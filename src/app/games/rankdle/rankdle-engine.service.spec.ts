import { TestBed } from '@angular/core/testing';
import { RankdleEngineService } from './rankdle-engine.service';
import { RankdleItem } from './rankdle.models';

describe('RankdleEngineService', () => {
  let service: RankdleEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RankdleEngineService);
  });

  it('creates deterministic rounds with five shuffled items', () => {
    const first = service.createRoundPuzzle(3);
    const second = service.createRoundPuzzle(3);

    expect(first).toEqual(second);
    expect(first.number).toBe(3);
    expect(first.definition.items.length).toBe(5);
    expect(new Set(first.initialOrder).size).toBe(5);
    expect(first.initialOrder).not.toEqual(service.correctOrder(first.definition.items));
  });

  it('evaluates exact positions and the direction of misplaced items', () => {
    const items = [item('low', 10), item('middle', 20), item('high', 30)];

    expect(service.evaluate(['middle', 'low', 'high'], items)).toEqual(['down', 'up', 'correct']);
  });

  it('moves a dragged item into the target position', () => {
    expect(service.reorder(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
    expect(service.reorder(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('does not reveal answers in the shared result', () => {
    const puzzle = service.createRoundPuzzle(2);
    const text = service.buildShareText(
      puzzle,
      [['correct', 'up', 'down', 'correct', 'correct']],
      false
    );

    expect(text).toContain('RankDLE');
    expect(text).toContain('Ronda 2');
    expect(text).toContain('🟩');
    for (const item of puzzle.definition.items) {
      expect(text).not.toContain(item.name);
      expect(text).not.toContain(item.displayValue);
    }
  });

  function item(id: string, value: number): RankdleItem {
    return { id, value, name: id, displayValue: String(value), note: '' };
  }
});
