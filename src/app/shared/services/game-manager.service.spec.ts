import { DailyActivityService } from './daily-activity.service';
import { GameManagerService } from './game-manager.service';
import { GameStorageService } from './game-storage.service';

describe('GameManagerService unlimited daily rounds', () => {
  it('keeps the first daily result while counting later rounds in general stats', () => {
    const savedGames: any[] = [];
    const storage = {
      getGames: () => [],
      saveGame: (game: any) => savedGames.push(structuredClone(game)),
      isGamePlayedToday: () => false,
      getTodayGameState: () => null,
    } as unknown as GameStorageService;
    const dailyActivity = {
      recordDailyGame: jasmine.createSpy('recordDailyGame').and.resolveTo(),
    } as unknown as DailyActivityService;
    const service = new GameManagerService(storage, dailyActivity);

    service.completeGame('wordle', true, 3, { targetWord: 'PERRO' });
    const dailyResult = structuredClone(service.getGame('wordle')!.dailyState);
    service.completeGame('wordle', false, 6, { targetWord: 'NUBES' });

    expect(service.getGame('wordle')!.dailyState).toEqual(dailyResult);
    expect(service.getGame('wordle')!.stats!.totalGames).toBe(2);
    expect(savedGames[1].dailyState).toEqual(dailyResult);
    expect((dailyActivity.recordDailyGame as jasmine.Spy).calls.count()).toBe(1);
  });
});
