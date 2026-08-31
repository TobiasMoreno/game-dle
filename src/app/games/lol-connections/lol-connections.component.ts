import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme.service';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolGameShellComponent } from '../lol-shared/lol-game-shell.component';
import { randomChampionImage, shuffleChampions, validChampions } from '../lol-shared/lol-game.utils';
import { LolConnectionsState, LolConnectionsStorageService } from './lol-connections-storage.service';

type ConnectionCategory = 'position' | 'role' | 'region' | 'species' | 'resource' | 'range' | 'era' | `${string}+${string}`;

interface ConnectionCandidate {
  category: ConnectionCategory;
  title: string;
  champions: LoLCharacter[];
}

export interface ConnectionGroup extends ConnectionCandidate {
  id: number;
  qualifierChampionIds: number[];
}

@Component({
  selector: 'app-lol-connections',
  imports: [LolGameShellComponent],
  templateUrl: './lol-connections.component.html',
})
export class LolConnectionsComponent implements OnInit, OnDestroy {
  readonly title = 'Conexiones LoL';
  readonly instructions = 'Encontrá los cuatro grupos ocultos. Cada conexión puede combinar dos características y tiene exactamente cuatro coincidencias en el tablero.';
  readonly surrenderErrorThreshold = 10;
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
  private readonly storage = inject(LolConnectionsStorageService);
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
        if (!this.restoreRound()) this.startRound();
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
    this.saveRound();
  }

  toggleChampion(champion: LoLCharacter): void {
    if (this.roundComplete) return;
    const next = new Set(this.selectedIds);
    if (next.has(champion.id)) next.delete(champion.id);
    else if (next.size < 4) next.add(champion.id);
    this.selectedIds = next;
    this.feedback = '';
    this.feedbackKind = 'neutral';
    this.saveRound();
  }

  clearSelection(): void {
    this.selectedIds = new Set<number>();
    this.feedback = '';
    this.feedbackKind = 'neutral';
    this.saveRound();
  }

  shuffleBoard(): void {
    this.board = shuffleChampions(this.board);
    this.clearSelection();
  }

  submitSelection(): void {
    if (this.selectedIds.size !== 4 || this.roundComplete) return;
    const pendingGroups = this.groups.filter((group) =>
      !this.solvedGroups.some((solved) => solved.id === group.id)
    );
    const matchingGroup = pendingGroups.find((group) =>
      group.champions.every((champion) => this.selectedIds.has(champion.id))
    );

    if (!matchingGroup) {
      this.errors++;
      const bestMatch = Math.max(...pendingGroups.map((group) =>
        group.champions.filter((champion) => this.selectedIds.has(champion.id)).length
      ));
      const isOneAway = bestMatch === 3;
      this.feedback = isOneAway
        ? '¡Casi! Tenés 3 correctos y 1 incorrecto. Cambiá uno y volvé a comprobar.'
        : 'Esos cuatro no forman uno de los grupos esperados. Probá otra combinación.';
      this.feedbackKind = 'error';
      if (!isOneAway) this.selectedIds = new Set<number>();
      this.saveRound();
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
    this.saveRound();
  }

  giveUp(): void {
    if (this.roundComplete || this.errors < this.surrenderErrorThreshold) return;
    this.solvedGroups = [...this.groups];
    this.board = [];
    this.selectedIds = new Set<number>();
    this.rounds++;
    this.roundComplete = true;
    this.feedback = 'Te rendiste. Estas eran las cuatro conexiones del tablero.';
    this.feedbackKind = 'neutral';
    this.saveRound();
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
      this.saveRound();
    } else {
      (event.target as HTMLImageElement).style.visibility = 'hidden';
    }
  }

  private generateGroups(): ConnectionGroup[] {
    const candidates = this.buildCandidates();
    const categories = [...new Set(candidates.map((candidate) => candidate.category))];
    const prepared = candidates.map((candidate) => ({
      candidate,
      qualifierIds: new Set(candidate.champions.map((champion) => champion.id)),
    }));
    for (let attempt = 0; attempt < 240; attempt++) {
      const drafts: Array<{ candidate: ConnectionCandidate; champions: LoLCharacter[]; qualifierIds: Set<number> }> = [];
      for (const category of this.shuffle(categories)) {
        const viable = this.shuffle(prepared.filter((preparedCandidate) => {
          if (preparedCandidate.candidate.category !== category) return false;
          const proposedDrafts = [...drafts, { ...preparedCandidate, champions: [] }];
          return proposedDrafts.every((draft) => draft.candidate.champions.filter((champion) =>
            proposedDrafts.every((other) => other === draft || !other.qualifierIds.has(champion.id))
          ).length >= 4);
        })).sort((left, right) => left.candidate.champions.length - right.candidate.champions.length);
        const selected = viable[0];
        if (!selected) continue;
        drafts.push({ ...selected, champions: [] });
        if (drafts.length === 4) {
          return drafts.map((draft, index) => ({
            id: index + 1,
            category: draft.candidate.category,
            title: draft.candidate.title,
            champions: shuffleChampions(draft.candidate.champions.filter((champion) =>
              drafts.every((other) => other === draft || !other.qualifierIds.has(champion.id))
            )).slice(0, 4),
            qualifierChampionIds: [...draft.qualifierIds],
          }));
        }
      }
    }
    return [];
  }

  private saveRound(): void {
    if (!this.isBrowser || this.groups.length !== 4) return;
    const state: LolConnectionsState = {
      version: 2,
      savedAt: new Date().toISOString(),
      groups: this.groups.map((group) => ({
        id: group.id,
        category: group.category,
        title: group.title,
        championIds: group.champions.map((champion) => champion.id),
        championNames: group.champions.map((champion) => champion.nombre),
        qualifierChampionIds: group.qualifierChampionIds,
        qualifierChampionNames: group.qualifierChampionIds
          .map((id) => this.champions.find((champion) => champion.id === id)?.nombre)
          .filter((name): name is string => !!name),
      })),
      boardIds: this.board.map((champion) => champion.id),
      selectedIds: [...this.selectedIds],
      solvedGroupIds: this.solvedGroups.map((group) => group.id),
      imageUrls: [...this.roundImageUrls.entries()],
      score: this.score,
      rounds: this.rounds,
      errors: this.errors,
      roundComplete: this.roundComplete,
      feedback: this.feedback,
      feedbackKind: this.feedbackKind,
    };
    this.storage.save(state);
  }

  private restoreRound(): boolean {
    const state = this.storage.load();
    if (!state) return false;
    const championsById = new Map(this.champions.map((champion) => [champion.id, champion]));
    const groups = state.groups.map((storedGroup) => ({
      id: storedGroup.id,
      category: storedGroup.category as ConnectionCategory,
      title: storedGroup.title,
      champions: storedGroup.championIds.map((id) => championsById.get(id)),
      qualifierChampionIds: storedGroup.qualifierChampionIds,
    }));
    const groupChampionIds = groups.flatMap((group) => group.champions.map((champion) => champion?.id));
    const board = state.boardIds.map((id) => championsById.get(id));
    const validGroupIds = new Set(groups.map((group) => group.id));
    const allRoundChampionIds = new Set(groupChampionIds.filter((id): id is number => id !== undefined));
    if (
      groups.some((group) => group.champions.some((champion) => !champion))
      || new Set(groupChampionIds).size !== 16
      || board.some((champion) => !champion)
      || new Set(state.boardIds).size !== state.boardIds.length
      || state.selectedIds.length > 4
      || state.selectedIds.some((id) => !state.boardIds.includes(id))
      || state.solvedGroupIds.some((id) => !validGroupIds.has(id))
      || groups.some((group) => {
        const matchingRoundIds = group.qualifierChampionIds.filter((id) => allRoundChampionIds.has(id));
        return matchingRoundIds.length !== 4
          || group.champions.some((champion) => !champion || !matchingRoundIds.includes(champion.id));
      })
    ) return false;

    this.groups = groups.map((group) => ({ ...group, champions: group.champions as LoLCharacter[] }));
    this.board = board as LoLCharacter[];
    this.selectedIds = new Set(state.selectedIds);
    this.solvedGroups = state.solvedGroupIds.map((id) => this.groups.find((group) => group.id === id)!);
    this.roundImageUrls = new Map(state.imageUrls.filter(([id, url]) => championsById.has(id) && typeof url === 'string'));
    this.score = Number.isFinite(state.score) ? state.score : 0;
    this.rounds = Number.isFinite(state.rounds) ? state.rounds : 0;
    this.errors = Number.isFinite(state.errors) ? state.errors : 0;
    this.roundComplete = state.roundComplete === true;
    this.feedback = typeof state.feedback === 'string' ? state.feedback : '';
    this.feedbackKind = ['neutral', 'success', 'error'].includes(state.feedbackKind) ? state.feedbackKind : 'neutral';
    return true;
  }

  private buildCandidates(): ConnectionCandidate[] {
    const atomicCandidates: ConnectionCandidate[] = [];
    this.addArrayFieldCandidates(atomicCandidates, 'position', 'posicion', (value) => `Juegan en ${value}`);
    this.addArrayFieldCandidates(atomicCandidates, 'role', 'rol', (value) => `Su rol es ${value}`);
    this.addArrayFieldCandidates(atomicCandidates, 'region', 'region', (value) => `Vinculados a ${value}`);
    this.addArrayFieldCandidates(atomicCandidates, 'species', 'especie', (value) => `Son ${value}`);
    this.addArrayFieldCandidates(atomicCandidates, 'resource', 'recurso', (value) => `Usan ${value}`);
    this.addArrayFieldCandidates(atomicCandidates, 'range', 'tipo_de_gama', (value) => `Su alcance es ${value}`);
    const eras = [
      { start: 2009, end: 2011, title: 'Lanzados entre 2009 y 2011' },
      { start: 2012, end: 2014, title: 'Lanzados entre 2012 y 2014' },
      { start: 2015, end: 2017, title: 'Lanzados entre 2015 y 2017' },
      { start: 2018, end: 2020, title: 'Lanzados entre 2018 y 2020' },
      { start: 2021, end: 2099, title: 'Lanzados desde 2021' },
    ];
    for (const era of eras) {
      const champions = this.champions.filter((champion) => champion.anio_de_lanzamiento >= era.start && champion.anio_de_lanzamiento <= era.end);
      if (champions.length >= 4) atomicCandidates.push({ category: 'era', title: era.title, champions });
    }

    const candidatesByChampionSet = new Map<string, ConnectionCandidate>();
    const addCandidate = (candidate: ConnectionCandidate, maximumSize: number): void => {
      if (candidate.champions.length < 4 || candidate.champions.length > maximumSize) return;
      const signature = candidate.champions.map((champion) => champion.id).sort((a, b) => a - b).join(',');
      if (!candidatesByChampionSet.has(signature)) candidatesByChampionSet.set(signature, candidate);
    };

    for (const candidate of atomicCandidates) {
      const isTooGeneric = candidate.title === 'Son Humano' || candidate.title === 'Usan Maná';
      if (!isTooGeneric) addCandidate(candidate, 12);
    }

    for (let leftIndex = 0; leftIndex < atomicCandidates.length; leftIndex++) {
      const left = atomicCandidates[leftIndex];
      const leftIds = new Set(left.champions.map((champion) => champion.id));
      for (let rightIndex = leftIndex + 1; rightIndex < atomicCandidates.length; rightIndex++) {
        const right = atomicCandidates[rightIndex];
        if (left.category === right.category) continue;
        const champions = right.champions.filter((champion) => leftIds.has(champion.id));
        const secondClause = right.title.charAt(0).toLocaleLowerCase('es') + right.title.slice(1);
        addCandidate({
          category: `${left.category}+${right.category}`,
          title: `${left.title} y ${secondClause}`,
          champions,
        }, 10);
      }
    }

    return [...candidatesByChampionSet.values()];
  }

  private addArrayFieldCandidates(
    candidates: ConnectionCandidate[],
    category: ConnectionCategory,
    field: 'posicion' | 'rol' | 'region' | 'especie' | 'recurso' | 'tipo_de_gama',
    title: (value: string) => string,
  ): void {
    const values = new Map<string, LoLCharacter[]>();
    for (const champion of this.champions) {
      for (const value of champion[field] ?? []) values.set(value, [...(values.get(value) ?? []), champion]);
    }
    for (const [value, champions] of values) {
      if (champions.length >= 4) {
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
