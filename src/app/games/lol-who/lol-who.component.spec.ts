import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolWhoComponent } from './lol-who.component';

describe('LolWhoComponent', () => {
  let fixture: ComponentFixture<LolWhoComponent>;
  let component: LolWhoComponent;
  let httpTesting: HttpTestingController;

  const champions: LoLCharacter[] = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    nombre: `Campeón ${index + 1}`,
    genero: 'Prueba',
    posicion: ['Medio'],
    especie: ['Humano'],
    recurso: ['Maná'],
    tipo_de_gama: ['A distancia'],
    region: ['Runaterra'],
    anio_de_lanzamiento: 2010 + index,
    img_url: `img_lol/champion-${index + 1}.jpg`,
    skins: [{ nombre: `Skin ${index + 1}`, numero: 1, img_url: `https://example.test/champion-${index + 1}-skin.jpg` }],
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LolWhoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LolWhoComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('campeones_lol.json').flush(champions);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('starts zoomed to 300 percent from a non-repeated origin', () => {
    const previousOrigin = component.imageOriginClass;
    expect(component.imageScaleClass).toBe('scale-[3]');
    expect(component.zoomPercent).toBe(300);

    component.startRound();

    expect(component.imageOriginClass).not.toBe(previousOrigin);
    expect(component.zoomTransitionEnabled).toBeFalse();
  });

  it('uses a random skin image for the hidden champion', () => {
    expect(component.targetImageUrl).toBe(component.target!.skins![0].img_url);
  });

  it('falls back to the local image when a skin fails to load', () => {
    component.onTargetImageError();
    expect(component.targetImageUrl).toBe(component.target!.img_url);
  });

  it('scores a correct answer', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();

    expect(component.score).toBe(1);
    expect(component.rounds).toBe(1);
    expect(component.roundComplete).toBeTrue();
  });

  it('reduces zoom after an incorrect valid answer', () => {
    const wrong = champions.find((champion) => champion.id !== component.target!.id)!;
    component.onInput(wrong.nombre);
    component.submitGuess();

    expect(component.attempts).toEqual([wrong.nombre]);
    expect(component.imageScaleClass).toBe('scale-[2.55]');
    expect(component.zoomPercent).toBe(255);
  });

  it('submits the first suggestion with Enter', () => {
    component.onInput('Campeón');
    const firstSuggestion = component.suggestions[0];
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

    expect(component.attempts).toContain(firstSuggestion.nombre);
  });

  it('navigates suggestions with arrow keys', () => {
    component.onInput('Campeón');
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(component.suggestionIndex).toBe(0);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(component.suggestionIndex).toBe(1);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    expect(component.suggestionIndex).toBe(0);
  });
});
