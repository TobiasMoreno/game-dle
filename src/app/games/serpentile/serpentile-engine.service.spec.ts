import { SerpentileEngineService } from './serpentile-engine.service';
import { SerpentileTile } from './serpentile.models';

describe('SerpentileEngineService', () => {
  let service: SerpentileEngineService;
  const tile: SerpentileTile = {
    id: 'tile',
    paths: [
      { from: 0, to: 2, color: 'coral' },
      { from: 1, to: 5, color: 'gold' },
      { from: 3, to: 4, color: 'mint' },
    ],
  };

  beforeEach(() => service = new SerpentileEngineService());

  it('crea un tablero completo de radio tres', () => {
    const cells = service.createBoardCells();
    expect(cells.length).toBe(37);
    expect(cells.every((cell) => service.isInsideBoard(cell))).toBeTrue();
  });

  it('sale por el lado enlazado y entra por el lado opuesto del bloque vecino', () => {
    const move = service.nextMove({ tileId: 'tile', q: 0, r: 0, rotation: 0 }, tile, 0);

    expect(move).toEqual({ coordinate: { q: 0, r: -1 }, incomingSide: 5, exitSide: 2 });
  });

  it('aplica la rotación antes de resolver el recorrido', () => {
    const move = service.nextMove({ tileId: 'tile', q: 0, r: 0, rotation: 1 }, tile, 5);

    expect(move).toEqual({ coordinate: { q: 1, r: -1 }, incomingSide: 4, exitSide: 1 });
  });

  it('detecta cuando la serpiente sale por el borde del dibujo', () => {
    const move = service.nextMove({ tileId: 'tile', q: 3, r: 0, rotation: 0 }, tile, 2);

    expect(move).toBeNull();
  });

  it('gira una pieza en pasos de sesenta grados', () => {
    const rotated = service.rotate({ tileId: 'tile', q: 0, r: 0, rotation: 5 });
    expect(rotated.rotation).toBe(0);
  });
});
