import { TestBed } from '@angular/core/testing';
import { FutboldleEngineService } from './futboldle-engine.service';

describe('FutboldleEngineService', () => {
  let service: FutboldleEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FutboldleEngineService);
  });

  it('normalizes accents, spaces and punctuation', () => {
    expect(service.normalize("Di María")).toBe('DIMARIA');
    expect(service.normalize("Eto'o")).toBe('ETOO');
  });

  it('does not mark duplicate letters more times than they appear', () => {
    expect(service.evaluate('SASSY', 'MESSI')).toEqual([
      { letter: 'S', state: 'absent' },
      { letter: 'A', state: 'absent' },
      { letter: 'S', state: 'correct' },
      { letter: 'S', state: 'correct' },
      { letter: 'Y', state: 'absent' }
    ]);
  });

  it('selects the same player for the same local date', () => {
    const date = new Date(2026, 7, 22);
    expect(service.getDailyPlayer(date)).toEqual(service.getDailyPlayer(date));
  });

  it('only uses surnames with a supported length', () => {
    expect(service.players.length).toBeGreaterThan(0);
    expect(service.players.every(player => [5, 6, 7].includes(player.answer.length))).toBeTrue();
    expect([5, 6, 7].every(length => service.players.some(player => player.answer.length === length))).toBeTrue();
  });

  it('includes the expanded five-letter player catalog', () => {
    expect(service.getPlayerByAnswer('TEVEZ')?.player).toBe('Carlos Tévez');
    expect(service.getPlayerByAnswer('POGBA')?.player).toBe('Paul Pogba');
  });

  it('selects another player for the next unlimited round', () => {
    const first = service.players[0];
    const next = service.getRandomPlayer(first.answer, () => 0);
    expect(next.answer).not.toBe(first.answer);
  });

  it('selects a player with the requested word length', () => {
    expect(service.getRandomPlayerByLength(6, undefined, () => 0).answer.length).toBe(6);
    expect(service.getRandomPlayerByLength(7, undefined, () => 0).answer.length).toBe(7);
  });

  it('selects the word length uniformly from the available options', () => {
    expect(service.getRandomWordLength(() => 0)).toBe(5);
    expect(service.getRandomWordLength(() => 0.34)).toBe(6);
    expect(service.getRandomWordLength(() => 0.99)).toBe(7);
  });

  it('restores a player by its saved normalized answer', () => {
    const player = service.players[0];
    expect(service.getPlayerByAnswer(player.answer)).toBe(player);
  });
});
