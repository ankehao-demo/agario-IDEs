import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE, WORLD_SIZE } from './config.js';
import { respawnAI } from './entities.js';

function isValidEntity(entity) {
    return entity && typeof entity.score === 'number';
}

function tryEatFood(entity, food) {
    if (!food) return false;
    const distance = getDistance(entity, food);
    const entitySize = getSize(entity.score);
    if (distance < entitySize + FOOD_SIZE) {
        entity.score = Math.min(Number.MAX_SAFE_INTEGER, entity.score + FOOD_SCORE);
        return true;
    }
    return false;
}

export function handleFoodCollisions() {
    for (const playerCell of gameState.playerCells) {
        if (!isValidEntity(playerCell)) continue;
        gameState.food = gameState.food.filter(food => !tryEatFood(playerCell, food));
    }

    for (const ai of gameState.aiPlayers) {
        if (!isValidEntity(ai)) continue;
        gameState.food = gameState.food.filter(food => !tryEatFood(ai, food));
    }
}

function checkPlayerAICollision(playerCell, playerCellIndex, ai, aiIndex, context) {
    if (!isValidEntity(ai)) return;
    if (context.aiIndicesToRemove.has(aiIndex)) return;
    if (context.playerCellsToRemove.has(playerCellIndex)) return;

    const distance = getDistance(playerCell, ai);
    const playerSize = getSize(playerCell.score);
    const aiSize = getSize(ai.score);

    if (distance >= playerSize + aiSize) return;

    if (playerSize > aiSize * COLLISION_THRESHOLD) {
        const currentGain = context.scoreGains.get(playerCellIndex) || 0;
        context.scoreGains.set(playerCellIndex, currentGain + ai.score + 100);
        context.aiIndicesToRemove.add(aiIndex);
    } else if (aiSize > playerSize * COLLISION_THRESHOLD) {
        ai.score = Math.min(Number.MAX_SAFE_INTEGER, ai.score + playerCell.score + 100);
        context.playerCellsToRemove.add(playerCellIndex);
    }
}

function removeIndicesInReverse(array, indices) {
    [...indices].sort((a, b) => b - a).forEach(index => {
        array.splice(index, 1);
    });
}

export function handlePlayerAICollisions() {
    const context = {
        aiIndicesToRemove: new Set(),
        playerCellsToRemove: new Set(),
        scoreGains: new Map()
    };

    gameState.playerCells.forEach((playerCell, playerCellIndex) => {
        if (!isValidEntity(playerCell)) return;
        gameState.aiPlayers.forEach((ai, aiIndex) => {
            checkPlayerAICollision(playerCell, playerCellIndex, ai, aiIndex, context);
        });
    });

    removeIndicesInReverse(gameState.aiPlayers, context.aiIndicesToRemove);

    context.scoreGains.forEach((gain, cellIndex) => {
        if (!context.playerCellsToRemove.has(cellIndex) && gameState.playerCells[cellIndex]) {
            gameState.playerCells[cellIndex].score = Math.min(Number.MAX_SAFE_INTEGER, gameState.playerCells[cellIndex].score + gain);
        }
    });

    removeIndicesInReverse(gameState.playerCells, context.playerCellsToRemove);

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

function resolveAICollision(ai1, ai2, i, j, aisToRemove, scoreGains) {
    const ai1Size = getSize(ai1.score);
    const ai2Size = getSize(ai2.score);
    const distance = getDistance(ai1, ai2);

    if (distance >= ai1Size + ai2Size) return false;

    if (ai1Size > ai2Size * COLLISION_THRESHOLD) {
        const currentGain = scoreGains.get(i) || 0;
        scoreGains.set(i, currentGain + ai2.score + 100);
        aisToRemove.add(j);
    } else if (ai2Size > ai1Size * COLLISION_THRESHOLD) {
        const currentGain = scoreGains.get(j) || 0;
        scoreGains.set(j, currentGain + ai1.score + 100);
        aisToRemove.add(i);
        return true;
    }
    return false;
}

export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map();

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        if (aisToRemove.has(i)) continue;
        const ai1 = gameState.aiPlayers[i];
        if (!isValidEntity(ai1)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            if (aisToRemove.has(j)) continue;
            const ai2 = gameState.aiPlayers[j];
            if (!isValidEntity(ai2)) continue;

            const consumed = resolveAICollision(ai1, ai2, i, j, aisToRemove, scoreGains);
            if (consumed) break;
        }
    }

    scoreGains.forEach((gain, aiIndex) => {
        if (!aisToRemove.has(aiIndex) && gameState.aiPlayers[aiIndex]) {
            gameState.aiPlayers[aiIndex].score = Math.min(Number.MAX_SAFE_INTEGER, gameState.aiPlayers[aiIndex].score + gain);
        }
    });

    removeIndicesInReverse(gameState.aiPlayers, aisToRemove);
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