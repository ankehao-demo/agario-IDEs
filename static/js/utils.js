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

// True when pos keeps a safe margin from every entity.
function isPositionSafe(pos, entities, minDistance) {
    return entities.every(entity => {
        const safeDistance = getSize(entity.score) + minDistance;
        return getDistance(pos, entity) >= safeDistance;
    });
}

// Smallest distance from pos to any entity.
function distanceToNearestEntity(pos, entities) {
    return entities.reduce(
        (nearest, entity) => Math.min(nearest, getDistance(pos, entity)),
        Infinity
    );
}

// Fallback when no fully safe spot is found: sample positions and pick the
// one furthest from all players.
function findFurthestPosition(entities, samples = 20) {
    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < samples; i++) {
        const pos = getRandomPosition();
        const minDistanceToPlayer = distanceToNearestEntity(pos, entities);

        if (minDistanceToPlayer > maxMinDistance) {
            maxMinDistance = minDistanceToPlayer;
            bestPos = pos;
        }
    }

    return bestPos;
}

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;
    const entities = [...gameState.aiPlayers, ...gameState.playerCells];

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const pos = getRandomPosition();
        if (isPositionSafe(pos, entities, minDistance)) {
            return pos;
        }
    }

    // If no safe spot found after max attempts, find the spot furthest from all players
    return findFurthestPosition(entities);
}