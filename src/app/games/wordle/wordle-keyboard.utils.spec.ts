import { buildKeyboardState } from './wordle-keyboard.utils';

describe('Wordle keyboard state', () => {
  it('marks absent letters so the keyboard can disable them', () => {
    const state = buildKeyboardState([['P', 'E', 'R', 'R', 'O']], 'RUIDO', 1);

    expect(state['P']).toBe('absent');
    expect(state['E']).toBe('absent');
    expect(state['R']).toBe('present');
    expect(state['O']).toBe('correct');
  });

  it('keeps the strongest state when a repeated letter has mixed results', () => {
    const state = buildKeyboardState([['R', 'E', 'R', 'E', 'S']], 'REINA', 1);

    expect(state['R']).toBe('correct');
    expect(state['E']).toBe('correct');
    expect(state['S']).toBe('absent');
  });

  it('ignores rows that have not been submitted', () => {
    const state = buildKeyboardState([
      ['P', 'E', 'R', 'R', 'O'],
      ['N', 'U', 'B', 'E', 'S'],
    ], 'RUIDO', 1);

    expect(state['N']).toBeUndefined();
  });
});
