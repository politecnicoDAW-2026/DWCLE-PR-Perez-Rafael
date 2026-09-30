//Usa map en todas las funciones de este fichero.
//Map transforma cada elemento del array en otro valor.

export function multiplyBy10(array) {
  //map recorre cada elemento y devuelve otro array con cada valor multiplicado por 10.
  return array.map((number) => number * 10);
}

export function shiftRight(array) {
  //Cada posición toma el valor de la anterior; el último pasa a ser el primero.
  return array.map((_, index, items) => items[(index - 1 + items.length) % items.length]);
}

export function onlyVowels(array) {
  //Por cada palabra, cogemos sus letras, filtramos solo vocales y las juntamos en una cadena.
  return array.map((word) =>
    [...word].filter((letter) => /[aeiou]/i.test(letter)).join(''),
  );
}

export function doubleMatrix(array) {
  // Cada fila se transforma con un map interno para doblar cada número.
  return array.map((numbers) => numbers.map((number) => number * 2));
}
