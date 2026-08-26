import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import {
  TUTTIFRUTTI_LETTERS,
  TuttiFruttiPlayer,
  TuttiFruttiRoom,
  TuttiFruttiScore,
  TuttiFruttiVote,
  TuttiFruttiVotingWord,
} from './tuttifrutti.models';
import { TuttiFruttiRoomService } from './tuttifrutti-room.service';
import { requiredYesVotes } from './tuttifrutti-score';

interface PlayerEntry {
  id: string;
  player: TuttiFruttiPlayer;
}

interface ScoreEntry extends PlayerEntry {
  score: TuttiFruttiScore;
}

@Component({
  selector: 'app-tuttifrutti',
  imports: [CommonModule, FormsModule, GameEditorialContentComponent],
  templateUrl: './tuttifrutti.component.html',
  styleUrl: './tuttifrutti.component.css',
})
export class TuttiFruttiComponent extends BaseGameComponent implements OnInit, OnDestroy {
  playerName = '';
  joinCode = '';
  roomCode = '';
  userId = '';
  room: TuttiFruttiRoom | null = null;
  answers: Record<string, string> = {};
  configuredCategories: string[] = [];
  configuredRounds = 5;
  selectedDurationMs = 90_000;
  selectedVotingDurationMs = 30_000;
  newCategory = '';
  remainingMs = 0;
  validationRemainingMs = 30_000;
  errorMessage = '';
  infoMessage = '';
  isBusy = false;
  closingRound = false;

  private serverOffsetMs = 0;
  private timerId?: ReturnType<typeof setInterval>;
  private unsubscribeRoom?: () => void;
  private unsubscribeOffset?: () => void;
  private submittedRound = -1;
  private initializingRound = -1;
  private advancingColumn = '';

  private readonly roomService = inject(TuttiFruttiRoomService);
  private readonly route = inject(ActivatedRoute);

  get isHost(): boolean {
    return this.room?.hostId === this.userId;
  }

  get playerEntries(): PlayerEntry[] {
    return Object.entries(this.room?.players ?? {}).map(([id, player]) => ({ id, player }));
  }

  get onlinePlayers(): number {
    return this.playerEntries.filter(({ player }) => player.online).length;
  }

  get answeredCategories(): number {
    if (!this.room) return 0;
    return this.room.categories.filter((_category, index) =>
      this.answers[this.categoryKey(index)]?.trim()
    ).length;
  }

  get formattedTime(): string {
    return this.formatMilliseconds(this.remainingMs);
  }

  get validationSeconds(): number {
    return Math.ceil(this.validationRemainingMs / 1000);
  }

  get timerProgress(): number {
    if (!this.room?.durationMs) return 0;
    return Math.max(0, Math.min(100, (this.remainingMs / this.room.durationMs) * 100));
  }

  get validationProgress(): number {
    const duration = this.room?.votingDurationMs ?? 30_000;
    return Math.max(0, Math.min(100, (this.validationRemainingMs / duration) * 100));
  }

  get voteThreshold(): number {
    return requiredYesVotes(this.playerEntries.length);
  }

  get currentVotingCategoryIndex(): number | null {
    return this.room?.votingCategories?.[this.room.votingCursor] ?? null;
  }

  get currentVotingCategory(): string {
    const categoryIndex = this.currentVotingCategoryIndex;
    return categoryIndex === null ? '' : this.room?.categories[categoryIndex] ?? '';
  }

  get currentVotingWords(): TuttiFruttiVotingWord[] {
    const categoryIndex = this.currentVotingCategoryIndex;
    if (categoryIndex === null) return [];
    return (this.room?.votingWords ?? []).filter(
      (word) => word.categoryIndex === categoryIndex
    );
  }

  get currentColumnVotesCompleted(): number {
    return this.currentVotingWords.reduce((total, word) => {
      const key = this.categoryKey(word.categoryIndex);
      return total + Object.values(this.room?.votes ?? {}).filter(
        (votes) => Boolean(votes[word.ownerId]?.[key])
      ).length;
    }, 0);
  }

  get expectedCurrentColumnVotes(): number {
    return this.currentVotingWords.length * this.playerEntries.length;
  }

  get allCurrentColumnVotesSubmitted(): boolean {
    return this.currentVotingWords.length > 0 &&
      this.currentColumnVotesCompleted >= this.expectedCurrentColumnVotes;
  }

  get allAnswersSubmitted(): boolean {
    return Object.keys(this.room?.answers ?? {}).length >= this.playerEntries.length;
  }

  get scoreEntries(): ScoreEntry[] {
    return this.toScoreEntries(this.room?.roundScores ?? {});
  }

  get rankingEntries(): ScoreEntry[] {
    const totals = this.room?.totals ?? {};
    return this.playerEntries
      .map((entry) => ({
        ...entry,
        score: { total: totals[entry.id] ?? 0, byCategory: {} },
      }))
      .sort((a, b) => b.score.total - a.score.total);
  }

  ngOnInit(): void {
    this.setGameId('tuttifrutti');
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

  addCategory(): void {
    const category = this.newCategory.trim().slice(0, 30);
    if (!category || this.configuredCategories.length >= 10) return;
    if (this.configuredCategories.some((item) => item.toLowerCase() === category.toLowerCase())) {
      this.errorMessage = 'Esa columna ya existe.';
      return;
    }
    this.configuredCategories.push(category);
    this.newCategory = '';
    this.errorMessage = '';
  }

  removeCategory(index: number): void {
    if (this.configuredCategories.length <= 2) {
      this.errorMessage = 'La partida necesita al menos 2 columnas.';
      return;
    }
    this.configuredCategories.splice(index, 1);
  }

  async startRound(): Promise<void> {
    if (!this.room || !this.isHost || this.onlinePlayers < 2) return;
    if (!this.validateSettings()) return;
    const availableLetters = TUTTIFRUTTI_LETTERS.filter(
      (letter) => letter !== this.room?.letter
    );
    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    await this.runAction(async () => {
      if (this.room?.round === 0) {
        await this.roomService.updateSettings(
          this.roomCode,
          this.configuredRounds,
          this.selectedDurationMs,
          this.selectedVotingDurationMs,
          this.configuredCategories
        );
      }
      await this.roomService.startRound(this.roomCode, letter, this.selectedDurationMs);
    });
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

  async castVote(ownerId: string, categoryIndex: number, vote: TuttiFruttiVote): Promise<void> {
    if (this.room?.status !== 'voting' || this.validationRemainingMs <= 0) return;
    try {
      await this.roomService.voteAnswer(
        this.roomCode,
        this.userId,
        ownerId,
        categoryIndex,
        vote
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async restartGame(): Promise<void> {
    if (!this.isHost) return;
    await this.runAction(() => this.roomService.restartGame(this.roomCode));
  }

  async leaveRoom(): Promise<void> {
    if (this.roomCode && this.userId) {
      try {
        await this.roomService.leaveRoom(this.roomCode, this.userId);
      } catch {
        // La salida local no debe bloquearse por una desconexión de red.
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

  categoryKey(index: number): string {
    return String(index);
  }

  resultAnswer(playerId: string, categoryIndex: number): string {
    return this.room?.answers?.[playerId]?.values[this.categoryKey(categoryIndex)] || '—';
  }

  myVote(ownerId: string, categoryIndex: number): TuttiFruttiVote | null {
    return this.room?.votes?.[this.userId]?.[ownerId]?.[this.categoryKey(categoryIndex)] ?? null;
  }

  isAccepted(ownerId: string, categoryIndex: number): boolean {
    return this.room?.validationResults?.[ownerId]?.[this.categoryKey(categoryIndex)] ?? false;
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
    this.unsubscribeOffset = this.roomService.listenToServerOffset(
      (offsetMs) => this.serverOffsetMs = offsetMs
    );
    this.unsubscribeRoom = this.roomService.listenToRoom(code, (room) => {
      if (!room) {
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

    if (previousRound === undefined || (nextRoom.status === 'waiting' && previousStatus !== 'waiting')) {
      this.configuredCategories = [...nextRoom.categories];
      this.configuredRounds = nextRoom.totalRounds;
      this.selectedDurationMs = nextRoom.durationMs;
      this.selectedVotingDurationMs = nextRoom.votingDurationMs;
    }

    if (nextRoom.status === 'playing') {
      if (previousRound !== nextRoom.round) {
        this.answers = Object.fromEntries(
          nextRoom.categories.map((_category, index) => [this.categoryKey(index), ''])
        );
        this.submittedRound = -1;
        this.initializingRound = -1;
        this.advancingColumn = '';
      }
      this.startTimer('playing');
      return;
    }

    if (nextRoom.status === 'voting') {
      if (previousStatus === 'playing' && this.submittedRound !== nextRoom.round) {
        this.submittedRound = nextRoom.round;
        void this.roomService
          .submitAnswers(this.roomCode, this.userId, this.answers)
          .catch((error) => this.handleError(error));
      }
      if (!nextRoom.votingCategories?.length) {
        this.stopTimer();
        this.initializeVotingIfReady();
        return;
      }
      this.startTimer('voting');
      this.evaluateVotingCompletion();
      return;
    }

    this.stopTimer();
  }

  private startTimer(mode: 'playing' | 'voting'): void {
    this.stopTimer();
    const tick = () => mode === 'playing'
      ? this.updatePlayingTime()
      : this.updateVotingTime();
    tick();
    this.timerId = setInterval(tick, 250);
  }

  private updatePlayingTime(): void {
    if (!this.room?.startedAt) return;
    const endsAt = this.room.startedAt + this.room.durationMs;
    this.remainingMs = Math.max(0, endsAt - this.serverNow());
    if (this.remainingMs === 0) void this.callTuttiFrutti();
  }

  private updateVotingTime(): void {
    if (!this.room?.votingStartedAt) return;
    const endsAt = this.room.votingStartedAt + this.room.votingDurationMs;
    this.validationRemainingMs = Math.max(0, endsAt - this.serverNow());
    this.evaluateVotingCompletion();
  }

  private evaluateVotingCompletion(): void {
    if (
      !this.room ||
      !this.isHost ||
      this.room.status !== 'voting' ||
      this.currentVotingCategoryIndex === null
    ) return;

    const columnKey = `${this.room.round}:${this.room.votingCursor}`;
    if (
      (this.validationRemainingMs === 0 || this.allCurrentColumnVotesSubmitted) &&
      this.advancingColumn !== columnKey
    ) {
      this.advancingColumn = columnKey;
      void this.roomService.advanceVotingColumn(this.roomCode).catch((error) => {
        this.advancingColumn = '';
        this.handleError(error);
      });
    }
  }

  private initializeVotingIfReady(): void {
    if (
      !this.room ||
      !this.isHost ||
      !this.allAnswersSubmitted ||
      this.initializingRound === this.room.round
    ) return;

    this.initializingRound = this.room.round;
    void this.roomService.initializeVoting(this.roomCode).catch((error) => {
      this.initializingRound = -1;
      this.handleError(error);
    });
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

  private validateSettings(): boolean {
    const categories = this.configuredCategories.map((item) => item.trim()).filter(Boolean);
    const uniqueCategories = new Set(categories.map((item) => item.toLowerCase()));
    if (this.configuredRounds < 1 || this.configuredRounds > 12) {
      this.errorMessage = 'Configura entre 1 y 12 rondas.';
      return false;
    }
    if (categories.length < 2 || categories.length > 10) {
      this.errorMessage = 'Configura entre 2 y 10 columnas.';
      return false;
    }
    if (uniqueCategories.size !== categories.length) {
      this.errorMessage = 'No puede haber columnas repetidas.';
      return false;
    }
    this.configuredCategories = categories;
    return true;
  }

  private toScoreEntries(scores: Record<string, TuttiFruttiScore>): ScoreEntry[] {
    return this.playerEntries
      .map((entry) => ({
        ...entry,
        score: scores[entry.id] ?? { total: 0, byCategory: {} },
      }))
      .sort((a, b) => b.score.total - a.score.total);
  }

  private formatMilliseconds(milliseconds: number): string {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private serverNow(): number {
    return Date.now() + this.serverOffsetMs;
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
