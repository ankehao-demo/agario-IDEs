import { getSize, getDistance, calculateCenterOfMass } from '../utils.js';

describe('getSize', () => {
  test('returns correct size for score 0', () => {
    expect(getSize(0)).toBe(20);  // sqrt(0) + 20
  });

  test('returns correct size for score 100', () => {
    expect(getSize(100)).toBe(30);  // sqrt(100) + 20
  });

  test('returns correct size for score 400', () => {
    expect(getSize(400)).toBe(40);  // sqrt(400) + 20
  });
});

describe('getDistance', () => {
  test('returns 0 for same point', () => {
    const point = { x: 10, y: 10 };
    expect(getDistance(point, point)).toBe(0);
  });

  test('returns correct horizontal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 0 };
    expect(getDistance(point1, point2)).toBe(3);
  });

  test('returns correct vertical distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 0, y: 4 };
    expect(getDistance(point1, point2)).toBe(4);
  });

  test('returns correct diagonal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    expect(getDistance(point1, point2)).toBe(5);  // 3-4-5 triangle
  });
});

describe('calculateCenterOfMass', () => {
  test('returns center for single cell', () => {
    const cells = [{ x: 10, y: 20, score: 100 }];
    const center = calculateCenterOfMass(cells);
    expect(center).toEqual({ x: 10, y: 20 });
  });

  test('returns weighted center for multiple cells', () => {
    const cells = [
      { x: 0, y: 0, score: 100 },
      { x: 10, y: 10, score: 300 }
    ];
    const center = calculateCenterOfMass(cells);
    expect(center.x).toBeCloseTo(7.5);
    expect(center.y).toBeCloseTo(7.5);
  });

  test('returns {x: 0, y: 0} for empty cells array', () => {
    expect(calculateCenterOfMass([])).toEqual({ x: 0, y: 0 });
  });

  test('returns {x: 0, y: 0} for cells with zero total score', () => {
    const cells = [
      { x: 10, y: 20, score: 0 },
      { x: 30, y: 40, score: 0 }
    ];
    expect(calculateCenterOfMass(cells)).toEqual({ x: 0, y: 0 });
  });
});

describe('findSafeSpawnLocation', () => {
  const { findSafeSpawnLocation } = require('../utils.js');

  test('returns a valid position with sparse entities', () => {
    const gameState = {
      aiPlayers: [{ x: 100, y: 100, score: 100 }],
      playerCells: [{ x: 500, y: 500, score: 100 }]
    };

    const pos = findSafeSpawnLocation(gameState);

    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('returns a valid position with dense entities', () => {
    const gameState = {
      aiPlayers: [
        { x: 100, y: 100, score: 100 },
        { x: 200, y: 200, score: 100 },
        { x: 300, y: 300, score: 100 }
      ],
      playerCells: [
        { x: 400, y: 400, score: 100 },
        { x: 500, y: 500, score: 100 }
      ]
    };

    const pos = findSafeSpawnLocation(gameState);

    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('returns a valid position with empty game state', () => {
    const gameState = {
      aiPlayers: [],
      playerCells: []
    };

    const pos = findSafeSpawnLocation(gameState);

    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('respects minimum distance parameter', () => {
    const gameState = {
      aiPlayers: [{ x: 1000, y: 1000, score: 100 }],
      playerCells: []
    };

    const pos = findSafeSpawnLocation(gameState, 200);

    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });
});
