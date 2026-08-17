import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../shared/services/theme.service';
import {
  TUTTIFRUTTI_LETTERS,
  TuttiFruttiPlayer,
  TuttiFruttiRoom,
  TuttiFruttiScore,
} from './tuttifrutti.models';
import { TuttiFruttiRoomService } from './tuttifrutti-room.service';
import { calculateTuttiFruttiScores } from './tuttifrutti-score';

interface PlayerEntry {
  id: string;
  player: TuttiFruttiPlayer;
}

interface ScoreEntry extends PlayerEntry {
  score: TuttiFruttiScore;
}

@Component({
  selector: 'app-tuttifrutti',
  imports: [CommonModule, FormsModule],
  templateUrl: './tuttifrutti.component.html',
  styleUrl: './tuttifrutti.component.css',
})
export class TuttiFruttiComponent implements OnInit, OnDestroy {
  playerName = '';
  joinCode = '';
  roomCode = '';
  userId = '';
  room: TuttiFruttiRoom | null = null;
  answers: Record<string, string> = {};
  selectedDurationMs = 90_000;
  remainingMs = 0;
  errorMessage = '';
  infoMessage = '';
  isBusy = false;
  closingRound = false;

  private serverOffsetMs = 0;
  private timerId?: ReturnType<typeof setInterval>;
  private unsubscribeRoom?: () => void;
  private unsubscribeOffset?: () => void;
  private submittedRound = -1;

  private readonly roomService = inject(TuttiFruttiRoomService);
  private readonly route = inject(ActivatedRoute);
  private readonly themeService = inject(ThemeService);

  get isHost(): boolean {
    return this.room?.hostId === this.userId;
  }

  get playerEntries(): PlayerEntry[] {
    return Object.entries(this.room?.players ?? {}).map(([id, player]) => ({
      id,
      player,
    }));
  }

  get onlinePlayers(): number {
    return this.playerEntries.filter(({ player }) => player.online).length;
  }

  get answeredCategories(): number {
    if (!this.room) return 0;
    return this.room.categories.filter((category) => this.answers[category]?.trim()).length;
  }

  get formattedTime(): string {
    const totalSeconds = Math.ceil(this.remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get timerProgress(): number {
    if (!this.room?.durationMs) return 0;
    return Math.max(0, Math.min(100, (this.remainingMs / this.room.durationMs) * 100));
  }

  get scoreEntries(): ScoreEntry[] {
    if (!this.room) return [];
    const scores = calculateTuttiFruttiScores(this.room);
    return this.playerEntries
      .map((entry) => ({ ...entry, score: scores[entry.id] }))
      .sort((a, b) => b.score.total - a.score.total);
  }

  ngOnInit(): void {
    this.themeService.setHeaderTheme('default');
    this.themeService.setFooterTheme('default');
    this.joinCode = this.route.snapshot.queryParamMap.get('room')?.toUpperCase() ?? '';

    const remembered = this.roomService.getRememberedSession();
    if (remembered) {
      this.playerName = remembered.playerName;
      this.joinCode ||= remembered.code;
      void this.restoreSession(remembered.code, remembered.playerName);
    }
  }

  ngOnDestroy(): void {
    this.stopListening();
  }

  async createRoom(): Promise<void> {
    if (!this.validateName()) return;
    await this.runAction(async () => {
      const session = await this.roomService.createRoom(this.playerName);
      this.connectToRoom(session.code, session.userId);
    });
  }

  async joinRoom(): Promise<void> {
    if (!this.validateName()) return;
    if (this.joinCode.trim().length !== 6) {
      this.errorMessage = 'El código debe tener 6 caracteres.';
      return;
    }

    await this.runAction(async () => {
      const session = await this.roomService.joinRoom(this.joinCode, this.playerName);
      this.connectToRoom(session.code, session.userId);
    });
  }

  async startRound(): Promise<void> {
    if (!this.room || !this.isHost || this.onlinePlayers < 2) return;
    const availableLetters = TUTTIFRUTTI_LETTERS.filter(
      (letter) => letter !== this.room?.letter
    );
    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    await this.runAction(() =>
      this.roomService.startRound(this.roomCode, letter, this.selectedDurationMs)
    );
  }

  async callTuttiFrutti(): Promise<void> {
    if (!this.room || this.room.status !== 'playing' || this.closingRound) return;
    this.closingRound = true;
    this.submittedRound = this.room.round;

    try {
      await this.roomService.finishRound(this.roomCode, this.userId, this.answers);
    } catch (error) {
      this.closingRound = false;
      this.handleError(error);
    }
  }

  async returnToLobby(): Promise<void> {
    if (!this.isHost) return;
    await this.runAction(() => this.roomService.returnToLobby(this.roomCode));
  }

  async leaveRoom(): Promise<void> {
    if (this.roomCode && this.userId) {
      try {
        await this.roomService.leaveRoom(this.roomCode, this.userId);
      } catch {
        // La salida local no debe quedar bloqueada por una desconexión de red.
      }
    }
    this.stopListening();
    this.roomService.forgetSession();
    this.room = null;
    this.roomCode = '';
    this.userId = '';
    this.answers = {};
    this.infoMessage = '';
    this.errorMessage = '';
  }

  async copyRoomInvitation(): Promise<void> {
    const url = new URL('/games/tuttifrutti', window.location.origin);
    url.searchParams.set('room', this.roomCode);
    const text = `Sumate a mi Tutti Frutti en Game-DLE. Sala ${this.roomCode}`;

    try {
      await navigator.clipboard.writeText(`${text}\n${url.toString()}`);
      this.infoMessage = 'Invitación copiada al portapapeles.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'No pudimos copiar la invitación.';
    }
  }

  trackCategory(_index: number, category: string): string {
    return category;
  }

  resultAnswer(playerId: string, category: string): string {
    return this.room?.answers?.[playerId]?.values[category] || '—';
  }

  private async restoreSession(code: string, playerName: string): Promise<void> {
    await this.runAction(async () => {
      const session = await this.roomService.reconnect(code, playerName);
      this.connectToRoom(session.code, session.userId);
    });
  }

  private connectToRoom(code: string, userId: string): void {
    this.stopListening();
    this.roomCode = code;
    this.joinCode = code;
    this.userId = userId;
    this.unsubscribeOffset = this.roomService.listenToServerOffset((offsetMs) => {
      this.serverOffsetMs = offsetMs;
    });
    this.unsubscribeRoom = this.roomService.listenToRoom(code, (room) => {
      if (!room) {
        this.errorMessage = 'La sala fue cerrada.';
        void this.leaveRoom();
        return;
      }
      this.onRoomUpdate(room);
    });
  }

  private onRoomUpdate(nextRoom: TuttiFruttiRoom): void {
    const previousRound = this.room?.round;
    const previousStatus = this.room?.status;
    this.room = nextRoom;
    this.closingRound = false;

    if (nextRoom.status === 'playing') {
      if (previousRound !== nextRoom.round) {
        this.answers = Object.fromEntries(
          nextRoom.categories.map((category) => [category, ''])
        );
        this.submittedRound = -1;
      }
      this.startTimer();
    } else {
      this.stopTimer();
    }

    if (
      nextRoom.status === 'results' &&
      previousStatus === 'playing' &&
      this.submittedRound !== nextRoom.round
    ) {
      this.submittedRound = nextRoom.round;
      void this.roomService
        .submitAnswers(this.roomCode, this.userId, this.answers)
        .catch((error) => this.handleError(error));
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.updateRemainingTime();
    this.timerId = setInterval(() => this.updateRemainingTime(), 250);
  }

  private updateRemainingTime(): void {
    if (!this.room?.startedAt) return;
    const serverNow = Date.now() + this.serverOffsetMs;
    const endsAt = this.room.startedAt + this.room.durationMs;
    this.remainingMs = Math.max(0, endsAt - serverNow);
    if (this.remainingMs === 0) void this.callTuttiFrutti();
  }

  private stopTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = undefined;
  }

  private stopListening(): void {
    this.stopTimer();
    this.unsubscribeRoom?.();
    this.unsubscribeOffset?.();
    this.unsubscribeRoom = undefined;
    this.unsubscribeOffset = undefined;
  }

  private validateName(): boolean {
    this.errorMessage = '';
    if (this.playerName.trim().length < 2) {
      this.errorMessage = 'Escribí un nombre de al menos 2 caracteres.';
      return false;
    }
    return true;
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    this.isBusy = true;
    this.errorMessage = '';
    try {
      await action();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isBusy = false;
    }
  }

  private handleError(error: unknown): void {
    this.errorMessage = error instanceof Error
      ? error.message
      : 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}
