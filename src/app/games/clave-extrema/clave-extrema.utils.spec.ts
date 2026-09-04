import { calculateExtremeScore, dailyWordIndex, nextManualMark, scoreExtremeGuess } from './clave-extrema.utils';

describe('Clave Extrema helpers', () => {
  it('reports only row totals and respects repeated letters', () => {
    expect(scoreExtremeGuess('RARAS', 'PERRO')).toEqual({ exact: 1, displaced: 1, absent: 3 });
    expect(scoreExtremeGuess('PERRO', 'PERRO')).toEqual({ exact: 5, displaced: 0, absent: 0 });
  });

  it('keeps the daily selection stable and in range', () => {
    expect(dailyWordIndex('2026-09-04', 1200)).toBe(dailyWordIndex('2026-09-04', 1200));
    expect(dailyWordIndex('2026-09-04', 1200)).toBeLessThan(1200);
  });

  it('rewards early and fast solutions', () => {
    expect(calculateExtremeScore(1, 0)).toBe(1500);
    expect(calculateExtremeScore(2, 60)).toBeLessThan(calculateExtremeScore(1, 60));
    expect(calculateExtremeScore(8, 999)).toBe(100);
  });

  it('cycles manual letter marks through the three helper colors', () => {
    expect(nextManualMark(null)).toBe('green');
    expect(nextManualMark('green')).toBe('orange');
    expect(nextManualMark('orange')).toBe('red');
    expect(nextManualMark('red')).toBeNull();
  });
});
