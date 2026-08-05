import './style.css';
import { AudioManager } from './core/AudioManager.js';
import { StorageManager } from './core/StorageManager.js';
import { StatsTracker } from './core/StatsTracker.js';
import { PerfMonitor } from './core/PerfMonitor.js';
import { GAME_REGISTRY, getPlayableGames } from './app/gameRegistry.js';
import { AchievementManager, createAchievements } from './app/achievements.js';
import { registerServiceWorker } from './app/appPaths.js';
import {
    createAchievementToast,
    createElement,
    createControlsPanel,
    createErrorPanel,
    createGameCard,
    setArcadeHeading,
    setGameHeading,
} from './app/dom.js';
import {
    createSettingsPanel,
    getVolume,
    isColorBlindMode,
    setColorBlindMode,
    setVolume,
} from './app/settings.js';

const storage = new StorageManager();
const stats = new StatsTracker();
const perfMonitor = new PerfMonitor();
const gameContainer = document.getElementById('game-container');
const heading = document.querySelector('header h1');
const achievements = createAchievements(getPlayableGames(GAME_REGISTRY), storage);
const achievementManager = new AchievementManager({ achievements });

let activeGame = null;
let backBtn = null;
let settingsOpen = false;
let achievementQueue = [];
let showingAchievement = false;

if (import.meta.env.PROD) {
    registerServiceWorker();
}

AudioManager.masterVolume = getVolume();

window.addEventListener('keydown', (e) => {
    if (e.code === 'F3') {
        e.preventDefault();
        perfMonitor.toggle();
    }
});

function showNextAchievement() {
    if (showingAchievement || achievementQueue.length === 0) return;
    showingAchievement = true;
    const achievement = achievementQueue.shift();
    const toast = createAchievementToast(achievement);
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

function checkAchievements() {
    const unlocked = achievementManager.unlockNew();
    if (unlocked.length === 0) return;
    achievementQueue.push(...unlocked);
    showNextAchievement();
}

function initLobby() {
    const gameList = document.querySelector('.game-list');
    if (!gameList) return;
    gameList.replaceChildren(
        ...GAME_REGISTRY.map((game) => createGameCard(game, storage.getHighScore(game.id), loadGame))
    );

    let settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) {
        settingsBtn = createElement('button', { id: 'settings-btn', className: 'settings-btn', text: 'SETTINGS' });
        settingsBtn.addEventListener('click', toggleSettings);
        document.getElementById('app')?.appendChild(settingsBtn);
    }
}

function toggleSettings() {
    settingsOpen = !settingsOpen;
    let panel = document.getElementById('settings-panel');

    if (settingsOpen) {
        panel?.remove();
        panel = createSettingsPanel({
            achievements,
            unlockedIds: achievementManager.getUnlocked(),
            stats: stats.getStats(),
            volume: getVolume(),
            colorBlind: isColorBlindMode(),
            onVolume: (volume) => setVolume(volume, { audioManager: AudioManager }),
            onMute: (volume) => setVolume(volume, { audioManager: AudioManager }),
            onColorBlind: (enabled) => setColorBlindMode(enabled),
            onClose: toggleSettings,
        });
        document.getElementById('app')?.appendChild(panel);
        panel.style.display = 'flex';
    } else if (panel) {
        panel.style.display = 'none';
    }
}

function setLobbyVisible(visible) {
    const lobbyMenu = document.querySelector('.lobby-menu');
    if (lobbyMenu) lobbyMenu.style.display = visible ? 'flex' : 'none';

    const footer = document.querySelector('footer');
    if (footer) footer.style.display = visible ? 'block' : 'none';

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.style.display = visible ? 'block' : 'none';
}

function loadGame(gameConfig) {
    setLobbyVisible(false);
    if (heading) setGameHeading(heading, gameConfig.title);

    const canvasContainer = createElement('div', { id: 'game-canvas-container' });
    gameContainer?.appendChild(canvasContainer);

    backBtn = createElement('button', { className: 'back-btn', text: '← BACK TO ARCADE' });
    backBtn.addEventListener('click', returnToLobby);
    document.body.appendChild(backBtn);

    try {
        activeGame = new gameConfig.class(canvasContainer, () => {
            stats.endSession();
            checkAchievements();
        });
        activeGame.init();
        gameContainer?.appendChild(createControlsPanel(gameConfig.controls));
        stats.startSession(gameConfig.id);
    } catch (err) {
        console.error(`Failed to initialize ${gameConfig.title}:`, err);
        canvasContainer.replaceChildren(createErrorPanel(gameConfig.title, err));
    }
}

function returnToLobby() {
    stats.endSession();
    if (activeGame) {
        activeGame.stop();
        activeGame = null;
    }

    backBtn?.remove();
    backBtn = null;
    document.getElementById('game-canvas-container')?.remove();
    document.getElementById('controls-panel')?.remove();
    if (heading) setArcadeHeading(heading);
    setLobbyVisible(true);
    initLobby();
    checkAchievements();
}

initLobby();
checkAchievements();
