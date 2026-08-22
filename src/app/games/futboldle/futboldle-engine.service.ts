import { Injectable } from '@angular/core';
import { FOOTBALLERS, FootballerEntry } from './futboldle.data';

export type LetterState = 'correct' | 'present' | 'absent';

export interface LetterResult {
  letter: string;
  state: LetterState;
}

@Injectable({ providedIn: 'root' })
export class FutboldleEngineService {
  readonly players = FOOTBALLERS.filter(player => player.answer.length === 5);

  normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  }

  getDailyPlayer(date = new Date()): FootballerEntry {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    let hash = 2166136261;
    for (const char of key) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return this.players[(hash >>> 0) % this.players.length];
  }

  isKnownName(value: string): boolean {
    const normalized = this.normalize(value);
    return this.players.some(player => player.answer === normalized);
  }

  evaluate(guessValue: string, answerValue: string): LetterResult[] {
    const guess = this.normalize(guessValue);
    const answer = this.normalize(answerValue);
    const result: LetterResult[] = guess.split('').map(letter => ({ letter, state: 'absent' }));
    const remaining = new Map<string, number>();

    for (let index = 0; index < answer.length; index++) {
      if (guess[index] === answer[index]) {
        result[index].state = 'correct';
      } else {
        remaining.set(answer[index], (remaining.get(answer[index]) ?? 0) + 1);
      }
    }

    for (let index = 0; index < guess.length; index++) {
      if (result[index].state === 'correct') continue;
      const available = remaining.get(guess[index]) ?? 0;
      if (available > 0) {
        result[index].state = 'present';
        remaining.set(guess[index], available - 1);
      }
    }

    return result;
  }
}
