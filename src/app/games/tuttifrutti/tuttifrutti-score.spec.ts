import { TuttiFruttiRoom } from './tuttifrutti.models';
import { calculateTuttiFruttiScores } from './tuttifrutti-score';

describe('calculateTuttiFruttiScores', () => {
  it('otorga 10 a respuestas únicas, 5 a repetidas y 0 a inválidas', () => {
    const room: TuttiFruttiRoom = {
      code: 'ABC123',
      hostId: 'one',
      status: 'results',
      round: 1,
      letter: 'M',
      durationMs: 60_000,
      startedAt: 1,
      stoppedAt: 2,
      createdAt: 0,
      categories: ['Nombre', 'Animal'],
      players: {
        one: { name: 'Ana', online: true, joinedAt: 0 },
        two: { name: 'Beto', online: true, joinedAt: 0 },
      },
      answers: {
        one: { values: { Nombre: 'María', Animal: 'Mono' }, submittedAt: 2 },
        two: { values: { Nombre: 'Martín', Animal: 'mono' }, submittedAt: 2 },
      },
    };

    const scores = calculateTuttiFruttiScores(room);

    expect(scores['one'].byCategory['Nombre']).toBe(10);
    expect(scores['one'].byCategory['Animal']).toBe(5);
    expect(scores['two'].total).toBe(15);
  });

  it('ignora respuestas que no empiezan con la letra de la ronda', () => {
    const room: TuttiFruttiRoom = {
      code: 'ABC123',
      hostId: 'one',
      status: 'results',
      round: 1,
      letter: 'P',
      durationMs: 60_000,
      startedAt: 1,
      stoppedAt: 2,
      createdAt: 0,
      categories: ['Animal'],
      players: { one: { name: 'Ana', online: true, joinedAt: 0 } },
      answers: { one: { values: { Animal: 'Gato' }, submittedAt: 2 } },
    };

    expect(calculateTuttiFruttiScores(room)['one'].total).toBe(0);
  });
});
