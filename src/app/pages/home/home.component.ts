import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePresentationState, GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import {
  GameCatalogSection,
  GamePresentationService,
  NextGameRecommendation,
  groupGameCatalog,
} from '../../shared/services/game-presentation.service';
import { ThemeService } from '../../shared/services/theme.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { ADSENSE_CONFIG } from '../../shared/config/adsense.config';
import { DailyJourneyComponent } from '../../shared/components/daily-journey/daily-journey.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FooterComponent, AdSlotComponent, DailyJourneyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly adSlots = ADSENSE_CONFIG.slots;
  catalogSections: GameCatalogSection[] = [];
  nextGame: NextGameRecommendation | null = null;
  gameManager = inject(GameManagerService);
  private readonly gamePresentation = inject(GamePresentationService);
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.setHeaderTheme('default');
    this.themeService.setFooterTheme('default');
    
    this.gameManager.games$.subscribe((games) => {
      this.nextGame = this.gamePresentation.getNextGame(games);
      this.catalogSections = groupGameCatalog(games);
    });
  }

  getGamePresentation(game: GameState): GamePresentationState {
    return this.gamePresentation.getState(game);
  }

  getGameStatusClass(tone: GamePresentationState['tone']): string {
    switch (tone) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'progress':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  }
}
