import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
  MusicdleArtistOption,
  MusicdleFilter,
  MusicdleFilterOption,
  MusicdleSong,
} from './musicdle.models';

@Injectable({ providedIn: 'root' })
export class MusicdleCatalogService {
  private readonly http = inject(HttpClient);
  private readonly catalog$ = this.http
    .get<MusicdleSong[]>('/musicdle-songs.json')
    .pipe(
      map((songs) => songs.filter((song) => this.isValidSong(song))),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  loadSongs(): Observable<MusicdleSong[]> {
    return this.catalog$;
  }

  buildFilterOptions(songs: MusicdleSong[]): MusicdleFilterOption[] {
    const collections = this.unique(songs.map((song) => song.collection));

    return [
      { key: 'all:*', kind: 'all', value: '*', label: 'Todas las canciones' },
      ...collections.map((collection) => ({
        key: `collection:${collection}`,
        kind: 'collection' as const,
        value: collection,
        label: collection,
      })),
    ];
  }

  buildArtistOptions(
    songs: MusicdleSong[],
    excludedSongIds: Set<string> = new Set()
  ): MusicdleArtistOption[] {
    const counts = new Map<string, number>();

    for (const song of songs) {
      for (const artist of new Set(song.artists)) {
        if (!counts.has(artist)) counts.set(artist, 0);
        if (!excludedSongIds.has(song.id)) {
          counts.set(artist, (counts.get(artist) ?? 0) + 1);
        }
      }
    }

    return [...counts.entries()]
      .map(([artist, availableSongs]) => ({
        value: artist,
        label: artist,
        availableSongs,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }

  filterSongs(songs: MusicdleSong[], filter: MusicdleFilter): MusicdleSong[] {
    const categorySongs = this.filterSongsByCategory(songs, filter);
    const selectedArtists = new Set(
      (filter.artistValues ?? []).map((artist) => this.normalize(artist))
    );

    if (selectedArtists.size === 0) return categorySongs;

    return categorySongs.filter((song) => song.artists.some(
      (artist) => selectedArtists.has(this.normalize(artist))
    ));
  }

  filterSongsByCategory(songs: MusicdleSong[], filter: MusicdleFilter): MusicdleSong[] {
    switch (filter.kind) {
      case 'collection':
        return songs.filter((song) => (filter.values ?? [filter.value]).includes(song.collection));
      case 'genre':
        return songs.filter((song) => song.genres.includes(filter.value));
      case 'decade':
        return songs.filter((song) => String(song.decade) === filter.value);
      case 'language':
        return songs.filter((song) => song.language === filter.value);
      default:
        return songs;
    }
  }

  searchArtistOptions(
    options: MusicdleArtistOption[],
    query: string
  ): MusicdleArtistOption[] {
    const normalizedQuery = this.normalize(query);
    if (!normalizedQuery) return options;
    return options.filter((option) => this.normalize(option.label).includes(normalizedQuery));
  }

  resolveFilter(
    filter: MusicdleFilter,
    options: MusicdleFilterOption[]
  ): MusicdleFilter | null {
    const artistValues = this.unique(filter.artistValues ?? []);
    if (filter.kind !== 'collection') {
      const selected = options.find(
        (option) => option.kind === filter.kind && option.value === filter.value
      );
      return selected ? {
        ...selected,
        ...(artistValues.length ? { artistValues } : {}),
      } : null;
    }

    const values = this.unique(filter.values ?? [filter.value]);
    const selected = values.map((value) => options.find(
      (option) => option.kind === 'collection' && option.value === value
    ));
    if (!selected.length || selected.some((option) => !option)) return null;

    return {
      kind: 'collection',
      value: values[0],
      values,
      label: selected.map((option) => option!.label).join(' + '),
      ...(artistValues.length ? { artistValues } : {}),
    };
  }

  searchSongs(
    songs: MusicdleSong[],
    query: string,
    excludedSongIds: Set<string>
  ): MusicdleSong[] {
    const normalizedQuery = this.normalize(query);
    if (normalizedQuery.length < 2) return [];

    return songs
      .filter((song) => !excludedSongIds.has(song.id))
      .filter((song) => {
        const haystack = [song.title, song.artist, ...song.aliases]
          .map((value) => this.normalize(value))
          .join(' ');
        return haystack.includes(normalizedQuery);
      });
  }

  pickRandomSong(songs: MusicdleSong[], excludedSongIds: Set<string>): MusicdleSong | null {
    const candidates = songs.filter((song) => !excludedSongIds.has(song.id));
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private unique(values: string[]): string[] {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }

  private isValidSong(song: MusicdleSong): boolean {
    return Boolean(
      song?.enabled &&
      song.id &&
      song.title &&
      song.artist &&
      Array.isArray(song.artists) &&
      song.artists.length > 0 &&
      song.artists.every((artist) => typeof artist === 'string' && artist.trim()) &&
      song.collection &&
      /^[\w-]{11}$/.test(song.youtubeVideoId) &&
      Number.isFinite(song.startSeconds) &&
      song.startSeconds >= 0
    );
  }
}
