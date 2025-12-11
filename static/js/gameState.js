/**
 * @fileoverview Global game state management module.
 * Contains the central state object that tracks all game entities including
 * player cells, AI players, food particles, and camera position.
 * @module gameState
 */

import { WORLD_SIZE, STARTING_SCORE } from './config.js';

/**
 * @typedef {Object} PlayerCell
 * @property {number} x - The x-coordinate of the cell in world space.
 * @property {number} y - The y-coordinate of the cell in world space.
 * @property {number} score - The current score/mass of the cell.
 * @property {number} velocityX - The horizontal velocity component.
 * @property {number} velocityY - The vertical velocity component.
 * @property {number} [splitTime] - Timestamp when the cell was created from a split.
 */

/**
 * @typedef {Object} AIPlayer
 * @property {number} x - The x-coordinate of the AI player in world space.
 * @property {number} y - The y-coordinate of the AI player in world space.
 * @property {number} score - The current score/mass of the AI player.
 * @property {string} color - The HSL color string for rendering.
 * @property {number} direction - The current movement direction in radians.
 * @property {string} name - The display name of the AI player.
 */

/**
 * @typedef {Object} Food
 * @property {number} x - The x-coordinate of the food particle.
 * @property {number} y - The y-coordinate of the food particle.
 * @property {string} color - The HSL color string for rendering.
 */

/**
 * The central game state object containing all game entities and state.
 * This object is mutated throughout gameplay to track positions, scores, and entities.
 * @constant {Object}
 * @property {PlayerCell[]} playerCells - Array of cells controlled by the player.
 * @property {string} playerName - The display name of the player.
 * @property {{x: number, y: number}} camera - The camera offset for viewport rendering.
 * @property {Food[]} food - Array of food particles in the game world.
 * @property {AIPlayer[]} aiPlayers - Array of AI-controlled players.
 * @example
 * // Access player's total score
 * const totalScore = gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0);
 *
 * // Update camera position
 * gameState.camera.x = playerX - canvas.width / 2;
 * gameState.camera.y = playerY - canvas.height / 2;
 */
export const gameState = {
    playerCells: [{
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0
    }],
    playerName: 'Windsurf',
    camera: {
        x: 0,
        y: 0
    },
    food: [],
    aiPlayers: []
};

/**
 * Tracks the current mouse position for player movement direction.
 * Updated by mouse move event listeners in the game loop.
 * @constant {{x: number, y: number}}
 * @example
 * // Calculate direction from screen center to mouse
 * const dx = mouse.x - window.innerWidth / 2;
 * const dy = mouse.y - window.innerHeight / 2;
 */
export const mouse = { x: 0, y: 0 };
