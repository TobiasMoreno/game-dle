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

  it('only uses five-letter surnames', () => {
    expect(service.players.length).toBeGreaterThan(0);
    expect(service.players.every(player => player.answer.length === 5)).toBeTrue();
  });

  it('selects another player for the next unlimited round', () => {
    const first = service.players[0];
    const next = service.getRandomPlayer(first.answer, () => 0);
    expect(next.answer).not.toBe(first.answer);
  });

  it('restores a player by its saved normalized answer', () => {
    const player = service.players[0];
    expect(service.getPlayerByAnswer(player.answer)).toBe(player);
  });
});
