import { Injectable } from '@angular/core';
import {
  GeodleArrow,
  GeodleCountry,
  GeodleGuessResult,
  GeodleMatchStatus,
} from './geodle.models';

@Injectable({ providedIn: 'root' })
export class GeodleEngineService {
  getRandomCountry(countries: GeodleCountry[], excludedCode?: string): GeodleCountry {
    if (countries.length === 0) throw new Error('El catálogo de GeoDLE está vacío.');
    const availableCountries = countries.length > 1 && excludedCode
      ? countries.filter(({ code }) => code !== excludedCode)
      : countries;
    return availableCountries[Math.floor(Math.random() * availableCountries.length)];
  }

  getDailyCountry(countries: GeodleCountry[], date: string): GeodleCountry {
    if (countries.length === 0) throw new Error('El catálogo de GeoDLE está vacío.');
    const stableCountries = [...countries].sort((a, b) => a.code.localeCompare(b.code));
    return stableCountries[this.hashDate(date) % stableCountries.length];
  }

  filterCountries(
    countries: GeodleCountry[],
    query: string,
    guessedCodes: string[],
    limit = 8
  ): GeodleCountry[] {
    const search = this.normalize(query);
    if (!search) return [];
    const guessed = new Set(guessedCodes);
    return countries
      .filter((country) => !guessed.has(country.code) && this.searchableNames(country).some((name) => name.includes(search)))
      .sort((a, b) => {
        const aStarts = this.normalize(a.name).startsWith(search) ? 0 : 1;
        const bStarts = this.normalize(b.name).startsWith(search) ? 0 : 1;
        return aStarts - bStarts || a.name.localeCompare(b.name, 'es');
      })
      .slice(0, limit);
  }

  findCountry(countries: GeodleCountry[], query: string): GeodleCountry | null {
    const search = this.normalize(query);
    return countries.find((country) =>
      country.code.toLowerCase() === search ||
      country.code3.toLowerCase() === search ||
      this.searchableNames(country).includes(search)
    ) ?? null;
  }

  compare(guess: GeodleCountry, target: GeodleCountry): GeodleGuessResult {
    const area = this.compareNumber(guess.areaKm2, target.areaKm2);
    const population = this.compareNumber(guess.population, target.population);
    const borders = this.compareNumber(guess.borders.length, target.borders.length, 0);
    return {
      code: guess.code,
      name: guess.name,
      flagPath: guess.flagPath,
      country: { value: guess.name, status: guess.code === target.code ? 'correct' : 'wrong' },
      continent: { value: guess.continent, status: this.compareText(guess.continent, target.continent) },
      subregion: { value: guess.subregion, status: this.compareText(guess.subregion, target.subregion) },
      hemisphere: {
        value: this.hemisphereLabel(guess),
        status: this.compareArrays(this.hemispheres(guess), this.hemispheres(target)),
      },
      languages: {
        value: guess.languages.join(', '),
        status: this.compareArrays(guess.languages, target.languages),
      },
      area: { value: this.formatArea(guess.areaKm2), ...area },
      population: { value: this.formatPopulation(guess.population), ...population },
      borders: { value: String(guess.borders.length), ...borders },
    };
  }

  private searchableNames(country: GeodleCountry): string[] {
    return [country.name, ...country.aliases].map((name) => this.normalize(name));
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private compareText(guess: string, target: string): GeodleMatchStatus {
    return this.normalize(guess) === this.normalize(target) ? 'correct' : 'wrong';
  }

  private compareArrays(guess: string[], target: string[]): GeodleMatchStatus {
    const guessSet = new Set(guess.map((value) => this.normalize(value)));
    const targetSet = new Set(target.map((value) => this.normalize(value)));
    if (guessSet.size === targetSet.size && [...guessSet].every((value) => targetSet.has(value))) return 'correct';
    return [...guessSet].some((value) => targetSet.has(value)) ? 'partial' : 'wrong';
  }

  private compareNumber(
    guess: number,
    target: number,
    partialThreshold = 0.15
  ): { status: GeodleMatchStatus; arrow: GeodleArrow } {
    if (guess === target) return { status: 'correct', arrow: null };
    const difference = Math.abs(guess - target) / Math.max(Math.abs(target), 1);
    return {
      status: partialThreshold > 0 && difference <= partialThreshold ? 'partial' : 'wrong',
      arrow: guess < target ? 'up' : 'down',
    };
  }

  private hemispheres(country: GeodleCountry): string[] {
    const [latitude, longitude] = country.coordinates;
    return [latitude >= 0 ? 'Norte' : 'Sur', longitude >= 0 ? 'Este' : 'Oeste'];
  }

  private hemisphereLabel(country: GeodleCountry): string {
    return this.hemispheres(country).join(' · ');
  }

  private formatArea(area: number): string {
    return `${new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(area)} km²`;
  }

  private formatPopulation(population: number): string {
    return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(population);
  }

  private hashDate(date: string): number {
    let hash = 2166136261;
    for (const character of `geodle-v1:${date}`) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
