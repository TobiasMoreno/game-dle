import { LoLCharacter } from '../loldle/loldle-game.service';

export function shuffleChampions(champions: LoLCharacter[]): LoLCharacter[] {
  const items = [...champions];
  for (let index = items.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

export function validChampions(champions: LoLCharacter[]): LoLCharacter[] {
  return champions.filter((champion) => champion.nombre && champion.img_url);
}

export function randomChampionImage(champion: LoLCharacter): string {
  if (!champion.skins?.length) return champion.img_url;
  return champion.skins[Math.floor(Math.random() * champion.skins.length)].img_url;
}
