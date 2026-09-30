//Usa every en todas las funciones de este fichero.
//Every comprueba que todos los elementos cumplen una condición.

//Comprueba si todos los elementos del array son números pares.
export function allEven(input) {
  return input.every((value) => value % 2 === 0);
}

//Comprueba si todos los elementos del array son del mismo tipo.
export function allSameType(input) {
  return input.every((value) => typeof value === typeof input[0]);
}

//Comprueba que cada elemento de la matriz es un array
//y que todos sus elementos son mayores que 0.
export function positiveMatrix(input) {
  return input.every((row) => Array.isArray(row) && row.every((value) => value > 0));
}

//Comprueba que todos los elementos son strings
//y que cada uno contiene una sola vocal (repetida o no).
export function allSameVowels(input) {
  return input.every((word) => {
    const vowels = [...word.toLowerCase()].filter((letter) => /[aeiou]/.test(letter));
    return vowels.length > 0 && vowels.every((vowel) => vowel === vowels[0]);
  });
}
