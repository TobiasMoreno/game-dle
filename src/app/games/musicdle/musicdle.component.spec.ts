import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MusicdleComponent } from './musicdle.component';
import { MusicdleEngineService } from './musicdle-engine.service';
import { MusicdleFilter, MusicdleSong } from './musicdle.models';
import { MusicdleStorageService } from './musicdle-storage.service';
import { MusicdleYoutubePlayerComponent } from './musicdle-youtube-player.component';

describe('MusicdleComponent categorías múltiples', () => {
  const songs: MusicdleSong[] = ['Cuarteto', 'Rock nacional', 'Trap argentino'].map((collection, index) => ({
    id: `song-${index}`, title: `Tema ${index}`, artist: 'Artista', aliases: [], collection,
    genres: [], decade: 2020, language: 'Español', youtubeVideoId: 'abcdefghijk',
    startSeconds: 0, enabled: true,
  }));
  const combined: MusicdleFilter = {
    kind: 'collection', value: 'Cuarteto', values: ['Cuarteto', 'Rock nacional'],
    label: 'Cuarteto + Rock nacional',
  };
  let storage: MusicdleStorageService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MusicdleComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    storage = TestBed.inject(MusicdleStorageService);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  function load(): MusicdleComponent {
    const component = TestBed.createComponent(MusicdleComponent).componentInstance;
    spyOn(component, 'setGameId');
    component.ngOnInit();
    TestBed.inject(HttpTestingController).expectOne('/musicdle-songs.json').flush(songs);
    return component;
  }

  it('permite combinar, quitar y volver a todas las categorías', () => {
    const component = load();
    component.onFilterChange('collection:Cuarteto');
    component.onFilterChange('collection:Rock nacional');
    expect(component.selectedFilter).toEqual(combined);
    expect(component.round?.filter).toEqual(combined);
    component.onGuessInputChange('Tema');
    expect(component.suggestions.map((song) => song.id)).toEqual(['song-0', 'song-1']);

    component.onFilterChange('collection:Cuarteto');
    expect(component.selectedFilter.values).toEqual(['Rock nacional']);
    component.onFilterChange('collection:Rock nacional');
    expect(component.selectedFilter.values).toEqual(['Rock nacional']);

    component.onFilterChange('all:*');
    expect(component.selectedFilter.kind).toBe('all');
    component.onGuessInputChange('Tema');
    expect(component.suggestions.length).toBe(3);
  });

  it('refleja la selección en las casillas y evita desmarcar la última categoría', () => {
    spyOn(MusicdleYoutubePlayerComponent.prototype, 'ngAfterViewInit');
    const fixture = TestBed.createComponent(MusicdleComponent);
    spyOn(fixture.componentInstance, 'setGameId');
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/musicdle-songs.json').flush(songs);
    fixture.detectChanges();
    const labels: HTMLLabelElement[] = Array.from(fixture.nativeElement.querySelectorAll('.category-option'));
    const checkbox = (text: string) => labels.find((label) => label.textContent?.trim() === text)!
      .querySelector('input')!;
    const cuarteto = checkbox('Cuarteto');
    const rock = checkbox('Rock nacional');
    cuarteto.click();
    fixture.detectChanges();
    rock.click();
    fixture.detectChanges();

    expect(cuarteto.checked).toBeTrue();
    expect(rock.checked).toBeTrue();
    expect(checkbox('Todas las canciones').checked).toBeFalse();
    expect(fixture.nativeElement.querySelector('summary').textContent).toContain(combined.label);

    cuarteto.click();
    fixture.detectChanges();
    rock.click();
    fixture.detectChanges();
    expect(rock.checked).toBeTrue();
    expect(fixture.componentInstance.selectedFilter.values).toEqual(['Rock nacional']);
  });

  it('restaura una ronda con varias categorías y conserva los intentos', () => {
    const round = new MusicdleEngineService().pass(
      new MusicdleEngineService().createRound('song-0', combined)
    );
    storage.saveRound(round);
    const component = load();
    expect(component.selectedFilter).toEqual(combined);
    expect(component.round).toEqual(round);
    component.onFilterChange('collection:Trap argentino');
    expect(component.selectedFilter).toEqual(combined);
    expect(component.round).toEqual(round);
  });

  it('aplica las categorías nuevas en la siguiente ronda tras un resultado', () => {
    const round = new MusicdleEngineService().createRound('song-0', combined);
    storage.saveRound({ ...round, status: 'won' });
    const component = load();
    component.onFilterChange('collection:Cuarteto');
    expect(component.round?.filter).toEqual(combined);
    expect(component.selectedFilter.values).toEqual(['Rock nacional']);
    component.nextRound();
    expect(component.targetSong?.collection).toBe('Rock nacional');
    expect(component.round?.filter.values).toEqual(['Rock nacional']);
  });

  it('permite agregar otra categoría cuando la seleccionada no tiene canciones disponibles', () => {
    storage.saveFilter({ kind: 'collection', value: 'Cuarteto', label: 'Cuarteto' });
    storage.addCooldown('song-0', 'played');
    const component = load();
    expect(component.round).toBeNull();
    component.onFilterChange('collection:Rock nacional');
    expect(component.selectedFilter).toEqual(combined);
    expect(component.targetSong?.id).toBe('song-1');
  });
});
