---
trigger: model_decision
description: Whenever documentation is being written
---

# Documentation Style Guide - Docstring Best Practices

## Overview
This guide outlines best practices for writing docstrings in our Agar.io clone project, covering both Python (Flask backend) and JavaScript (frontend) components.

## Python Docstrings (PEP 257 Style)

### Function/Method Docstrings
```python
def get_distance(obj1, obj2):
    """
    Calculate the Euclidean distance between two game objects.
    
    Args:
        obj1 (dict): First object with 'x' and 'y' coordinates
        obj2 (dict): Second object with 'x' and 'y' coordinates
        
    Returns:
        float: The distance between the two objects
        
    Example:
        >>> player = {'x': 100, 'y': 200}
        >>> food = {'x': 150, 'y': 250}
        >>> get_distance(player, food)
        70.71067811865476
    """
```

### Class Docstrings
```python
class GameState:
    """
    Manages the current state of the Agar.io game.
    
    This class handles player positions, AI movements, food generation,
    and collision detection for the game world.
    
    Attributes:
        players (list): List of active player objects
        ai_players (list): List of AI-controlled players
        food_items (list): List of food objects in the world
        world_size (int): Size of the game world boundaries
    """
```

### Flask Route Docstrings
```python
@app.route('/game_state')
def game_state():
    """
    API endpoint to retrieve current game state.
    
    Returns the current positions of all players, AI entities, and food items
    in JSON format for client-side rendering.
    
    Returns:
        Response: JSON object containing:
            - players: List of player objects with positions and scores
            - ai_players: List of AI player objects
            - food: List of food item positions
            - timestamp: Server timestamp of the state
            
    Raises:
        500: If game state cannot be retrieved
    """
```

## JavaScript Docstrings (JSDoc Style)

### Function Documentation
```javascript
/**
 * Calculate the size of a cell based on its score.
 * 
 * @param {number} score - The player's current score
 * @returns {number} The radius of the cell in pixels
 * 
 * @example
 * // Get size for a player with score 100
 * const cellSize = getSize(100);
 * console.log(cellSize); // 30
 */
export function getSize(score) {
    return Math.sqrt(score) + 20;
}
```

### Complex Function Documentation
```javascript
/**
 * Find a safe spawn location for a new player or AI.
 * 
 * Attempts to find a position that maintains minimum distance from existing
 * players and AI entities. Falls back to the safest available position if
 * no ideal spot is found after maximum attempts.
 * 
 * @param {Object} gameState - Current game state object
 * @param {Array} gameState.aiPlayers - Array of AI player objects
 * @param {Array} gameState.playerCells - Array of player cell objects
 * @param {number} [minDistance=100] - Minimum safe distance from other entities
 * @returns {Object} Position object with x and y coordinates
 * 
 * @example
 * const gameState = {
 *   aiPlayers: [{x: 100, y: 100, score: 50}],
 *   playerCells: [{x: 200, y: 200, score: 75}]
 * };
 * const safePos = findSafeSpawnLocation(gameState, 150);
 */
```

### Class Documentation
```javascript
/**
 * Represents a player in the Agar.io game.
 * 
 * @class Player
 * @param {string} id - Unique identifier for the player
 * @param {string} name - Display name for the player
 * @param {Object} position - Initial position {x, y}
 */
class Player {
    /**
     * Move the player towards target coordinates.
     * 
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {number} speed - Movement speed multiplier
     */
    moveTo(targetX, targetY, speed) {
        // Implementation
    }
}
```

## Test Function Documentation

### Jest Test Documentation
```javascript
/**
 * Test suite for utility functions.
 * 
 * @fileoverview Tests for game utility functions including distance calculations,
 * size computations, and spawn location algorithms.
 */

/**
 * Test distance calculation between two points.
 * 
 * Verifies that the getDistance function correctly calculates Euclidean
 * distance for various coordinate pairs.
 */
describe('getDistance', () => {
    /**
     * Should return correct distance for basic coordinates.
     */
    test('calculates distance correctly', () => {
        // Test implementation
    });
});
```

## General Guidelines

### Required Elements
- **Purpose**: Brief description of what the function/class does
- **Parameters**: Type, name, and description of each parameter
- **Returns**: Type and description of return value
- **Examples**: At least one usage example for complex functions
- **Exceptions**: Document any exceptions that may be thrown

### Style Rules
1. **First line**: Brief summary (one sentence, no period)
2. **Blank line**: After summary if additional description follows
3. **Parameter order**: Match the actual function signature
4. **Type annotations**: Use consistent type notation
5. **Examples**: Use realistic game-related data
6. **Line length**: Keep lines under 80 characters when possible

### When to Document
- **Always**: Public functions, classes, and API endpoints
- **Always**: Complex algorithms (like [findSafeSpawnLocation](cci:1://file:///Users/ankehao/Documents/GitHub/windsurf-demo/static/js/utils.js:29:0-85:1))
- **Consider**: Private functions with non-obvious behavior
- **Skip**: Simple getters/setters with obvious behavior

### Game-Specific Conventions
- Use game terminology consistently (cells, players, AI, food, score)
- Include coordinate system context (world boundaries, pixel units)
- Document performance considerations for real-time functions
- Specify units for measurements (pixels, milliseconds, etc.)

This style guide ensures consistent, helpful documentation across the entire Agar.io codebase, making it easier for developers to understand and maintain the game logic.