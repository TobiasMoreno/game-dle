import { Injectable } from '@angular/core';

export interface OnePieceCharacter {
  id: number;
  nombre: string;
  genero: string;
  afiliacion: string;
  fruta_del_diablo: string;
  hakis: string[];
  ultima_recompensa: number;
  altura: number;
  origen: string;
  primer_arco_id: number;
  img_url: string;
}

export interface OnePieceArc {
  id: number;
  name: string;
}

export type CompareStatus = 'correct' | 'partial' | 'wrong';
export type Arrow = 'up' | 'down' | null;

export interface GuessResult {
  name: { value: string; status: CompareStatus };
  genero: { value: string; status: CompareStatus };
  img_url: string;
  afiliacion: { value: string; status: CompareStatus };
  fruta_del_diablo: { value: string; status: CompareStatus };
  hakis: { value: string; status: CompareStatus };
  ultima_recompensa: { value: string; status: CompareStatus; arrow: Arrow };
  altura: { value: string; status: CompareStatus; arrow: Arrow };
  origen: { value: string; status: CompareStatus };
  primer_arco: { value: string; status: CompareStatus; arrow: Arrow };
}

@Injectable({ providedIn: 'root' })
export class OnePieceGameService {
  private arcs: OnePieceArc[] = [];

  constructor() {
    this.loadArcs();
  }

  private loadArcs(): void {
    fetch('arcos.json')
      .then((response) => response.json())
      .then((data) => {
        this.arcs = data;
      })
      .catch((error) => {
        console.error('Error cargando arcos:', error);
      });
  }

  getArcName(arcId: number): string {
    const arc = this.arcs.find((a) => a.id === arcId);
    return arc ? arc.name : 'N/A';
  }

  filterCharacters(
    characters: OnePieceCharacter[],
    search: string,
    guessedNames: string[] = []
  ): OnePieceCharacter[] {
    //TODO: ordenar alfabeticamente
    const value = search.toLowerCase().trim();
    return characters.filter(
      (char) =>
        (char.nombre.toLowerCase().includes(value) ||
          (char.afiliacion && char.afiliacion.toLowerCase().includes(value))) &&
        !guessedNames.includes(char.nombre)
    );
  }

  formatReward(reward: number): string {
    if (!reward || reward === 0) return 'N/A';
    if (reward >= 1000000) {
      const millions = reward / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (reward >= 1000) {
      const thousands = reward / 1000;
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return reward.toString();
  }

  formatHeight(height: number): string {
    if (!height || height === 0) return 'N/A';
    const meters = height / 100;
    return `${meters.toFixed(2)}M`;
  }

  getFormattedValue(field: string, value: any): string {
    if (!value || value === 'N/A') return 'N/A';
    switch (field) {
      case 'ultima_recompensa':
        return this.formatReward(value);
      case 'altura':
        return this.formatHeight(value);
      default:
        return value.toString();
    }
  }

  findCharacterByName(
    characters: OnePieceCharacter[],
    name: string
  ): OnePieceCharacter | null {
    const normalizedName = name.toLowerCase().trim();
    return (
      characters.find((char) => char.nombre.toLowerCase() === normalizedName) ||
      null
    );
  }

  compareText(
    guess: string,
    target: string,
    allowPartial = true
  ): CompareStatus {
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

  compareNumeric(
    guess: number,
    target: number
  ): { status: CompareStatus; arrow: Arrow } {
    if (guess === target) return { status: 'correct', arrow: null };
    if (guess < target) return { status: 'wrong', arrow: 'up' };
    return { status: 'wrong', arrow: 'down' };
  }

  compareHakis(guess: string[], target: string[]): CompareStatus {
    if (!guess || !target) return 'wrong';
    const guessSet = new Set(guess.map((h) => h.toLowerCase()));
    const targetSet = new Set(target.map((h) => h.toLowerCase()));
    if (
      guessSet.size === targetSet.size &&
      [...guessSet].every((h) => targetSet.has(h))
    ) {
      return 'correct';
    }
    const hasCommon = [...guessSet].some((h) => targetSet.has(h));
    if (hasCommon) return 'partial';
    return 'wrong';
  }

  compareGuess(
    guess: OnePieceCharacter,
    target: OnePieceCharacter
  ): GuessResult {
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
      afiliacion: {
        value: guess.afiliacion || 'N/A',
        status: this.compareText(
          guess.afiliacion || '',
          target.afiliacion || '',
          true
        ),
      },
      fruta_del_diablo: {
        value: guess.fruta_del_diablo || 'N/A',
        status: this.compareText(
          guess.fruta_del_diablo || '',
          target.fruta_del_diablo || '',
          true
        ),
      },
      hakis: {
        value: guess.hakis.join(', ') || 'N/A',
        status: this.compareHakis(guess.hakis || [], target.hakis || []),
      },
      ultima_recompensa: {
        value: this.formatReward(guess.ultima_recompensa || 0),
        ...this.compareNumeric(
          guess.ultima_recompensa || 0,
          target.ultima_recompensa || 0
        ),
      },
      altura: {
        value: this.formatHeight(guess.altura || 0),
        ...this.compareNumeric(guess.altura || 0, target.altura || 0),
      },
      origen: {
        value: guess.origen || 'N/A',
        status: this.compareText(guess.origen || '', target.origen || '', true),
      },
      primer_arco: {
        value: this.getArcName(guess.primer_arco_id || 0),
        ...this.compareNumeric(
          guess.primer_arco_id || 0,
          target.primer_arco_id || 0
        ),
      },
    };
  }
}
