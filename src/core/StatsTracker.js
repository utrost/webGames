import { StorageManager } from './StorageManager.js';

const STATS_KEY = 'stats';

export class StatsTracker {
    constructor() {
        this.storage = new StorageManager();
        this.stats = this.storage.getSettings(STATS_KEY) || {
            totalGamesPlayed: 0,
            totalTimePlayed: 0,
            gamesPlayed: {}
        };
        this._sessionStart = null;
        this._currentGame = null;
    }

    startSession(gameId) {
        this._currentGame = gameId;
        this._sessionStart = Date.now();
        this.stats.totalGamesPlayed++;
        if (!this.stats.gamesPlayed[gameId]) {
            this.stats.gamesPlayed[gameId] = { plays: 0, totalTime: 0 };
        }
        this.stats.gamesPlayed[gameId].plays++;
        this._save();
    }

    endSession() {
        if (this._sessionStart && this._currentGame) {
            const elapsed = (Date.now() - this._sessionStart) / 1000;
            this.stats.totalTimePlayed += elapsed;
            this.stats.gamesPlayed[this._currentGame].totalTime += elapsed;
            this._save();
        }
        this._sessionStart = null;
        this._currentGame = null;
    }

    getStats() {
        return { ...this.stats };
    }

    getGameStats(gameId) {
        return this.stats.gamesPlayed[gameId] || { plays: 0, totalTime: 0 };
    }

    _save() {
        this.storage.saveSettings(STATS_KEY, this.stats);
    }
}
