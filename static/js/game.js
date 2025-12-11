/**
 * @fileoverview Main game module containing initialization and game loop.
 * This is the entry point for the game, handling DOM setup, input binding,
 * and orchestrating the main update/render cycle.
 * @module game
 */

import { gameState, mouse } from './gameState.js';
import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from './renderer.js';
import { updatePlayer, updateAI, initEntities, handlePlayerSplit } from './entities.js';
import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from './collisions.js';
import { initUI } from './ui.js';

/**
 * Sets up all input event handlers for the game.
 * Binds mouse movement to update the mouse position tracker,
 * click events to trigger cell splitting, and window resize to update canvas dimensions.
 * @private
 */
function setupInputHandlers() {
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    canvas.addEventListener('click', (e) => {
        handlePlayerSplit();
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
    });
}

/**
 * Processes all collision types in the correct order.
 * Handles food consumption first, then player-AI interactions,
 * then AI-AI interactions, and finally respawns consumed entities.
 * @private
 */
function checkCollisions() {
    handleFoodCollisions();
    handlePlayerAICollisions();
    handleAIAICollisions();
    respawnEntities();
}

/**
 * Logs the current game state to the console for debugging.
 * Outputs player cells, AI players, and food count.
 * Logs errors if any entity arrays are empty.
 * @private
 */
function verifyGameState() {
    console.log('Verifying game state...');
    console.log('Player cells:', gameState.playerCells);
    console.log('AI players:', gameState.aiPlayers);
    console.log('Food count:', gameState.food.length);

    if (gameState.playerCells.length === 0) {
        console.error('No player cells found!');
    }
    if (gameState.aiPlayers.length === 0) {
        console.error('No AI players found!');
    }
    if (gameState.food.length === 0) {
        console.error('No food found!');
    }
}

/**
 * Main game loop that runs every frame using requestAnimationFrame.
 * Updates all game entities, checks collisions, updates UI elements,
 * and renders the game. Recursively schedules itself for the next frame.
 * @example
 * // Start the game loop
 * gameLoop();
 * // Loop continues indefinitely via requestAnimationFrame
 */
function gameLoop() {
    updatePlayer();
    updateAI();
    checkCollisions();
    updateLeaderboard();
    drawGame();
    drawMinimap();
    requestAnimationFrame(gameLoop);
}

/**
 * Initializes the entire game asynchronously.
 * Sets up all game components in the correct order: renderer, input handlers,
 * entities, and UI. Verifies game state before starting the main loop.
 * Logs progress and catches any initialization errors.
 * @async
 * @example
 * // Called automatically when DOM is ready
 * initGame();
 */
async function initGame() {
    try {
        console.log('Initializing game...');
        
        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Could not find element: ${key}`);
            }
        });

        console.log('DOM elements found');

        initRenderer(elements);
        console.log('Renderer initialized');
        
        setupInputHandlers();
        console.log('Input handlers set up');
        
        initEntities();
        console.log('Entities initialized');

        initUI();
        console.log('UI initialized');

        verifyGameState();

        console.log('Starting game loop');
        gameLoop();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

/**
 * Entry point - starts the game when the DOM is fully loaded.
 * If the document is still loading, waits for DOMContentLoaded event.
 * Otherwise, initializes immediately.
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
