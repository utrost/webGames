import { createElement } from './dom.js';

export const VOLUME_KEY = 'webGames_volume';
export const COLORBLIND_KEY = 'webGames_colorblind';

export function getVolume(localStorageRef = globalThis.localStorage) {
    try {
        const volume = parseFloat(localStorageRef.getItem(VOLUME_KEY) || '1.0');
        return Number.isFinite(volume) ? volume : 1.0;
    } catch {
        return 1.0;
    }
}

export function setVolume(volume, { localStorageRef = globalThis.localStorage, audioManager } = {}) {
    try {
        localStorageRef.setItem(VOLUME_KEY, volume.toString());
    } catch {
        // Storage unavailable — keep runtime volume change only.
    }
    if (audioManager) audioManager.masterVolume = volume;
}

export function isColorBlindMode(localStorageRef = globalThis.localStorage) {
    try {
        return localStorageRef.getItem(COLORBLIND_KEY) === 'true';
    } catch {
        return false;
    }
}

export function setColorBlindMode(enabled, localStorageRef = globalThis.localStorage) {
    try {
        localStorageRef.setItem(COLORBLIND_KEY, enabled.toString());
    } catch {
        // Storage unavailable — no persistent mode change.
    }
}

function createAchievementRow(achievement, unlockedIds) {
    const done = unlockedIds.includes(achievement.id);
    return createElement('div', { className: `achievement ${done ? 'unlocked' : 'locked'}` }, [
        createElement('span', { text: done ? '★' : '☆' }),
        document.createTextNode(' '),
        createElement('strong', { text: achievement.name }),
        document.createTextNode(` — ${achievement.desc}`),
    ]);
}

export function createSettingsPanel({ achievements, unlockedIds, stats, volume, colorBlind, onVolume, onMute, onColorBlind, onClose }) {
    const volumeLabel = createElement('span', { id: 'volume-label', text: `${Math.round(volume * 100)}%` });
    const muteBtn = createElement('button', { id: 'mute-btn', className: 'setting-btn', text: volume === 0 ? 'UNMUTE' : 'MUTE' });
    const volumeSlider = createElement('input', {
        id: 'volume-slider',
        attrs: { type: 'range', min: '0', max: '1', step: '0.1', value: volume.toString() },
    });
    const colorBlindBtn = createElement('button', { id: 'colorblind-btn', className: 'setting-btn', text: colorBlind ? 'ON' : 'OFF' });
    const minutesPlayed = Math.round(stats.totalTimePlayed / 60);

    volumeSlider.addEventListener('input', (e) => {
        const nextVolume = parseFloat(e.target.value);
        onVolume(nextVolume);
        volumeLabel.textContent = `${Math.round(nextVolume * 100)}%`;
        muteBtn.textContent = nextVolume === 0 ? 'UNMUTE' : 'MUTE';
    });

    muteBtn.addEventListener('click', () => {
        const nextVolume = getVolume() === 0 ? 1.0 : 0;
        onMute(nextVolume);
        volumeSlider.value = nextVolume.toString();
        volumeLabel.textContent = `${Math.round(nextVolume * 100)}%`;
        muteBtn.textContent = nextVolume === 0 ? 'UNMUTE' : 'MUTE';
    });

    colorBlindBtn.addEventListener('click', () => {
        const next = !isColorBlindMode();
        onColorBlind(next);
        colorBlindBtn.textContent = next ? 'ON' : 'OFF';
    });

    const closeBtn = createElement('button', { id: 'close-settings', className: 'setting-btn', text: 'CLOSE' });
    closeBtn.addEventListener('click', onClose);

    return createElement('div', { id: 'settings-panel', className: 'settings-panel' }, [
        createElement('h2', { text: 'SETTINGS' }),
        createElement('div', { className: 'setting-row' }, [
            createElement('label', { text: 'Volume' }),
            volumeSlider,
            volumeLabel,
        ]),
        createElement('div', { className: 'setting-row' }, [muteBtn]),
        createElement('div', { className: 'setting-row' }, [
            createElement('label', { text: 'Color-blind' }),
            colorBlindBtn,
        ]),
        createElement('h3', { text: 'STATISTICS' }),
        createElement('div', { className: 'stats-display' }, [
            createElement('p', { text: `Games Played: ${stats.totalGamesPlayed}` }),
            createElement('p', { text: `Time Played: ${minutesPlayed} min` }),
            createElement('p', { text: 'Press F3 in-game for FPS counter', style: { color: '#888', fontSize: '0.8rem' } }),
        ]),
        createElement('h3', { text: 'ACHIEVEMENTS' }),
        createElement('div', { className: 'achievements-list' }, achievements.map((achievement) => createAchievementRow(achievement, unlockedIds))),
        closeBtn,
    ]);
}
