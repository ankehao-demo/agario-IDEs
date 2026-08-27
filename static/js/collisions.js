import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE, WORLD_SIZE } from './config.js';
import { respawnAI } from './entities.js';

function removeIndices(array, indices) {
    [...indices].sort((a, b) => b - a).forEach(index => array.splice(index, 1));
}

function applyScoreGains(entities, scoreGains, removedIndices) {
    scoreGains.forEach((gain, index) => {
        if (!removedIndices.has(index) && entities[index]) {
            entities[index].score = Math.min(Number.MAX_SAFE_INTEGER, entities[index].score + gain);
        }
    });
}

function addGain(scoreGains, index, amount) {
    scoreGains.set(index, (scoreGains.get(index) || 0) + amount);
}

function isValidEntity(entity) {
    return entity && typeof entity.score === 'number';
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

function resolvePlayerAIPair(playerCell, playerCellIndex, ai, aiIndex, tracked) {
    if (!isValidEntity(playerCell) || !isValidEntity(ai)) return;
    if (tracked.aiIndicesToRemove.has(aiIndex) || tracked.playerCellsToRemove.has(playerCellIndex)) return;

    const distance = getDistance(playerCell, ai);
    const playerSize = getSize(playerCell.score);
    const aiSize = getSize(ai.score);
    const minDistance = playerSize + aiSize;

    if (distance < minDistance) {
        if (playerSize > aiSize * COLLISION_THRESHOLD) {
            addGain(tracked.scoreGains, playerCellIndex, ai.score + 100);
            tracked.aiIndicesToRemove.add(aiIndex);
        } else if (aiSize > playerSize * COLLISION_THRESHOLD) {
            ai.score = Math.min(Number.MAX_SAFE_INTEGER, ai.score + playerCell.score + 100);
            tracked.playerCellsToRemove.add(playerCellIndex);
        }
    }
}

function resolveAIAIPair(ai1, ai1Index, ai2, ai2Index, tracked) {
    if (tracked.aisToRemove.has(ai2Index) || !isValidEntity(ai2)) return false;

    const distance = getDistance(ai1, ai2);
    const ai1Size = getSize(ai1.score);
    const ai2Size = getSize(ai2.score);
    const minDistance = ai1Size + ai2Size;

    if (distance < minDistance) {
        if (ai1Size > ai2Size * COLLISION_THRESHOLD) {
            addGain(tracked.scoreGains, ai1Index, ai2.score + 100);
            tracked.aisToRemove.add(ai2Index);
        } else if (ai2Size > ai1Size * COLLISION_THRESHOLD) {
            addGain(tracked.scoreGains, ai2Index, ai1.score + 100);
            tracked.aisToRemove.add(ai1Index);
            return true;
        }
    }
    return false;
}

export function handleFoodCollisions() {
    // Player cells eating food
    for (const playerCell of gameState.playerCells) {
        if (!playerCell || typeof playerCell.score !== 'number') continue;
        
        gameState.food = gameState.food.filter(food => {
            if (!food) return true;
            
            const distance = getDistance(playerCell, food);
            const playerSize = getSize(playerCell.score);

            if (distance < playerSize + FOOD_SIZE) {
                // Prevent score overflow
                playerCell.score = Math.min(Number.MAX_SAFE_INTEGER, playerCell.score + FOOD_SCORE);
                return false;
            }
            return true;
        });
    }

    // AI eating food
    for (const ai of gameState.aiPlayers) {
        if (!ai || typeof ai.score !== 'number') continue;
        
        gameState.food = gameState.food.filter(food => {
            if (!food) return true;
            
            const distance = getDistance(ai, food);
            const aiSize = getSize(ai.score);

            if (distance < aiSize + FOOD_SIZE) {
                // Prevent score overflow
                ai.score = Math.min(Number.MAX_SAFE_INTEGER, ai.score + FOOD_SCORE);
                return false;
            }
            return true;
        });
    }
}

export function handlePlayerAICollisions() {
    const aiIndicesToRemove = new Set();
    const playerCellsToRemove = new Set();
    const scoreGains = new Map();
    const tracked = { aiIndicesToRemove, playerCellsToRemove, scoreGains };

    gameState.playerCells.forEach((playerCell, playerCellIndex) => {
        gameState.aiPlayers.forEach((ai, aiIndex) => {
            resolvePlayerAIPair(playerCell, playerCellIndex, ai, aiIndex, tracked);
        });
    });

    removeIndices(gameState.aiPlayers, aiIndicesToRemove);
    applyScoreGains(gameState.playerCells, scoreGains, playerCellsToRemove);
    removeIndices(gameState.playerCells, playerCellsToRemove);

    if (gameState.playerCells.length === 0) {
        spawnPlayerCell();
    }
}

export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map();
    const tracked = { aisToRemove, scoreGains };

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        if (aisToRemove.has(i)) continue;
        
        const ai1 = gameState.aiPlayers[i];
        if (!isValidEntity(ai1)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            const ai2 = gameState.aiPlayers[j];
            if (resolveAIAIPair(ai1, i, ai2, j, tracked)) break;
        }
    }

    applyScoreGains(gameState.aiPlayers, scoreGains, aisToRemove);
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