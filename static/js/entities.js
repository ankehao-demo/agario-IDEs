import { gameState, mouse } from './gameState.js';
import { getSize, getRandomPosition, getDistance } from './utils.js';
import { 
    WORLD_SIZE, 
    FOOD_COUNT, 
    AI_COUNT, 
    MIN_SPLIT_SCORE, 
    SPLIT_VELOCITY, 
    MAX_PLAYER_CELLS,
    AI_STARTING_SCORE,
    MERGE_COOLDOWN,
    MERGE_DISTANCE,
    MERGE_FORCE,
    MERGE_START_FORCE
} from './config.js';

const AI_NAMES = [
    'Cursor',
    'Zed',
    'VSCode',
    'Visual Studio',
    'Eclipse',
    'JetBrains',
    'XCode',
    'Sublime',
    'Neovim',
    'Emacs'
];

// Function to get an unused AI name
function getUnusedAIName() {
    const usedNames = new Set(gameState.aiPlayers.map(ai => ai.name));
    return AI_NAMES.find(name => !usedNames.has(name)) || AI_NAMES[0];
}

function isValidCell(cell) {
    return Boolean(cell) && typeof cell.score === 'number';
}

// Applies opposite velocity changes along the axis between two cells.
// A positive factor attracts them, a negative factor repels them.
function applyMutualForce(cell1, cell2, factor) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;

    cell1.velocityX = (cell1.velocityX || 0) + dx * factor;
    cell1.velocityY = (cell1.velocityY || 0) + dy * factor;
    cell2.velocityX = (cell2.velocityX || 0) - dx * factor;
    cell2.velocityY = (cell2.velocityY || 0) - dy * factor;
}

// Applies merge/repulsion forces to a pair of cells and reports whether they
// are close enough to be merged.
function resolveCellPair(cell1, cell2, now) {
    const distance = getDistance(cell1, cell2);
    const minDistance = getSize(cell1.score) + getSize(cell2.score);  // Minimum distance before repulsion
    const minMergeDistance = minDistance * MERGE_DISTANCE;
    const canMerge = now - (cell1.splitTime || 0) > MERGE_COOLDOWN &&
        now - (cell2.splitTime || 0) > MERGE_COOLDOWN;

    if (distance < minMergeDistance && canMerge) {
        // Merge only if the cells are very close
        if (distance < minDistance * 0.5) {
            return true;
        }
        // Strong attraction force when close to merging
        applyMutualForce(cell1, cell2, MERGE_FORCE / Math.max(1, distance));
        return false;
    }

    if (distance < minDistance) {
        const repulsionStrength = 0.3;  // Adjust this to control repulsion strength
        const repulsionFactor = (minDistance - distance) / minDistance * repulsionStrength;
        applyMutualForce(cell1, cell2, -repulsionFactor);
    } else if (distance > minDistance) {
        const force = canMerge ? MERGE_FORCE : MERGE_START_FORCE;
        applyMutualForce(cell1, cell2, force / Math.max(1, distance));
    }

    return false;
}

function collectMergeableCells(now) {
    const cellsToMerge = [];

    for (let i = 0; i < gameState.playerCells.length; i++) {
        const cell1 = gameState.playerCells[i];
        if (!isValidCell(cell1) || cellsToMerge.includes(i)) continue;

        for (let j = i + 1; j < gameState.playerCells.length; j++) {
            const cell2 = gameState.playerCells[j];
            if (!isValidCell(cell2) || cellsToMerge.includes(j)) continue;

            if (resolveCellPair(cell1, cell2, now)) {
                cellsToMerge.push(i, j);
            }
        }
    }

    return cellsToMerge;
}

// Groups descending indices into runs of consecutive cells.
function groupConsecutiveIndices(indices) {
    const groups = [];
    let currentGroup = [indices[0]];

    for (let i = 1; i < indices.length; i++) {
        const current = indices[i];
        const prev = currentGroup.at(-1);

        if (prev - current === 1) {
            currentGroup.push(current);
        } else {
            groups.push(currentGroup);
            currentGroup = [current];
        }
    }
    groups.push(currentGroup);

    return groups;
}

function mergeCellGroup(group) {
    const cells = group.map(index => gameState.playerCells[index]);

    // Calculate total score and weighted position
    const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
    const weightedX = cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore;
    const weightedY = cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore;

    // Calculate average velocity weighted by mass
    const avgVelocityX = cells.reduce((sum, cell) => sum + cell.velocityX * cell.score, 0) / totalScore;
    const avgVelocityY = cells.reduce((sum, cell) => sum + cell.velocityY * cell.score, 0) / totalScore;

    // Remove old cells (in reverse order to maintain correct indices)
    [...group].sort((a, b) => b - a).forEach(index => {
        gameState.playerCells.splice(index, 1);
    });

    // Add merged cell with combined score
    gameState.playerCells.push({
        x: weightedX,
        y: weightedY,
        score: totalScore,  // This is the sum of all merged cell scores
        velocityX: avgVelocityX,
        velocityY: avgVelocityY,
        splitTime: 0  // Reset split time for merged cell
    });
}

function updateCellMerging() {
    const now = Date.now();
    const cellsToMerge = collectMergeableCells(now);

    if (cellsToMerge.length === 0) return;

    // Sort indices in descending order to remove from end first
    const uniqueIndices = [...new Set(cellsToMerge.sort((a, b) => b - a))];

    groupConsecutiveIndices(uniqueIndices).forEach(mergeCellGroup);
}

export function updatePlayer() {
    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        const direction = {
            x: dx / distance,
            y: dy / distance
        };

        // Update each cell
        gameState.playerCells.forEach(cell => {
            if (!isValidCell(cell)) return;
            
            // Base speed is inversely proportional to cell size
            const speed = 5 / (getSize(cell.score) / 20);

            // Update velocity (with inertia)
            cell.velocityX = (cell.velocityX || 0) * 0.9 + direction.x * speed * 0.1;
            cell.velocityY = (cell.velocityY || 0) * 0.9 + direction.y * speed * 0.1;

            // Update position
            cell.x = Math.max(0, Math.min(WORLD_SIZE, (cell.x || 0) + cell.velocityX));
            cell.y = Math.max(0, Math.min(WORLD_SIZE, (cell.y || 0) + cell.velocityY));
        });
    }

    // Handle cell merging
    updateCellMerging();
}

export function splitPlayerCell(cell) {
    if (!isValidCell(cell)) {
        return;
    }
    
    if (cell.score < MIN_SPLIT_SCORE || 
        gameState.playerCells.length >= MAX_PLAYER_CELLS) {
        return;
    }

    // Calculate split direction (towards mouse)
    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const direction = {
        x: dx / distance,
        y: dy / distance
    };

    const now = Date.now();

    // Create new cell
    const newCell = {
        x: cell.x,
        y: cell.y,
        score: cell.score / 2,
        velocityX: direction.x * SPLIT_VELOCITY,
        velocityY: direction.y * SPLIT_VELOCITY,
        splitTime: now
    };

    // Update original cell
    cell.score /= 2;
    cell.velocityX = -direction.x * SPLIT_VELOCITY * 0.5;
    cell.velocityY = -direction.y * SPLIT_VELOCITY * 0.5;
    cell.splitTime = now;

    // Add new cell
    gameState.playerCells.push(newCell);
}

export function handlePlayerSplit() {
    // Split each cell that's large enough
    const cellsToSplit = gameState.playerCells.filter(cell => 
        isValidCell(cell) &&
        cell.score >= MIN_SPLIT_SCORE && 
        gameState.playerCells.length < MAX_PLAYER_CELLS
    );

    cellsToSplit.forEach(cell => splitPlayerCell(cell));
}

export function updateAI() {
    gameState.aiPlayers.forEach(ai => {
        if (Math.random() < 0.02) {
            ai.direction = Math.random() * Math.PI * 2;
        }

        const speed = 5 / (getSize(ai.score) / 20);
        ai.x += Math.cos(ai.direction) * speed;
        ai.y += Math.sin(ai.direction) * speed;

        ai.x = Math.max(0, Math.min(WORLD_SIZE, ai.x));
        ai.y = Math.max(0, Math.min(WORLD_SIZE, ai.y));
    });
}

export function initEntities() {
    // Clear existing entities
    gameState.food = [];
    gameState.aiPlayers = [];
    
    console.log('Initializing entities...');

    // Initialize food
    for (let i = 0; i < FOOD_COUNT; i++) {
        const pos = getRandomPosition();
        gameState.food.push({
            x: pos.x,
            y: pos.y,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
    }

    // Initialize AI players
    for (let i = 0; i < AI_COUNT; i++) {
        const pos = getRandomPosition();
        const ai = {
            x: pos.x,
            y: pos.y,
            score: AI_STARTING_SCORE,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            direction: Math.random() * Math.PI * 2,
            name: getUnusedAIName()
        };
        gameState.aiPlayers.push(ai);
    }

    console.log('Entities initialized:', {
        foodCount: gameState.food.length,
        aiCount: gameState.aiPlayers.length,
        playerCells: gameState.playerCells.length
    });
}

// Export for use in other modules
export function respawnAI() {
    const pos = getRandomPosition();
    const name = getUnusedAIName();
    
    return {
        x: pos.x,
        y: pos.y,
        score: AI_STARTING_SCORE,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        direction: Math.random() * Math.PI * 2,
        name: name
    };
}