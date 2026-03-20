/** Wraps localStorage with a prefix-based key scheme for game data persistence. */
export class StorageManager {
    constructor() {
        this.prefix = 'webGames_';
    }

    /** @param {string} gameId @param {number} score @returns {boolean} */
    saveHighScore(gameId, score) {
        const key = `${this.prefix}${gameId}_highscore`;
        const currentHigh = this.getHighScore(gameId);
        if (score > currentHigh) {
            localStorage.setItem(key, score);
            return true; // New high score!
        }
        return false;
    }

    /** @param {string} gameId @returns {number} */
    getHighScore(gameId) {
        const key = `${this.prefix}${gameId}_highscore`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    /** @param {string} gameId @param {Object} settings */
    saveSettings(gameId, settings) {
        const key = `${this.prefix}${gameId}_settings`;
        localStorage.setItem(key, JSON.stringify(settings));
    }

    /** @param {string} gameId @returns {Object|null} */
    getSettings(gameId) {
        const key = `${this.prefix}${gameId}_settings`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}
