import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MusicdleCatalogService } from './musicdle-catalog.service';
import { MusicdleSong } from './musicdle.models';

describe('MusicdleCatalogService', () => {
  let service: MusicdleCatalogService;

  const songs: MusicdleSong[] = [
    createSong('rock-1', 'Rock nacional'),
    createSong('trap-1', 'Trap argentino'),
    createSong('rock-2', 'Rock nacional'),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(MusicdleCatalogService);
  });

  it('expone todas las canciones y una opción por colección', () => {
    expect(service.buildFilterOptions(songs)).toEqual([
      { key: 'all:*', kind: 'all', value: '*', label: 'Todas las canciones' },
      {
        key: 'collection:Rock nacional',
        kind: 'collection',
        value: 'Rock nacional',
        label: 'Rock nacional',
      },
      {
        key: 'collection:Trap argentino',
        kind: 'collection',
        value: 'Trap argentino',
        label: 'Trap argentino',
      },
    ]);
  });

  it('limita las rondas a la colección seleccionada', () => {
    const filtered = service.filterSongs(songs, {
      kind: 'collection',
      value: 'Trap argentino',
      label: 'Trap argentino',
    });

    expect(filtered.map((song) => song.id)).toEqual(['trap-1']);
  });
});

function createSong(id: string, collection: string): MusicdleSong {
  return {
    id,
    title: id,
    artist: 'Artista',
    aliases: [],
    collection,
    genres: ['Rock'],
    decade: 2020,
    language: 'Español',
    youtubeVideoId: `${id.padEnd(11, '0')}`,
    startSeconds: 20,
    enabled: true,
  };
}
