const ACHIEVEMENT_STORAGE_KEY = 'webGames_achievements';

export function createAchievements(games, storage) {
    return [
        { id: 'first_game', name: 'First Steps', desc: 'Play your first game', check: () => games.some((game) => storage.getHighScore(game.id) > 0) },
        { id: 'breaker_1000', name: 'Brick Buster', desc: 'Score 1000+ in Cosmic Breaker', check: () => storage.getHighScore('cosmic-breaker') >= 1000 },
        { id: 'orbit_500', name: 'Gravity Master', desc: 'Score 500+ in Orbit', check: () => storage.getHighScore('orbit') >= 500 },
        { id: 'asteroids_2000', name: 'Space Ace', desc: 'Score 2000+ in Asteroids', check: () => storage.getHighScore('asteroids') >= 2000 },
        { id: 'blocks_5000', name: 'Tetris Legend', desc: 'Score 5000+ in Neon Blocks', check: () => storage.getHighScore('neon-blocks') >= 5000 },
        { id: 'all_games', name: 'Arcade Regular', desc: 'Play all games', check: () => games.every((game) => storage.getHighScore(game.id) > 0) },
    ];
}

export function findNewAchievements(achievements, unlockedIds) {
    return achievements.filter((achievement) => !unlockedIds.includes(achievement.id) && achievement.check());
}

export class AchievementManager {
    constructor({ achievements, localStorageRef = globalThis.localStorage }) {
        this.achievements = achievements;
        this.localStorage = localStorageRef;
    }

    getUnlocked() {
        try {
            return JSON.parse(this.localStorage.getItem(ACHIEVEMENT_STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    setUnlocked(unlocked) {
        try {
            this.localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(unlocked));
        } catch {
            // Storage may be unavailable in private browsing or hardened contexts.
        }
    }

    unlockNew() {
        const unlocked = this.getUnlocked();
        const newlyUnlocked = findNewAchievements(this.achievements, unlocked);
        if (newlyUnlocked.length > 0) {
            this.setUnlocked([...unlocked, ...newlyUnlocked.map((achievement) => achievement.id)]);
        }
        return newlyUnlocked;
    }
}
