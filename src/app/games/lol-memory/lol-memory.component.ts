import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme.service';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolGameShellComponent } from '../lol-shared/lol-game-shell.component';
import { shuffleChampions, validChampions } from '../lol-shared/lol-game.utils';

interface MemoryCard {
  key: string;
  championId: number;
  label: string;
  imageUrl?: string;
  revealed: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-lol-memory',
  imports: [LolGameShellComponent],
  templateUrl: './lol-memory.component.html',
})
export class LolMemoryComponent implements OnInit, OnDestroy {
  readonly title = 'Memoria de campeones';
  readonly instructions = 'Encontrá cada campeón y uní su retrato con su nombre.';
  champions: LoLCharacter[] = [];
  cards: MemoryCard[] = [];
  selectedCards: number[] = [];
  loading = true;
  score = 0;
  rounds = 0;
  feedback = '';
  roundComplete = false;

  private readonly http = inject(HttpClient);
  private readonly themeService = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly subscriptions = new Subscription();
  private memoryTimer: ReturnType<typeof setTimeout> | null = null;

  get matches(): number {
    return this.cards.filter((card) => card.matched).length / 2;
  }

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
    if (this.memoryTimer) clearTimeout(this.memoryTimer);
  }

  startRound(): void {
    if (!this.champions.length) return;
    if (this.memoryTimer) clearTimeout(this.memoryTimer);
    const selected = shuffleChampions(this.champions).slice(0, 6);
    this.cards = this.shuffleCards(selected.flatMap((champion) => [
      { key: `${champion.id}-image`, championId: champion.id, label: champion.nombre, imageUrl: champion.img_url, revealed: false, matched: false },
      { key: `${champion.id}-name`, championId: champion.id, label: champion.nombre, revealed: false, matched: false },
    ]));
    this.selectedCards = [];
    this.feedback = '';
    this.roundComplete = false;
  }

  revealCard(index: number): void {
    const card = this.cards[index];
    if (!card || card.revealed || card.matched || this.selectedCards.length === 2) return;
    card.revealed = true;
    this.selectedCards.push(index);
    if (this.selectedCards.length < 2) return;
    const [firstIndex, secondIndex] = this.selectedCards;
    const first = this.cards[firstIndex];
    const second = this.cards[secondIndex];
    if (first.championId === second.championId) {
      first.matched = true;
      second.matched = true;
      this.selectedCards = [];
      if (this.cards.every((item) => item.matched)) {
        this.score++;
        this.rounds++;
        this.roundComplete = true;
        this.feedback = '¡Tablero completo! Encontraste las seis parejas.';
      }
      return;
    }
    this.memoryTimer = setTimeout(() => {
      first.revealed = false;
      second.revealed = false;
      this.selectedCards = [];
    }, 850);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  private shuffleCards(cards: MemoryCard[]): MemoryCard[] {
    const items = [...cards];
    for (let index = items.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [items[index], items[other]] = [items[other], items[index]];
    }
    return items;
  }
}
