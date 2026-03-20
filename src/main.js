import './style.css'
import { CosmicBreaker } from './games/cosmic-breaker/index.js';
import { NeonFlow } from './games/neon-flow/index.js';
import { Orbit } from './games/orbit/index.js';
import { Asteroids } from './games/asteroids/index.js';
import { NeonBlocks } from './games/neon-blocks/index.js';
import { ElementalSandbox } from './games/elemental-sandbox/index.js';
import { StorageManager } from './core/StorageManager.js';
import { AudioManager } from './core/AudioManager.js';

const storage = new StorageManager();
const gameContainer = document.getElementById('game-container');
let activeGame = null;
let backBtn = null;

// Shared audio for volume control
const globalAudio = new AudioManager();

const games = [
    { id: 'cosmic-breaker', title: 'Cosmic Breaker', description: 'Physics-based breakout action!', class: CosmicBreaker },
    { id: 'neon-flow', title: 'Neon Flow', description: 'Connect the energy nodes.', class: NeonFlow },
    { id: 'orbit', title: 'Orbit', description: 'Defend the gravity well.', class: Orbit },
    { id: 'asteroids', title: 'Asteroids', description: 'Neon Vector Shooter.', class: Asteroids },
    { id: 'neon-blocks', title: 'Neon Blocks', description: 'Glowing Tetrominoes.', class: NeonBlocks },
    { id: 'elemental-sandbox', title: 'Elemental Sandbox', description: 'Paint with physics!', class: ElementalSandbox }
];

// Achievements system
const ACHIEVEMENTS = [
    { id: 'first_game', name: 'First Steps', desc: 'Play your first game', check: () => games.some(g => storage.getHighScore(g.id) > 0) },
    { id: 'breaker_1000', name: 'Brick Buster', desc: 'Score 1000+ in Cosmic Breaker', check: () => storage.getHighScore('cosmic-breaker') >= 1000 },
    { id: 'orbit_500', name: 'Gravity Master', desc: 'Score 500+ in Orbit', check: () => storage.getHighScore('orbit') >= 500 },
    { id: 'asteroids_2000', name: 'Space Ace', desc: 'Score 2000+ in Asteroids', check: () => storage.getHighScore('asteroids') >= 2000 },
    { id: 'blocks_5000', name: 'Tetris Legend', desc: 'Score 5000+ in Neon Blocks', check: () => storage.getHighScore('neon-blocks') >= 5000 },
    { id: 'all_games', name: 'Arcade Regular', desc: 'Play all games', check: () => games.every(g => storage.getHighScore(g.id) > 0) }
];

let achievementQueue = [];
let showingAchievement = false;

function checkAchievements() {
    const unlocked = JSON.parse(localStorage.getItem('webGames_achievements') || '[]');
    ACHIEVEMENTS.forEach(a => {
        if (!unlocked.includes(a.id) && a.check()) {
            unlocked.push(a.id);
            localStorage.setItem('webGames_achievements', JSON.stringify(unlocked));
            achievementQueue.push(a);
            showNextAchievement();
        }
    });
}

function showNextAchievement() {
    if (showingAchievement || achievementQueue.length === 0) return;
    showingAchievement = true;
    const a = achievementQueue.shift();

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<span class="achievement-icon">&#9733;</span> <strong>${a.name}</strong><br><small>${a.desc}</small>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            showingAchievement = false;
            showNextAchievement();
        }, 400);
    }, 3000);
}

// Settings
let settingsOpen = false;

function getVolume() {
    return parseFloat(localStorage.getItem('webGames_volume') || '1.0');
}

function setVolume(v) {
    localStorage.setItem('webGames_volume', v.toString());
    AudioManager.masterVolume = v;
}

// Initialize volume from storage
AudioManager.masterVolume = getVolume();

function initLobby() {
    const gameList = document.querySelector('.game-list');
    if (!gameList) return;
    gameList.innerHTML = '';

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        if (!game.class) card.classList.add('disabled');

        const highScore = storage.getHighScore(game.id);
        const scoreDisplay = highScore > 0 ? `<small class="high-score">HI: ${highScore}</small>` : '';

        card.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      ${scoreDisplay}
      ${!game.class ? '<small>Coming Soon</small>' : ''}
    `;

        if (game.class) {
            card.addEventListener('click', () => loadGame(game));
        }

        gameList.appendChild(card);
    });

    // Settings button
    let settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) {
        settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings-btn';
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerText = 'SETTINGS';
        settingsBtn.onclick = toggleSettings;
        document.getElementById('app').appendChild(settingsBtn);
    }
}

function toggleSettings() {
    settingsOpen = !settingsOpen;
    let panel = document.getElementById('settings-panel');

    if (settingsOpen) {
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'settings-panel';
            panel.className = 'settings-panel';

            const unlocked = JSON.parse(localStorage.getItem('webGames_achievements') || '[]');
            const achievementHTML = ACHIEVEMENTS.map(a => {
                const done = unlocked.includes(a.id);
                return `<div class="achievement ${done ? 'unlocked' : 'locked'}">
                    <span>${done ? '&#9733;' : '&#9734;'}</span> <strong>${a.name}</strong> — ${a.desc}
                </div>`;
            }).join('');

            panel.innerHTML = `
                <h2>SETTINGS</h2>
                <div class="setting-row">
                    <label>Volume</label>
                    <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="${getVolume()}">
                    <span id="volume-label">${Math.round(getVolume() * 100)}%</span>
                </div>
                <div class="setting-row">
                    <button id="mute-btn" class="setting-btn">${getVolume() === 0 ? 'UNMUTE' : 'MUTE'}</button>
                </div>
                <h3>ACHIEVEMENTS</h3>
                <div class="achievements-list">${achievementHTML}</div>
                <button id="close-settings" class="setting-btn">CLOSE</button>
            `;
            document.getElementById('app').appendChild(panel);

            document.getElementById('volume-slider').addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                document.getElementById('volume-label').textContent = `${Math.round(v * 100)}%`;
                document.getElementById('mute-btn').textContent = v === 0 ? 'UNMUTE' : 'MUTE';
            });

            document.getElementById('mute-btn').addEventListener('click', () => {
                const current = getVolume();
                const newVol = current === 0 ? 1.0 : 0;
                setVolume(newVol);
                document.getElementById('volume-slider').value = newVol;
                document.getElementById('volume-label').textContent = `${Math.round(newVol * 100)}%`;
                document.getElementById('mute-btn').textContent = newVol === 0 ? 'UNMUTE' : 'MUTE';
            });

            document.getElementById('close-settings').addEventListener('click', toggleSettings);
        }
        panel.style.display = 'flex';
    } else if (panel) {
        panel.style.display = 'none';
    }
}

function loadGame(gameConfig) {
    // Fade out lobby
    const lobbyMenu = document.querySelector('.lobby-menu');
    if (lobbyMenu) lobbyMenu.style.display = 'none';

    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.style.display = 'none';

    document.querySelector('header h1').innerHTML = `<span class="neon-flicker">${gameConfig.title.toUpperCase()}</span>`;

    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'game-canvas-container';
    gameContainer.appendChild(canvasContainer);

    backBtn = document.createElement('button');
    backBtn.innerText = '\u2190 BACK TO ARCADE';
    backBtn.className = 'back-btn';
    backBtn.onclick = returnToLobby;
    document.body.appendChild(backBtn);

    activeGame = new gameConfig.class(canvasContainer, () => {
        // Game over callback — check achievements
        checkAchievements();
    });
    activeGame.init();
}

function returnToLobby() {
    if (activeGame) {
        activeGame.stop();
        activeGame = null;
    }

    // Remove back button
    if (backBtn) {
        backBtn.remove();
        backBtn = null;
    }

    // Clear game container
    const canvasContainer = document.getElementById('game-canvas-container');
    if (canvasContainer) canvasContainer.remove();

    // Restore lobby
    document.querySelector('header h1').innerHTML = 'ARCADE <span class="neon-flicker">LOBBY</span>';

    const lobbyMenu = document.querySelector('.lobby-menu');
    if (lobbyMenu) lobbyMenu.style.display = 'flex';

    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'block';

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.style.display = 'block';

    // Refresh lobby to update high scores
    initLobby();
    checkAchievements();
}

initLobby();
checkAchievements();
