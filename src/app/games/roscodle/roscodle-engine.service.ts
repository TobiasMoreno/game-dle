import { Injectable } from '@angular/core';
import { RoscoLetter, RoscoQuestion, RoscoResult } from './roscodle.models';

@Injectable({ providedIn: 'root' })
export class RoscoEngineService {
  createLetters(questions: RoscoQuestion[]): RoscoLetter[] {
    return questions.map((question, index) => ({
      ...question,
      status: index === 0 ? 'current' : 'pending',
    }));
  }

  isCorrect(question: RoscoQuestion, guess: string): boolean {
    const accepted = [question.answer, ...(question.aliases ?? [])];
    const normalizedGuess = this.normalize(guess);
    return normalizedGuess.length > 0 && accepted.some((answer) => this.normalize(answer) === normalizedGuess);
  }

  nextPendingIndex(letters: RoscoLetter[], currentIndex: number): number {
    for (let offset = 1; offset <= letters.length; offset += 1) {
      const index = (currentIndex + offset) % letters.length;
      if (letters[index].status === 'pending') return index;
    }
    return -1;
  }

  result(letters: RoscoLetter[]): RoscoResult {
    return letters.reduce<RoscoResult>((result, letter) => {
      if (letter.status === 'correct') result.correct += 1;
      else if (letter.status === 'wrong') result.wrong += 1;
      else result.unanswered += 1;
      return result;
    }, { correct: 0, wrong: 0, unanswered: 0 });
  }

  normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9ñ]/g, '');
  }
}
