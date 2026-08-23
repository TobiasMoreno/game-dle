import { ROSCO_LEAGUES } from './roscodle-catalog';
import { EUROPEAN_CLUB_QUESTIONS } from './roscodle-european-clubs.data';
import { EXTRA_ROSCO_QUESTIONS } from './roscodle-extra.data';

describe('Roscodle extra question catalog', () => {
  it('provides a complete and ordered alphabet for every new rosco', () => {
    const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    Object.values(EXTRA_ROSCO_QUESTIONS).forEach((questions) => {
      expect(questions.length).toBe(27);
      expect(questions.map((question) => question.letter)).toEqual(expectedLetters);
      questions.forEach((question) => {
        expect(question.answer.trim()).toBeTruthy();
        expect(question.clue.trim()).toBeTruthy();
      });
    });
  });

  it('provides a separate complete rosco for every selected European club', () => {
    expect(Object.keys(EUROPEAN_CLUB_QUESTIONS).length).toBe(25);
    Object.values(EUROPEAN_CLUB_QUESTIONS).forEach((questions) => {
      expect(questions.length).toBe(27);
      expect(questions.map((question) => question.letter).join('')).toBe('ABCDEFGHIJKLMNÑOPQRSTUVWXYZ');
    });
  });

  it('shows five separate club choices inside every European league', () => {
    const europeanLeagues = ROSCO_LEAGUES.filter((league) => league.id !== 'argentina');
    expect(europeanLeagues.length).toBe(5);
    europeanLeagues.forEach((league) => expect(league.categories.length).toBe(5));
  });
});
