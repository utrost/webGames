import { GameLoop } from '../../core/GameLoop.js';
import { AudioManager } from '../../core/AudioManager.js';
import { CanvasScaler } from '../../core/CanvasScaler.js';
import { Simulation } from './Simulation.js';
import { ELEMENTS, ELEMENT_INFO } from './Elements.js';

export class ElementalSandbox {
    constructor(canvasContainer, onGameOver) {
        this.container = canvasContainer;
        this.onGameOver = onGameOver;
        this.audio = new AudioManager();

        // Simulation grid
        this.simWidth = 200;
        this.simHeight = 150;
        this.pixelSize = 4; // Each cell = 4x4 pixels

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.simWidth * this.pixelSize;
        this.canvas.height = this.simHeight * this.pixelSize;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.imageRendering = 'pixelated';
        this.scaler = new CanvasScaler(this.canvas, this.canvas.width, this.canvas.height);

        // Off-screen buffer for pixel manipulation
        this.imageData = this.ctx.createImageData(this.simWidth, this.simHeight);
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.simWidth;
        this.bufferCanvas.height = this.simHeight;
        this.bufferCtx = this.bufferCanvas.getContext('2d');

        // State
        this.selectedElement = ELEMENTS.SAND;
        this.brushSize = 3;
        this.isDrawing = false;
        this.drawX = 0;
        this.drawY = 0;
        this.paused = false;
        this.simSpeed = 1; // Steps per frame

        this.sim = new Simulation(this.simWidth, this.simHeight);
    }

    init() {
        this.createUI();
        this.setupInput();

        this.loop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );
        this.loop.start();
    }

    createUI() {
        this.uiPanel = document.createElement('div');
        this.uiPanel.className = 'sandbox-ui';
        this.uiPanel.innerHTML = '';

        // Element buttons
        const elemRow = document.createElement('div');
        elemRow.className = 'sandbox-elements';

        const drawableElements = Object.entries(ELEMENT_INFO).filter(([, info]) => info.key !== null);
        drawableElements.forEach(([typeStr, info]) => {
            const type = parseInt(typeStr);
            const btn = document.createElement('button');
            btn.className = 'sandbox-elem-btn';
            btn.textContent = `${info.key}: ${info.name}`;
            btn.style.borderColor = info.color || '#666';
            if (type === this.selectedElement) btn.classList.add('active');

            btn.addEventListener('click', () => {
                this.selectedElement = type;
                elemRow.querySelectorAll('.sandbox-elem-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });

            elemRow.appendChild(btn);
        });

        // Controls row
        const controlRow = document.createElement('div');
        controlRow.className = 'sandbox-controls';

        const brushLabel = document.createElement('span');
        brushLabel.textContent = `Brush: ${this.brushSize}`;
        brushLabel.style.color = '#fff';
        brushLabel.style.marginRight = '10px';

        const brushSlider = document.createElement('input');
        brushSlider.type = 'range';
        brushSlider.min = '1';
        brushSlider.max = '10';
        brushSlider.value = this.brushSize.toString();
        brushSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            brushLabel.textContent = `Brush: ${this.brushSize}`;
        });

        const clearBtn = document.createElement('button');
        clearBtn.className = 'sandbox-elem-btn';
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.borderColor = '#f00';
        clearBtn.addEventListener('click', () => this.sim.clear());

        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'sandbox-elem-btn';
        pauseBtn.textContent = 'PAUSE';
        pauseBtn.style.borderColor = '#ff0';
        pauseBtn.addEventListener('click', () => {
            this.paused = !this.paused;
            pauseBtn.textContent = this.paused ? 'PLAY' : 'PAUSE';
        });

        controlRow.appendChild(brushLabel);
        controlRow.appendChild(brushSlider);
        controlRow.appendChild(clearBtn);
        controlRow.appendChild(pauseBtn);

        this.uiPanel.appendChild(elemRow);
        this.uiPanel.appendChild(controlRow);
        this.container.appendChild(this.uiPanel);
    }

    setupInput() {
        const getSimCoords = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width * this.simWidth) | 0;
            const y = ((clientY - rect.top) / rect.height * this.simHeight) | 0;
            return { x, y };
        };

        this.handleMouseDown = (e) => {
            this.isDrawing = true;
            const { x, y } = getSimCoords(e.clientX, e.clientY);
            this.drawX = x;
            this.drawY = y;
            this.paint(x, y);
        };

        this.handleMouseMove = (e) => {
            const { x, y } = getSimCoords(e.clientX, e.clientY);
            if (this.isDrawing) {
                this.paintLine(this.drawX, this.drawY, x, y);
            }
            this.drawX = x;
            this.drawY = y;
        };

        this.handleMouseUp = () => {
            this.isDrawing = false;
        };

        this.handleTouchStart = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const touch = e.touches[0];
            const { x, y } = getSimCoords(touch.clientX, touch.clientY);
            this.drawX = x;
            this.drawY = y;
            this.paint(x, y);
        };

        this.handleTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const { x, y } = getSimCoords(touch.clientX, touch.clientY);
            if (this.isDrawing) {
                this.paintLine(this.drawX, this.drawY, x, y);
            }
            this.drawX = x;
            this.drawY = y;
        };

        this.handleTouchEnd = (e) => {
            e.preventDefault();
            this.isDrawing = false;
        };

        this.handleKey = (e) => {
            // Number keys for element selection
            const num = parseInt(e.key);
            if (!isNaN(num)) {
                const entry = Object.entries(ELEMENT_INFO).find(([, info]) => info.key === e.key);
                if (entry) {
                    this.selectedElement = parseInt(entry[0]);
                    const buttons = this.uiPanel.querySelectorAll('.sandbox-elem-btn');
                    buttons.forEach(b => b.classList.remove('active'));
                    // Find and activate matching button
                    const drawableElements = Object.entries(ELEMENT_INFO).filter(([, info]) => info.key !== null);
                    const idx = drawableElements.findIndex(([t]) => parseInt(t) === this.selectedElement);
                    if (idx >= 0 && buttons[idx]) buttons[idx].classList.add('active');
                }
            }
            if (e.code === 'BracketLeft') this.brushSize = Math.max(1, this.brushSize - 1);
            if (e.code === 'BracketRight') this.brushSize = Math.min(10, this.brushSize + 1);
            if (e.code === 'KeyC') this.sim.clear();
            if (e.code === 'Escape') this.paused = !this.paused;
        };

        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        window.addEventListener('keydown', this.handleKey);
    }

    paint(cx, cy) {
        const r = this.brushSize;
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                if (dx * dx + dy * dy <= r * r) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (this.sim.inBounds(nx, ny)) {
                        if (this.selectedElement === ELEMENTS.EMPTY) {
                            this.sim.set(nx, ny, ELEMENTS.EMPTY);
                        } else if (this.sim.isEmpty(nx, ny)) {
                            // Small random chance to skip for natural look
                            if (Math.random() < 0.7) {
                                this.sim.set(nx, ny, this.selectedElement);
                            }
                        }
                    }
                }
            }
        }
    }

    paintLine(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.paint(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    update(dt) {
        if (!this.paused) {
            this.sim.step();
        }

        if (this.isDrawing) {
            this.paint(this.drawX, this.drawY);
        }
    }

    render() {
        const data = this.imageData.data;

        for (let y = 0; y < this.simHeight; y++) {
            for (let x = 0; x < this.simWidth; x++) {
                const i = y * this.simWidth + x;
                const pi = i * 4;
                const color = this.sim.colors[i];

                if (color === 0) {
                    // Dark background
                    data[pi] = 8;
                    data[pi + 1] = 8;
                    data[pi + 2] = 8;
                    data[pi + 3] = 255;
                } else {
                    data[pi] = (color >> 16) & 0xFF;
                    data[pi + 1] = (color >> 8) & 0xFF;
                    data[pi + 2] = color & 0xFF;
                    data[pi + 3] = 255;
                }
            }
        }

        this.bufferCtx.putImageData(this.imageData, 0, 0);

        // Scale up
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.bufferCanvas, 0, 0, this.canvas.width, this.canvas.height);

        // Draw brush cursor
        if (this.drawX >= 0 && this.drawY >= 0) {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(
                this.drawX * this.pixelSize + this.pixelSize / 2,
                this.drawY * this.pixelSize + this.pixelSize / 2,
                this.brushSize * this.pixelSize,
                0, Math.PI * 2
            );
            this.ctx.stroke();
        }

        // Paused indicator
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, 40);
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = '20px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED (ESC to resume)', this.canvas.width / 2, 28);
        }
    }

    stop() {
        this.loop.stop();
        this.scaler.destroy();
        this.canvas.remove();
        if (this.uiPanel) this.uiPanel.remove();
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('keydown', this.handleKey);
    }
}
