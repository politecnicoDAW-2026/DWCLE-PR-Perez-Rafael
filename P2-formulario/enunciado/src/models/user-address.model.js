import { ValidationError } from '../exceptions/validation.exception.js';
import { DEFAULT_COUNTRY } from './country.model.js';

/**
 * DIRECCIÓN = código postal + dirección en texto.
 *
 * El código postal se valida con el patrón DEL PAÍS (`country.zipPattern`), nunca con uno
 * escrito aquí. Motivo: el mismo texto puede ser válido en un país e inválido en otro.
 * '29001' vale en España (5 dígitos) y no vale en EE. UU. (donde hacen falta 6 caracteres).
 * Si el patrón estuviera escrito aquí, habría que duplicarlo en cada país nuevo.
 */
export class UserAddress {
  #zip;
  #address;
  #country;

  /**
   * @param {{ zip?: string, address?: string }} datos lo que se conoce de la dirección
   * @param {object} country país cuyas reglas se aplican (por defecto, España)
   */
  constructor({ zip, address } = {}, country = DEFAULT_COUNTRY) {
    this.#country = country;

    // Se asigna SOLO lo que llega. Los campos que no vienen se quedan sin poner a propósito:
    // el servicio necesita poder comprobar el código postal sin tener aún la calle escrita
    // (validación campo a campo), y si aquí se pusiera `undefined` en el setter, todo fallaría.
    if (zip !== undefined) this.zip = zip;
    if (address !== undefined) this.address = address;
  }

  get zip() {
    return this.#zip;
  }

  set zip(value) {
    // A texto y sin espacios de sobra: así ' 29001 ' es el mismo código postal que '29001'.
    const zip = String(value ?? '').trim();

    // El patrón lo dicta el país. `test()` devuelve true/false; nosotros lo damos la vuelta
    // para lanzar el error del dominio, que es lo que espera el resto del programa.
    if (!this.#country.zipPattern.test(zip)) {
      throw new ValidationError(
        'zip',
        `Código postal inválido: se espera ${this.#country.zipExample}`,
      );
    }
    this.#zip = zip;
  }

  get address() {
    return this.#address;
  }

  set address(value) {
    const address = String(value ?? '').trim();

    // La dirección es obligatoria, sin más reglas: no hay un patrón que valga para todas.
    // Un texto que son solo espacios se considera vacío, porque se recortó antes.
    if (address.length === 0) {
      throw new ValidationError('address', 'La dirección es obligatoria');
    }
    this.#address = address;
  }

  get country() {
    return this.#country;
  }

  /** true cuando están puestos los dos campos: código postal y dirección. */
  get isComplete() {
    return this.#zip !== undefined && this.#address !== undefined;
  }

  /** Cómo se ve una dirección al imprimirla: "Calle Larios 1 (29001)". */
  toString() {
    return `${this.#address} (${this.#zip})`;
  }
}
