import { Injectable } from '@angular/core';
import { PALMODLE_PEOPLE } from './palmodle.data';
import { PalmodlePair, PalmodlePerson } from './palmodle.models';

@Injectable({ providedIn: 'root' })
export class PalmodleEngineService {
  createPair(run: number, round: number): PalmodlePair {
    const shuffled = this.shuffle([...PALMODLE_PEOPLE], run * 104729 + 7919);
    const start = (round * 2) % shuffled.length;
    return { left: shuffled[start], right: shuffled[(start + 1) % shuffled.length] };
  }

  firstToDie(pair: PalmodlePair): PalmodlePerson {
    return pair.left.deathDate < pair.right.deathDate ? pair.left : pair.right;
  }

  isCorrect(pair: PalmodlePair, selectedId: string): boolean {
    return this.firstToDie(pair).id === selectedId;
  }

  yearsApart(pair: PalmodlePair): number {
    const left = Date.parse(`${pair.left.deathDate}T12:00:00Z`);
    const right = Date.parse(`${pair.right.deathDate}T12:00:00Z`);
    return Math.max(0, Math.round(Math.abs(left - right) / 31_556_952_000));
  }

  buildShareText(score: number, answers: readonly { correct: boolean }[]): string {
    const marks = answers.map((answer) => answer.correct ? '🟩' : '🟥').join('');
    return `PALMÓ PRIMERO\n${score}/10 ${marks}\n¿Cuánto sabés de las últimas páginas de la historia?`;
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
