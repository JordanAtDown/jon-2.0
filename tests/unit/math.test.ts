import { describe, test, expect } from 'vitest';
import { add, multiply } from '../../src/math';

describe('Math Functions Tests', () => {
  test('Addition de 2 + 3 = 5', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('Multiplication de 3 * 3 = 9', () => {
    expect(multiply(3, 3)).toBe(9);
  });

  test('Addition négative -1 + -1 = -2', () => {
    expect(add(-1, -1)).toBe(-2);
  });

  test('Multiplication avec zéro', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});
