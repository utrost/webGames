import './style.css'
import { CosmicBreaker } from './games/cosmic-breaker/index.js';
import { NeonFlow } from './games/neon-flow/index.js';
import { Orbit } from './games/orbit/index.js';
import { Asteroids } from './games/asteroids/index.js';
import { NeonBlocks } from './games/neon-blocks/index.js';
import { ElementalSandbox } from './games/elemental-sandbox/index.js';
import { VoidCrawler } from './games/void-crawler/index.js';
import { StorageManager } from './core/StorageManager.js';
import { AudioManager } from './core/AudioManager.js';
import { StatsTracker } from './core/StatsTracker.js';
import { PerfMonitor } from './core/PerfMonitor.js';

const storage = new StorageManager();
const stats = new StatsTracker();
const perfMonitor = new PerfMonitor();
const gameContainer = document.getElementById('game-container');
let activeGame = null;
let backBtn = null;

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// FPS toggle with F3
window.addEventListener('keydown', (e) => {
    if (e.code === 'F3') {
        e.preventDefault();
        perfMonitor.toggle();
    }
});

const games = [
    { id: 'cosmic-breaker', title: 'Cosmic Breaker', description: 'Smash neon bricks with power-ups, multi-ball, and screen-shake action.', genre: 'Breakout', icon: '&#9632;', color: '#ff00ff', class: CosmicBreaker },
    { id: 'neon-flow', title: 'Neon Flow', description: 'Rotate pipes to route RGB energy streams to their receivers.', genre: 'Puzzle', icon: '&#9784;', color: '#00ff88', class: NeonFlow },
    { id: 'orbit', title: 'Orbit', description: 'Sling counter-bodies to keep planets in stable orbits.', genre: 'Physics', icon: '&#9788;', color: '#ffaa00', class: Orbit },
    { id: 'asteroids', title: 'Asteroids', description: 'Pilot a neon ship through endless asteroid waves.', genre: 'Shooter', icon: '&#9733;', color: '#00f3ff', class: Asteroids },
    { id: 'neon-blocks', title: 'Neon Blocks', description: 'Stack glowing tetrominoes — clear lines, climb levels.', genre: 'Puzzle', icon: '&#9642;', color: '#ff3366', class: NeonBlocks },
    { id: 'elemental-sandbox', title: 'Elemental Sandbox', description: 'Paint with sand, water, fire, and acid in a pixel physics sim.', genre: 'Sandbox', icon: '&#9883;', color: '#ffff00', class: ElementalSandbox },
    { id: 'void-crawler', title: 'Void Crawler', description: 'Roguelite sci-fi horror. Explore EREBUS-7, fight generated monsters, descend 10 decks.', genre: 'Roguelite', icon: '&#9760;', color: '#39ff14', class: VoidCrawler }
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
        const scoreDisplay = highScore > 0 ? `<div class="high-score">HI: ${highScore}</div>` : '';
        const accentColor = game.color || 'var(--neon-blue)';

        card.style.borderColor = accentColor;
        card.style.setProperty('--card-glow', accentColor);

        card.innerHTML = `
      <div class="card-icon" style="color:${accentColor}">${game.icon}</div>
      <h3>${game.title}</h3>
      <span class="genre-tag" style="border-color:${accentColor};color:${accentColor}">${game.genre}</span>
      <p class="card-desc">${game.description}</p>
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

            const colorBlind = localStorage.getItem('webGames_colorblind') === 'true';
            const totalStats = stats.getStats();
            const minutesPlayed = Math.round(totalStats.totalTimePlayed / 60);

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
                <div class="setting-row">
                    <label>Color-blind</label>
                    <button id="colorblind-btn" class="setting-btn">${colorBlind ? 'ON' : 'OFF'}</button>
                </div>
                <h3>STATISTICS</h3>
                <div class="stats-display">
                    <p>Games Played: ${totalStats.totalGamesPlayed}</p>
                    <p>Time Played: ${minutesPlayed} min</p>
                    <p style="color:#888;font-size:0.8rem;">Press F3 in-game for FPS counter</p>
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

            document.getElementById('colorblind-btn').addEventListener('click', () => {
                const current = localStorage.getItem('webGames_colorblind') === 'true';
                localStorage.setItem('webGames_colorblind', (!current).toString());
                document.getElementById('colorblind-btn').textContent = !current ? 'ON' : 'OFF';
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

    try {
        activeGame = new gameConfig.class(canvasContainer, () => {
            // Game over callback — check achievements
            stats.endSession();
            checkAchievements();
        });
        activeGame.init();
        stats.startSession(gameConfig.id);
    } catch (err) {
        console.error(`Failed to initialize ${gameConfig.title}:`, err);
        canvasContainer.innerHTML = `<div style="color:#f00;text-align:center;padding:40px;font-family:monospace;">
            <h2>SYSTEM ERROR</h2>
            <p>${gameConfig.title} failed to initialize.</p>
            <p style="color:#888;font-size:0.8rem;">${err.message}</p>
        </div>`;
    }
}

function returnToLobby() {
    stats.endSession();
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
