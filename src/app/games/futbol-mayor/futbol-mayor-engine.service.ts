import { Injectable } from '@angular/core';
import { FUTBOL_MAYOR_COMPARISONS } from './futbol-mayor.data';
import {
  FutbolMayorComparison,
  FutbolMayorCompetitor,
} from './futbol-mayor.models';

@Injectable({ providedIn: 'root' })
export class FutbolMayorEngineService {
  createSeed(): number {
    if (globalThis.crypto?.getRandomValues)
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  comparison(seed: number, round: number): FutbolMayorComparison {
    const ordered = this.shuffle([...FUTBOL_MAYOR_COMPARISONS], seed);
    const comparison = ordered[round % ordered.length];
    if (((seed + round) & 1) === 0) return comparison;
    return { ...comparison, left: comparison.right, right: comparison.left };
  }

  winner(comparison: FutbolMayorComparison): FutbolMayorCompetitor {
    return comparison.left.value > comparison.right.value
      ? comparison.left
      : comparison.right;
  }

  isCorrect(comparison: FutbolMayorComparison, selectedId: string): boolean {
    return this.winner(comparison).id === selectedId;
  }

  gap(comparison: FutbolMayorComparison): number {
    return Math.abs(comparison.left.value - comparison.right.value);
  }

  buildShareText(
    score: number,
    answers: readonly { correct: boolean }[],
  ): string {
    const marks = answers
      .map((answer) => (answer.correct ? '🟩' : '🟥'))
      .join('');
    return `¿QUIÉN TIENE MÁS? ⚽\n${score}/${answers.length} ${marks}\nDatos, duelos y fútbol en Game-DLE`;
  }

  private shuffle<T>(items: T[], seed: number): T[] {
    let value = seed >>> 0;
    for (let index = items.length - 1; index > 0; index--) {
      value = (value * 1664525 + 1013904223) >>> 0;
      const target = value % (index + 1);
      [items[index], items[target]] = [items[target], items[index]];
    }
    return items;
  }
}
