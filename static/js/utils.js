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

function findFurthestPosition(allEntities) {
    let bestPos = getRandomPosition();
    let maxMinDist = 0;

    for (let i = 0; i < 20; i++) {
        const pos = getRandomPosition();
        let minDist = Infinity;

        allEntities.forEach(entity => {
            const distance = getDistance(pos, entity);
            minDist = Math.min(minDist, distance);
        });

        if (minDist > maxMinDist) {
            maxMinDist = minDist;
            bestPos = pos;
        }
    }

    return bestPos;
}

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const pos = getRandomPosition();
        const safeFromAI = isSafeFromEntities(pos, gameState.aiPlayers, minDistance);
        const safeFromPlayers = safeFromAI && isSafeFromEntities(pos, gameState.playerCells, minDistance);

        if (safeFromPlayers) {
            return pos;
        }
    }

    return findFurthestPosition([...gameState.aiPlayers, ...gameState.playerCells]);
}
