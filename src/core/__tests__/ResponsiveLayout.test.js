import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const css = readFileSync(resolve(root, 'src/style.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const normalize = (source) => source.replace(/\s+/g, ' ').trim();
const compactCss = css.replace(/\s+/g, ' ');

function blockFor(selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'));
    return match?.[1] ?? '';
}

describe('responsive arcade shell', () => {
    it('declares a mobile viewport that supports safe-area insets', () => {
        expect(html).toMatch(/<meta\s+name=["']viewport["'][^>]*>/i);
        expect(html).toMatch(/content=["'][^"']*width=device-width[^"']*initial-scale=1\.0[^"']*viewport-fit=cover/i);
    });

    it('uses border-box sizing and dynamic viewport shell sizing', () => {
        expect(normalize(css)).toMatch(/\*, \*::before, \*::after \{ box-sizing: border-box;/);
        expect(blockFor('html')).toMatch(/min-height:\s*100%/);
        expect(blockFor('body')).toMatch(/min-height:\s*100dvh/);
        expect(blockFor('#app')).toMatch(/min-height:\s*100dvh/);
        expect(blockFor('#app')).toMatch(/max-width:\s*1200px/);
    });

    it('lays out the lobby as a fluid card grid instead of fixed-width rows', () => {
        const gameList = blockFor('.game-list');
        expect(gameList).toMatch(/display:\s*grid/);
        expect(gameList).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*220px\),\s*1fr\)\)/);
        expect(gameList).toMatch(/width:\s*100%/);
        expect(gameList).toMatch(/max-width:\s*1100px/);

        const gameCard = blockFor('.game-card');
        expect(gameCard).toMatch(/width:\s*100%/);
        expect(gameCard).toMatch(/min-height:\s*44px/);
    });

    it('keeps navigation and settings reachable on touch screens', () => {
        expect(blockFor('.back-btn')).toMatch(/min-height:\s*44px/);
        expect(blockFor('.settings-btn')).toMatch(/min-height:\s*44px/);
        expect(compactCss).toMatch(/@media \(hover: none\)[\s\S]*\.game-card:hover[\s\S]*transform:\s*none/);
    });

    it('constrains game canvases to phone-sized viewports and reserves space for mobile chrome', () => {
        expect(blockFor('#game-container')).toMatch(/width:\s*100%/);
        expect(blockFor('#game-container')).toMatch(/padding-inline:\s*var\(--page-gutter\)/);
        expect(blockFor('#game-canvas-container')).toMatch(/height:\s*min\(calc\(100dvh - 112px\),\s*720px\)/);
        expect(blockFor('#game-canvas-container canvas')).toMatch(/max-width:\s*calc\(100vw - \(var\(--page-gutter\) \* 2\)\)/);
        expect(blockFor('#game-canvas-container canvas')).toMatch(/height:\s*auto/);
    });

    it('has dedicated narrow and landscape mobile breakpoints', () => {
        expect(css).toMatch(/@media\s*\(max-width:\s*640px\)/);
        expect(css).toMatch(/@media\s*\(max-width:\s*480px\)/);
        expect(css).toMatch(/@media\s*\(max-height:\s*520px\)\s*and\s*\(orientation:\s*landscape\)/);
    });
});
