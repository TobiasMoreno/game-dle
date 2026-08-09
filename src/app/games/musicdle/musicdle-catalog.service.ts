import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import {
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
    const genres = this.unique(songs.flatMap((song) => song.genres));
    const decades = this.unique(songs.map((song) => String(song.decade)))
      .sort((a, b) => Number(a) - Number(b));
    const languages = this.unique(songs.map((song) => song.language));

    return [
      { key: 'all:*', kind: 'all', value: '*', label: 'Todas las canciones' },
      ...genres.map((genre) => ({
        key: `genre:${genre}`,
        kind: 'genre' as const,
        value: genre,
        label: `Género · ${genre}`,
      })),
      ...decades.map((decade) => ({
        key: `decade:${decade}`,
        kind: 'decade' as const,
        value: decade,
        label: `Década · ${decade}s`,
      })),
      ...languages.map((language) => ({
        key: `language:${language}`,
        kind: 'language' as const,
        value: language,
        label: `Idioma · ${language}`,
      })),
    ];
  }

  filterSongs(songs: MusicdleSong[], filter: MusicdleFilter): MusicdleSong[] {
    switch (filter.kind) {
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

  searchSongs(
    songs: MusicdleSong[],
    query: string,
    excludedSongIds: Set<string>,
    limit = 10
  ): MusicdleSong[] {
    const normalizedQuery = this.normalize(query);
    if (!normalizedQuery) return [];

    return songs
      .filter((song) => !excludedSongIds.has(song.id))
      .filter((song) => {
        const haystack = [song.title, song.artist, ...song.aliases]
          .map((value) => this.normalize(value))
          .join(' ');
        return haystack.includes(normalizedQuery);
      })
      .slice(0, limit);
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
      /^[\w-]{11}$/.test(song.youtubeVideoId) &&
      Number.isFinite(song.startSeconds) &&
      song.startSeconds >= 0
    );
  }
}

