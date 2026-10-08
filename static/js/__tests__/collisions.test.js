import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions } from '../collisions.js';
import { gameState } from '../gameState.js';
import { getSize } from '../utils.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: []
  }
}));

describe('handleFoodCollisions', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.playerCells = [];
    gameState.food = [];
  });

  test('player cell consumes food when overlapping', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 100, y: 100 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(0);
    expect(gameState.playerCells[0].score).toBe(110);  // Initial + FOOD_SCORE
  });

  test('food remains when not overlapping with player', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [{ x: 500, y: 500 }];

    handleFoodCollisions();

    expect(gameState.food.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(100);
  });

  // Security: Input validation and bounds checking
  test('handles empty player cells array safely', () => {
    gameState.playerCells = [];
    gameState.food = [{ x: 100, y: 100 }];

    expect(() => handleFoodCollisions()).not.toThrow();
    expect(gameState.food.length).toBe(1);
  });

  test('handles empty food array safely', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 100 }];
    gameState.food = [];

    expect(() => handleFoodCollisions()).not.toThrow();
    expect(gameState.playerCells[0].score).toBe(100);
  });

  test('prevents score overflow with extremely large values', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: Number.MAX_SAFE_INTEGER - 5 }];
    gameState.food = [{ x: 100, y: 100 }];

    handleFoodCollisions();

    expect(gameState.playerCells[0].score).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });
});

describe('handlePlayerAICollisions', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];
  });

  test('larger player cell consumes AI', () => {
    const playerCell = { x: 100, y: 100, score: 400 };  // Large player
    const ai = { x: 100, y: 100, score: 100 };  // Small AI

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    handlePlayerAICollisions();

    expect(gameState.aiPlayers.length).toBe(0);
    expect(gameState.playerCells[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });

  test('larger AI consumes player cell', () => {
    const playerCell = { x: 100, y: 100, score: 100 };  // Small player
    const ai = { x: 100, y: 100, score: 400 };  // Large AI

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    handlePlayerAICollisions();

    expect(gameState.playerCells.length).toBe(1);  // Player respawns
    expect(gameState.aiPlayers[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });

  // Security: Input validation and edge cases
  test('handles empty arrays safely', () => {
    gameState.playerCells = [];
    gameState.aiPlayers = [];

    expect(() => handlePlayerAICollisions()).not.toThrow();
  });

  test('handles negative scores safely', () => {
    const playerCell = { x: 100, y: 100, score: -100 };
    const ai = { x: 100, y: 100, score: 100 };

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    expect(() => handlePlayerAICollisions()).not.toThrow();
  });

  test('prevents score overflow in collisions', () => {
    const playerCell = { x: 100, y: 100, score: Number.MAX_SAFE_INTEGER - 100 };
    const ai = { x: 100, y: 100, score: 100 };

    gameState.playerCells = [playerCell];
    gameState.aiPlayers = [ai];

    handlePlayerAICollisions();

    // Ensure score doesn't overflow
    expect(gameState.playerCells[0].score).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  });
});

describe('handleAIAICollisions', () => {
  beforeEach(() => {
    gameState.aiPlayers = [];
  });

  test('larger AI consumes smaller AI', () => {
    const ai1 = { x: 100, y: 100, score: 400 };  // Large AI
    const ai2 = { x: 100, y: 100, score: 100 };  // Small AI

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(1);
    expect(gameState.aiPlayers[0].score).toBe(600);  // 400 + 100 + 100 bonus
  });

  test('equal sized AIs do not consume each other', () => {
    const ai1 = { x: 100, y: 100, score: 100 };
    const ai2 = { x: 100, y: 100, score: 100 };

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(2);
    expect(gameState.aiPlayers[0].score).toBe(100);
    expect(gameState.aiPlayers[1].score).toBe(100);
  });

  // Security: Input validation and edge cases
  test('handles empty AI array safely', () => {
    gameState.aiPlayers = [];

    expect(() => handleAIAICollisions()).not.toThrow();
  });

  test('handles single AI safely', () => {
    gameState.aiPlayers = [{ x: 100, y: 100, score: 100 }];

    expect(() => handleAIAICollisions()).not.toThrow();
    expect(gameState.aiPlayers.length).toBe(1);
  });

  test('handles malformed AI objects safely', () => {
    const ai1 = { x: 100, y: 100 };  // Missing score
    const ai2 = { score: 100 };  // Missing coordinates

    gameState.aiPlayers = [ai1, ai2];

    expect(() => handleAIAICollisions()).not.toThrow();
  });

  test('prevents score overflow in AI collisions', () => {
    const ai1 = { x: 100, y: 100, score: Number.MAX_SAFE_INTEGER - 100 };
    const ai2 = { x: 100, y: 100, score: 100 };

    gameState.aiPlayers = [ai1, ai2];

    handleAIAICollisions();

    // Ensure no overflow occurred
    gameState.aiPlayers.forEach(ai => {
      expect(ai.score).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });
  });

  test('smaller AI listed first is consumed and stops checking further AIs', () => {
    const small = { x: 100, y: 100, score: 100 };
    const big = { x: 100, y: 100, score: 400 };
    const farAway = { x: 1500, y: 1500, score: 50 };

    gameState.aiPlayers = [small, big, farAway];

    handleAIAICollisions();

    expect(gameState.aiPlayers).toEqual([
      { x: 100, y: 100, score: 600 },
      { x: 1500, y: 1500, score: 50 }
    ]);
  });

  test('AI accumulates gains from consuming multiple AIs', () => {
    const big = { x: 100, y: 100, score: 900 };
    const small1 = { x: 110, y: 100, score: 100 };
    const small2 = { x: 90, y: 100, score: 100 };

    gameState.aiPlayers = [big, small1, small2];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(1);
    expect(gameState.aiPlayers[0].score).toBe(900 + 200 + 200);
  });

  test('AIs that do not touch are unaffected', () => {
    gameState.aiPlayers = [
      { x: 100, y: 100, score: 400 },
      { x: 1000, y: 1000, score: 100 }
    ];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(2);
    expect(gameState.aiPlayers[0].score).toBe(400);
  });

  test('AI with missing coordinates does not consume other AIs', () => {
    gameState.aiPlayers = [
      { score: 400 },
      { x: 100, y: 100, score: 100 }
    ];

    handleAIAICollisions();

    expect(gameState.aiPlayers.length).toBe(2);
    expect(gameState.aiPlayers[0].score).toBe(400);
    expect(gameState.aiPlayers[1].score).toBe(100);
  });
});
