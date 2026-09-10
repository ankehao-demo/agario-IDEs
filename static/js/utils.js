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

function isClearOf(pos, entities, minDistance) {
    return entities.every(entity =>
        getDistance(pos, entity) >= getSize(entity.score) + minDistance
    );
}

function minDistanceTo(pos, entities) {
    return entities.reduce(
        (min, entity) => Math.min(min, getDistance(pos, entity)),
        Infinity
    );
}

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;
    const entities = [...gameState.aiPlayers, ...gameState.playerCells];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const pos = getRandomPosition();
        if (isClearOf(pos, entities, minDistance)) {
            return pos;
        }
    }

    // If no safe spot found after max attempts, find the spot furthest from all players
    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
        const pos = getRandomPosition();
        const distance = minDistanceTo(pos, entities);
        if (distance > maxMinDistance) {
            maxMinDistance = distance;
            bestPos = pos;
        }
    }

    return bestPos;
}