export function createElement(tag, { className, id, text, attrs = {}, style = {} } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (id) node.id = id;
    if (text !== undefined) node.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    Object.entries(style).forEach(([key, value]) => {
        if (key in node.style) {
            node.style[key] = value;
        } else {
            node.style.setProperty(key, value);
        }
    });
    children.forEach((child) => node.append(child));
    return node;
}

export function setArcadeHeading(heading) {
    heading.replaceChildren(
        document.createTextNode('ARCADE '),
        createElement('span', { className: 'neon-flicker', text: 'LOBBY' })
    );
}

export function setGameHeading(heading, title) {
    heading.replaceChildren(createElement('span', { className: 'neon-flicker', text: title.toUpperCase() }));
}

export function createGameCard(game, highScore, onSelect) {
    const card = createElement('div', { className: `game-card${game.class ? '' : ' disabled'}` });
    const accentColor = game.color || 'var(--neon-blue)';
    card.style.borderColor = accentColor;
    card.style.setProperty('--card-glow', accentColor);

    card.append(
        createElement('div', { className: 'card-icon', text: game.icon, style: { color: accentColor } }),
        createElement('h3', { text: game.title }),
        createElement('span', { className: 'genre-tag', text: game.genre, style: { borderColor: accentColor, color: accentColor } }),
        createElement('p', { className: 'card-desc', text: game.description })
    );

    if (highScore > 0) {
        card.append(createElement('div', { className: 'high-score', text: `HI: ${highScore}` }));
    }

    if (!game.class) {
        card.append(createElement('small', { text: 'Coming Soon' }));
    } else {
        card.addEventListener('click', () => onSelect(game));
    }

    return card;
}

export function createControlsPanel(controls = {}) {
    const panel = createElement('details', {
        id: 'controls-panel',
        className: 'controls-panel',
        attrs: { open: '' },
    });
    panel.append(createElement('summary', { text: 'Controls' }));

    const grid = createElement('div', { className: 'controls-grid' });
    const modes = [
        ['mouse', 'Mouse'],
        ['keyboard', 'Keyboard'],
        ['touch', 'Touch'],
    ];

    modes.forEach(([mode, label]) => {
        const entries = controls[mode] || [];
        const list = createElement('ul');
        entries.forEach((entry) => list.append(createElement('li', { text: entry })));

        grid.append(createElement('section', { className: 'control-mode' }, [
            createElement('h3', { text: label }),
            list,
        ]));
    });

    panel.append(grid);
    return panel;
}

export function createAchievementToast(achievement) {
    return createElement('div', { className: 'achievement-toast' }, [
        createElement('span', { className: 'achievement-icon', text: '★' }),
        document.createTextNode(' '),
        createElement('strong', { text: achievement.name }),
        createElement('br'),
        createElement('small', { text: achievement.desc }),
    ]);
}

export function createErrorPanel(gameTitle, err) {
    return createElement('div', {
        style: {
            color: '#f00',
            textAlign: 'center',
            padding: '40px',
            fontFamily: 'monospace',
        },
    }, [
        createElement('h2', { text: 'SYSTEM ERROR' }),
        createElement('p', { text: `${gameTitle} failed to initialize.` }),
        createElement('p', {
            text: err.message,
            style: { color: '#888', fontSize: '0.8rem' },
        }),
    ]);
}
