export type RoscoCategory =
  | 'players'
  | 'teams'
  | 'boca'
  | 'river'
  | 'independiente'
  | 'racing'
  | 'san-lorenzo'
  | 'talleres'
  | 'belgrano'
  | 'premier-league'
  | 'la-liga'
  | 'serie-a'
  | 'bundesliga'
  | 'ligue-1'
  | 'arsenal'
  | 'chelsea'
  | 'liverpool'
  | 'manchester-city'
  | 'manchester-united'
  | 'atletico-madrid'
  | 'barcelona'
  | 'real-madrid'
  | 'sevilla'
  | 'valencia'
  | 'inter'
  | 'juventus'
  | 'milan'
  | 'napoli'
  | 'roma'
  | 'bayern-munich'
  | 'borussia-dortmund'
  | 'bayer-leverkusen'
  | 'rb-leipzig'
  | 'eintracht-frankfurt'
  | 'psg'
  | 'marseille'
  | 'lyon'
  | 'monaco'
  | 'lille';

export type RoscoLeague = 'argentina' | 'england' | 'spain' | 'italy' | 'germany' | 'france';

export interface RoscoCategoryOption {
  id: RoscoCategory;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
}

export interface RoscoLeagueOption {
  id: RoscoLeague;
  name: string;
  country: string;
  description: string;
  accent: string;
  categories: RoscoCategoryOption[];
}

export type RoscoLetterStatus = 'pending' | 'current' | 'correct' | 'wrong';

export interface RoscoQuestion {
  letter: string;
  relation: 'starts' | 'contains';
  clue: string;
  answer: string;
  aliases?: string[];
}

export interface RoscoLetter extends RoscoQuestion {
  status: RoscoLetterStatus;
}

export interface RoscoResult {
  correct: number;
  wrong: number;
  unanswered: number;
}
