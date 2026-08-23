import { routeMatchesRecommendation } from './next-game-preloading.strategy';

describe('next game preloading strategy', () => {
  it('matches only the recommended lazy route', () => {
    expect(routeMatchesRecommendation('games/wordle', '/games/wordle')).toBeTrue();
    expect(routeMatchesRecommendation('games/geodle', '/games/wordle')).toBeFalse();
  });

  it('does not preload when either route is missing', () => {
    expect(routeMatchesRecommendation(undefined, '/games/wordle')).toBeFalse();
    expect(routeMatchesRecommendation('games/wordle', undefined)).toBeFalse();
  });
});
