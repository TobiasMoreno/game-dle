export type GeodleMatchStatus = 'correct' | 'partial' | 'wrong';
export type GeodleArrow = 'up' | 'down' | null;

export interface GeodleCountry {
  code: string;
  code3: string;
  name: string;
  aliases: string[];
  capital: string;
  continent: string;
  subregion: string;
  languages: string[];
  currencies: string[];
  areaKm2: number;
  population: number;
  coordinates: [number, number];
  borders: string[];
  flagPath: string;
}

export interface GeodleCatalog {
  version: number;
  generatedAt: string;
  source: string;
  flagSource: string;
  countries: GeodleCountry[];
}

export interface GeodleCell {
  value: string;
  status: GeodleMatchStatus;
  arrow?: GeodleArrow;
}

export interface GeodleGuessResult {
  code: string;
  name: string;
  flagPath: string;
  country: GeodleCell;
  continent: GeodleCell;
  subregion: GeodleCell;
  hemisphere: GeodleCell;
  languages: GeodleCell;
  area: GeodleCell;
  population: GeodleCell;
  borders: GeodleCell;
}

export interface GeodleProgressData {
  targetCode: string;
}
