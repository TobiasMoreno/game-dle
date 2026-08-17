import { TuttiFruttiRoom, TuttiFruttiScore } from './tuttifrutti.models';

export function calculateTuttiFruttiScores(
  room: TuttiFruttiRoom
): Record<string, TuttiFruttiScore> {
  const scores: Record<string, TuttiFruttiScore> = {};

  for (const playerId of Object.keys(room.players)) {
    const byCategory: Record<string, number> = {};

    for (const category of room.categories) {
      const answer = normalizeAnswer(room.answers?.[playerId]?.values[category] ?? '');
      if (!answer || !answer.startsWith(normalizeAnswer(room.letter))) {
        byCategory[category] = 0;
        continue;
      }

      const matchingAnswers = Object.keys(room.players).filter((otherPlayerId) => {
        const otherAnswer = normalizeAnswer(
          room.answers?.[otherPlayerId]?.values[category] ?? ''
        );
        return otherAnswer === answer;
      }).length;

      byCategory[category] = matchingAnswers > 1 ? 5 : 10;
    }

    scores[playerId] = {
      byCategory,
      total: Object.values(byCategory).reduce((total, score) => total + score, 0),
    };
  }

  return scores;
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
