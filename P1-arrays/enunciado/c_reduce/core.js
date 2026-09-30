//Usa reduce en todas las funciones de este fichero.
//Reduce sirve para acumular un resultado final a partir de todos los elementos.

export function sum(array) {
  //Acumula la suma total de todos los números del array.
  return array.reduce((total, value) => total + value, 0);
}

export function productAll(array) {
  //Multiplica todos los valores de la matriz, reduciendo cada fila y luego toda la matriz.
  return array.reduce(
    (total, row) => total * row.reduce((product, value) => product * value, 1),
    1,
  );
}

export function objectify(array) {
  // Convierte un array de pares [clave, valor] en un objeto acumulado.
  return array.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

export function luckyNumbers(array) {
  // Construye la frase final concatenando los números con coma y la última conjunción.
  return array.reduce((phrase, number, index) => {
    const value = String(number);
    if (index === 0) return `Your lucky numbers are: ${value}`;
    if (index === array.length - 1) return `${phrase}, and ${value}`;
    return `${phrase}, ${value}`;
  }, '');
}
