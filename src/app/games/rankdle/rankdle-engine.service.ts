import { Injectable } from '@angular/core';
import { RANKDLE_PUZZLES } from './rankdle.data';
import { RankdleDirection, RankdleItem, RankdlePuzzle } from './rankdle.models';

@Injectable({ providedIn: 'root' })
export class RankdleEngineService {
  createRoundPuzzle(number: number): RankdlePuzzle {
    const definition = RANKDLE_PUZZLES[(number - 1) % RANKDLE_PUZZLES.length];
    const correctOrder = this.correctOrder(definition.items);
    let initialOrder = this.shuffle(correctOrder, this.hash(`rankdle:${number}:shuffle`));

    if (initialOrder.every((id, index) => id === correctOrder[index])) {
      initialOrder = [...initialOrder.slice(1), initialOrder[0]];
    }

    return { number, definition, initialOrder };
  }

  correctOrder(items: readonly RankdleItem[]): string[] {
    return [...items].sort((a, b) => a.value - b.value).map((item) => item.id);
  }

  evaluate(order: string[], items: readonly RankdleItem[]): RankdleDirection[] {
    const correctOrder = this.correctOrder(items);
    return order.map((id, currentIndex) => {
      const targetIndex = correctOrder.indexOf(id);
      if (targetIndex === currentIndex) return 'correct';
      return targetIndex < currentIndex ? 'up' : 'down';
    });
  }

  isSolved(feedback: RankdleDirection[]): boolean {
    return feedback.every((direction) => direction === 'correct');
  }

  reorder(order: string[], sourceId: string, targetId: string): string[] {
    if (sourceId === targetId || !order.includes(sourceId) || !order.includes(targetId)) {
      return [...order];
    }
    const result = order.filter((id) => id !== sourceId);
    result.splice(order.indexOf(targetId), 0, sourceId);
    return result;
  }

  buildShareText(puzzle: RankdlePuzzle, attempts: RankdleDirection[][], won: boolean): string {
    const rows = attempts.map((feedback) => feedback
      .map((direction) => ({ correct: '🟩', up: '⬆️', down: '⬇️' })[direction])
      .join(''));
    return [
      `RankDLE · Ronda ${puzzle.number} · ${won ? attempts.length : 'X'}/4`,
      puzzle.definition.category,
      '',
      ...rows,
      '',
      `${window.location.origin}/games/rankdle`,
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
