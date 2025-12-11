/**
 * @fileoverview Collision detection and handling module.
 * Manages all collision interactions between game entities including
 * food consumption, player-AI collisions, and AI-AI collisions.
 * @module collisions
 */

import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE, WORLD_SIZE } from './config.js';
import { respawnAI } from './entities.js';

/**
 * Handles collision detection between all cells (player and AI) and food particles.
 * When a cell overlaps with food, the food is consumed and the cell gains FOOD_SCORE points.
 * Food particles are removed from the game state when consumed.
 * @example
 * // Called every frame to check food collisions
 * handleFoodCollisions();
 * // Player and AI scores increase when they eat food
 */
export function handleFoodCollisions() {
    for (const playerCell of gameState.playerCells) {
        gameState.food = gameState.food.filter(food => {
            const distance = getDistance(playerCell, food);
            const playerSize = getSize(playerCell.score);

            if (distance < playerSize + FOOD_SIZE) {
                playerCell.score += FOOD_SCORE;
                return false;
            }
            return true;
        });
    }

    for (const ai of gameState.aiPlayers) {
        gameState.food = gameState.food.filter(food => {
            const distance = getDistance(ai, food);
            const aiSize = getSize(ai.score);

            if (distance < aiSize + FOOD_SIZE) {
                ai.score += FOOD_SCORE;
                return false;
            }
            return true;
        });
    }
}

/**
 * Handles collision detection and resolution between player cells and AI players.
 * Uses COLLISION_THRESHOLD to determine if one entity can consume another.
 * The larger entity must be at least COLLISION_THRESHOLD times bigger to consume.
 * Consumed entities are removed and their score is transferred to the consumer.
 * If all player cells are consumed, the player respawns at a safe location.
 * @example
 * // Called every frame to check player-AI collisions
 * handlePlayerAICollisions();
 * // Handles both player eating AI and AI eating player
 */
export function handlePlayerAICollisions() {
    const aiIndicesToRemove = new Set();
    const playerCellsToRemove = new Set();
    const scoreGains = new Map();

    gameState.playerCells.forEach((playerCell, playerCellIndex) => {
        gameState.aiPlayers.forEach((ai, aiIndex) => {
            if (aiIndicesToRemove.has(aiIndex)) return;
            if (playerCellsToRemove.has(playerCellIndex)) return;

            const distance = getDistance(playerCell, ai);
            const playerSize = getSize(playerCell.score);
            const aiSize = getSize(ai.score);
            const minDistance = playerSize + aiSize;

            if (distance < minDistance) {
                // Player cell is bigger
                if (playerSize > aiSize * COLLISION_THRESHOLD) {
                    const currentGain = scoreGains.get(playerCellIndex) || 0;
                    scoreGains.set(playerCellIndex, currentGain + ai.score + 100);
                    aiIndicesToRemove.add(aiIndex);
                }
                // AI is bigger
                else if (aiSize > playerSize * COLLISION_THRESHOLD) {
                    ai.score += playerCell.score + 100;
                    playerCellsToRemove.add(playerCellIndex);
                }
            }
        });
    });

    // Apply all changes after collision checks
    // Remove consumed AIs (in reverse order)
    [...aiIndicesToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.aiPlayers.splice(index, 1);
    });

    // Apply score gains to surviving player cells
    scoreGains.forEach((gain, cellIndex) => {
        if (!playerCellsToRemove.has(cellIndex)) {
            gameState.playerCells[cellIndex].score += gain;
        }
    });

    // Remove consumed player cells (in reverse order)
    [...playerCellsToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.playerCells.splice(index, 1);
    });

    // Respawn player if all cells are gone
    if (gameState.playerCells.length === 0) {
        const safePos = findSafeSpawnLocation(gameState);
        gameState.playerCells.push({
            x: safePos.x,
            y: safePos.y,
            score: STARTING_SCORE,
            velocityX: 0,
            velocityY: 0
        });
    }
}

/**
 * Handles collision detection and resolution between AI players.
 * When two AI players collide, the larger one (by COLLISION_THRESHOLD) consumes the smaller.
 * Uses a two-pass approach: first identifies collisions, then applies changes to avoid
 * concurrent modification issues.
 * @example
 * // Called every frame to check AI-AI collisions
 * handleAIAICollisions();
 * // Larger AI players consume smaller ones
 */
export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map();

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        if (aisToRemove.has(i)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            if (aisToRemove.has(j)) continue;

            const ai1 = gameState.aiPlayers[i];
            const ai2 = gameState.aiPlayers[j];
            
            const distance = getDistance(ai1, ai2);
            const ai1Size = getSize(ai1.score);
            const ai2Size = getSize(ai2.score);
            const minDistance = ai1Size + ai2Size;

            if (distance < minDistance) {
                if (ai1Size > ai2Size * COLLISION_THRESHOLD) {
                    const currentGain = scoreGains.get(i) || 0;
                    scoreGains.set(i, currentGain + ai2.score + 100);
                    aisToRemove.add(j);
                } else if (ai2Size > ai1Size * COLLISION_THRESHOLD) {
                    const currentGain = scoreGains.get(j) || 0;
                    scoreGains.set(j, currentGain + ai1.score + 100);
                    aisToRemove.add(i);
                    break;
                }
            }
        }
    }

    // Apply score gains to surviving AIs
    scoreGains.forEach((gain, aiIndex) => {
        if (!aisToRemove.has(aiIndex)) {
            gameState.aiPlayers[aiIndex].score += gain;
        }
    });

    // Remove consumed AIs (in reverse order)
    [...aisToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.aiPlayers.splice(index, 1);
    });
}

/**
 * Maintains the target population of food and AI players in the game world.
 * Respawns food particles up to FOOD_COUNT and AI players up to AI_COUNT.
 * Also ensures the player always has at least one cell by respawning if needed.
 * New entities are spawned at safe locations away from existing players.
 * @example
 * // Called every frame after collision handling
 * respawnEntities();
 * // Keeps food and AI counts at configured levels
 */
export function respawnEntities() {
    while (gameState.food.length < FOOD_COUNT) {
        const pos = getRandomPosition();
        gameState.food.push({
            x: pos.x,
            y: pos.y,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
    }

    // Respawn AI players if needed
    while (gameState.aiPlayers.length < AI_COUNT) {
        const safePos = findSafeSpawnLocation(gameState);
        const newAI = respawnAI();
        newAI.x = safePos.x;
        newAI.y = safePos.y;
        gameState.aiPlayers.push(newAI);
    }

    // Ensure player has at least one cell
    if (gameState.playerCells.length === 0) {
        const safePos = findSafeSpawnLocation(gameState);
        gameState.playerCells.push({
            x: safePos.x,
            y: safePos.y,
            score: STARTING_SCORE,
            velocityX: 0,
            velocityY: 0
        });
    }
}
