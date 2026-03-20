// Element types and their properties
export const ELEMENTS = {
    EMPTY: 0,
    SAND: 1,
    WATER: 2,
    FIRE: 3,
    OIL: 4,
    ACID: 5,
    PLANT: 6,
    WOOD: 7,
    STONE: 8,
    STEAM: 9,
    SMOKE: 10
};

export const ELEMENT_INFO = {
    [ELEMENTS.EMPTY]:  { name: 'Erase',  color: null,      key: '0' },
    [ELEMENTS.SAND]:   { name: 'Sand',   color: '#c2b280', key: '1' },
    [ELEMENTS.WATER]:  { name: 'Water',  color: '#3498db', key: '2' },
    [ELEMENTS.FIRE]:   { name: 'Fire',   color: '#e74c3c', key: '3' },
    [ELEMENTS.OIL]:    { name: 'Oil',    color: '#8B4513', key: '4' },
    [ELEMENTS.ACID]:   { name: 'Acid',   color: '#2ecc71', key: '5' },
    [ELEMENTS.PLANT]:  { name: 'Plant',  color: '#27ae60', key: '6' },
    [ELEMENTS.WOOD]:   { name: 'Wood',   color: '#8B6914', key: '7' },
    [ELEMENTS.STONE]:  { name: 'Stone',  color: '#7f8c8d', key: '8' },
    [ELEMENTS.STEAM]:  { name: 'Steam',  color: '#bdc3c7', key: null },
    [ELEMENTS.SMOKE]:  { name: 'Smoke',  color: '#555555', key: null }
};

// Color variation for visual interest
export function getColor(type) {
    const info = ELEMENT_INFO[type];
    if (!info || !info.color) return null;

    // Add slight random variation
    const base = info.color;
    const r = parseInt(base.slice(1, 3), 16);
    const g = parseInt(base.slice(3, 5), 16);
    const b = parseInt(base.slice(5, 7), 16);

    const vary = 15;
    const nr = Math.max(0, Math.min(255, r + (Math.random() * vary * 2 - vary) | 0));
    const ng = Math.max(0, Math.min(255, g + (Math.random() * vary * 2 - vary) | 0));
    const nb = Math.max(0, Math.min(255, b + (Math.random() * vary * 2 - vary) | 0));

    return (nr << 16) | (ng << 8) | nb;
}

// Fire flicker color
export function getFireColor() {
    const colors = [0xe74c3c, 0xff6600, 0xffcc00, 0xff3300];
    return colors[Math.random() * colors.length | 0];
}
