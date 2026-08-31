import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolConnectionsComponent } from './lol-connections.component';

describe('LolConnectionsComponent', () => {
  const storageKey = 'game-dle-lol-connections-state-v2';
  const champions: LoLCharacter[] = Array.from({ length: 32 }, (_, index) => ({
    id: index + 1, nombre: `Campeón ${index + 1}`, genero: '',
    posicion: [index < 4 ? 'Medio' : 'Reserva'],
    especie: [index >= 4 && index < 8 ? 'Yordle' : 'Humano'],
    recurso: [index >= 8 && index < 12 ? 'Energía' : 'Maná'],
    tipo_de_gama: ['A distancia'],
    region: [index >= 12 && index < 16 ? 'Demacia' : 'Runaterra'],
    rol: ['Mago'],
    anio_de_lanzamiento: 2009,
    img_url: `img_lol/${index}.jpg`,
    skins: [{ nombre: `Skin ${index}`, numero: 1, img_url: `https://example.test/${index}-skin.jpg` }],
  }));

  async function createComponent() {
    await TestBed.configureTestingModule({ imports: [LolConnectionsComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LolConnectionsComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('campeones_lol.json').flush(champions);
    fixture.detectChanges();
    return { fixture, http };
  }

  beforeEach(() => localStorage.removeItem(storageKey));

  it('creates four groups with sixteen unique champions', async () => {
    const { fixture, http } = await createComponent();
    expect(fixture.componentInstance.groups.length).toBe(4);
    expect(fixture.componentInstance.board.length).toBe(16);
    expect(new Set(fixture.componentInstance.board.map((champion) => champion.id)).size).toBe(16);
    const roundIds = fixture.componentInstance.groups.flatMap((group) => group.champions.map((champion) => champion.id));
    for (const group of fixture.componentInstance.groups) {
      const matchingIds = roundIds.filter((id) => group.qualifierChampionIds.includes(id));
      expect(new Set(matchingIds)).toEqual(new Set(group.champions.map((champion) => champion.id)));
    }
    http.verify();
  });

  it('moves a correct group out of the board', async () => {
    const { fixture, http } = await createComponent();
    const component = fixture.componentInstance;
    component.groups[0].champions.forEach((champion) => component.toggleChampion(champion));
    component.submitSelection();
    expect(component.solvedGroups.length).toBe(1);
    expect(component.board.length).toBe(12);
    expect(component.score).toBe(1);
    http.verify();
  });

  it('keeps the selection and warns when three champions are correct', async () => {
    const { fixture, http } = await createComponent();
    const component = fixture.componentInstance;
    const group = component.groups[0];
    const groupIds = new Set(group.champions.map((champion) => champion.id));
    const incorrectChampion = component.board.find((champion) => !groupIds.has(champion.id))!;
    [...group.champions.slice(0, 3), incorrectChampion].forEach((champion) => component.toggleChampion(champion));

    component.submitSelection();

    expect(component.feedback).toContain('3 correctos y 1 incorrecto');
    expect(component.selectedIds.size).toBe(4);
    expect(component.solvedGroups.length).toBe(0);
    expect(component.errors).toBe(1);
    http.verify();
  });

  it('uses a skin image for every champion on the board', async () => {
    const { fixture, http } = await createComponent();
    const component = fixture.componentInstance;
    expect(component.board.every((champion) => component.imageFor(champion) === champion.skins![0].img_url)).toBeTrue();
    http.verify();
  });

  it('stores the four generated connections with champion names', async () => {
    const { http } = await createComponent();
    const stored = JSON.parse(localStorage.getItem(storageKey)!);

    expect(stored.groups.length).toBe(4);
    expect(stored.groups.every((group: { championNames: string[] }) => group.championNames.length === 4)).toBeTrue();
    expect(stored.groups.every((group: { qualifierChampionNames: string[] }) => group.qualifierChampionNames.length >= 4)).toBeTrue();
    expect(stored.boardIds.length).toBe(16);
    http.verify();
  });

  it('restores the same connections after reloading', async () => {
    const { fixture, http } = await createComponent();
    const expectedGroups = fixture.componentInstance.groups.map((group) => group.champions.map((champion) => champion.id));
    fixture.destroy();

    const restoredFixture = TestBed.createComponent(LolConnectionsComponent);
    restoredFixture.detectChanges();
    http.expectOne('campeones_lol.json').flush(champions);
    restoredFixture.detectChanges();

    expect(restoredFixture.componentInstance.groups.map((group) => group.champions.map((champion) => champion.id))).toEqual(expectedGroups);
    restoredFixture.destroy();
    http.verify();
  });
});
