import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveServiceWorkerUrl } from '../appPaths.js';

describe('app path helpers', () => {
    it('registers the service worker under the deployed base path', () => {
        expect(resolveServiceWorkerUrl('/games/', 'https://simiono.com')).toBe('https://simiono.com/games/sw.js');
        expect(resolveServiceWorkerUrl('/webGames/', 'https://utrost.github.io')).toBe('https://utrost.github.io/webGames/sw.js');
    });

    it('keeps root deployments rooted at /sw.js', () => {
        expect(resolveServiceWorkerUrl('/', 'https://example.test')).toBe('https://example.test/sw.js');
    });

    it('keeps service-worker cache cleanup scoped and only caches GET success responses', () => {
        const sw = readFileSync('public/sw.js', 'utf8');
        expect(sw).toContain("key.startsWith('webgames-')");
        expect(sw).toContain("event.request.method !== 'GET'");
        expect(sw).toContain('response.ok');
    });
});
