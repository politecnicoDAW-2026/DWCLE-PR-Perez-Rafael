//Usa some en todas las funciones de este fichero.
//Some comprueba si al menos un elemento cumple una condición.

//Comprueba si algún elemento del array es un número mayor que 10.
export function anyGreaterThan10(input) {
  return input.some((value) => value > 10);
}

//Comprobamos si alguna palabra del array tiene más de 10 caracteres.
export function longWord(input) {
  return input.some((word) => word.length > 10);
}

//Comprobamos si algún elemento de la matriz es true.
export function truePossibilities(input) {
  return input.some((row) => row.some((value) => value === true));
}

//Comprobamos si 'Lost' aparece en alguno de los versos.
export function lostCarcosa(input) {
  return input.some((verse) => verse.includes('Lost'));
}
