export const DIRECTIONS = {
    UP: { row: -1, col: 0, name: 'up' },
    RIGHT: { row: 0, col: 1, name: 'right' },
    DOWN: { row: 1, col: 0, name: 'down' },
    LEFT: { row: 0, col: -1, name: 'left' },
    NONE: { row: 0, col: 0, name: 'none' },
};

const DIRECTION_LIST = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];

export function keyFor(row, col) {
    return `${row},${col}`;
}

export function sameDirection(a, b) {
    return a?.row === b?.row && a?.col === b?.col;
}

export function reverseDirection(direction) {
    return { row: -direction.row, col: -direction.col, name: `reverse-${direction.name}` };
}

export function isReverse(a, b) {
    return a.row + b.row === 0 && a.col + b.col === 0 && (a.row !== 0 || a.col !== 0);
}

export function directionBetween(from, to) {
    const delta = { row: Math.sign(to.row - from.row), col: Math.sign(to.col - from.col) };
    return DIRECTION_LIST.find((direction) => direction.row === delta.row && direction.col === delta.col) ?? DIRECTIONS.NONE;
}

export function createMazeState(levelRows) {
    const walls = new Set();
    const dots = new Set();
    const powerNodes = new Set();
    const hunters = [];
    let player = null;

    levelRows.forEach((rowText, row) => {
        [...rowText].forEach((tile, col) => {
            const key = keyFor(row, col);
            if (tile === '#') walls.add(key);
            if (tile === '.') dots.add(key);
            if (tile === 'P') powerNodes.add(key);
            if (tile === 'S') player = { row, col };
            if (tile === 'H') hunters.push({ row, col });
        });
    });

    return {
        rows: levelRows.length,
        cols: Math.max(...levelRows.map((row) => row.length)),
        walls,
        dots,
        powerNodes,
        player,
        hunters,
    };
}

export function isInside(state, row, col) {
    return row >= 0 && row < state.rows && col >= 0 && col < state.cols;
}

export function isWalkable(state, row, col) {
    if (!isInside(state, row, col)) return false;
    return !state.walls.has(keyFor(row, col));
}

export function stepPosition(state, position, direction) {
    const next = { row: position.row + direction.row, col: position.col + direction.col };
    if (next.col < 0) next.col = state.cols - 1;
    if (next.col >= state.cols) next.col = 0;
    return isWalkable(state, next.row, next.col) ? next : { row: position.row, col: position.col };
}

export function availableDirections(state, position) {
    return DIRECTION_LIST.filter((direction) => {
        const next = stepPosition(state, position, direction);
        return next.row !== position.row || next.col !== position.col;
    });
}

function shortestDistance(state, start, target) {
    const queue = [{ ...start, distance: 0 }];
    const seen = new Set([keyFor(start.row, start.col)]);

    while (queue.length > 0) {
        const current = queue.shift();
        if (current.row === target.row && current.col === target.col) return current.distance;

        for (const direction of DIRECTION_LIST) {
            const next = stepPosition(state, current, direction);
            const key = keyFor(next.row, next.col);
            if (seen.has(key) || (next.row === current.row && next.col === current.col)) continue;
            seen.add(key);
            queue.push({ ...next, distance: current.distance + 1 });
        }
    }

    return Number.POSITIVE_INFINITY;
}

export function findNextHunterDirection(state, position, target, currentDirection = DIRECTIONS.NONE, mode = 'chase') {
    let choices = availableDirections(state, position);
    if (choices.length === 0) return DIRECTIONS.NONE;

    const nonReverse = choices.filter((direction) => !isReverse(direction, currentDirection));
    if (nonReverse.length > 0) choices = nonReverse;

    return choices
        .map((direction) => {
            const next = stepPosition(state, position, direction);
            return { direction, distance: shortestDistance(state, next, target) };
        })
        .sort((a, b) => mode === 'frightened' ? b.distance - a.distance : a.distance - b.distance)[0].direction;
}
