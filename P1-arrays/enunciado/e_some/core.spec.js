import { describe, expect, it } from 'vitest';
import * as core from './core.js';

describe('some', () => {
  it('anyGreaterThan10', () => {
    expect(core.anyGreaterThan10([8, 9, 10, 11])).toBe(true);
    expect(core.anyGreaterThan10([1, 2, 3, 4])).toBe(false);
  });

  it('longWord', () => {
    expect(core.longWord(['democracy', 'aristocracy'])).toBe(true);
    expect(core.longWord(['democracy', 'republic'])).toBe(false);
  });

  it('truePossibilities', () => {
    const good = [
      [false, false, false],
      [false, false, false],
      [false, false, true],
    ];
    const bad = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];
    expect(core.truePossibilities(good)).toBe(true);
    expect(core.truePossibilities(bad)).toBe(false);
  });

  it('lostCarcosa', () => {
    const good = [
      'Strange is the night where black stars rise,',
      'And strange moons circle through the skies,',
      'But stranger still is',
      'Lost Carcosa.',
    ];
    const bad = [
      'Along the shore the cloud waves break,',
      'The twin suns sink behind the lake,',
      'The shadows lengthen',
      'In Carcosa.',
    ];
    expect(core.lostCarcosa(good)).toBe(true);
    expect(core.lostCarcosa(bad)).toBe(false);
  });
});
