import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE } from './config.js';
import { respawnAI } from './entities.js';

function isValidEntity(entity) {
    return Boolean(entity) && typeof entity.score === 'number';
}

// Prevents score overflow
function addScore(entity, amount) {
    entity.score = Math.min(Number.MAX_SAFE_INTEGER, entity.score + amount);
}

// Removes entries by index without invalidating the remaining indices
function removeIndices(entities, indices) {
    [...indices].sort((a, b) => b - a).forEach(index => {
        entities.splice(index, 1);
    });
}

// Returns the entity that consumes the other one, or null when neither does.
function findConsumer(entityA, entityB) {
    const sizeA = getSize(entityA.score);
    const sizeB = getSize(entityB.score);

    if (getDistance(entityA, entityB) >= sizeA + sizeB) return null;
    if (sizeA > sizeB * COLLISION_THRESHOLD) return entityA;
    if (sizeB > sizeA * COLLISION_THRESHOLD) return entityB;
    return null;
}

function spawnPlayerCell() {
    const safePos = findSafeSpawnLocation(gameState);
    gameState.playerCells.push({
        x: safePos.x,
        y: safePos.y,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0
    });
}

// Removes the food eaten by the entity and grows it accordingly
function consumeReachableFood(entity) {
    gameState.food = gameState.food.filter(food => {
        if (!food) return true;

        if (getDistance(entity, food) < getSize(entity.score) + FOOD_SIZE) {
            addScore(entity, FOOD_SCORE);
            return false;
        }
        return true;
    });
}

export function handleFoodCollisions() {
    for (const entity of [...gameState.playerCells, ...gameState.aiPlayers]) {
        if (!isValidEntity(entity)) continue;

        consumeReachableFood(entity);
    }
}

export function handlePlayerAICollisions() {
    // Track changes to make after all collision checks
    const aiIndicesToRemove = new Set();
    const playerCellsToRemove = new Set();
    const scoreGains = new Map(); // Map of cell index to score gain

    // Check each player cell against each AI
    gameState.playerCells.forEach((playerCell, playerCellIndex) => {
        if (!isValidEntity(playerCell)) return;

        gameState.aiPlayers.forEach((ai, aiIndex) => {
            if (!isValidEntity(ai)) return;
            if (aiIndicesToRemove.has(aiIndex) || playerCellsToRemove.has(playerCellIndex)) return;

            const consumer = findConsumer(playerCell, ai);

            if (consumer === playerCell) {
                const currentGain = scoreGains.get(playerCellIndex) || 0;
                scoreGains.set(playerCellIndex, currentGain + ai.score + 100);
                aiIndicesToRemove.add(aiIndex);
            } else if (consumer === ai) {
                addScore(ai, playerCell.score + 100);
                playerCellsToRemove.add(playerCellIndex);
            }
        });
    });

    // Apply all changes after collision checks
    removeIndices(gameState.aiPlayers, aiIndicesToRemove);

    // Apply score gains to surviving player cells
    scoreGains.forEach((gain, cellIndex) => {
        if (!playerCellsToRemove.has(cellIndex) && gameState.playerCells[cellIndex]) {
            addScore(gameState.playerCells[cellIndex], gain);
        }
    });

    removeIndices(gameState.playerCells, playerCellsToRemove);

    // Respawn player if all cells are gone
    if (gameState.playerCells.length === 0) {
        spawnPlayerCell();
    }
}

export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map(); // Map of AI index to score gain

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        const ai1 = gameState.aiPlayers[i];
        if (aisToRemove.has(i) || !isValidEntity(ai1)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            const ai2 = gameState.aiPlayers[j];
            if (aisToRemove.has(j) || !isValidEntity(ai2)) continue;

            const consumer = findConsumer(ai1, ai2);

            if (consumer === ai1) {
                const currentGain = scoreGains.get(i) || 0;
                scoreGains.set(i, currentGain + ai2.score + 100);
                aisToRemove.add(j);
            } else if (consumer === ai2) {
                const currentGain = scoreGains.get(j) || 0;
                scoreGains.set(j, currentGain + ai1.score + 100);
                aisToRemove.add(i);
                break;
            }
        }
    }

    // Apply score gains to surviving AIs
    scoreGains.forEach((gain, aiIndex) => {
        if (!aisToRemove.has(aiIndex) && gameState.aiPlayers[aiIndex]) {
            addScore(gameState.aiPlayers[aiIndex], gain);
        }
    });

    removeIndices(gameState.aiPlayers, aisToRemove);
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
        spawnPlayerCell();
    }
}