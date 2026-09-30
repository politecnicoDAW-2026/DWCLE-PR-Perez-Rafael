//Usa filter en todas las funciones de este fichero.
// Filter selecciona los elementos que cumplen una condición.

export function onlyEven(array) {
  return array.filter((number) => number % 2 === 0);
}

export function onlyOneWord(array) {
  return array.filter((word) => word.trim().split(/\s+/).length === 1);
}

export function positiveRowsOnly(array) {
  return array.filter((row) => row.every((number) => number > 0));
}

export function allSameVowels(array) {
  return array.filter((word) => {
    const vowels = [...word.toLowerCase()].filter((letter) => /[aeiou]/.test(letter));
    return vowels.length > 0 && vowels.every((vowel) => vowel === vowels[0]);
  });
}
