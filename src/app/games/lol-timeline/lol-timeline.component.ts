import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme.service';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolGameShellComponent } from '../lol-shared/lol-game-shell.component';
import { shuffleChampions, validChampions } from '../lol-shared/lol-game.utils';

@Component({
  selector: 'app-lol-timeline',
  imports: [LolGameShellComponent],
  templateUrl: './lol-timeline.component.html',
})
export class LolTimelineComponent implements OnInit, OnDestroy {
  readonly title = 'Timeline de campeones';
  readonly instructions = 'Ordená los campeones desde el lanzamiento más antiguo hasta el más reciente.';
  champions: LoLCharacter[] = [];
  timeline: LoLCharacter[] = [];
  loading = true;
  score = 0;
  rounds = 0;
  feedback = '';
  roundComplete = false;

  private readonly http = inject(HttpClient);
  private readonly themeService = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.themeService.setHeaderTheme('loldle');
    this.themeService.setFooterTheme('loldle');
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }
    this.subscriptions.add(this.http.get<LoLCharacter[]>('campeones_lol.json').subscribe({
      next: (champions) => {
        this.champions = validChampions(champions);
        this.loading = false;
        this.startRound();
      },
      error: () => {
        this.loading = false;
        this.feedback = 'No pudimos cargar los campeones. Probá de nuevo en unos segundos.';
      },
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  startRound(): void {
    if (!this.champions.length) return;
    this.timeline = shuffleChampions(this.champions).slice(0, 5);
    this.feedback = '';
    this.roundComplete = false;
  }

  move(index: number, direction: -1 | 1): void {
    if (this.roundComplete) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.timeline.length) return;
    [this.timeline[index], this.timeline[targetIndex]] = [this.timeline[targetIndex], this.timeline[index]];
  }

  check(): void {
    if (this.roundComplete) return;
    this.rounds++;
    this.roundComplete = true;
    const correct = this.timeline.every((champion, index, items) => index === 0 || items[index - 1].anio_de_lanzamiento <= champion.anio_de_lanzamiento);
    if (correct) {
      this.score++;
      this.feedback = '¡Orden perfecto! La cronología es correcta.';
    } else {
      this.feedback = 'Casi. Esta es la cronología correcta.';
      this.timeline = [...this.timeline].sort((a, b) => a.anio_de_lanzamiento - b.anio_de_lanzamiento);
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
