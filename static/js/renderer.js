/**
 * @fileoverview Canvas rendering module for the game.
 * Handles all visual rendering including the main game canvas, minimap,
 * score display, and leaderboard updates.
 * @module renderer
 */

import { gameState } from './gameState.js';
import { getSize, calculateCenterOfMass } from './utils.js';
import { WORLD_SIZE, COLORS, FOOD_SIZE } from './config.js';

/** @type {HTMLCanvasElement} Main game canvas element */
let canvas;
/** @type {CanvasRenderingContext2D} Main canvas 2D rendering context */
let ctx;
/** @type {HTMLCanvasElement} Minimap canvas element */
let minimapCanvas;
/** @type {CanvasRenderingContext2D} Minimap canvas 2D rendering context */
let minimapCtx;
/** @type {HTMLElement} Score display element */
let scoreElement;
/** @type {HTMLElement} Leaderboard content container element */
let leaderboardContent;

/**
 * Initializes the renderer with DOM canvas elements and their contexts.
 * Sets up references to all required canvas and UI elements for rendering.
 * @param {Object} canvasElements - Object containing DOM element references.
 * @param {HTMLCanvasElement} canvasElements.gameCanvas - The main game canvas.
 * @param {HTMLCanvasElement} canvasElements.minimapCanvas - The minimap canvas.
 * @param {HTMLElement} canvasElements.scoreElement - The score display element.
 * @param {HTMLElement} canvasElements.leaderboardContent - The leaderboard container.
 * @example
 * // Initialize renderer with DOM elements
 * initRenderer({
 *   gameCanvas: document.getElementById('gameCanvas'),
 *   minimapCanvas: document.getElementById('minimap'),
 *   scoreElement: document.getElementById('score'),
 *   leaderboardContent: document.getElementById('leaderboard-content')
 * });
 */
export function initRenderer(canvasElements) {
    canvas = canvasElements.gameCanvas;
    ctx = canvas.getContext('2d');
    minimapCanvas = canvasElements.minimapCanvas;
    minimapCtx = minimapCanvas.getContext('2d');
    scoreElement = canvasElements.scoreElement;
    leaderboardContent = canvasElements.leaderboardContent;

    resizeCanvas();
}

/**
 * Resizes the main game canvas to match the current window dimensions.
 * Should be called on window resize events to maintain full-screen rendering.
 * @example
 * // Bind to window resize event
 * window.addEventListener('resize', resizeCanvas);
 */
export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Draws a filled circle on the main canvas.
 * Used for rendering food particles and as a base for cell rendering.
 * @param {number} x - The x-coordinate of the circle center in screen space.
 * @param {number} y - The y-coordinate of the circle center in screen space.
 * @param {number} value - Either the radius (for food) or score (for cells).
 * @param {string} color - The fill color for the circle.
 * @param {boolean} isFood - If true, value is used as radius; if false, radius is calculated from score.
 * @private
 */
function drawCircle(x, y, value, color, isFood) {
    const size = isFood ? value : getSize(value);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

/**
 * Draws a cell with its name label centered inside.
 * Renders the cell as a filled circle with the player/AI name displayed
 * in white text with a black outline for readability.
 * @param {number} x - The x-coordinate of the cell center in screen space.
 * @param {number} y - The y-coordinate of the cell center in screen space.
 * @param {number} score - The score/mass of the cell (determines size).
 * @param {string} color - The fill color for the cell.
 * @param {string} name - The name to display inside the cell.
 * @private
 */
function drawCellWithName(x, y, score, color, name) {
    const size = getSize(score);
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (size > 20) {
        ctx.save();
        
        const fontSize = Math.max(12, Math.min(20, size / 2));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText(name, x, y);
        ctx.fillText(name, x, y);
        
        ctx.restore();
    }
}

/**
 * Renders the main game view including all entities.
 * Clears the canvas, updates camera position to follow player's center of mass,
 * then draws food particles, AI players, and player cells in order (back to front).
 * Only renders entities that are within the visible viewport for performance.
 * Also updates the score display element.
 * @example
 * // Called every frame in the game loop
 * drawGame();
 */
export function drawGame() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerOfMass = calculateCenterOfMass(gameState.playerCells);
    gameState.camera.x = centerOfMass.x - canvas.width / 2;
    gameState.camera.y = centerOfMass.y - canvas.height / 2;

    gameState.food.forEach(food => {
        const screenX = food.x - gameState.camera.x;
        const screenY = food.y - gameState.camera.y;
        
        if (screenX >= -FOOD_SIZE && screenX <= canvas.width + FOOD_SIZE &&
            screenY >= -FOOD_SIZE && screenY <= canvas.height + FOOD_SIZE) {
            drawCircle(screenX, screenY, FOOD_SIZE, food.color, true);
        }
    });

    // Draw AI players
    gameState.aiPlayers.forEach(ai => {
        const screenX = ai.x - gameState.camera.x;
        const screenY = ai.y - gameState.camera.y;
        const size = getSize(ai.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, ai.score, ai.color, ai.name);
        }
    });

    // Draw player cells
    gameState.playerCells.forEach(cell => {
        const screenX = cell.x - gameState.camera.x;
        const screenY = cell.y - gameState.camera.y;
        const size = getSize(cell.score);
        
        if (screenX >= -size && screenX <= canvas.width + size &&
            screenY >= -size && screenY <= canvas.height + size) {
            drawCellWithName(screenX, screenY, cell.score, COLORS.PLAYER, gameState.playerName);
        }
    });

    scoreElement.textContent = `Score: ${Math.floor(gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0))}`;
}

/**
 * Renders the minimap showing a scaled-down view of the entire game world.
 * Displays the current viewport as a rectangle and shows positions of
 * AI players and player cells as colored dots.
 * @example
 * // Called every frame after drawGame
 * drawMinimap();
 */
export function drawMinimap() {
    if (!minimapCtx) return;

    const MINIMAP_SIZE = 150;
    const scale = MINIMAP_SIZE / WORLD_SIZE;
    
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    minimapCtx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    
    const viewWidth = canvas.width * scale;
    const viewHeight = canvas.height * scale;
    const viewX = gameState.camera.x * scale;
    const viewY = gameState.camera.y * scale;
    minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    minimapCtx.strokeRect(viewX, viewY, viewWidth, viewHeight);

    gameState.aiPlayers.forEach(ai => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            ai.x * scale,
            ai.y * scale,
            2,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.OTHER;
        minimapCtx.fill();
    });

    // Draw player cells on minimap
    gameState.playerCells.forEach(cell => {
        minimapCtx.beginPath();
        minimapCtx.arc(
            cell.x * scale,
            cell.y * scale,
            3,
            0,
            Math.PI * 2
        );
        minimapCtx.fillStyle = COLORS.MINIMAP.PLAYER;
        minimapCtx.fill();
    });
}

/**
 * Updates the leaderboard display with current rankings.
 * Combines player and AI scores, sorts by score descending,
 * and displays the top 5 players with their names and scores.
 * The current player's name is highlighted with a special CSS class.
 * @example
 * // Called every frame to keep leaderboard current
 * updateLeaderboard();
 */
export function updateLeaderboard() {
    if (!leaderboardContent) return;

    const playerTotalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
    
    const allPlayers = [
        { 
            name: gameState.playerName,
            score: playerTotalScore,
            isPlayer: true
        },
        ...gameState.aiPlayers.map(ai => ({
            name: ai.name,
            score: ai.score,
            isPlayer: false
        }))
    ];

    allPlayers.sort((a, b) => b.score - a.score);
    
    leaderboardContent.innerHTML = allPlayers
        .slice(0, 5)
        .map((player, index) => `
            <div class="leaderboard-item">
                <span class="${player.isPlayer ? 'player-name' : ''}">${index + 1}. ${player.name}</span>
                <span>${Math.floor(player.score)}</span>
            </div>
        `)
        .join('');
}
