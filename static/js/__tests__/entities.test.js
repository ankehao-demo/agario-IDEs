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

  test('applies repulsion force when cells are too close', () => {
    const now = Date.now();
    const cell1 = { 
      x: 100, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 1000
    };
    const cell2 = { 
      x: 105, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 1000
    };
    
    gameState.playerCells = [cell1, cell2];
    mouse.x = 500;
    mouse.y = 500;
    
    updatePlayer();
    
    expect(cell1.velocityX).toBeLessThan(0);
    expect(cell2.velocityX).toBeGreaterThan(0);
  });

  test('applies attraction force when cells can merge', () => {
    const now = Date.now();
    const cell1 = { 
      x: 100, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 20000
    };
    const cell2 = { 
      x: 200, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 20000
    };
    
    gameState.playerCells = [cell1, cell2];
    mouse.x = 500;
    mouse.y = 500;
    
    const initialDistance = Math.abs(cell2.x - cell1.x);
    updatePlayer();
    
    expect(cell1.velocityX).toBeGreaterThan(0);
    expect(cell2.velocityX).toBeLessThan(0);
  });

  test('merges cells when very close and cooldown expired', () => {
    const now = Date.now();
    const cell1 = { 
      x: 100, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 20000
    };
    const cell2 = { 
      x: 101, 
      y: 100, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0,
      splitTime: now - 20000
    };
    
    gameState.playerCells = [cell1, cell2];
    mouse.x = 500;
    mouse.y = 500;
    
    updatePlayer();
    
    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(200);
  });
});
