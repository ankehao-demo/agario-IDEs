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
  const mockRandomSequence = values => {
    let call = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => values[call++] ?? 0.1);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the first random position when nothing is nearby', () => {
    mockRandomSequence([0.5, 0.5]);

    const pos = findSafeSpawnLocation({ aiPlayers: [], playerCells: [] });

    expect(pos).toEqual({ x: 0.5 * WORLD_SIZE, y: 0.5 * WORLD_SIZE });
  });

  test('retries when a position is too close to an AI', () => {
    mockRandomSequence([0, 0, 0.5, 0.5]);
    const gameState = { aiPlayers: [{ x: 0, y: 0, score: 100 }], playerCells: [] };

    expect(findSafeSpawnLocation(gameState)).toEqual({ x: 0.5 * WORLD_SIZE, y: 0.5 * WORLD_SIZE });
  });

  test('retries when a position is too close to a player cell', () => {
    mockRandomSequence([0, 0, 0.5, 0.5]);
    const gameState = { aiPlayers: [], playerCells: [{ x: 0, y: 0, score: 100 }] };

    expect(findSafeSpawnLocation(gameState)).toEqual({ x: 0.5 * WORLD_SIZE, y: 0.5 * WORLD_SIZE });
  });

  test('treats entities with missing coordinates as non-blocking', () => {
    mockRandomSequence([0.05, 0.05]);
    const gameState = { aiPlayers: [{ score: 100 }], playerCells: [] };

    expect(findSafeSpawnLocation(gameState)).toEqual({ x: 0.05 * WORLD_SIZE, y: 0.05 * WORLD_SIZE });
  });

  test('falls back to the sampled position furthest from all entities', () => {
    // 50 attempts use 100 values, the initial fallback position uses 2, then 20 samples follow
    const values = new Array(142).fill(0.1);
    values[102] = 0.9;
    values[103] = 0.9;
    mockRandomSequence(values);
    const gameState = { aiPlayers: [{ x: 0, y: 0, score: 100 }], playerCells: [] };

    const pos = findSafeSpawnLocation(gameState, WORLD_SIZE * 10);

    expect(pos).toEqual({ x: 0.9 * WORLD_SIZE, y: 0.9 * WORLD_SIZE });
  });
});
