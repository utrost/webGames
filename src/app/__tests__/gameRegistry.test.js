import { describe, expect, it } from 'vitest';
import { GAME_REGISTRY, getPlayableGames } from '../gameRegistry.js';

describe('game registry', () => {
  it('keeps the arcade focused on six playable cartridges', () => {
    expect(getPlayableGames()).toHaveLength(6);
    expect(GAME_REGISTRY.map((game) => game.id)).toEqual([
      'cosmic-breaker',
      'neon-flow',
      'orbit',
      'asteroids',
      'neon-blocks',
      'elemental-sandbox',
    ]);
  });

  it('uses unique ids for persistence keys and achievement checks', () => {
    const ids = GAME_REGISTRY.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
