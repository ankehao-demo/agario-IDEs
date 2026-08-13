import { splitPlayerCell, handlePlayerSplit, updatePlayer } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS, MERGE_COOLDOWN } from '../config.js';

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

describe('cell merging via updatePlayer', () => {
  const makeCell = (x, y, score, splitTime = 0) => ({
    x,
    y,
    score,
    velocityX: 0,
    velocityY: 0,
    splitTime
  });

  beforeEach(() => {
    gameState.playerCells = [];
    // Point the mouse at the screen centre so cells are not moved by input
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
  });

  test('merges overlapping cells past the merge cooldown', () => {
    gameState.playerCells = [makeCell(100, 100, 100), makeCell(110, 100, 100)];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(200);
    expect(gameState.playerCells[0].x).toBeCloseTo(105);
    expect(gameState.playerCells[0].splitTime).toBe(0);
  });

  test('merges each group of adjacent cells separately', () => {
    gameState.playerCells = [
      makeCell(100, 100, 100),
      makeCell(105, 100, 100),
      makeCell(1500, 1500, 100),  // Far away from every other cell
      makeCell(500, 500, 100),
      makeCell(505, 500, 100)
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(3);
    expect(gameState.playerCells.map(cell => cell.score).sort()).toEqual([100, 200, 200]);
  });

  test('attracts distant cells towards each other', () => {
    gameState.playerCells = [makeCell(100, 100, 100), makeCell(300, 100, 100)];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);  // Pulled right
    expect(gameState.playerCells[1].velocityX).toBeLessThan(0);  // Pulled left
  });

  test('repels cells that overlap before the merge cooldown', () => {
    const splitTime = Date.now() - MERGE_COOLDOWN / 2;
    gameState.playerCells = [
      makeCell(100, 100, 100, splitTime),
      makeCell(140, 100, 100, splitTime)
    ];

    updatePlayer();

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].velocityX).toBeLessThan(0);  // Pushed left
    expect(gameState.playerCells[1].velocityX).toBeGreaterThan(0);  // Pushed right
  });

  test('ignores malformed cells while merging', () => {
    gameState.playerCells = [makeCell(100, 100, 100), null, { x: 100, y: 100 }];

    expect(() => updatePlayer()).not.toThrow();
    expect(gameState.playerCells.length).toBe(3);
  });
});