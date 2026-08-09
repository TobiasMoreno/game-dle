import { MusicdleEngineService } from './musicdle-engine.service';
import { MusicdleFilter, MusicdleSong } from './musicdle.models';

describe('MusicdleEngineService', () => {
  let service: MusicdleEngineService;

  const filter: MusicdleFilter = {
    kind: 'all',
    value: '*',
    label: 'Todas las canciones',
  };

  const target: MusicdleSong = {
    id: 'target',
    title: 'Canción secreta',
    artist: 'Artista secreto',
    aliases: [],
    genres: ['Pop'],
    decade: 2020,
    language: 'Español',
    youtubeVideoId: 'abcdefghijk',
    startSeconds: 20,
    enabled: true,
  };

  const wrong: MusicdleSong = {
    ...target,
    id: 'wrong',
    title: 'Respuesta incorrecta',
  };

  beforeEach(() => {
    service = new MusicdleEngineService();
  });

  it('empieza con 2 segundos y seis intentos disponibles', () => {
    const round = service.createRound(target.id, filter, 100);

    expect(round.unlockedSeconds).toBe(2);
    expect(round.attempts).toEqual([]);
    expect(round.status).toBe('active');
  });

  it('agrega dos segundos después de una respuesta incorrecta', () => {
    const round = service.createRound(target.id, filter, 100);
    const updated = service.submitGuess(round, wrong, target, 200);

    expect(updated.attempts.length).toBe(1);
    expect(updated.attempts[0].correct).toBeFalse();
    expect(updated.unlockedSeconds).toBe(4);
    expect(updated.status).toBe('active');
  });

  it('pierde después de seis pases y nunca desbloquea más de 12 segundos', () => {
    let round = service.createRound(target.id, filter, 100);

    for (let attempt = 0; attempt < 6; attempt += 1) {
      round = service.pass(round, 200 + attempt);
    }

    expect(round.attempts.length).toBe(6);
    expect(round.unlockedSeconds).toBe(12);
    expect(round.status).toBe('lost');
  });

  it('termina la ronda al acertar y no revela la respuesta al compartir', () => {
    const round = service.createRound(target.id, filter, 100);
    const won = service.submitGuess(round, target, target, 200);
    const shareText = service.buildShareText(won);

    expect(won.status).toBe('won');
    expect(shareText).toContain('MusicDLE');
    expect(shareText).not.toContain(target.title);
    expect(shareText).not.toContain(target.artist);
  });
});
