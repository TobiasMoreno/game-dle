import { Component, OnInit, inject } from '@angular/core';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ADSENSE_CONFIG } from '../../shared/config/adsense.config';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ChronodleEngineService } from './chronodle-engine.service';
import {
  ChronodleDirection,
  ChronodleEvent,
  ChronodleGameState,
} from './chronodle.models';
import { ChronodleStorageService } from './chronodle-storage.service';

@Component({
  selector: 'app-chronodle',
  imports: [AdSlotComponent, FooterComponent],
  templateUrl: './chronodle.component.html',
  styleUrl: './chronodle.component.css',
})
export class ChronodleComponent implements OnInit {
  readonly maxAttempts = 4;
  readonly adSlots = ADSENSE_CONFIG.slots;

  private readonly engine = inject(ChronodleEngineService);
  private readonly storage = inject(ChronodleStorageService);
  private readonly gameManager = inject(GameManagerService);
  private readonly theme = inject(ThemeService);

  puzzle = this.engine.createRoundPuzzle(1);
  state!: ChronodleGameState;
  draggedId: string | null = null;
  dragOverId: string | null = null;
  feedbackVisible = false;
  shareMessage = '';
  private pointerDragId: string | null = null;
  private pointerDragActive = false;
  private pointerStart: { x: number; y: number } | null = null;

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
    const restored = this.storage.load();
    this.puzzle = this.engine.createRoundPuzzle(restored?.round ?? 1);
    this.state = restored && this.isValidState(restored)
      ? restored
      : this.createInitialState(this.puzzle.number);
    this.feedbackVisible = this.state.attempts.length > 0;
  }

  get orderedEvents(): ChronodleEvent[] {
    return this.state.order.map((id) => this.eventById(id));
  }

  get correctEvents(): ChronodleEvent[] {
    return this.engine.correctOrder(this.puzzle.events).map((id) => this.eventById(id));
  }

  get latestFeedback(): ChronodleDirection[] | null {
    return this.state.attempts.at(-1)?.feedback ?? null;
  }

  get attemptsLeft(): number {
    return this.maxAttempts - this.state.attempts.length;
  }

  startDrag(id: string, event: DragEvent): void {
    if (this.state.status !== 'playing') {
      event.preventDefault();
      return;
    }
    this.draggedId = id;
    this.dragOverId = id;
    event.dataTransfer?.setData('text/plain', id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  enterDropZone(id: string): void {
    if (this.draggedId) this.dragOverId = id;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropAt(id: string, event: DragEvent): void {
    event.preventDefault();
    const sourceId = this.draggedId ?? event.dataTransfer?.getData('text/plain') ?? null;
    if (sourceId) this.reorder(sourceId, id);
    this.resetDrag();
  }

  endDrag(): void {
    this.resetDrag();
  }

  startPointerDrag(id: string, event: PointerEvent): void {
    if (this.state.status !== 'playing') return;
    this.pointerDragId = id;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.dragOverId = id;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  continuePointerDrag(event: PointerEvent): void {
    if (!this.pointerDragId || !this.pointerStart) return;
    const distance = Math.hypot(
      event.clientX - this.pointerStart.x,
      event.clientY - this.pointerStart.y
    );
    if (!this.pointerDragActive && distance < 6) return;

    this.pointerDragActive = true;
    this.draggedId = this.pointerDragId;
    event.preventDefault();
    const card = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-event-id]');
    if (card?.dataset['eventId']) this.dragOverId = card.dataset['eventId'];
  }

  finishPointerDrag(event: PointerEvent): void {
    if (this.pointerDragActive && this.pointerDragId && this.dragOverId) {
      this.reorder(this.pointerDragId, this.dragOverId);
    }
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    this.resetPointerDrag();
    this.resetDrag();
  }

  cancelPointerDrag(): void {
    this.resetPointerDrag();
    this.resetDrag();
  }

  handleDragKeydown(index: number, event: KeyboardEvent): void {
    const direction = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.state.order.length) return;
    this.reorder(this.state.order[index], this.state.order[targetIndex]);
  }

  submitOrder(): void {
    if (this.state.status !== 'playing') return;
    const feedback = this.engine.evaluate(this.state.order, this.puzzle.events);
    const attempts = [...this.state.attempts, { order: [...this.state.order], feedback }];
    const won = this.engine.isSolved(feedback);
    const status = won ? 'won' : attempts.length >= this.maxAttempts ? 'lost' : 'playing';

    this.state = { ...this.state, attempts, status };
    this.feedbackVisible = true;
    this.shareMessage = '';
    this.storage.save(this.state);

    if (status !== 'playing') {
      this.gameManager.completeGame('chronodle', won, attempts.length, {
        puzzleNumber: this.puzzle.number,
        maxAttempts: this.maxAttempts,
      });
    }
  }

  feedbackAt(index: number): ChronodleDirection | null {
    return this.feedbackVisible ? this.latestFeedback?.[index] ?? null : null;
  }

  feedbackLabel(direction: ChronodleDirection | null): string {
    return {
      correct: 'Está en la posición correcta',
      up: 'Debe ir más atrás en el tiempo',
      down: 'Debe ir más adelante en el tiempo',
    }[direction ?? 'correct'];
  }

  async share(): Promise<void> {
    const text = this.engine.buildShareText(
      this.puzzle,
      this.state.attempts.map((attempt) => attempt.feedback),
      this.state.status === 'won'
    );
    try {
      if (navigator.share) await navigator.share({ title: 'ChronoDLE', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir el resultado.';
    }
  }

  nextRound(): void {
    const round = this.state.round + 1;
    this.puzzle = this.engine.createRoundPuzzle(round);
    this.state = this.createInitialState(round);
    this.feedbackVisible = false;
    this.shareMessage = '';
    this.resetPointerDrag();
    this.resetDrag();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackEvent(_: number, event: ChronodleEvent): string {
    return event.id;
  }

  private updateOrder(order: string[]): void {
    this.state = { ...this.state, order };
    this.feedbackVisible = false;
    this.shareMessage = '';
    this.storage.save(this.state);
  }

  private reorder(sourceId: string, targetId: string): void {
    const order = this.engine.reorder(this.state.order, sourceId, targetId);
    if (order.every((id, index) => id === this.state.order[index])) return;
    this.updateOrder(order);
  }

  private resetDrag(): void {
    this.draggedId = null;
    this.dragOverId = null;
  }

  private resetPointerDrag(): void {
    this.pointerDragId = null;
    this.pointerDragActive = false;
    this.pointerStart = null;
  }

  private eventById(id: string): ChronodleEvent {
    const event = this.puzzle.events.find((candidate) => candidate.id === id);
    if (!event) throw new Error(`Evento de ChronoDLE desconocido: ${id}`);
    return event;
  }

  private createInitialState(round: number): ChronodleGameState {
    const state: ChronodleGameState = {
      version: 2,
      round,
      status: 'playing',
      order: [...this.puzzle.initialOrder],
      attempts: [],
    };
    this.storage.save(state);
    return state;
  }

  private isValidState(state: ChronodleGameState): boolean {
    const validIds = new Set(this.puzzle.events.map((event) => event.id));
    return state.version === 2 &&
      state.round === this.puzzle.number &&
      state.order.length === this.puzzle.events.length &&
      new Set(state.order).size === state.order.length &&
      state.order.every((id) => validIds.has(id)) &&
      state.attempts.length <= this.maxAttempts;
  }

}
