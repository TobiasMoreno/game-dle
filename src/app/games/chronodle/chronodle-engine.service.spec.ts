import { TestBed } from '@angular/core/testing';
import { ChronodleEngineService } from './chronodle-engine.service';
import { ChronodleEvent } from './chronodle.models';

describe('ChronodleEngineService', () => {
  let service: ChronodleEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChronodleEngineService);
  });

  it('creates a deterministic round with five unique events', () => {
    const first = service.createRoundPuzzle(42);
    const second = service.createRoundPuzzle(42);

    expect(first).toEqual(second);
    expect(first.number).toBe(42);
    expect(first.events.length).toBe(5);
    expect(new Set(first.events.map((event) => event.id)).size).toBe(5);
    expect(first.initialOrder).not.toEqual(service.correctOrder(first.events));
    expect(service.createRoundPuzzle(43)).not.toEqual(first);
  });

  it('evaluates correct, earlier and later positions', () => {
    const events = [
      event('old', '1900-01-01'),
      event('middle', '1950-01-01'),
      event('new', '2000-01-01'),
    ];

    expect(service.evaluate(['middle', 'old', 'new'], events)).toEqual(['down', 'up', 'correct']);
  });

  it('does not reveal event names or dates in the shared result', () => {
    const puzzle = service.createRoundPuzzle(42);
    const text = service.buildShareText(
      puzzle,
      [['correct', 'up', 'down', 'correct', 'correct']],
      false
    );

    expect(text).toContain('ChronoDLE');
    expect(text).toContain('Ronda 42');
    expect(text).toContain('🟩');
    for (const item of puzzle.events) {
      expect(text).not.toContain(item.title);
      expect(text).not.toContain(item.displayDate);
    }
  });

  it('moves a dragged event into the dropped position', () => {
    expect(service.reorder(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
    expect(service.reorder(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  function event(id: string, date: string): ChronodleEvent {
    return {
      id,
      date,
      title: id,
      displayDate: date,
      category: 'Ciencia',
      region: 'Mundo',
      summary: '',
      sourceUrl: '',
    };
  }
});
