/**
 * @fileoverview Entity management module for player and AI entities.
 * Handles player movement, cell splitting/merging, AI behavior, and entity initialization.
 * @module entities
 */

import { gameState, mouse } from './gameState.js';
import { getSize, getRandomPosition, calculateCenterOfMass, getDistance } from './utils.js';
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

/**
 * Array of possible names for AI players, themed after popular code editors and IDEs.
 * @constant {string[]}
 */
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

/**
 * Retrieves an AI name that is not currently in use by any existing AI player.
 * Falls back to the first name if all names are taken.
 * @returns {string} An unused AI name from the AI_NAMES array.
 * @private
 */
function getUnusedAIName() {
    const usedNames = new Set(gameState.aiPlayers.map(ai => ai.name));
    return AI_NAMES.find(name => !usedNames.has(name)) || AI_NAMES[0];
}

/**
 * Handles the merging physics and logic for player cells.
 * Performs a two-pass algorithm: first calculates forces and identifies mergeable cells,
 * then executes the actual merging. Cells can only merge after MERGE_COOLDOWN has passed
 * since their last split. Also handles repulsion when cells are too close but can't merge.
 * @private
 * @example
 * // Called automatically in updatePlayer()
 * updateCellMerging();
 */
function updateCellMerging() {
    const now = Date.now();
    const cellsToMerge = [];

    for (let i = 0; i < gameState.playerCells.length; i++) {
        const cell1 = gameState.playerCells[i];
        
        // Skip if cell is already marked for merging
        if (cellsToMerge.includes(i)) continue;

        for (let j = i + 1; j < gameState.playerCells.length; j++) {
            const cell2 = gameState.playerCells[j];
            
            // Skip if cell is already marked for merging
            if (cellsToMerge.includes(j)) continue;

            const distance = getDistance(cell1, cell2);
            const cell1Size = getSize(cell1.score);
            const cell2Size = getSize(cell2.score);
            const minMergeDistance = (cell1Size + cell2Size) * MERGE_DISTANCE;
            const minDistance = cell1Size + cell2Size;  // Minimum distance before repulsion

            // Calculate time since split
            const timeSinceSplit1 = now - (cell1.splitTime || 0);
            const timeSinceSplit2 = now - (cell2.splitTime || 0);
            const canMerge = timeSinceSplit1 > MERGE_COOLDOWN && timeSinceSplit2 > MERGE_COOLDOWN;

            if (distance < minMergeDistance && canMerge) {
                // Mark cells for merging only if they're very close
                if (distance < minDistance * 0.5) {
                    cellsToMerge.push(i, j);
                } else {
                    // Strong attraction force when close to merging
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    const force = MERGE_FORCE;
                    const factor = force / Math.max(1, distance);

                    cell1.velocityX += dx * factor;
                    cell1.velocityY += dy * factor;
                    cell2.velocityX -= dx * factor;
                    cell2.velocityY -= dy * factor;
                }
            } else {
                // Calculate repulsion when too close
                if (distance < minDistance) {
                    const repulsionStrength = 0.3;  // Adjust this to control repulsion strength
                    const repulsionFactor = (minDistance - distance) / minDistance * repulsionStrength;
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    
                    // Apply repulsion
                    cell1.velocityX -= dx * repulsionFactor;
                    cell1.velocityY -= dy * repulsionFactor;
                    cell2.velocityX += dx * repulsionFactor;
                    cell2.velocityY += dy * repulsionFactor;
                }
                
                // Apply attraction force if not too close
                if (distance > minDistance) {
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    const force = canMerge ? MERGE_FORCE : MERGE_START_FORCE;
                    const factor = force / Math.max(1, distance);

                    cell1.velocityX += dx * factor;
                    cell1.velocityY += dy * factor;
                    cell2.velocityX -= dx * factor;
                    cell2.velocityY -= dy * factor;
                }
            }
        }
    }

    // Second pass: merge cells
    if (cellsToMerge.length > 0) {
        // Sort indices in descending order to remove from end first
        cellsToMerge.sort((a, b) => b - a);
        
        // Get unique indices
        const uniqueIndices = [...new Set(cellsToMerge)];
        
        // Group cells to merge
        const groups = [];
        let currentGroup = [uniqueIndices[0]];
        
        for (let i = 1; i < uniqueIndices.length; i++) {
            const current = uniqueIndices[i];
            const prev = currentGroup[currentGroup.length - 1];
            
            if (prev - current === 1) {
                currentGroup.push(current);
            } else {
                groups.push(currentGroup);
                currentGroup = [current];
            }
        }
        groups.push(currentGroup);

        // Merge each group
        groups.forEach(group => {
            const cells = group.map(index => gameState.playerCells[index]);
            
            // Calculate total score and weighted position
            const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
            const weightedX = cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore;
            const weightedY = cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore;
            
            // Calculate average velocity weighted by mass
            const avgVelocityX = cells.reduce((sum, cell) => sum + cell.velocityX * cell.score, 0) / totalScore;
            const avgVelocityY = cells.reduce((sum, cell) => sum + cell.velocityY * cell.score, 0) / totalScore;

            // Remove old cells (in reverse order to maintain correct indices)
            group.sort((a, b) => b - a).forEach(index => {
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
        });
    }
}

/**
 * Updates all player cells based on mouse position input.
 * Calculates movement direction from screen center to mouse position,
 * applies velocity with inertia for smooth movement, and constrains
 * cells within world boundaries. Also triggers cell merging logic.
 * @example
 * // Called every frame in the game loop
 * updatePlayer();
 */
export function updatePlayer() {
    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        const direction = {
            x: dx / distance,
            y: dy / distance
        };

        gameState.playerCells.forEach(cell => {
            const speed = 5 / (getSize(cell.score) / 20);

            cell.velocityX = cell.velocityX * 0.9 + direction.x * speed * 0.1;
            cell.velocityY = cell.velocityY * 0.9 + direction.y * speed * 0.1;

            cell.x = Math.max(0, Math.min(WORLD_SIZE, cell.x + cell.velocityX));
            cell.y = Math.max(0, Math.min(WORLD_SIZE, cell.y + cell.velocityY));
        });
    }

    updateCellMerging();
}

/**
 * Splits a single player cell into two cells of equal mass.
 * The new cell is ejected in the direction of the mouse cursor with SPLIT_VELOCITY,
 * while the original cell receives a smaller recoil in the opposite direction.
 * Both cells are marked with a splitTime to prevent immediate re-merging.
 * @param {Object} cell - The player cell to split.
 * @param {number} cell.x - The x-coordinate of the cell.
 * @param {number} cell.y - The y-coordinate of the cell.
 * @param {number} cell.score - The current score of the cell.
 * @param {number} cell.velocityX - The horizontal velocity of the cell.
 * @param {number} cell.velocityY - The vertical velocity of the cell.
 * @returns {void} Returns early if cell score is below MIN_SPLIT_SCORE or max cells reached.
 * @example
 * // Split a specific cell
 * const cell = gameState.playerCells[0];
 * if (cell.score >= MIN_SPLIT_SCORE) {
 *   splitPlayerCell(cell);
 * }
 */
export function splitPlayerCell(cell) {
    if (cell.score < MIN_SPLIT_SCORE || 
        gameState.playerCells.length >= MAX_PLAYER_CELLS) {
        return;
    }

    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const direction = {
        x: dx / distance,
        y: dy / distance
    };

    const now = Date.now();

    const newCell = {
        x: cell.x,
        y: cell.y,
        score: cell.score / 2,
        velocityX: direction.x * SPLIT_VELOCITY,
        velocityY: direction.y * SPLIT_VELOCITY,
        splitTime: now
    };

    cell.score /= 2;
    cell.velocityX = -direction.x * SPLIT_VELOCITY * 0.5;
    cell.velocityY = -direction.y * SPLIT_VELOCITY * 0.5;
    cell.splitTime = now;

    gameState.playerCells.push(newCell);
}

/**
 * Handles the player split action triggered by user input (click).
 * Filters all player cells that meet the minimum score requirement and
 * splits each one, up to the maximum cell limit.
 * @example
 * // Bind to click event for split action
 * canvas.addEventListener('click', () => {
 *   handlePlayerSplit();
 * });
 */
export function handlePlayerSplit() {
    const cellsToSplit = gameState.playerCells.filter(cell => 
        cell.score >= MIN_SPLIT_SCORE && 
        gameState.playerCells.length < MAX_PLAYER_CELLS
    );

    cellsToSplit.forEach(cell => splitPlayerCell(cell));
}

/**
 * Updates all AI player positions using simple random wandering behavior.
 * Each AI has a 2% chance per frame to change direction randomly.
 * Movement speed is inversely proportional to size, matching player physics.
 * AI positions are constrained within world boundaries.
 * @example
 * // Called every frame in the game loop
 * updateAI();
 */
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

/**
 * Initializes all game entities at the start of the game.
 * Clears existing food and AI players, then populates the world with
 * FOOD_COUNT food particles and AI_COUNT AI players at random positions.
 * Each entity is assigned a random HSL color for visual variety.
 * @example
 * // Initialize entities when starting a new game
 * initEntities();
 * console.log(`Spawned ${gameState.food.length} food items`);
 */
export function initEntities() {
    gameState.food = [];
    gameState.aiPlayers = [];
    
    console.log('Initializing entities...');

    for (let i = 0; i < FOOD_COUNT; i++) {
        const pos = getRandomPosition();
        gameState.food.push({
            x: pos.x,
            y: pos.y,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
    }

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

/**
 * Creates and returns a new AI player object with random attributes.
 * Used to respawn AI players after they are consumed.
 * The new AI gets a random position, color, direction, and an unused name.
 * @returns {Object} A new AI player object ready to be added to gameState.aiPlayers.
 * @returns {number} returns.x - Random x-coordinate in world space.
 * @returns {number} returns.y - Random y-coordinate in world space.
 * @returns {number} returns.score - Starting score (AI_STARTING_SCORE).
 * @returns {string} returns.color - Random HSL color string.
 * @returns {number} returns.direction - Random direction in radians.
 * @returns {string} returns.name - An unused AI name.
 * @example
 * // Respawn an AI at a safe location
 * const newAI = respawnAI();
 * newAI.x = safePosition.x;
 * newAI.y = safePosition.y;
 * gameState.aiPlayers.push(newAI);
 */
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
