import { Injectable } from '@angular/core';
import { signInAnonymously } from 'firebase/auth';
import {
  Database,
  get,
  onDisconnect,
  onValue,
  ref,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import {
  assertFirebaseConfigured,
  firebaseAuth,
  getFirebaseDatabase,
} from '../../shared/config/firebase.config';
import {
  TUTTIFRUTTI_CATEGORIES,
  TuttiFruttiRoom,
  TuttiFruttiVote,
  TuttiFruttiVotingWord,
} from './tuttifrutti.models';
import {
  calculateAccumulatedTotals,
  calculateTuttiFruttiScores,
  calculateValidationResults,
} from './tuttifrutti-score';

const ROOM_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

@Injectable({ providedIn: 'root' })
export class TuttiFruttiRoomService {
  async authenticate(): Promise<string> {
    assertFirebaseConfigured();
    if (firebaseAuth.currentUser) return firebaseAuth.currentUser.uid;

    const credential = await signInAnonymously(firebaseAuth);
    return credential.user.uid;
  }

  async createRoom(playerName: string): Promise<{ code: string; userId: string }> {
    const userId = await this.authenticate();
    const database = getFirebaseDatabase();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = this.generateRoomCode();
      const roomRef = ref(database, `rooms/${code}`);
      const room: TuttiFruttiRoom = {
        code,
        hostId: userId,
        status: 'waiting',
        round: 0,
        totalRounds: 5,
        letter: '',
        durationMs: 90_000,
        votingDurationMs: 30_000,
        startedAt: null,
        stoppedAt: null,
        votingStartedAt: null,
        votingCursor: 0,
        categories: [...TUTTIFRUTTI_CATEGORIES],
        players: {
          [userId]: {
            name: this.cleanName(playerName),
            online: true,
            joinedAt: Date.now(),
          },
        },
        createdAt: Date.now(),
      };

      const result = await runTransaction(roomRef, (currentRoom) => {
        return currentRoom === null ? room : undefined;
      });

      if (result.committed) {
        await this.registerPresence(database, code, userId);
        this.rememberSession(code, playerName);
        return { code, userId };
      }
    }

    throw new Error('No pudimos generar un código de sala. Intenta nuevamente.');
  }

  async joinRoom(
    rawCode: string,
    playerName: string
  ): Promise<{ code: string; userId: string }> {
    const userId = await this.authenticate();
    const database = getFirebaseDatabase();
    const code = this.normalizeRoomCode(rawCode);
    const roomSnapshot = await get(ref(database, `rooms/${code}`));

    if (!roomSnapshot.exists()) {
      throw new Error('No encontramos una sala con ese código.');
    }

    const room = roomSnapshot.val() as TuttiFruttiRoom;
    if (room.status !== 'waiting' || room.round > 0) {
      throw new Error('La partida ya empezó y no admite nuevos jugadores.');
    }

    await set(ref(database, `rooms/${code}/players/${userId}`), {
      name: this.cleanName(playerName),
      online: true,
      joinedAt: Date.now(),
    });

    await this.registerPresence(database, code, userId);
    this.rememberSession(code, playerName);
    return { code, userId };
  }

  async reconnect(
    rawCode: string,
    playerName: string
  ): Promise<{ code: string; userId: string }> {
    const userId = await this.authenticate();
    const database = getFirebaseDatabase();
    const code = this.normalizeRoomCode(rawCode);
    const playerRef = ref(database, `rooms/${code}/players/${userId}`);
    const playerSnapshot = await get(playerRef);

    if (!playerSnapshot.exists()) {
      return this.joinRoom(code, playerName);
    }

    await update(playerRef, {
      name: this.cleanName(playerName),
      online: true,
    });
    await this.registerPresence(database, code, userId);
    return { code, userId };
  }

  listenToRoom(
    roomCode: string,
    callback: (room: TuttiFruttiRoom | null) => void
  ): () => void {
    const roomRef = ref(getFirebaseDatabase(), `rooms/${roomCode}`);
    return onValue(roomRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() as TuttiFruttiRoom : null);
    });
  }

  listenToServerOffset(callback: (offsetMs: number) => void): () => void {
    return onValue(ref(getFirebaseDatabase(), '.info/serverTimeOffset'), (snapshot) => {
      callback(snapshot.val() ?? 0);
    });
  }

  async startRound(
    roomCode: string,
    letter: string,
    durationMs: number
  ): Promise<void> {
    await update(ref(getFirebaseDatabase(), `rooms/${roomCode}`), {
      status: 'playing',
      round: await this.nextRoundNumber(roomCode),
      letter,
      durationMs,
      startedAt: serverTimestamp(),
      stoppedAt: null,
      votingStartedAt: null,
      votingCursor: 0,
      votingWords: null,
      votingCategories: null,
      answers: null,
      votes: null,
      validationResults: null,
      roundScores: null,
    });
  }

  async updateSettings(
    roomCode: string,
    totalRounds: number,
    durationMs: number,
    votingDurationMs: number,
    categories: string[]
  ): Promise<void> {
    const cleanCategories = categories
      .map((category) => category.trim().slice(0, 30))
      .filter(Boolean);

    if (cleanCategories.length < 2 || cleanCategories.length > 10) {
      throw new Error('Configura entre 2 y 10 columnas.');
    }

    await update(ref(getFirebaseDatabase(), `rooms/${roomCode}`), {
      totalRounds: Math.max(1, Math.min(12, Math.round(totalRounds))),
      durationMs,
      votingDurationMs: Math.max(10_000, Math.min(120_000, votingDurationMs)),
      categories: cleanCategories,
    });
  }

  async finishRound(
    roomCode: string,
    userId: string,
    answers: Record<string, string>
  ): Promise<void> {
    await update(ref(getFirebaseDatabase(), `rooms/${roomCode}`), {
      [`answers/${userId}`]: {
        values: answers,
        submittedAt: serverTimestamp(),
      },
      status: 'voting',
      stoppedAt: serverTimestamp(),
    });
  }

  async submitAnswers(
    roomCode: string,
    userId: string,
    answers: Record<string, string>
  ): Promise<void> {
    await set(ref(getFirebaseDatabase(), `rooms/${roomCode}/answers/${userId}`), {
      values: answers,
      submittedAt: serverTimestamp(),
    });
  }

  async voteAnswer(
    roomCode: string,
    voterId: string,
    ownerId: string,
    categoryIndex: number,
    vote: TuttiFruttiVote
  ): Promise<void> {
    await set(
      ref(
        getFirebaseDatabase(),
        `rooms/${roomCode}/votes/${voterId}/${ownerId}/${categoryIndex}`
      ),
      vote
    );
  }

  async initializeVoting(roomCode: string): Promise<void> {
    const roomRef = ref(getFirebaseDatabase(), `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;

    const room = snapshot.val() as TuttiFruttiRoom;
    if (room.status !== 'voting' || room.votingWords?.length) return;

    const votingWords: TuttiFruttiVotingWord[] = [];
    const votingCategories: number[] = [];
    room.categories.forEach((_category, categoryIndex) => {
      const categoryWords: TuttiFruttiVotingWord[] = [];
      Object.keys(room.players).forEach((ownerId) => {
        const answer = room.answers?.[ownerId]?.values[String(categoryIndex)]?.trim();
        if (answer) categoryWords.push({ ownerId, categoryIndex });
      });
      if (categoryWords.length) {
        votingCategories.push(categoryIndex);
        votingWords.push(...categoryWords.sort(() => Math.random() - 0.5));
      }
    });

    if (!votingWords.length) {
      await this.finalizeVoting(roomCode);
      return;
    }

    await update(roomRef, {
      votingWords,
      votingCategories,
      votingCursor: 0,
      votingStartedAt: serverTimestamp(),
    });
  }

  async advanceVotingColumn(roomCode: string): Promise<void> {
    const roomRef = ref(getFirebaseDatabase(), `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;

    const room = snapshot.val() as TuttiFruttiRoom;
    if (room.status !== 'voting' || !room.votingCategories?.length) return;

    if (room.votingCursor >= room.votingCategories.length - 1) {
      await this.finalizeVoting(roomCode);
      return;
    }

    await update(roomRef, {
      votingCursor: room.votingCursor + 1,
      votingStartedAt: serverTimestamp(),
    });
  }

  async finalizeVoting(roomCode: string): Promise<void> {
    const roomRef = ref(getFirebaseDatabase(), `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;

    const room = snapshot.val() as TuttiFruttiRoom;
    if (room.status !== 'voting') return;

    const validationResults = calculateValidationResults(room);
    const roundScores = calculateTuttiFruttiScores(room, validationResults);
    const totals = calculateAccumulatedTotals(room, roundScores);

    await update(roomRef, {
      validationResults,
      roundScores,
      totals,
      status: room.round >= room.totalRounds ? 'finished' : 'roundResults',
    });
  }

  async restartGame(roomCode: string): Promise<void> {
    await update(ref(getFirebaseDatabase(), `rooms/${roomCode}`), {
      status: 'waiting',
      round: 0,
      letter: '',
      startedAt: null,
      stoppedAt: null,
      votingStartedAt: null,
      votingCursor: 0,
      votingWords: null,
      votingCategories: null,
      answers: null,
      votes: null,
      validationResults: null,
      roundScores: null,
      totals: null,
    });
  }

  async leaveRoom(roomCode: string, userId: string): Promise<void> {
    await set(
      ref(getFirebaseDatabase(), `rooms/${roomCode}/players/${userId}/online`),
      false
    );
  }

  getRememberedSession(): { code: string; playerName: string } | null {
    const code = localStorage.getItem('tuttifrutti-room');
    const playerName = localStorage.getItem('tuttifrutti-player-name');
    return code && playerName ? { code, playerName } : null;
  }

  forgetSession(): void {
    localStorage.removeItem('tuttifrutti-room');
    localStorage.removeItem('tuttifrutti-player-name');
  }

  private async nextRoundNumber(roomCode: string): Promise<number> {
    const snapshot = await get(ref(getFirebaseDatabase(), `rooms/${roomCode}/round`));
    return (snapshot.val() ?? 0) + 1;
  }

  private async registerPresence(
    database: Database,
    roomCode: string,
    userId: string
  ): Promise<void> {
    const onlineRef = ref(database, `rooms/${roomCode}/players/${userId}/online`);
    await onDisconnect(onlineRef).set(false);
    await set(onlineRef, true);
  }

  private rememberSession(code: string, playerName: string): void {
    localStorage.setItem('tuttifrutti-room', code);
    localStorage.setItem('tuttifrutti-player-name', this.cleanName(playerName));
  }

  private normalizeRoomCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private cleanName(name: string): string {
    return name.trim().slice(0, 24);
  }

  private generateRoomCode(): string {
    return Array.from(
      { length: ROOM_CODE_LENGTH },
      () => ROOM_CODE_CHARACTERS[Math.floor(Math.random() * ROOM_CODE_CHARACTERS.length)]
    ).join('');
  }
}
