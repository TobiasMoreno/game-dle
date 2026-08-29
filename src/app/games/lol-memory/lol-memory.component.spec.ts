import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolMemoryComponent } from './lol-memory.component';

describe('LolMemoryComponent', () => {
  it('creates six independent image-name pairs', async () => {
    const champions = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1, nombre: `Campeón ${index + 1}`, genero: '', posicion: [], especie: [], recurso: [], tipo_de_gama: [], region: [], anio_de_lanzamiento: 2010 + index, img_url: `img_lol/${index}.jpg`,
    } satisfies LoLCharacter));
    await TestBed.configureTestingModule({ imports: [LolMemoryComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LolMemoryComponent);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('campeones_lol.json').flush(champions);

    expect(fixture.componentInstance.cards.length).toBe(12);
    expect(new Set(fixture.componentInstance.cards.map((card) => card.championId)).size).toBe(6);
    http.verify();
  });
});
