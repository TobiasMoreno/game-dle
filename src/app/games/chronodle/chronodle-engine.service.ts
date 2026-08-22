import { Injectable } from '@angular/core';
import { CHRONODLE_EVENT_ERAS } from './chronodle.data';
import {
  ChronodleDirection,
  ChronodleEvent,
  ChronodlePuzzle,
} from './chronodle.models';

@Injectable({ providedIn: 'root' })
export class ChronodleEngineService {
  createRoundPuzzle(number: number): ChronodlePuzzle {
    const seed = `round:${number}`;
    const events = CHRONODLE_EVENT_ERAS.map((era, eraIndex) =>
      era[this.hash(`${seed}:era:${eraIndex}`) % era.length]
    ).sort((a, b) => a.date.localeCompare(b.date));
    const correctOrder = events.map((event) => event.id);
    let initialOrder = this.shuffle(correctOrder, this.hash(`${seed}:shuffle`));

    if (initialOrder.every((id, index) => id === correctOrder[index])) {
      initialOrder = [...initialOrder.slice(1), initialOrder[0]];
    }

    return { number, events, initialOrder };
  }

  evaluate(order: string[], events: ChronodleEvent[]): ChronodleDirection[] {
    const correctOrder = this.correctOrder(events);
    return order.map((id, currentIndex) => {
      const targetIndex = correctOrder.indexOf(id);
      if (targetIndex === currentIndex) return 'correct';
      return targetIndex < currentIndex ? 'up' : 'down';
    });
  }

  isSolved(feedback: ChronodleDirection[]): boolean {
    return feedback.every((direction) => direction === 'correct');
  }

  correctOrder(events: ChronodleEvent[]): string[] {
    return [...events].sort((a, b) => a.date.localeCompare(b.date)).map((event) => event.id);
  }

  reorder(order: string[], sourceId: string, targetId: string): string[] {
    if (sourceId === targetId || !order.includes(sourceId) || !order.includes(targetId)) {
      return [...order];
    }
    const result = order.filter((id) => id !== sourceId);
    result.splice(order.indexOf(targetId), 0, sourceId);
    return result;
  }

  buildShareText(
    puzzle: ChronodlePuzzle,
    attempts: ChronodleDirection[][],
    won: boolean
  ): string {
    const rows = attempts.map((feedback) => feedback
      .map((direction) => ({ correct: '🟩', up: '⬆️', down: '⬇️' })[direction])
      .join(''));
    return [
      `ChronoDLE · Ronda ${puzzle.number} · ${won ? attempts.length : 'X'}/4`,
      '',
      ...rows,
      '',
      `${window.location.origin}/games/chronodle`,
    ].join('\n');
  }

  private shuffle(values: string[], seed: number): string[] {
    const result = [...values];
    let state = seed || 1;
    for (let index = result.length - 1; index > 0; index--) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const swapIndex = state % (index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  private hash(value: string): number {
    let hash = 2166136261;
    for (const character of value) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
