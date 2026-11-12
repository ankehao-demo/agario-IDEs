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

function isSafeFrom(pos, entities, minDistance) {
    return !entities.some(entity => getDistance(pos, entity) < getSize(entity.score) + minDistance);
}

// Picks the sampled position whose nearest entity is furthest away
function findFurthestPosition(entities) {
    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
        const pos = getRandomPosition();
        let minDistanceToPlayer = Infinity;

        entities.forEach(entity => {
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

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const pos = getRandomPosition();
        if (isSafeFrom(pos, gameState.aiPlayers, minDistance) &&
            isSafeFrom(pos, gameState.playerCells, minDistance)) {
            return pos;
        }
    }

    // No safe spot found; fall back to the spot furthest from all players
    return findFurthestPosition([...gameState.aiPlayers, ...gameState.playerCells]);
}
