import { Injectable } from '@angular/core';

export interface LoLCharacter {
  id: number;
  nombre: string;
  genero: string;
  posicion: string[];
  especie: string[];
  recurso: string[];
  tipo_de_gama: string[];
  region: string[];
  anio_de_lanzamiento: number;
  img_url: string;
}

export type CompareStatus = 'correct' | 'partial' | 'wrong';
export type Arrow = 'up' | 'down' | null;

export interface GuessResult {
  name: { value: string; status: CompareStatus };
  genero: { value: string; status: CompareStatus };
  img_url: string;
  posicion: { value: string; status: CompareStatus };
  especie: { value: string; status: CompareStatus };
  recurso: { value: string; status: CompareStatus };
  tipo_de_gama: { value: string; status: CompareStatus };
  region: { value: string; status: CompareStatus };
  anio_de_lanzamiento: { value: string; status: CompareStatus; arrow: Arrow };
}

@Injectable({ providedIn: 'root' })
export class LoLGameService {

  filterCharacters(characters: LoLCharacter[], search: string, guessedNames: string[] = []): LoLCharacter[] {
    const value = search.toLowerCase().trim();
    if (!value) return [];
    return characters.filter(
      (char) =>
        char.nombre.toLowerCase().includes(value) &&
        !guessedNames.includes(char.nombre)
    );
  }

  formatYear(year: number): string {
    if (!year || year === 0) return 'N/A';
    return year.toString();
  }

  getFormattedValue(field: string, value: any): string {
    if (!value || value === 'N/A') return 'N/A';
    switch (field) {
      case 'anio_de_lanzamiento':
        return this.formatYear(value);
      default:
        return value.toString();
    }
  }

  findCharacterByName(characters: LoLCharacter[], name: string): LoLCharacter | null {
    const normalizedName = name.toLowerCase().trim();
    return (
      characters.find((char) => char.nombre.toLowerCase() === normalizedName) || null
    );
  }

  compareText(guess: string, target: string, allowPartial = true): CompareStatus {
    if (guess === target) return 'correct';
    if (
      allowPartial &&
      guess &&
      target &&
      guess.toLowerCase() === target.toLowerCase()
    )
      return 'correct';
    if (
      allowPartial &&
      guess &&
      target &&
      guess !== target &&
      guess.toLowerCase().includes(target.toLowerCase())
    )
      return 'partial';
    return 'wrong';
  }

  compareArrays(guess: string[], target: string[]): CompareStatus {
    if (!guess || !target) return 'wrong';
    const guessSet = new Set(guess.map(h => h.toLowerCase()));
    const targetSet = new Set(target.map(h => h.toLowerCase()));
    if (guessSet.size === targetSet.size && [...guessSet].every(h => targetSet.has(h))) {
      return 'correct';
    }
    const hasCommon = [...guessSet].some(h => targetSet.has(h));
    if (hasCommon) return 'partial';
    return 'wrong';
  }

  compareNumeric(guess: number, target: number): { status: CompareStatus; arrow: Arrow } {
    if (guess === target) return { status: 'correct', arrow: null };
    if (guess < target) return { status: 'wrong', arrow: 'up' };
    return { status: 'wrong', arrow: 'down' };
  }

  compareGuess(guess: LoLCharacter, target: LoLCharacter): GuessResult {
    return {
      name: {
        value: guess.nombre,
        status: this.compareText(guess.nombre, target.nombre),
      },
      genero: {
        value: guess.genero || 'N/A',
        status: this.compareText(
          guess.genero || '',
          target.genero || '',
          false
        ),
      },
      img_url: guess.img_url,
      posicion: {
        value: guess.posicion.join(', ') || 'N/A',
        status: this.compareArrays(guess.posicion || [], target.posicion || []),
      },
      especie: {
        value: guess.especie.join(', ') || 'N/A',
        status: this.compareArrays(guess.especie || [], target.especie || []),
      },
      recurso: {
        value: guess.recurso.join(', ') || 'N/A',
        status: this.compareArrays(guess.recurso || [], target.recurso || []),
      },
      tipo_de_gama: {
        value: guess.tipo_de_gama.join(', ') || 'N/A',
        status: this.compareArrays(guess.tipo_de_gama || [], target.tipo_de_gama || []),
      },
      region: {
        value: guess.region.join(', ') || 'N/A',
        status: this.compareArrays(guess.region || [], target.region || []),
      },
      anio_de_lanzamiento: {
        value: this.formatYear(guess.anio_de_lanzamiento || 0),
        ...this.compareNumeric(guess.anio_de_lanzamiento || 0, target.anio_de_lanzamiento || 0),
      },
    };
  }
}
