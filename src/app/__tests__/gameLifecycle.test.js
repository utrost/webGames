import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const restartableGames = [
    'asteroids',
    'starfall-armada',
    'cosmic-breaker',
    'neon-blocks',
    'neon-flow',
    'orbit',
];

describe('game lifecycle contracts', () => {
    it('uses state resets instead of teardown/re-init for in-game restarts', () => {
        for (const gameId of restartableGames) {
            const source = readFileSync(`src/games/${gameId}/index.js`, 'utf8');
            expect(source).not.toMatch(/this\.stop\(\);\s*this\.init\(\);/);
            expect(source).toContain('resetGameState()');
        }
    });

    it('clears delayed Neon Flow level transitions when the game is stopped', () => {
        const source = readFileSync('src/games/neon-flow/index.js', 'utf8');
        expect(source).toContain('clearLevelAdvanceTimer()');
        expect(source).toContain('this.clearLevelAdvanceTimer();\n        this.loop?.stop();');
        expect(source).toContain('if (!this.isRunning) return;');
    });
});
