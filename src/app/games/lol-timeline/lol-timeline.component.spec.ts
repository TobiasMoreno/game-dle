import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolTimelineComponent } from './lol-timeline.component';

describe('LolTimelineComponent', () => {
  it('creates a five-champion timeline', async () => {
    const champions = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1, nombre: `Campeón ${index + 1}`, genero: '', posicion: [], especie: [], recurso: [], tipo_de_gama: [], region: [], anio_de_lanzamiento: 2010 + index, img_url: `img_lol/${index}.jpg`,
    } satisfies LoLCharacter));
    await TestBed.configureTestingModule({ imports: [LolTimelineComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LolTimelineComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('campeones_lol.json').flush(champions);

    expect(fixture.componentInstance.timeline.length).toBe(5);
    http.verify();
  });
});
