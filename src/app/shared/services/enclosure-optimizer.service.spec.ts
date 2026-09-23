import { TestBed } from '@angular/core/testing';
import { EnclosureOptimizerService, EnclosureTile } from './enclosure-optimizer.service';

describe('EnclosureOptimizerService', () => {
  let service: EnclosureOptimizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnclosureOptimizerService);
  });

  it('aprovecha el agua y cierra una única abertura con una pared', () => {
    const result = service.findOptimalEnclosure(board([
      '~~~~~',
      '~...~',
      '~.H..',
      '~~~~~',
    ]), 1);

    expect(result).not.toBeNull();
    expect(result!.enclosedTileCount).toBe(6);
    expect(result!.wallsUsed).toBe(1);
    expect(result!.wallPositions).toEqual([{ row: 2, column: 4 }]);
  });

  it('elige el cerramiento exterior de mayor área cuando alcanza el presupuesto', () => {
    const map = nestedEnclosures();

    const small = service.findOptimalEnclosure(map, 1);
    const large = service.findOptimalEnclosure(map, 2);

    expect(small?.enclosedTileCount).toBe(2);
    expect(small?.wallsUsed).toBe(1);
    expect(large?.enclosedTileCount).toBe(28);
    expect(large?.wallsUsed).toBe(2);
    expect(large?.wallPositions).toEqual([
      { row: 0, column: 4 },
      { row: 6, column: 2 },
    ]);
  });

  it('no agrega paredes innecesarias aunque sobre presupuesto', () => {
    const result = service.findOptimalEnclosure(nestedEnclosures(), 15);

    expect(result?.enclosedTileCount).toBe(28);
    expect(result?.wallsUsed).toBe(2);
  });

  it('ignora una región cerrada que no contiene al caballo', () => {
    const result = service.findOptimalEnclosure(board([
      '.H...',
      '~~~~~',
      '~...~',
      '~~~~~',
    ]), 0);

    expect(result).toBeNull();
  });

  it('puntúa únicamente la región cerrada que contiene al caballo', () => {
    const result = service.findOptimalEnclosure(board([
      '~~~~~~~~~',
      '~H..~...~',
      '~~~~~~~~~',
    ]), 0);

    expect(result?.enclosedTileCount).toBe(3);
    expect(result?.region).toEqual([
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 1, column: 3 },
    ]);
  });

  it('considera abierta una región transitable que toca el borde', () => {
    const result = service.findOptimalEnclosure(board([
      '~~~~~',
      '~H...',
      '~~~~~',
    ]), 0);

    expect(result).toBeNull();
  });

  it('resuelve con K cero cuando el agua ya encierra al caballo', () => {
    const result = service.findOptimalEnclosure(board([
      '~~~',
      '~H~',
      '~~~',
    ]), 0);

    expect(result).toEqual({
      enclosedTileCount: 1,
      wallPositions: [],
      wallsUsed: 0,
      region: [{ row: 1, column: 1 }],
    });
  });

  it('devuelve null si el presupuesto no alcanza para cortar todos los caminos', () => {
    const result = service.findOptimalEnclosure(board([
      '...',
      '.H.',
      '...',
    ]), 3);

    expect(result).toBeNull();
  });

  it('valida presupuesto, cierre, área y que las paredes no sumen al score', () => {
    const map = board([
      '~~~~~',
      '~...~',
      '~.H..',
      '~~~~~',
    ]);
    const valid = service.validateEnclosure(map, 1, [{ row: 2, column: 4 }]);
    const stillOpen = service.validateEnclosure(map, 1, []);
    const onWater = service.validateEnclosure(map, 1, [{ row: 0, column: 0 }]);

    expect(valid.isValid).toBeTrue();
    expect(valid.enclosedTileCount).toBe(6);
    expect(valid.wallsUsed).toBe(1);
    expect(stillOpen.isValid).toBeFalse();
    expect(onWater.isValid).toBeFalse();
  });

  it('coincide con búsqueda exhaustiva en mapas pequeños', () => {
    const maps = [
      ['....', '.H..', '..~.', '....'],
      ['.~..', '.H~.', '....', '..~.'],
      ['....', '~H..', '..~.', '....'],
      ['..~.', '.H..', '.~..', '....'],
    ].map(board);

    for (const map of maps) {
      const exact = service.findOptimalEnclosure(map, 4);
      const exhaustive = exhaustiveOptimum(map, 4);
      expect(exact?.enclosedTileCount ?? null).toBe(exhaustive?.area ?? null);
      expect(exact?.wallsUsed ?? null).toBe(exhaustive?.walls ?? null);
    }
  });

  function nestedEnclosures(): EnclosureTile[][] {
    return board([
      '~~~~.~~~~',
      '~.......~',
      '~.......~',
      '~..~~~..~',
      '~..~H...~',
      '~..~~~..~',
      '~~.~~~~~~',
    ]);
  }

  function board(rows: string[]): EnclosureTile[][] {
    const tiles: Record<string, EnclosureTile> = {
      '.': 'grass',
      '~': 'water',
      H: 'horse',
      '#': 'wall',
    };
    return rows.map((row) => [...row].map((tile) => tiles[tile]));
  }

  function exhaustiveOptimum(map: EnclosureTile[][], budget: number): { area: number; walls: number } | null {
    const grass = map.flatMap((row, rowIndex) => row.flatMap((tile, columnIndex) =>
      tile === 'grass' ? [{ row: rowIndex, column: columnIndex }] : []
    ));
    let best: { area: number; walls: number } | null = null;

    const visit = (start: number, selected: Array<{ row: number; column: number }>): void => {
      const validation = service.validateEnclosure(map, budget, selected);
      if (validation.isValid && (
        best === null || validation.enclosedTileCount > best.area ||
        (validation.enclosedTileCount === best.area && validation.wallsUsed < best.walls)
      )) {
        best = { area: validation.enclosedTileCount, walls: validation.wallsUsed };
      }
      if (selected.length === budget) return;
      for (let index = start; index < grass.length; index += 1) {
        selected.push(grass[index]);
        visit(index + 1, selected);
        selected.pop();
      }
    };

    visit(0, []);
    return best;
  }
});
