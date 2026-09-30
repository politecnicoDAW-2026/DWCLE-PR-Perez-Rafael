import { describe, expect, it } from 'vitest';
import * as core from './core.js';

describe('filter', () => {
  it('onlyEven: devuelve solo los números pares', () => {
    expect(core.onlyEven([10, 15, 20, 25, 30, 35])).toEqual([10, 20, 30]);
  });

  it('onlyOneWord: devuelve solo los textos de una palabra (sin espacios)', () => {
    expect(core.onlyOneWord(['return', 'phrases', 'with one word'])).toEqual(['return', 'phrases']);
  });

  it('positiveRowsOnly: devuelve solo las filas con todos los números positivos', () => {
    const input = [
      [1, 10, -100],
      [2, -20, 200],
      [3, 30, 300],
    ];
    expect(core.positiveRowsOnly(input)).toEqual([[3, 30, 300]]);
  });

  it('allSameVowels: devuelve solo las palabras cuyas vocales son todas la misma', () => {
    expect(core.allSameVowels(['racecar', 'amalgam', 'oligopoly', 'zoom'])).toEqual([
      'amalgam',
      'zoom',
    ]);
  });
});
