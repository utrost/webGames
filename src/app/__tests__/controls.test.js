import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAME_REGISTRY, getPlayableGames } from '../gameRegistry.js';

describe('game controls metadata and help docs', () => {
    it('documents mouse, keyboard, and touch controls for every playable game', () => {
        for (const game of GAME_REGISTRY.filter((entry) => entry.class)) {
            expect(game.controls, `${game.title} controls`).toBeDefined();
            expect(game.controls.mouse, `${game.title} mouse controls`).toEqual(expect.any(Array));
            expect(game.controls.keyboard, `${game.title} keyboard controls`).toEqual(expect.any(Array));
            expect(game.controls.touch, `${game.title} touch controls`).toEqual(expect.any(Array));
            expect(game.controls.mouse.length, `${game.title} mouse entries`).toBeGreaterThan(0);
            expect(game.controls.keyboard.length, `${game.title} keyboard entries`).toBeGreaterThan(0);
            expect(game.controls.touch.length, `${game.title} touch entries`).toBeGreaterThan(0);
        }
    });

    it('renders the selected game controls panel in the arcade shell', () => {
        const source = readFileSync('src/main.js', 'utf8');
        const domSource = readFileSync('src/app/dom.js', 'utf8');
        expect(source).toContain('createControlsPanel(gameConfig.controls)');
        expect(domSource).toContain('controls-panel');
    });

    it('links the current how-to-play guide from the README', () => {
        const readme = readFileSync('README.md', 'utf8');
        expect(readme).toContain('[How to play](docs/how-to-play.md)');
    });

    it('documents all six games in the how-to-play guide', () => {
        const guide = readFileSync('docs/how-to-play.md', 'utf8');
        for (const game of GAME_REGISTRY.filter((entry) => entry.class)) {
            expect(guide).toContain(`## ${game.title}`);
        }
        expect(guide).toContain('Mouse');
        expect(guide).toContain('Keyboard');
        expect(guide).toContain('Touch');
    });

    it('keeps a code-design note for every game cartridge', () => {
        for (const game of GAME_REGISTRY.filter((entry) => entry.class)) {
            const design = readFileSync(`src/games/${game.id}/DESIGN.md`, 'utf8');
            expect(design).toContain(`# ${game.title} Code Design`);
            expect(design).toContain('## Cartridge boundary');
            expect(design).toContain('## Module responsibilities');
            expect(design).toContain('## State model');
            expect(design).toContain('## Rendering layers');
            expect(design).toContain('## Current quality notes');
        }
    });

    it('documents the quality gate for adding future games', () => {
        expect(existsSync('docs/new-game-checklist.md')).toBe(true);
        expect(existsSync('src/games/_template/index.js')).toBe(true);
        expect(existsSync('src/games/_template/DESIGN.md')).toBe(true);

        const checklist = readFileSync('docs/new-game-checklist.md', 'utf8');
        for (const required of [
            'constructor(container, onGameOver)',
            'init()',
            'stop()',
            'resetGameState()',
            'controls metadata',
            'DESIGN.md',
            'npm test',
            'npm run lint',
            'npm run build',
            'browser smoke',
        ]) {
            expect(checklist).toContain(required);
        }

        const gamesReadme = readFileSync('src/games/README.md', 'utf8');
        expect(gamesReadme).toContain('[new-game checklist](../../docs/new-game-checklist.md)');
        expect(gamesReadme).toContain('_template/');
    });

    it('keeps the copy-start template out of the playable registry', () => {
        const registrySource = readFileSync('src/app/gameRegistry.js', 'utf8');
        expect(registrySource).not.toContain('_template');
        expect(registrySource).not.toContain('TemplateGame');
        expect(getPlayableGames().map((game) => game.id)).not.toContain('_template');
    });
});
