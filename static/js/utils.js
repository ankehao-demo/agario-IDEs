import { WORLD_SIZE } from './config.js';

export function getSize(score) {
    return Math.sqrt(score) + 20;
}

export function getRandomPosition() {
    return {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE
    };
}

export function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function calculateCenterOfMass(cells) {
    const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
    if (totalScore === 0) return { x: 0, y: 0 };
    
    return {
        x: cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore,
        y: cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore
    };
}

function isSafeFromEntities(pos, entities, minDistance) {
    for (const entity of entities) {
        const distance = getDistance(pos, entity);
        const safeDistance = getSize(entity.score) + minDistance;
        if (distance < safeDistance) {
            return false;
        }
    }
    return true;
}

function isPositionSafe(pos, gameState, minDistance) {
    return isSafeFromEntities(pos, gameState.aiPlayers, minDistance) &&
           isSafeFromEntities(pos, gameState.playerCells, minDistance);
}

function findMinDistanceToEntities(pos, entities) {
    let minDist = Infinity;
    for (const entity of entities) {
        const distance = getDistance(pos, entity);
        minDist = Math.min(minDist, distance);
    }
    return minDist;
}

function findFurthestPosition(gameState, attempts = 20) {
    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < attempts; i++) {
        const pos = getRandomPosition();
        const allEntities = [...gameState.aiPlayers, ...gameState.playerCells];
        const minDistanceToPlayer = findMinDistanceToEntities(pos, allEntities);

        if (minDistanceToPlayer > maxMinDistance) {
            maxMinDistance = minDistanceToPlayer;
            bestPos = pos;
        }
    }

    return bestPos;
}

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const pos = getRandomPosition();
        if (isPositionSafe(pos, gameState, minDistance)) {
            return pos;
        }
    }

    return findFurthestPosition(gameState);
}
