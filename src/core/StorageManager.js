export class StorageManager {
    constructor() {
        this.prefix = 'webGames_';
    }

    saveHighScore(gameId, score) {
        const key = `${this.prefix}${gameId}_highscore`;
        const currentHigh = this.getHighScore(gameId);
        if (score > currentHigh) {
            localStorage.setItem(key, score);
            return true; // New high score!
        }
        return false;
    }

    getHighScore(gameId) {
        const key = `${this.prefix}${gameId}_highscore`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    saveSettings(gameId, settings) {
        const key = `${this.prefix}${gameId}_settings`;
        localStorage.setItem(key, JSON.stringify(settings));
    }

    getSettings(gameId) {
        const key = `${this.prefix}${gameId}_settings`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}
