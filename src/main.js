import './style.css'
import { CosmicBreaker } from './games/cosmic-breaker/index.js';
import { NeonFlow } from './games/neon-flow/index.js';
import { Orbit } from './games/orbit/index.js';
import { Asteroids } from './games/asteroids/index.js';

console.log('Arcade Lobby Initialized');

const gameList = document.querySelector('.game-list');
const gameContainer = document.getElementById('game-container');
let activeGame = null;

// Game Definitions
const games = [
    {
        id: 'cosmic-breaker',
        title: 'Cosmic Breaker',
        description: 'Physics-based breakout action!',
        class: CosmicBreaker
    },
    {
        id: 'neon-flow',
        title: 'Neon Flow',
        description: 'Connect the energy nodes.',
        class: NeonFlow
    },
    {
        id: 'orbit',
        title: 'Orbit',
        description: 'Defend the gravity well.',
        class: Orbit
    },
    {
        id: 'asteroids',
        title: 'Asteroids',
        description: 'Neon Vector Shooter.',
        class: Asteroids
    }
];

// Initialize Lobby UI
function initLobby() {
    gameList.innerHTML = ''; // Clear placeholders

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        if (!game.class) card.classList.add('disabled');

        card.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      ${!game.class ? '<small>Coming Soon</small>' : ''}
    `;

        if (game.class) {
            card.addEventListener('click', () => loadGame(game));
        }

        gameList.appendChild(card);
    });
}

function loadGame(gameConfig) {
    // Clear Lobby
    gameContainer.innerHTML = '';
    document.querySelector('header h1').innerHTML = `<span class="neon-flicker">${gameConfig.title.toUpperCase()}</span>`;

    // Create Canvas Container
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'game-canvas-container';
    gameContainer.appendChild(canvasContainer);

    // Add Back Button
    const backBtn = document.createElement('button');
    backBtn.innerText = '← BACK TO ARCADE';
    backBtn.className = 'back-btn';
    backBtn.onclick = () => {
        if (activeGame) {
            activeGame.stop();
            activeGame = null;
        }
        window.location.reload(); // Simple way to reset state for now
    };
    document.body.appendChild(backBtn);

    // Init Game
    console.log(`Launching ${gameConfig.title}...`);
    activeGame = new gameConfig.class(canvasContainer, () => alert('GAME OVER'));
    activeGame.init();
}

initLobby();
