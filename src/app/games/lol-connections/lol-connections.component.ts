import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme.service';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolGameShellComponent } from '../lol-shared/lol-game-shell.component';
import { randomChampionImage, shuffleChampions, validChampions } from '../lol-shared/lol-game.utils';

type ConnectionCategory = 'position' | 'role' | 'region' | 'species' | 'resource' | 'range' | 'era';

interface ConnectionCandidate {
  category: ConnectionCategory;
  title: string;
  champions: LoLCharacter[];
}

export interface ConnectionGroup extends ConnectionCandidate {
  id: number;
}

@Component({
  selector: 'app-lol-connections',
  imports: [LolGameShellComponent],
  templateUrl: './lol-connections.component.html',
})
export class LolConnectionsComponent implements OnInit, OnDestroy {
  readonly title = 'Conexiones LoL';
  readonly instructions = 'Encontrá los cuatro grupos ocultos. Elegí cuatro campeones que compartan una característica y comprobá tu selección.';
  champions: LoLCharacter[] = [];
  groups: ConnectionGroup[] = [];
  board: LoLCharacter[] = [];
  roundImageUrls = new Map<number, string>();
  selectedIds = new Set<number>();
  solvedGroups: ConnectionGroup[] = [];
  loading = true;
  score = 0;
  rounds = 0;
  errors = 0;
  feedback = '';
  feedbackKind: 'neutral' | 'success' | 'error' = 'neutral';
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
        this.feedbackKind = 'error';
      },
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  startRound(): void {
    if (!this.champions.length) return;
    this.groups = this.generateGroups();
    this.board = shuffleChampions(this.groups.flatMap((group) => group.champions));
    this.roundImageUrls = new Map(this.board.map((champion) => [champion.id, randomChampionImage(champion)]));
    this.selectedIds = new Set<number>();
    this.solvedGroups = [];
    this.errors = 0;
    this.feedback = '';
    this.feedbackKind = 'neutral';
    this.roundComplete = false;
  }

  toggleChampion(champion: LoLCharacter): void {
    if (this.roundComplete) return;
    const next = new Set(this.selectedIds);
    if (next.has(champion.id)) next.delete(champion.id);
    else if (next.size < 4) next.add(champion.id);
    this.selectedIds = next;
    this.feedback = '';
    this.feedbackKind = 'neutral';
  }

  clearSelection(): void {
    this.selectedIds = new Set<number>();
    this.feedback = '';
    this.feedbackKind = 'neutral';
  }

  shuffleBoard(): void {
    this.board = shuffleChampions(this.board);
    this.clearSelection();
  }

  submitSelection(): void {
    if (this.selectedIds.size !== 4 || this.roundComplete) return;
    const matchingGroup = this.groups.find((group) =>
      !this.solvedGroups.some((solved) => solved.id === group.id)
      && group.champions.every((champion) => this.selectedIds.has(champion.id))
    );

    if (!matchingGroup) {
      this.errors++;
      this.feedback = 'Esos cuatro no forman uno de los grupos esperados. Probá otra combinación.';
      this.feedbackKind = 'error';
      this.selectedIds = new Set<number>();
      return;
    }

    this.solvedGroups = [...this.solvedGroups, matchingGroup];
    this.board = this.board.filter((champion) => !this.selectedIds.has(champion.id));
    this.selectedIds = new Set<number>();
    this.score++;
    this.feedback = `¡Conexión encontrada! ${matchingGroup.title}.`;
    this.feedbackKind = 'success';
    if (this.solvedGroups.length === 4) {
      this.rounds++;
      this.roundComplete = true;
      this.feedback = '¡Tablero resuelto! Encontraste las cuatro conexiones.';
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  imageFor(champion: LoLCharacter): string {
    return this.roundImageUrls.get(champion.id) ?? champion.img_url;
  }

  onImageError(event: Event, champion: LoLCharacter): void {
    if (this.imageFor(champion) !== champion.img_url) {
      this.roundImageUrls = new Map(this.roundImageUrls).set(champion.id, champion.img_url);
    } else {
      (event.target as HTMLImageElement).style.visibility = 'hidden';
    }
  }

  private generateGroups(): ConnectionGroup[] {
    const candidates = this.buildCandidates();
    const categories = [...new Set(candidates.map((candidate) => candidate.category))];
    for (let attempt = 0; attempt < 30; attempt++) {
      const usedIds = new Set<number>();
      const groups: ConnectionGroup[] = [];
      for (const category of this.shuffle(categories)) {
        const viable = this.shuffle(candidates.filter((candidate) =>
          candidate.category === category
          && candidate.champions.filter((champion) => !usedIds.has(champion.id)).length >= 4
        ));
        const candidate = viable[0];
        if (!candidate) continue;
        const champions = shuffleChampions(candidate.champions.filter((champion) => !usedIds.has(champion.id))).slice(0, 4);
        champions.forEach((champion) => usedIds.add(champion.id));
        groups.push({ ...candidate, id: groups.length + 1, champions });
        if (groups.length === 4) return groups;
      }
    }
    return [];
  }

  private buildCandidates(): ConnectionCandidate[] {
    const candidates: ConnectionCandidate[] = [];
    this.addArrayFieldCandidates(candidates, 'position', 'posicion', (value) => `Juegan en ${value}`);
    this.addArrayFieldCandidates(candidates, 'role', 'rol', (value) => `Su rol es ${value}`);
    this.addArrayFieldCandidates(candidates, 'region', 'region', (value) => `Vinculados a ${value}`, 30);
    this.addArrayFieldCandidates(candidates, 'species', 'especie', (value) => `Son ${value}`, 24, new Set(['Humano']));
    this.addArrayFieldCandidates(candidates, 'resource', 'recurso', (value) => `Usan ${value}`, 24, new Set(['Maná']));
    this.addArrayFieldCandidates(candidates, 'range', 'tipo_de_gama', (value) => `Su alcance es ${value}`);
    const eras = [
      { start: 2009, end: 2011, title: 'Lanzados entre 2009 y 2011' },
      { start: 2012, end: 2014, title: 'Lanzados entre 2012 y 2014' },
      { start: 2015, end: 2017, title: 'Lanzados entre 2015 y 2017' },
      { start: 2018, end: 2020, title: 'Lanzados entre 2018 y 2020' },
      { start: 2021, end: 2099, title: 'Lanzados desde 2021' },
    ];
    for (const era of eras) {
      const champions = this.champions.filter((champion) => champion.anio_de_lanzamiento >= era.start && champion.anio_de_lanzamiento <= era.end);
      if (champions.length >= 4) candidates.push({ category: 'era', title: era.title, champions });
    }
    return candidates;
  }

  private addArrayFieldCandidates(
    candidates: ConnectionCandidate[],
    category: ConnectionCategory,
    field: 'posicion' | 'rol' | 'region' | 'especie' | 'recurso' | 'tipo_de_gama',
    title: (value: string) => string,
    maximumPoolSize = Number.POSITIVE_INFINITY,
    excluded = new Set<string>(),
  ): void {
    const values = new Map<string, LoLCharacter[]>();
    for (const champion of this.champions) {
      for (const value of champion[field] ?? []) values.set(value, [...(values.get(value) ?? []), champion]);
    }
    for (const [value, champions] of values) {
      if (champions.length >= 4 && champions.length <= maximumPoolSize && !excluded.has(value)) {
        candidates.push({ category, title: title(value), champions });
      }
    }
  }

  private shuffle<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    return shuffled;
  }
}
