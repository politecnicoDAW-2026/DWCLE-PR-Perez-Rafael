import { describe, expect, it } from 'vitest';
import * as core from './core.js';

describe('reduce', () => {
  it('sum: suma todos los números del array', () => {
    expect(core.sum([10, 15, 20, 25, 30, 35])).toBe(135);
  });

  it('productAll: multiplica todos los números de la matriz', () => {
    expect(core.productAll([[1, 2, 3], [4, 5], [6]])).toBe(720);
  });

  it('objectify: convierte un array de pares [clave, valor] en un objeto', () => {
    const input = [
      ['Thundercats', '80s'],
      ['The Powerpuff Girls', '90s'],
      ['Sealab 2021', '00s'],
    ];
    const expected = { Thundercats: '80s', 'The Powerpuff Girls': '90s', 'Sealab 2021': '00s' };
    expect(core.objectify(input)).toEqual(expected);
  });

  it('luckyNumbers: construye una frase de la fortuna con los números', () => {
    expect(core.luckyNumbers([30, 48, 11, 5, 32])).toBe(
      'Your lucky numbers are: 30, 48, 11, 5, and 32',
    );
  });
});
