import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE, WORLD_SIZE } from './config.js';
import { respawnAI } from './entities.js';

export function handleFoodCollisions() {
    // Player cells eating food
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

    // AI eating food
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

export function handlePlayerAICollisions() {
    // Track changes to make after all collision checks
    const aiIndicesToRemove = new Set();
    const playerCellsToRemove = new Set();
    const scoreGains = new Map(); // Map of cell index to score gain

    // Check each player cell against each AI
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

function calculatePairMetrics(ai1, ai2) {
    const distance = getDistance(ai1, ai2);
    const ai1Size = getSize(ai1.score);
    const ai2Size = getSize(ai2.score);
    const minDistance = ai1Size + ai2Size;
    return { distance, ai1Size, ai2Size, minDistance };
}

function determineCollisionOutcome(metrics) {
    if (metrics.distance >= metrics.minDistance) {
        return 'none';
    }
    if (metrics.ai1Size > metrics.ai2Size * COLLISION_THRESHOLD) {
        return 'ai1Consumes';
    }
    if (metrics.ai2Size > metrics.ai1Size * COLLISION_THRESHOLD) {
        return 'ai2Consumes';
    }
    return 'none';
}

function recordConsumption(winnerIndex, loserIndex, scoreGains, aisToRemove, aiPlayers) {
    const currentGain = scoreGains.get(winnerIndex) || 0;
    scoreGains.set(winnerIndex, currentGain + aiPlayers[loserIndex].score + 100);
    aisToRemove.add(loserIndex);
}

export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map();

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        if (aisToRemove.has(i)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            if (aisToRemove.has(j)) continue;

            const ai1 = gameState.aiPlayers[i];
            const ai2 = gameState.aiPlayers[j];
            
            const metrics = calculatePairMetrics(ai1, ai2);
            const outcome = determineCollisionOutcome(metrics);

            if (outcome === 'ai1Consumes') {
                recordConsumption(i, j, scoreGains, aisToRemove, gameState.aiPlayers);
            } else if (outcome === 'ai2Consumes') {
                recordConsumption(j, i, scoreGains, aisToRemove, gameState.aiPlayers);
                break;
            }
        }
    }

    scoreGains.forEach((gain, aiIndex) => {
        if (!aisToRemove.has(aiIndex)) {
            gameState.aiPlayers[aiIndex].score += gain;
        }
    });

    [...aisToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.aiPlayers.splice(index, 1);
    });
}

export function respawnEntities() {
    // Respawn food if needed
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
