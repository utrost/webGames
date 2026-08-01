import { CosmicBreaker } from '../games/cosmic-breaker/index.js';
import { NeonFlow } from '../games/neon-flow/index.js';
import { Orbit } from '../games/orbit/index.js';
import { Asteroids } from '../games/asteroids/index.js';
import { NeonBlocks } from '../games/neon-blocks/index.js';
import { ElementalSandbox } from '../games/elemental-sandbox/index.js';

export const GAME_REGISTRY = [
    { id: 'cosmic-breaker', title: 'Cosmic Breaker', description: 'Smash neon bricks with power-ups, multi-ball, and screen-shake action.', genre: 'Breakout', icon: '\u25a0', color: '#ff00ff', class: CosmicBreaker },
    { id: 'neon-flow', title: 'Neon Flow', description: 'Rotate pipes to route RGB energy streams to their receivers.', genre: 'Puzzle', icon: '\u2638', color: '#00ff88', class: NeonFlow },
    { id: 'orbit', title: 'Orbit', description: 'Sling counter-bodies to keep planets in stable orbits.', genre: 'Physics', icon: '\u263c', color: '#ffaa00', class: Orbit },
    { id: 'asteroids', title: 'Asteroids', description: 'Pilot a neon ship through endless asteroid waves.', genre: 'Shooter', icon: '\u2605', color: '#00f3ff', class: Asteroids },
    { id: 'neon-blocks', title: 'Neon Blocks', description: 'Stack glowing tetrominoes — clear lines, climb levels.', genre: 'Puzzle', icon: '\u25aa', color: '#ff3366', class: NeonBlocks },
    { id: 'elemental-sandbox', title: 'Elemental Sandbox', description: 'Paint with sand, water, fire, and acid in a pixel physics sim.', genre: 'Sandbox', icon: '\u269b', color: '#ffff00', class: ElementalSandbox },
];

export function getPlayableGames(games = GAME_REGISTRY) {
    return games.filter((game) => Boolean(game.class));
}
