/**
 * @fileoverview Utility functions for game calculations including size computation,
 * position generation, distance calculations, and spawn location finding.
 * @module utils
 */

import { WORLD_SIZE } from './config.js';

/**
 * Calculates the visual radius of a cell based on its score.
 * Uses a square root function to create diminishing returns as score increases,
 * with a base size of 20 pixels.
 * @param {number} score - The score/mass of the cell.
 * @returns {number} The radius of the cell in pixels.
 * @example
 * // Get size for a cell with score 100
 * const radius = getSize(100); // Returns ~30 (sqrt(100) + 20)
 */
export function getSize(score) {
    return Math.sqrt(score) + 20;
}

/**
 * Generates a random position within the game world boundaries.
 * @returns {{x: number, y: number}} An object containing random x and y coordinates.
 * @example
 * // Spawn food at random location
 * const pos = getRandomPosition();
 * food.push({ x: pos.x, y: pos.y, color: 'red' });
 */
export function getRandomPosition() {
    return {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE
    };
}

/**
 * Calculates the Euclidean distance between two objects with x and y coordinates.
 * @param {{x: number, y: number}} obj1 - The first object with position coordinates.
 * @param {{x: number, y: number}} obj2 - The second object with position coordinates.
 * @returns {number} The distance between the two objects in pixels.
 * @example
 * // Check if two cells are close enough to collide
 * const distance = getDistance(cell1, cell2);
 * if (distance < cell1.radius + cell2.radius) {
 *   handleCollision(cell1, cell2);
 * }
 */
export function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the weighted center of mass for an array of cells.
 * Each cell's position is weighted by its score, so larger cells have more
 * influence on the resulting center point. Used for camera positioning.
 * @param {Array<{x: number, y: number, score: number}>} cells - Array of cell objects.
 * @returns {{x: number, y: number}} The weighted center of mass coordinates.
 * @example
 * // Center camera on player's cells
 * const center = calculateCenterOfMass(gameState.playerCells);
 * camera.x = center.x - canvas.width / 2;
 * camera.y = center.y - canvas.height / 2;
 */
export function calculateCenterOfMass(cells) {
    const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
    if (totalScore === 0) return { x: 0, y: 0 };
    
    return {
        x: cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore,
        y: cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore
    };
}

/**
 * Finds a safe spawn location that is not too close to existing players or AI.
 * Uses a two-phase approach: first attempts to find a completely safe spot,
 * then falls back to finding the spot furthest from all entities.
 * @param {Object} gameState - The current game state object.
 * @param {Array<{x: number, y: number, score: number}>} gameState.aiPlayers - Array of AI player objects.
 * @param {Array<{x: number, y: number, score: number}>} gameState.playerCells - Array of player cell objects.
 * @param {number} [minDistance=100] - Minimum safe distance from other entities in pixels.
 * @returns {{x: number, y: number}} A safe spawn position.
 * @example
 * // Respawn player at safe location
 * const safePos = findSafeSpawnLocation(gameState);
 * gameState.playerCells.push({
 *   x: safePos.x,
 *   y: safePos.y,
 *   score: STARTING_SCORE
 * });
 */
export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const pos = getRandomPosition();
        let isSafe = true;

        for (const ai of gameState.aiPlayers) {
            const distance = getDistance(pos, ai);
            const safeDistance = getSize(ai.score) + minDistance;
            if (distance < safeDistance) {
                isSafe = false;
                break;
            }
        }

        for (const cell of gameState.playerCells) {
            const distance = getDistance(pos, cell);
            const safeDistance = getSize(cell.score) + minDistance;
            if (distance < safeDistance) {
                isSafe = false;
                break;
            }
        }

        if (isSafe) {
            return pos;
        }

        attempts++;
    }

    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
        const pos = getRandomPosition();
        let minDistanceToPlayer = Infinity;

        [...gameState.aiPlayers, ...gameState.playerCells].forEach(entity => {
            const distance = getDistance(pos, entity);
            minDistanceToPlayer = Math.min(minDistanceToPlayer, distance);
        });

        if (minDistanceToPlayer > maxMinDistance) {
            maxMinDistance = minDistanceToPlayer;
            bestPos = pos;
        }
    }

    return bestPos;
}
