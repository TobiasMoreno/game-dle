import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolConnectionsComponent } from './lol-connections.component';

describe('LolConnectionsComponent', () => {
  const champions: LoLCharacter[] = Array.from({ length: 32 }, (_, index) => ({
    id: index + 1, nombre: `Campeón ${index + 1}`, genero: '',
    posicion: [index < 16 ? 'Medio' : 'Superior'], especie: [index % 2 === 0 ? 'Vastaya' : 'Yordle'],
    recurso: [index % 3 === 0 ? 'Energía' : 'Sin Maná'], tipo_de_gama: [index % 2 === 0 ? 'A distancia' : 'Cuerpo a cuerpo'],
    region: [index < 16 ? 'Demacia' : 'Noxus'], rol: [index % 2 === 0 ? 'Mago' : 'Luchador'],
    anio_de_lanzamiento: 2009 + (index % 12), img_url: `img_lol/${index}.jpg`,
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

  it('creates four groups with sixteen unique champions', async () => {
    const { fixture, http } = await createComponent();
    expect(fixture.componentInstance.groups.length).toBe(4);
    expect(fixture.componentInstance.board.length).toBe(16);
    expect(new Set(fixture.componentInstance.board.map((champion) => champion.id)).size).toBe(16);
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

  it('uses a skin image for every champion on the board', async () => {
    const { fixture, http } = await createComponent();
    const component = fixture.componentInstance;
    expect(component.board.every((champion) => component.imageFor(champion) === champion.skins![0].img_url)).toBeTrue();
    http.verify();
  });
});
