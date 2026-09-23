import { Injectable } from '@angular/core';
import {
  BanderadleCountry,
  BanderadleRoundStatus,
} from './banderadle.models';

export const BANDERADLE_MAX_ATTEMPTS = 6;
export const BANDERADLE_BLUR_LEVELS = [28, 22, 17, 12, 7, 2.8] as const;

const COUNTRY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  CZ: 'Chequia',
  MK: 'Macedonia del Norte',
  SZ: 'Esuatini',
  VA: 'Ciudad del Vaticano',
};

@Injectable({ providedIn: 'root' })
export class BanderadleEngineService {
  prepareCountries(countries: BanderadleCountry[]): BanderadleCountry[] {
    return countries.map((country) => {
      const name = COUNTRY_NAME_OVERRIDES[country.code] ?? country.name;
      return {
        ...country,
        name,
        aliases: [...new Set([country.name, name, ...country.aliases])],
      };
    });
  }

  getRandomCountry(countries: BanderadleCountry[], excludedCode?: string): BanderadleCountry {
    if (countries.length === 0) throw new Error('El catálogo de BanderaDLE está vacío.');
    const available = countries.length > 1 && excludedCode
      ? countries.filter(({ code }) => code !== excludedCode)
      : countries;
    return available[Math.floor(Math.random() * available.length)];
  }

  filterCountries(
    countries: BanderadleCountry[],
    query: string,
    guessedCodes: string[],
    limit = 8
  ): BanderadleCountry[] {
    const search = this.normalize(query);
    if (!search) return [];
    const guessed = new Set(guessedCodes);
    return countries
      .filter((country) =>
        !guessed.has(country.code) &&
        this.searchableNames(country).some((name) => name.includes(search))
      )
      .sort((left, right) => {
        const leftStarts = this.normalize(left.name).startsWith(search) ? 0 : 1;
        const rightStarts = this.normalize(right.name).startsWith(search) ? 0 : 1;
        return leftStarts - rightStarts || left.name.localeCompare(right.name, 'es');
      })
      .slice(0, limit);
  }

  findCountry(countries: BanderadleCountry[], query: string): BanderadleCountry | null {
    const search = this.normalize(query);
    return countries.find((country) =>
      this.normalize(country.code) === search ||
      this.normalize(country.code3) === search ||
      this.searchableNames(country).includes(search)
    ) ?? null;
  }

  blurFor(attempts: number, status: BanderadleRoundStatus): number {
    if (status !== 'active') return 0;
    return BANDERADLE_BLUR_LEVELS[
      Math.min(Math.max(attempts, 0), BANDERADLE_BLUR_LEVELS.length - 1)
    ];
  }

  private searchableNames(country: BanderadleCountry): string[] {
    return [country.name, ...country.aliases].map((name) => this.normalize(name));
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
