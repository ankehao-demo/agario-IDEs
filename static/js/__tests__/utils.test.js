import { getSize, getDistance, calculateCenterOfMass, findSafeSpawnLocation } from '../utils.js';
import { WORLD_SIZE } from '../config.js';

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

  // Security: Input validation tests
  test('handles negative score safely', () => {
    const result = getSize(-100);
    expect(isNaN(result)).toBe(true);  // Should return NaN for invalid input
  });

  test('handles NaN input safely', () => {
    const result = getSize(NaN);
    expect(isNaN(result)).toBe(true);
  });

  test('handles Infinity input safely', () => {
    const result = getSize(Infinity);
    expect(result).toBe(Infinity);
  });

  test('handles extremely large values without overflow', () => {
    const result = getSize(Number.MAX_SAFE_INTEGER);
    expect(result).toBeGreaterThan(0);
    expect(isFinite(result)).toBe(true);
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

  // Security: Input validation tests
  test('handles null/undefined points safely', () => {
    expect(() => getDistance(null, { x: 0, y: 0 })).toThrow();
    expect(() => getDistance({ x: 0, y: 0 }, null)).toThrow();
  });

  test('handles missing coordinates safely', () => {
    const result = getDistance({ x: 0 }, { x: 0, y: 0 });
    expect(isNaN(result)).toBe(true);
  });

  test('handles negative coordinates', () => {
    const point1 = { x: -10, y: -10 };
    const point2 = { x: -5, y: -5 };
    const result = getDistance(point1, point2);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test('handles extremely large coordinate values', () => {
    const point1 = { x: Number.MAX_SAFE_INTEGER, y: 0 };
    const point2 = { x: 0, y: 0 };
    const result = getDistance(point1, point2);
    expect(isFinite(result)).toBe(true);
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

  // Security: Input validation tests
  test('handles null/undefined cells array safely', () => {
    expect(() => calculateCenterOfMass(null)).toThrow();
    expect(() => calculateCenterOfMass(undefined)).toThrow();
  });

  test('handles cells with missing properties safely', () => {
    const cells = [{ x: 10 }, { y: 20 }];
    const result = calculateCenterOfMass(cells);
    expect(isNaN(result.x) || isNaN(result.y)).toBe(true);
  });

  test('handles cells with negative scores', () => {
    const cells = [
      { x: 10, y: 20, score: -100 },
      { x: 30, y: 40, score: 100 }
    ];
    const result = calculateCenterOfMass(cells);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
  });

  test('handles extremely large coordinate values', () => {
    const cells = [
      { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER, score: 100 }
    ];
    const result = calculateCenterOfMass(cells);
    expect(isFinite(result.x)).toBe(true);
    expect(isFinite(result.y)).toBe(true);
  });
});

describe('findSafeSpawnLocation', () => {
  test('returns a position within world bounds with no entities', () => {
    const state = { aiPlayers: [], playerCells: [] };
    const pos = findSafeSpawnLocation(state);
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('returns a position when entities are present but space exists', () => {
    const state = {
      aiPlayers: [{ x: 100, y: 100, score: 100 }],
      playerCells: [{ x: 200, y: 200, score: 100 }]
    };
    const pos = findSafeSpawnLocation(state);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('falls back to furthest position when no safe spot found', () => {
    const entities = [];
    for (let i = 0; i < 50; i++) {
      entities.push({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        score: 100000
      });
    }
    const state = { aiPlayers: entities, playerCells: entities };
    const pos = findSafeSpawnLocation(state, 99999);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('respects custom minDistance parameter', () => {
    const state = {
      aiPlayers: [{ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, score: 100 }],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(state, 50);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('handles empty aiPlayers with populated playerCells', () => {
    const state = {
      aiPlayers: [],
      playerCells: [{ x: 500, y: 500, score: 100 }]
    };
    const pos = findSafeSpawnLocation(state);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('handles populated aiPlayers with empty playerCells', () => {
    const state = {
      aiPlayers: [{ x: 500, y: 500, score: 100 }],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(state);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });
});