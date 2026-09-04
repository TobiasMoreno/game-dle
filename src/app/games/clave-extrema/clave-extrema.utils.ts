export interface ClaveFeedback {
  exact: number;
  displaced: number;
  absent: number;
}

export type ManualLetterMark = 'green' | 'orange' | 'red' | null;

export function nextManualMark(mark: ManualLetterMark): ManualLetterMark {
  if (mark === null) return 'green';
  if (mark === 'green') return 'orange';
  if (mark === 'orange') return 'red';
  return null;
}

/** Compara ocurrencias, no solo letras, para resolver correctamente las repetidas. */
export function scoreExtremeGuess(guess: string, target: string): ClaveFeedback {
  const normalizedGuess = guess.toUpperCase().split('');
  const remainingTarget = target.toUpperCase().split('');
  let exact = 0;

  normalizedGuess.forEach((letter, index) => {
    if (letter !== remainingTarget[index]) return;
    exact++;
    normalizedGuess[index] = '';
    remainingTarget[index] = '';
  });

  let displaced = 0;
  normalizedGuess.forEach((letter) => {
    if (!letter) return;
    const matchIndex = remainingTarget.indexOf(letter);
    if (matchIndex < 0) return;
    displaced++;
    remainingTarget[matchIndex] = '';
  });

  return { exact, displaced, absent: guess.length - exact - displaced };
}

/** Produce una selección diaria estable a partir de una fecha YYYY-MM-DD. */
export function dailyWordIndex(dateKey: string, wordCount: number): number {
  if (wordCount <= 0) return 0;
  let hash = 2166136261;
  for (const character of dateKey) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % wordCount;
}

export function calculateExtremeScore(attempts: number, elapsedSeconds: number): number {
  const attemptPoints = [1000, 850, 700, 500, 250, 100, 100, 100][attempts - 1] ?? 0;
  const timeBonus = Math.max(0, 500 - Math.floor(elapsedSeconds * 2.5));
  return attemptPoints + timeBonus;
}
