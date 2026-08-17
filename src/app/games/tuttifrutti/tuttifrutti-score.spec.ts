import { TuttiFruttiRoom } from './tuttifrutti.models';
import {
  calculateAccumulatedTotals,
  calculateTuttiFruttiScores,
  calculateValidationResults,
  requiredYesVotes,
} from './tuttifrutti-score';

describe('Tutti Frutti scoring', () => {
  it('exige la mitad más uno de todos los participantes', () => {
    expect(requiredYesVotes(2)).toBe(2);
    expect(requiredYesVotes(3)).toBe(2);
    expect(requiredYesVotes(4)).toBe(3);
  });

  it('aprueba una palabra al alcanzar la mayoría y rechaza la que no llega', () => {
    const room = createRoom();
    room.votes = {
      one: { one: { '0': 'yes' }, two: { '0': 'yes' } },
      two: { one: { '0': 'yes' }, two: { '0': 'no' } },
      three: { one: { '0': 'no' }, two: { '0': 'no' } },
    };

    const results = calculateValidationResults(room);

    expect(results['one']['0']).toBeTrue();
    expect(results['two']['0']).toBeFalse();
  });

  it('otorga 10 a respuestas válidas únicas, 5 a repetidas y 0 a rechazadas', () => {
    const room = createRoom();
    room.answers = {
      one: answer('Mono'),
      two: answer('mono'),
      three: answer('Morsa'),
    };
    const validation = {
      one: { '0': true },
      two: { '0': true },
      three: { '0': false },
    };

    const scores = calculateTuttiFruttiScores(room, validation);

    expect(scores['one'].total).toBe(5);
    expect(scores['two'].total).toBe(5);
    expect(scores['three'].total).toBe(0);
  });

  it('acumula el puntaje nuevo sobre las rondas anteriores', () => {
    const room = createRoom();
    room.totals = { one: 15, two: 20, three: 5 };

    const totals = calculateAccumulatedTotals(room, {
      one: { total: 10, byCategory: { '0': 10 } },
      two: { total: 5, byCategory: { '0': 5 } },
      three: { total: 0, byCategory: { '0': 0 } },
    });

    expect(totals).toEqual({ one: 25, two: 25, three: 5 });
  });
});

function createRoom(): TuttiFruttiRoom {
  return {
    code: 'ABC123',
    hostId: 'one',
    status: 'voting',
    round: 1,
    totalRounds: 3,
    letter: 'M',
    durationMs: 60_000,
    startedAt: 1,
    stoppedAt: 2,
    votingStartedAt: 2,
    createdAt: 0,
    categories: ['Animal'],
    players: {
      one: { name: 'Ana', online: true, joinedAt: 0 },
      two: { name: 'Beto', online: true, joinedAt: 0 },
      three: { name: 'Cami', online: true, joinedAt: 0 },
    },
    answers: {
      one: answer('Mono'),
      two: answer('Morsa'),
      three: answer('Mosca'),
    },
  };
}

function answer(value: string) {
  return { values: { '0': value }, submittedAt: 2 };
}
