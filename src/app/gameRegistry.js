import { CosmicBreaker } from '../games/cosmic-breaker/index.js';
import { NeonFlow } from '../games/neon-flow/index.js';
import { Orbit } from '../games/orbit/index.js';
import { Asteroids } from '../games/asteroids/index.js';
import { StarfallArmada } from '../games/starfall-armada/index.js';
import { NeonBlocks } from '../games/neon-blocks/index.js';
import { ElementalSandbox } from '../games/elemental-sandbox/index.js';

export const GAME_REGISTRY = [
    {
        id: 'cosmic-breaker', title: 'Cosmic Breaker', description: 'Smash neon bricks with power-ups, multi-ball, and screen-shake action.', genre: 'Breakout', icon: '\u25a0', color: '#ff00ff', class: CosmicBreaker,
        controls: {
            mouse: ['Move pointer to aim paddle', 'Click/tap to serve a waiting ball'],
            keyboard: ['Arrow Left/Right: move paddle', 'Space or Arrow Up: serve', 'Esc: pause', 'R: restart after game over'],
            touch: ['Drag/finger position controls paddle', 'Tap to serve a waiting ball'],
        },
    },
    {
        id: 'neon-flow', title: 'Neon Flow', description: 'Rotate pipes to route RGB energy streams to their receivers.', genre: 'Puzzle', icon: '\u2638', color: '#00ff88', class: NeonFlow,
        controls: {
            mouse: ['Click a pipe tile to rotate it clockwise'],
            keyboard: ['Arrow keys: move cursor', 'Space/Enter: rotate selected tile', 'R: restart puzzle', 'Esc: pause'],
            touch: ['Tap a pipe tile to rotate it clockwise'],
        },
    },
    {
        id: 'orbit', title: 'Orbit', description: 'Sling counter-bodies to keep planets in stable orbits.', genre: 'Physics', icon: '\u263c', color: '#ffaa00', class: Orbit,
        controls: {
            mouse: ['Drag from a launch point, release to fire'],
            keyboard: ['Arrow keys: move launch point', 'WASD: aim launch vector', 'Space: fire', 'R: restart after game over', 'Esc: pause'],
            touch: ['Drag from a launch point, release to fire'],
        },
    },
    {
        id: 'asteroids', title: 'Asteroids', description: 'Pilot a neon ship through endless asteroid waves.', genre: 'Shooter', icon: '\u2605', color: '#00f3ff', class: Asteroids,
        controls: {
            mouse: ['Hold left/center/right screen regions for rotate, thrust, and fire'],
            keyboard: ['Arrow Left/Right: rotate', 'Arrow Up: thrust', 'Space: fire', 'R: restart after game over', 'Esc: pause'],
            touch: ['Left third: rotate left', 'Middle top: thrust', 'Middle bottom: rotate right', 'Right third: fire'],
        },
    },
    {
        id: 'starfall-armada', title: 'Starfall Armada', description: 'Defend the skyline from a descending neon armada.', genre: 'Shooter', icon: '\u25b2', color: '#ffaa00', class: StarfallArmada,
        controls: {
            mouse: ['Hold lower-left/lower-right screen regions to move', 'Hold the lower center to fire'],
            keyboard: ['Arrow Left/Right: move defender', 'Space: fire', 'R: restart after game over', 'Esc: pause'],
            touch: ['Lower left/right: move defender', 'Lower center: fire'],
        },
    },
    {
        id: 'neon-blocks', title: 'Neon Blocks', description: 'Stack glowing tetrominoes — clear lines, climb levels.', genre: 'Puzzle', icon: '\u25aa', color: '#ff3366', class: NeonBlocks,
        controls: {
            mouse: ['Click: rotate', 'Drag left/right: move', 'Drag down: soft or hard drop'],
            keyboard: ['Arrow Left/Right: move', 'Arrow Down: soft drop', 'Arrow Up: rotate', 'Space: hard drop', 'C: hold', 'R: restart after game over', 'Esc: pause'],
            touch: ['Tap: rotate', 'Swipe left/right: move', 'Swipe down: soft or hard drop'],
        },
    },
    {
        id: 'elemental-sandbox', title: 'Elemental Sandbox', description: 'Paint with sand, water, fire, and acid in a pixel physics sim.', genre: 'Sandbox', icon: '\u269b', color: '#ffff00', class: ElementalSandbox,
        controls: {
            mouse: ['Drag on the canvas to paint', 'Use buttons/slider to choose element and brush size'],
            keyboard: ['Number keys: select element', 'Arrow keys: move brush cursor', 'Space/Enter: paint', '[ / ]: brush size', 'C or R: clear', 'Esc: pause'],
            touch: ['Drag on the canvas to paint', 'Tap element buttons and brush slider'],
        },
    },
];

export function getPlayableGames(games = GAME_REGISTRY) {
    return games.filter((game) => Boolean(game.class));
}
