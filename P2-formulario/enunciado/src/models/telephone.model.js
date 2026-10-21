import { ValidationError } from '../exceptions/validation.exception.js';
import { DEFAULT_COUNTRY } from './country.model.js';

/**
 * TECLADO DEL TELÉFONO: 2 = ABC, 3 = DEF… 9 = WXYZ.
 *
 * Se escribe "al revés" de como se lee (dígito → letras) porque así se copia tal cual del
 * enunciado sin equivocarse; luego se le da la vuelta UNA sola vez, aquí abajo.
 */
const KEYPAD = {
  2: 'ABC',
  3: 'DEF',
  4: 'GHI',
  5: 'JKL',
  6: 'MNO',
  7: 'PQRS',
  8: 'TUV',
  9: 'WXYZ',
};

/**
 * La tabla al revés: de { 2: 'ABC', … } a { A: '2', B: '2', … }, una sola vez, al cargar el
 * módulo. Así, cuando el usuario teclee "FLOWERS", no hay que recorrer el teclado entero
 * buscando cada letra: se pregunta directamente `LETTER_TO_DIGIT['F']`.
 *
 * Paso a paso, porque encadena tres métodos:
 *   Object.entries(KEYPAD)   →  [['2', 'ABC'], ['3', 'DEF'], …]
 *   .flatMap(…)              →  [['A', '2'], ['B', '2'], ['C', '2'], …]   (una pareja por letra)
 *   Object.fromEntries(…)    →  { A: '2', B: '2', C: '2', … }
 *
 * `flatMap` = `map` (transformar cada elemento) + `flat` (aplanar un nivel), para que el
 * resultado sea UNA lista de parejas y no una lista de listas de parejas.
 */
const LETTER_TO_DIGIT = Object.fromEntries(
  Object.entries(KEYPAD).flatMap(([digit, letters]) =>
    [...letters].map((letter) => [letter, digit]),
  ),
);

/**
 * TELÉFONO = prefijo del país + número nacional.
 *
 * Este modelo no sabe qué es "un teléfono español": se lo pregunta al país que trae puesto
 * (`country.model.js`). Es la clave para que añadir un país nuevo no obligue a tocar esta clase.
 *
 * Qué tiene que hacer exactamente: los tests de `user.model.spec.js` (que son la especificación).
 * Mientras lo escribes, `npm run test:watch` deja los tests ejecutándose solos.
 */
export class Telephone {
  #number;
  #country;

  constructor(number, country = DEFAULT_COUNTRY) {
    this.#country = country;
    this.number = number; // OJO: pasa por el setter, que es quien valida (o lanza)
  }

  get number() {
    return this.#number;
  }

  set number(value) {
    // 1) Limpieza previa: a texto, sin espacios de sobra y en mayúsculas (para que "abc" y "ABC"
    //    signifiquen lo mismo al buscar en la tabla del teclado).
    //    `value ?? ''` protege del caso en que llegue `undefined` (campo sin rellenar).
    const raw = String(value ?? '')
      .trim()
      .toUpperCase();

    // 2) Conversión condicional. Aquí está la frontera más importante del modelo:
    //    las letras SOLO se traducen donde el país las admite (EE. UU.). Si en España se
    //    tradujeran siempre, '61234567A' acabaría siendo '612345672' y PASARÍA por válido
    //    sin serlo: un teléfono español no lleva letras.
    const number = this.#country.allowsLetters ? Telephone.#lettersToDigits(raw) : raw;

    // 3) Validación con el patrón del país (nunca con un patrón escrito aquí a mano).
    //    Fíjate en el orden: primero convertir, después validar. Si fuera al contrario,
    //    '800FLOWERS' tendría 10 caracteres pero no 10 dígitos y no valdría nunca.
    if (!this.#country.phonePattern.test(number)) {
      throw new ValidationError(
        'telephone',
        `Teléfono inválido: se espera ${this.#country.phoneExample}`,
      );
    }

    // 4) Solo se guarda si ha pasado el filtro: no existe un teléfono a medio validar.
    //    Se guarda el número YA convertido ('8003569377'), que es lo útil después.
    this.#number = number;
  }

  /**
   * 1-800-FLOWERS → 8003569377.
   *
   * Recorre el texto carácter a carácter: lo que esté en la tabla se cambia por su dígito y
   * lo que no (guiones, espacios, números) se deja igual gracias al `?? character`.
   *
   * Es `static` y privado: no depende de un teléfono concreto (no usa `this.#number`), es una
   * herramienta de la clase. Por eso se llama `Telephone.#lettersToDigits(...)`.
   */
  static #lettersToDigits(text) {
    return [...text].map((character) => LETTER_TO_DIGIT[character] ?? character).join('');
  }

  /** El prefijo no se guarda aparte: se le pregunta al país cada vez. Un dato, un sitio. */
  get prefix() {
    return this.#country.prefix;
  }

  get country() {
    return this.#country;
  }

  /** Cómo se ve un teléfono cuando se imprime: "+34 612345678". */
  toString() {
    return `${this.prefix} ${this.#number}`;
  }
}
