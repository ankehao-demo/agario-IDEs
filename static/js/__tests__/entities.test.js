import { splitPlayerCell, handlePlayerSplit, updatePlayer } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS } from '../config.js';

// Mock gameState and mouse
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: []
  },
  mouse: { x: 0, y: 0 }
}));

describe('splitPlayerCell', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('does not split cell below minimum score', () => {
    const cell = { x: 100, y: 100, score: MIN_SPLIT_SCORE - 1 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(MIN_SPLIT_SCORE - 1);
  });

  test('splits cell with sufficient score', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].score).toBe(50);
    expect(gameState.playerCells[1].score).toBe(50);
  });

  test('does not split when at max cells', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = Array(MAX_PLAYER_CELLS).fill({ ...cell });

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(MAX_PLAYER_CELLS);
  });

  // Security: Input validation and bounds checking
  test('handles null/undefined cell safely', () => {
    gameState.playerCells = [];

    expect(() => splitPlayerCell(null)).not.toThrow();
    expect(() => splitPlayerCell(undefined)).not.toThrow();
  });

  test('handles cell with missing properties safely', () => {
    const cell = { x: 100 };  // Missing y and score
    gameState.playerCells = [cell];

    expect(() => splitPlayerCell(cell)).not.toThrow();
  });

  test('handles negative score safely', () => {
    const cell = { x: 100, y: 100, score: -100 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    // Should not split with negative score
    expect(gameState.playerCells.length).toBe(1);
  });

  test('prevents score overflow during split', () => {
    const cell = { x: 100, y: 100, score: Number.MAX_SAFE_INTEGER };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    // Verify all cells have valid scores
    gameState.playerCells.forEach(c => {
      expect(c.score).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
      expect(isFinite(c.score)).toBe(true);
    });
  });
});

describe('handlePlayerSplit', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('splits all eligible cells', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100 },
      { x: 200, y: 200, score: MIN_SPLIT_SCORE - 1 },
      { x: 300, y: 300, score: 100 }
    ];

    handlePlayerSplit();

    expect(gameState.playerCells.length).toBe(5);  // 2 split + 1 unchanged
  });

  // Security: Input validation
  test('handles empty player cells array safely', () => {
    gameState.playerCells = [];

    expect(() => handlePlayerSplit()).not.toThrow();
    expect(gameState.playerCells.length).toBe(0);
  });

  test('handles malformed cells in array', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100 },
      null,
      { x: 200 },  // Missing properties
      undefined
    ];

    expect(() => handlePlayerSplit()).not.toThrow();
  });
});

describe('updatePlayer', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    mouse.x = 0;
    mouse.y = 0;
  });

  test('moves player cells towards mouse', () => {
    const cell = { 
      x: 0, 
      y: 0, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0 
    };
    gameState.playerCells = [cell];
    
    // Set mouse far to the right and run multiple updates to overcome inertia
    mouse.x = 1000;
    mouse.y = 0;
    
    // Run multiple updates to overcome initial inertia
    for (let i = 0; i < 5; i++) {
      updatePlayer();
    }

    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);  // Should move right
  });

  test('applies speed based on cell size', () => {
    const smallCell = { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 };
    const largeCell = { x: 100, y: 100, score: 400, velocityX: 0, velocityY: 0 };

    // Test small cell
    gameState.playerCells = [smallCell];
    mouse.x = 200;
    updatePlayer();
    const smallCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    // Test large cell
    gameState.playerCells = [largeCell];
    mouse.x = 200;
    updatePlayer();
    const largeCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    expect(smallCellSpeed).toBeGreaterThan(largeCellSpeed);  // Smaller cells move faster
  });

  // Security: Input validation and bounds checking
  test('handles empty player cells array safely', () => {
    gameState.playerCells = [];
    mouse.x = 100;
    mouse.y = 100;

    expect(() => updatePlayer()).not.toThrow();
  });

  test('handles cells with missing velocity properties', () => {
    const cell = { x: 100, y: 100, score: 100 };  // Missing velocityX, velocityY
    gameState.playerCells = [cell];
    mouse.x = 200;
    mouse.y = 200;

    expect(() => updatePlayer()).not.toThrow();
  });

  test('handles extreme mouse coordinates', () => {
    const cell = { x: 0, y: 0, score: 100, velocityX: 0, velocityY: 0 };
    gameState.playerCells = [cell];
    mouse.x = Number.MAX_SAFE_INTEGER;
    mouse.y = Number.MAX_SAFE_INTEGER;

    expect(() => updatePlayer()).not.toThrow();
    expect(isFinite(gameState.playerCells[0].velocityX)).toBe(true);
    expect(isFinite(gameState.playerCells[0].velocityY)).toBe(true);
  });

  test('handles negative mouse coordinates', () => {
    const cell = { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 };
    gameState.playerCells = [cell];
    mouse.x = -1000;
    mouse.y = -1000;

    expect(() => updatePlayer()).not.toThrow();
  });

  test('prevents position overflow with extreme velocities', () => {
    const cell = { 
      x: Number.MAX_SAFE_INTEGER - 1000, 
      y: Number.MAX_SAFE_INTEGER - 1000, 
      score: 100, 
      velocityX: 1000, 
      velocityY: 1000 
    };
    gameState.playerCells = [cell];
    mouse.x = Number.MAX_SAFE_INTEGER;
    mouse.y = Number.MAX_SAFE_INTEGER;

    updatePlayer();

    expect(isFinite(gameState.playerCells[0].x)).toBe(true);
    expect(isFinite(gameState.playerCells[0].y)).toBe(true);
  });
});

describe('cell merging (via updatePlayer)', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    // Centre the mouse so no movement force is applied and we isolate merging.
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
  });

  test('merges two overlapping cells into a single combined cell', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 }
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(200);
  });

  test('applies strong attraction to nearby mergeable cells', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 150, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 }
    ];

    updatePlayer();

    // Not yet close enough to merge, but pulled toward each other.
    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);
    expect(gameState.playerCells[1].velocityX).toBeLessThan(0);
  });

  test('repels overlapping cells that are still on split cooldown', () => {
    const now = Date.now();
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now },
      { x: 150, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now }
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].velocityX).toBeLessThan(0);
    expect(gameState.playerCells[1].velocityX).toBeGreaterThan(0);
  });

  test('merges multiple independent overlapping groups', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 1000, y: 1000, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 1500, y: 1500, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 },
      { x: 1500, y: 1500, score: 100, velocityX: 0, velocityY: 0, splitTime: 0 }
    ];

    updatePlayer();

    // Two overlapping pairs merge; the lone middle cell stays untouched.
    expect(gameState.playerCells.length).toBe(3);
    const scores = gameState.playerCells.map(c => c.score).sort((a, b) => a - b);
    expect(scores).toEqual([100, 200, 200]);
  });

  test('applies gentle attraction to spaced cells on split cooldown', () => {
    const now = Date.now();
    gameState.playerCells = [
      { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now },
      { x: 200, y: 100, score: 100, velocityX: 0, velocityY: 0, splitTime: now }
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);
    expect(gameState.playerCells[1].velocityX).toBeLessThan(0);
  });
});