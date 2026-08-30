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
    skins: [
      { nombre: `Skin ${index + 1} A`, numero: 1, img_url: `https://example.test/champion-${index + 1}-skin-a.jpg` },
      { nombre: `Skin ${index + 1} B`, numero: 2, img_url: `https://example.test/champion-${index + 1}-skin-b.jpg` },
    ],
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
    expect(component.target!.skins!.map((skin) => skin.img_url)).toContain(component.targetImageUrl);
    expect(component.targetSkin?.img_url).toBe(component.targetImageUrl);
  });

  it('falls back to the local image when a skin fails to load', () => {
    component.onTargetImageError();
    expect(component.targetImageUrl).toBe(component.target!.img_url);
    expect(component.targetSkin).toBeNull();
  });

  it('asks for one skin selection after guessing the champion', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();

    fixture.detectChanges();
    const dropdown = fixture.nativeElement.querySelector('#who-skin') as HTMLInputElement;
    expect(component.championGuessed).toBeTrue();
    expect(component.roundComplete).toBeFalse();
    expect(dropdown.getAttribute('role')).toBe('combobox');

    component.openSkinDropdown();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(component.skinOptions.length);
  });

  it('filters skin names while typing', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();
    component.onSkinSearch(' b');

    fixture.detectChanges();
    expect(component.filteredSkinOptions.length).toBe(1);
    expect(component.filteredSkinOptions[0].nombre).toContain(' B');
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(1);
  });

  it('selects one skin with the keyboard', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();

    component.onSkinDropdownKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    component.onSkinDropdownKeydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

    expect(component.selectedSkinNumber).toBe(component.skinOptions[0].numero);
    expect(component.skinDropdownOpen).toBeFalse();
  });

  it('scores after choosing the correct skin', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();
    component.selectedSkinNumber = component.targetSkin!.numero;
    component.submitSkinGuess();

    expect(component.score).toBe(1);
    expect(component.rounds).toBe(1);
    expect(component.roundComplete).toBeTrue();
  });

  it('finishes without scoring after choosing the wrong skin', () => {
    component.onInput(component.target!.nombre);
    component.submitGuess();
    component.selectedSkinNumber = component.skinOptions.find((skin) => skin.numero !== component.targetSkin!.numero)!.numero;
    component.submitSkinGuess();

    expect(component.score).toBe(0);
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
