export type BanderadleRoundStatus = 'active' | 'won' | 'lost';

export interface BanderadleCountry {
  code: string;
  code3: string;
  name: string;
  aliases: string[];
  capital: string;
  continent: string;
  flagPath: string;
}

export interface BanderadleCatalog {
  version: number;
  countries: BanderadleCountry[];
}

export interface BanderadleAttempt {
  kind: 'guess' | 'pass';
  code?: string;
  name: string;
  correct: boolean;
}

export interface BanderadleProgressData {
  targetCode: string;
}
