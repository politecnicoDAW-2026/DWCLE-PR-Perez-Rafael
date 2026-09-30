import { describe, expect, it } from 'vitest';
import * as core from './core.js';

describe('map', () => {
  it('multiplyBy10: multiplica por 10 cada elemento', () => {
    expect(core.multiplyBy10([45, 1, -10, 11, 250])).toEqual([450, 10, -100, 110, 2500]);
  });

  it('shiftRight: desplaza los elementos una posición a la derecha', () => {
    expect(core.shiftRight([{ name: '' }, 10, 'left-side'])).toEqual([
      'left-side',
      { name: '' },
      10,
    ]);
  });

  it('onlyVowels: deja solo las vocales de cada palabra', () => {
    expect(core.onlyVowels(['average', 'exceptional', 'amazing'])).toEqual([
      'aeae',
      'eeioa',
      'aai',
    ]);
  });

  it('doubleMatrix: duplica los números de la matriz manteniendo su estructura', () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const expected = [
      [2, 4, 6],
      [8, 10, 12],
      [14, 16, 18],
    ];
    expect(core.doubleMatrix(input)).toEqual(expected);
  });
});
