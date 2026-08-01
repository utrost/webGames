import { describe, expect, it } from 'vitest';
import { createAchievements, findNewAchievements } from '../achievements.js';

function storageWithScores(scores) {
  return { getHighScore: (id) => scores[id] || 0 };
}

describe('achievement rules', () => {
  const games = [{ id: 'alpha' }, { id: 'beta' }];

  it('builds the all-games achievement from the injected game registry', () => {
    const achievements = createAchievements(games, storageWithScores({ alpha: 1, beta: 1 }));
    const allGames = achievements.find((achievement) => achievement.id === 'all_games');

    expect(allGames.check()).toBe(true);
  });

  it('only reports achievements that are not already unlocked', () => {
    const achievements = [
      { id: 'done', check: () => true },
      { id: 'new', check: () => true },
      { id: 'locked', check: () => false },
    ];

    expect(findNewAchievements(achievements, ['done']).map((achievement) => achievement.id)).toEqual(['new']);
  });
});
