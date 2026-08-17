import {
  TuttiFruttiRoom,
  TuttiFruttiScore,
  TuttiFruttiValidationResults,
} from './tuttifrutti.models';

export function requiredYesVotes(playerCount: number): number {
  return Math.floor(playerCount / 2) + 1;
}

export function calculateValidationResults(
  room: TuttiFruttiRoom
): TuttiFruttiValidationResults {
  const results: TuttiFruttiValidationResults = {};
  const threshold = requiredYesVotes(Object.keys(room.players).length);

  for (const ownerId of Object.keys(room.players)) {
    results[ownerId] = {};
    room.categories.forEach((_category, categoryIndex) => {
      const categoryKey = String(categoryIndex);
      const answer = room.answers?.[ownerId]?.values[categoryKey]?.trim() ?? '';
      const positiveVotes = Object.values(room.votes ?? {}).filter(
        (voterVotes) => voterVotes[ownerId]?.[categoryKey] === 'yes'
      ).length;
      results[ownerId][categoryKey] = Boolean(answer) && positiveVotes >= threshold;
    });
  }

  return results;
}

export function calculateTuttiFruttiScores(
  room: TuttiFruttiRoom,
  validationResults = room.validationResults ?? calculateValidationResults(room)
): Record<string, TuttiFruttiScore> {
  const scores: Record<string, TuttiFruttiScore> = {};

  for (const playerId of Object.keys(room.players)) {
    const byCategory: Record<string, number> = {};

    room.categories.forEach((_category, categoryIndex) => {
      const categoryKey = String(categoryIndex);
      const answer = normalizeAnswer(
        room.answers?.[playerId]?.values[categoryKey] ?? ''
      );
      if (!answer || !validationResults[playerId]?.[categoryKey]) {
        byCategory[categoryKey] = 0;
        return;
      }

      const matchingAnswers = Object.keys(room.players).filter((otherPlayerId) => {
        if (!validationResults[otherPlayerId]?.[categoryKey]) return false;
        const otherAnswer = normalizeAnswer(
          room.answers?.[otherPlayerId]?.values[categoryKey] ?? ''
        );
        return otherAnswer === answer;
      }).length;

      const validAnswers = Object.keys(room.players).filter((otherPlayerId) => {
        const otherAnswer = normalizeAnswer(
          room.answers?.[otherPlayerId]?.values[categoryKey] ?? ''
        );
        return Boolean(otherAnswer) && validationResults[otherPlayerId]?.[categoryKey];
      }).length;

      if (matchingAnswers > 1) {
        byCategory[categoryKey] = 5;
      } else {
        byCategory[categoryKey] = validAnswers === 1 ? 20 : 10;
      }
    });

    scores[playerId] = {
      byCategory,
      total: Object.values(byCategory).reduce((total, score) => total + score, 0),
    };
  }

  return scores;
}

export function calculateAccumulatedTotals(
  room: TuttiFruttiRoom,
  roundScores: Record<string, TuttiFruttiScore>
): Record<string, number> {
  return Object.fromEntries(
    Object.keys(room.players).map((playerId) => [
      playerId,
      (room.totals?.[playerId] ?? 0) + (roundScores[playerId]?.total ?? 0),
    ])
  );
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
