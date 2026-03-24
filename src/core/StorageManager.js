/** Wraps localStorage with a prefix-based key scheme for game data persistence. */
export class StorageManager {
    constructor() {
        this.prefix = 'webGames_';
    }

    /** @param {string} gameId @param {number} score @returns {boolean} */
    saveHighScore(gameId, score) {
        const currentHigh = this.getHighScore(gameId);
        if (score > currentHigh) {
            try {
                localStorage.setItem(`${this.prefix}${gameId}_highscore`, score);
            } catch {
                return false;
            }
            return true;
        }
        return false;
    }

    /** @param {string} gameId @returns {number} */
    getHighScore(gameId) {
        try {
            const val = parseInt(localStorage.getItem(`${this.prefix}${gameId}_highscore`) || '0', 10);
            return Number.isNaN(val) ? 0 : val;
        } catch {
            return 0;
        }
    }

    /** @param {string} gameId @param {Object} settings */
    saveSettings(gameId, settings) {
        try {
            localStorage.setItem(`${this.prefix}${gameId}_settings`, JSON.stringify(settings));
        } catch {
            // Storage unavailable — silently ignore
        }
    }

    /** @param {string} gameId @returns {Object|null} */
    getSettings(gameId) {
        try {
            const data = localStorage.getItem(`${this.prefix}${gameId}_settings`);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }
}
