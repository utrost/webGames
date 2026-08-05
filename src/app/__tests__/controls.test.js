import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GAME_REGISTRY } from '../gameRegistry.js';

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
});
