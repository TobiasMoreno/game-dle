import { readFile } from 'node:fs/promises';

const catalogUrl = new URL('../public/musicdle-songs.json', import.meta.url);
const songs = JSON.parse(await readFile(catalogUrl, 'utf8'));
const errors = [];
const ids = new Set();
const videoIds = new Set();

if (!Array.isArray(songs) || songs.length === 0) {
  errors.push('El catálogo debe ser un array no vacío.');
}

for (const [index, song] of songs.entries()) {
  const location = `Canción ${index + 1}`;

  for (const field of ['id', 'title', 'artist', 'language', 'youtubeVideoId']) {
    if (typeof song[field] !== 'string' || !song[field].trim()) {
      errors.push(`${location}: falta ${field}.`);
    }
  }

  if (ids.has(song.id)) errors.push(`${location}: id duplicado "${song.id}".`);
  if (videoIds.has(song.youtubeVideoId)) {
    errors.push(`${location}: youtubeVideoId duplicado "${song.youtubeVideoId}".`);
  }

  ids.add(song.id);
  videoIds.add(song.youtubeVideoId);

  if (!/^[\w-]{11}$/.test(song.youtubeVideoId ?? '')) {
    errors.push(`${location}: youtubeVideoId inválido.`);
  }
  if (!Array.isArray(song.aliases) || !Array.isArray(song.genres) || song.genres.length === 0) {
    errors.push(`${location}: aliases y genres deben ser arrays; genres no puede estar vacío.`);
  }
  if (!Number.isInteger(song.decade) || song.decade < 1900 || song.decade % 10 !== 0) {
    errors.push(`${location}: decade debe indicar el inicio de una década.`);
  }
  if (!Number.isFinite(song.startSeconds) || song.startSeconds < 0) {
    errors.push(`${location}: startSeconds debe ser un número positivo o cero.`);
  }
  if (typeof song.enabled !== 'boolean') {
    errors.push(`${location}: enabled debe ser booleano.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const languages = [...new Set(songs.map((song) => song.language))].join(', ');
  console.log(`Catálogo MusicDLE válido: ${songs.length} canciones (${languages}).`);
}
