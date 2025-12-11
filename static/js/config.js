/**
 * @fileoverview Game configuration constants for the agar.io-style game.
 * Contains all tunable parameters for world size, scoring, collision mechanics,
 * split/merge behavior, and visual styling.
 * @module config
 */

/**
 * The size of the game world in pixels (width and height).
 * @constant {number}
 * @example
 * // Constrain entity position within world bounds
 * entity.x = Math.max(0, Math.min(WORLD_SIZE, entity.x));
 */
export const WORLD_SIZE = 2000;

/**
 * The radius of food particles in pixels.
 * @constant {number}
 */
export const FOOD_SIZE = 5;

/**
 * The initial score for new player cells.
 * @constant {number}
 */
export const STARTING_SCORE = 100;

/**
 * The initial score for AI-controlled players.
 * @constant {number}
 */
export const AI_STARTING_SCORE = 50;

/**
 * The score gained when consuming a food particle.
 * @constant {number}
 */
export const FOOD_SCORE = 10;

/**
 * The total number of food particles maintained in the game world.
 * @constant {number}
 */
export const FOOD_COUNT = 100;

/**
 * The number of AI players maintained in the game.
 * @constant {number}
 */
export const AI_COUNT = 10;

/**
 * The size ratio threshold required for one cell to consume another.
 * A value of 1.1 means the consuming cell must be at least 10% larger.
 * @constant {number}
 * @example
 * // Check if cell1 can consume cell2
 * if (cell1Size > cell2Size * COLLISION_THRESHOLD) {
 *   // cell1 consumes cell2
 * }
 */
export const COLLISION_THRESHOLD = 1.1;

/**
 * The minimum score required for a cell to perform a split action.
 * @constant {number}
 */
export const MIN_SPLIT_SCORE = 40;

/**
 * The initial velocity magnitude applied to cells after splitting.
 * @constant {number}
 */
export const SPLIT_VELOCITY = 12;

/**
 * The maximum number of cells a single player can control simultaneously.
 * @constant {number}
 */
export const MAX_PLAYER_CELLS = 16;

/**
 * The time in milliseconds before split cells can merge back together.
 * @constant {number}
 * @deprecated Use MERGE_COOLDOWN instead for merge timing.
 */
export const SPLIT_COOLDOWN = 5000;

/**
 * The distance multiplier threshold for determining when cells can merge.
 * @constant {number}
 */
export const MERGE_DISTANCE = 2;

/**
 * The time in milliseconds that must pass after splitting before cells can merge.
 * @constant {number}
 */
export const MERGE_COOLDOWN = 10000;

/**
 * The strength of the attractive force applied when cells are ready to merge.
 * Higher values cause faster merging.
 * @constant {number}
 */
export const MERGE_FORCE = 0.3;

/**
 * The initial attraction force between split cells before merge cooldown expires.
 * This creates a gentle pull between cells even when they can't merge yet.
 * @constant {number}
 */
export const MERGE_START_FORCE = 0.1;

/**
 * Color configuration object for game entities.
 * @constant {Object}
 * @property {string} PLAYER - The fill color for player cells (teal).
 * @property {Object} MINIMAP - Colors used in the minimap display.
 * @property {string} MINIMAP.PLAYER - Color for the current player on minimap.
 * @property {string} MINIMAP.TOP_PLAYER - Color for the top-ranked player on minimap.
 * @property {string} MINIMAP.OTHER - Color for other players on minimap.
 * @example
 * // Draw player cell with configured color
 * ctx.fillStyle = COLORS.PLAYER;
 * ctx.fill();
 */
export const COLORS = {
    PLAYER: '#008080',
    MINIMAP: {
        PLAYER: '#4CAF50',
        TOP_PLAYER: '#FFC107',
        OTHER: 'rgba(255, 255, 255, 0.3)'
    }
};
