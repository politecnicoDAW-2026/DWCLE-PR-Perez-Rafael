import { describe, expect, it } from 'vitest';
import * as core from './core.js';

describe('every', () => {
  it('allEven', () => {
    expect(core.allEven([2, 4, 10])).toBe(true);
    expect(core.allEven([2, 4, 11])).toBe(false);
  });

  it('allSameType', () => {
    expect(core.allSameType([1, 2, 3])).toBe(true);
    expect(core.allSameType([1, 2, 3, '4'])).toBe(false);
  });

  it('positiveMatrix', () => {
    const good = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const bad = [
      [-1, 2, 3],
      [4, -5, 6],
      [7, 8, -9],
    ];
    expect(core.positiveMatrix(good)).toBe(true);
    expect(core.positiveMatrix(bad)).toBe(false);
  });

  it('allSameVowels', () => {
    expect(core.allSameVowels(['amalgam', 'zoom'])).toBe(true);
    expect(core.allSameVowels(['zoom', 'oligopoly'])).toBe(false);
  });
});
