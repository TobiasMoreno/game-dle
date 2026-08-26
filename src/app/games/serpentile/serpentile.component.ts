import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import { ADSENSE_CONFIG } from '../../shared/config/adsense.config';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';
import { argentinaDateKey } from '../../shared/utils/daily-activity.utils';
import { SerpentileEngineService } from './serpentile-engine.service';
import { SerpentileGeneratorService } from './serpentile-generator.service';
import {
  HexCoordinate,
  SerpentileBoardCell,
  SerpentileGameState,
  SerpentileMove,
  SerpentilePath,
  SerpentilePlacement,
  SerpentilePuzzle,
  SerpentileTile,
} from './serpentile.models';
import { SerpentileStorageService } from './serpentile-storage.service';

@Component({
  selector: 'app-serpentile',
  imports: [AdSlotComponent, FooterComponent, GameEditorialContentComponent],
  templateUrl: './serpentile.component.html',
  styleUrl: './serpentile.component.css',
})
export class SerpentileComponent implements OnInit, OnDestroy {
  readonly adSlots = ADSENSE_CONFIG.slots;

  private readonly engine = inject(SerpentileEngineService);
  private readonly generator = inject(SerpentileGeneratorService);
  private readonly storage = inject(SerpentileStorageService);
  private readonly gameManager = inject(GameManagerService);
  private readonly theme = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private animationFrameId: number | null = null;
  private stepTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private activeMove: SerpentileMove | null = null;
  private readonly animationDuration = 900;
  private animationProgress = 0;
  private renderTrail: { x: number; y: number }[] = [];

  readonly boardCells = this.engine.createBoardCells();
  readonly hexPoints = this.createHexPoints(49);
  puzzle!: SerpentilePuzzle;
  state!: SerpentileGameState;
  shareMessage = '';
  displayHead = { x: 360, y: 310 };

  ngOnInit(): void {
    this.theme.setHeaderTheme('serpentile');
    this.theme.setFooterTheme('serpentile');
    const date = argentinaDateKey();
    this.puzzle = this.generator.createDailyPuzzle(date);
    const restored = this.storage.load(date);
    this.state = restored && this.isValidState(restored)
      ? restored
      : this.cloneState(this.puzzle.initialState);
    this.displayHead = this.edgePointFor(this.state.snake, this.state.snake.incomingSide);
    this.renderTrail = [{ ...this.displayHead }];
    if (this.isBrowser && this.state.status === 'running') this.scheduleNextStep(550);
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  get score(): number {
    return this.state.collected * 100;
  }

  get progressPercent(): number {
    return (this.state.collected / this.state.targetCount) * 100;
  }

  get roundNumber(): number {
    return this.state.round ?? 0;
  }

  get snakeLinePoints(): string {
    return this.renderTrail.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  get formattedDate(): string {
    const [year, month, day] = this.state.date.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })
      .format(new Date(year, month - 1, day));
  }

  tileById(tileId: string): SerpentileTile | undefined {
    return this.puzzle.tiles.find((tile) => tile.id === tileId);
  }

  placementAt(cell: HexCoordinate): SerpentilePlacement | undefined {
    const key = this.engine.coordinateKey(cell);
    return this.state.placements.find((placement) => this.engine.coordinateKey(placement) === key);
  }

  rotateTile(placement: SerpentilePlacement, event: Event): void {
    event.stopPropagation();
    if (this.state.status === 'won' || this.state.status === 'lost') return;
    if (this.activeMove && this.isCurrentPlacement(placement)) return;
    this.state = {
      ...this.state,
      placements: this.state.placements.map((current) =>
        current.tileId === placement.tileId ? this.engine.rotate(current) : current
      ),
    };
    this.storage.save(this.state);
  }

  togglePause(): void {
    if (this.state.status === 'won' || this.state.status === 'lost') return;
    if (this.state.status === 'running') {
      this.state = { ...this.state, status: 'paused' };
      this.pauseAnimation();
    } else {
      this.state = { ...this.state, status: 'running' };
      if (this.activeMove) this.animateActiveMove();
      else this.scheduleNextStep(120);
    }
    this.storage.save(this.state);
  }

  restart(): void {
    this.stopAnimation();
    this.state = this.cloneState(this.puzzle.initialState);
    this.displayHead = this.edgePointFor(this.state.snake, this.state.snake.incomingSide);
    this.renderTrail = [{ ...this.displayHead }];
    this.storage.save(this.state);
    this.scheduleNextStep(550);
  }

  playAnotherRound(): void {
    this.stopAnimation();
    const date = argentinaDateKey();
    this.puzzle = this.generator.createDailyPuzzle(date, this.roundNumber + 1);
    this.state = this.cloneState(this.puzzle.initialState);
    this.displayHead = this.edgePointFor(this.state.snake, this.state.snake.incomingSide);
    this.renderTrail = [{ ...this.displayHead }];
    this.shareMessage = '';
    this.storage.save(this.state);
    this.scheduleNextStep(550);
  }

  pathD(path: SerpentilePath): string {
    const start = this.sidePoint(path.from, 43);
    const end = this.sidePoint(path.to, 43);
    const controlX = (start.y - end.y) * 0.08;
    const controlY = (end.x - start.x) * 0.08;
    return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
  }

  pathColor(path: SerpentilePath): string {
    return { coral: '#ff6b5f', gold: '#ffd166', mint: '#55e6a5' }[path.color];
  }

  isTarget(cell: HexCoordinate): boolean {
    return cell.q === this.state.target.q && cell.r === this.state.target.r;
  }

  isTrail(cell: HexCoordinate): boolean {
    return this.state.snake.trail.some((step) => step.q === cell.q && step.r === cell.r);
  }

  isActivePath(placement: SerpentilePlacement, path: SerpentilePath): boolean {
    if (!this.activeMove || !this.isCurrentPlacement(placement)) return false;
    const incomingSide = (this.state.snake.incomingSide + placement.rotation) % 6;
    return path.from === incomingSide || path.to === incomingSide;
  }

  isActiveTile(placement: SerpentilePlacement): boolean {
    return Boolean(this.activeMove) && this.isCurrentPlacement(placement);
  }

  isCurrentPlacement(placement: SerpentilePlacement): boolean {
    return placement.q === this.state.snake.q && placement.r === this.state.snake.r;
  }

  async share(): Promise<void> {
    const text = `Serpentile · ${this.state.date}\n🐍 ${this.score} puntos · ${this.state.moves} movimientos\n${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Serpentile diario', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir.';
    }
  }

  private scheduleNextStep(delay: number): void {
    if (this.state.status !== 'running') return;
    if (this.stepTimeoutId !== null) clearTimeout(this.stepTimeoutId);
    this.stepTimeoutId = setTimeout(() => {
      this.stepTimeoutId = null;
      this.beginStep();
    }, delay);
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    if (this.stepTimeoutId !== null) clearTimeout(this.stepTimeoutId);
    this.animationFrameId = null;
    this.stepTimeoutId = null;
    this.activeMove = null;
    this.animationProgress = 0;
  }

  private pauseAnimation(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    if (this.stepTimeoutId !== null) clearTimeout(this.stepTimeoutId);
    this.animationFrameId = null;
    this.stepTimeoutId = null;
  }

  private beginStep(): void {
    if (this.state.status !== 'running') return;
    const placement = this.placementAt(this.state.snake);
    const tile = placement ? this.tileById(placement.tileId) : undefined;
    if (!placement || !tile) {
      this.finish('lost');
      return;
    }

    const move = this.engine.nextMove(placement, tile, this.state.snake.incomingSide);
    if (!move) {
      this.finish('lost');
      return;
    }

    this.activeMove = move;
    this.animationProgress = 0;
    this.animateActiveMove();
  }

  private animateActiveMove(): void {
    if (!this.activeMove || this.state.status !== 'running') return;
    const startedAt = performance.now() - this.animationProgress * this.animationDuration;

    const frame = (now: number) => {
      if (this.state.status !== 'running' || !this.activeMove) return;
      this.animationProgress = Math.min((now - startedAt) / this.animationDuration, 1);
      this.displayHead = this.pointAlongActiveMove(this.activeMove, this.animationProgress);
      this.appendRenderPoint(this.displayHead);

      if (this.animationProgress < 1) {
        this.animationFrameId = requestAnimationFrame(frame);
      } else {
        this.animationFrameId = null;
        this.completeStep(this.activeMove);
      }
    };
    this.animationFrameId = requestAnimationFrame(frame);
  }

  private completeStep(move: SerpentileMove): void {
    this.activeMove = null;
    this.animationProgress = 0;

    const collectedTarget = this.isTarget(move.coordinate);
    const collected = this.state.collected + (collectedTarget ? 1 : 0);
    const moves = this.state.moves + 1;
    const trail = [...this.state.snake.trail, move.coordinate].slice(-12);

    this.state = {
      ...this.state,
      collected,
      moves,
      snake: { ...move.coordinate, incomingSide: move.incomingSide, trail },
      target: collectedTarget && collected < this.state.targetCount
        ? this.generator.targetFor(this.state.date, collected, moves, move.coordinate, this.roundNumber)
        : this.state.target,
    };

    if (collected >= this.state.targetCount) {
      this.finish('won');
      return;
    }
    this.storage.save(this.state);
    this.scheduleNextStep(0);
  }

  private finish(status: 'won' | 'lost'): void {
    this.stopAnimation();
    this.state = { ...this.state, status };
    this.storage.save(this.state);
    this.gameManager.completeGame('serpentile', status === 'won', this.state.moves, {
      score: this.score,
      collected: this.state.collected,
    });
  }

  private isValidState(state: SerpentileGameState): boolean {
    return state.version === 2 && state.placements.length === this.boardCells.length &&
      this.engine.isInsideBoard(state.snake) && this.engine.isInsideBoard(state.target);
  }

  private cloneState(state: SerpentileGameState): SerpentileGameState {
    return {
      ...state,
      placements: state.placements.map((placement) => ({ ...placement })),
      snake: { ...state.snake, trail: state.snake.trail.map((step) => ({ ...step })) },
      target: { ...state.target },
    };
  }

  private createHexPoints(radius: number): string {
    return Array.from({ length: 6 }, (_, index) => {
      const angle = ((-90 + index * 60) * Math.PI) / 180;
      return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
    }).join(' ');
  }

  private pointFor(coordinate: HexCoordinate): { x: number; y: number } {
    const cell = this.boardCells.find(
      (candidate) => candidate.q === coordinate.q && candidate.r === coordinate.r
    );
    return cell ? { x: cell.x, y: cell.y } : { x: 360, y: 310 };
  }

  private edgePointFor(coordinate: HexCoordinate, side: number): { x: number; y: number } {
    const center = this.pointFor(coordinate);
    const offset = this.sidePoint(side, 43);
    return { x: center.x + offset.x, y: center.y + offset.y };
  }

  private pointAlongActiveMove(move: SerpentileMove, progress: number): { x: number; y: number } {
    const center = this.pointFor(this.state.snake);
    const startOffset = this.sidePoint(this.state.snake.incomingSide, 43);
    const endOffset = this.sidePoint(move.exitSide, 43);
    const start = { x: center.x + startOffset.x, y: center.y + startOffset.y };
    const end = { x: center.x + endOffset.x, y: center.y + endOffset.y };
    const control = {
      x: center.x + (startOffset.y - endOffset.y) * 0.08,
      y: center.y + (endOffset.x - startOffset.x) * 0.08,
    };
    const curveShare = 0.9;

    if (progress <= curveShare) {
      const t = progress / curveShare;
      const inverse = 1 - t;
      return {
        x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
        y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
      };
    }

    const neighbourEntry = this.edgePointFor(move.coordinate, move.incomingSide);
    const bridgeProgress = (progress - curveShare) / (1 - curveShare);
    return {
      x: end.x + (neighbourEntry.x - end.x) * bridgeProgress,
      y: end.y + (neighbourEntry.y - end.y) * bridgeProgress,
    };
  }

  private appendRenderPoint(point: { x: number; y: number }): void {
    const previous = this.renderTrail[this.renderTrail.length - 1];
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 2.5) return;
    this.renderTrail = [...this.renderTrail, { ...point }].slice(-90);
  }

  private sidePoint(side: number, radius: number): { x: number; y: number } {
    const angles = [0, -60, -120, 180, 120, 60];
    const angle = (angles[side] * Math.PI) / 180;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }
}
