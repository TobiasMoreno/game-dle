export type WordleLetterState = 'correct' | 'present' | 'absent';

const STATE_PRIORITY: Record<WordleLetterState, number> = {
  absent: 1,
  present: 2,
  correct: 3,
};

export function buildKeyboardState(
  attempts: string[][],
  targetWord: string,
  completedAttempts: number,
): Readonly<Record<string, WordleLetterState>> {
  const state: Record<string, WordleLetterState> = {};

  attempts.slice(0, completedAttempts).forEach((row) => {
    const letters = row.map((letter) => letter.toUpperCase());
    const remainingLetters = targetWord.toUpperCase().split('');
    const rowStates: WordleLetterState[] = Array(letters.length).fill('absent');

    letters.forEach((letter, index) => {
      if (letter === remainingLetters[index]) {
        rowStates[index] = 'correct';
        remainingLetters[index] = '';
      }
    });

    letters.forEach((letter, index) => {
      if (rowStates[index] === 'correct') return;
      const matchingIndex = remainingLetters.indexOf(letter);
      if (matchingIndex >= 0) {
        rowStates[index] = 'present';
        remainingLetters[matchingIndex] = '';
      }
    });

    letters.forEach((letter, index) => {
      if (!letter) return;
      const nextState = rowStates[index];
      if (!state[letter] || STATE_PRIORITY[nextState] > STATE_PRIORITY[state[letter]]) {
        state[letter] = nextState;
      }
    });
  });

  return state;
}
