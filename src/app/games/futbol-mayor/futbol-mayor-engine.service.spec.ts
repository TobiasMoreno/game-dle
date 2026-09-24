import { FutbolMayorEngineService } from './futbol-mayor-engine.service';
import { FUTBOL_MAYOR_COMPARISONS } from './futbol-mayor.data';

describe('FutbolMayorEngineService', () => {
  const engine = new FutbolMayorEngineService();

  it('builds a stable round from the same seed', () => {
    expect(engine.comparison(12345, 2).id).toBe(engine.comparison(12345, 2).id);
  });

  it('selects the competitor with the larger value', () => {
    const comparison = FUTBOL_MAYOR_COMPARISONS[0];
    expect(engine.winner(comparison).id).toBe('cristiano');
    expect(engine.isCorrect(comparison, 'cristiano')).toBeTrue();
    expect(engine.gap(comparison)).toBe(11);
  });

  it('ships comparisons without ties and with provenance', () => {
    expect(FUTBOL_MAYOR_COMPARISONS.length).toBeGreaterThanOrEqual(20);
    for (const comparison of FUTBOL_MAYOR_COMPARISONS) {
      expect(comparison.left.value).not.toBe(comparison.right.value);
      expect(comparison.sourceUrl.startsWith('https://')).toBeTrue();
      expect(comparison.cutoff.length).toBeGreaterThan(0);
      expect(comparison.scope.length).toBeGreaterThan(0);
    }
  });
});
