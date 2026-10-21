import { format, isValid, parse } from 'date-fns';
import { ValidationError } from '../exceptions/validation.exception.js';
import { DEFAULT_COUNTRY } from './country.model.js';
import { Telephone } from './telephone.model.js';
import { UserAddress } from './user-address.model.js';

/** Longitud máxima de nombre y apellidos (lo dice la tabla de campos del enunciado). */
const MAX_NAME_LENGTH = 100;

/** Nadie del formulario ha nacido antes de esta año: sirve para cazar erratas como 0190. */
const MIN_BIRTH_YEAR = 1900;

/**
 * USUARIO DEL FORMULARIO.
 *
 * La idea que hay detrás de todo el modelo: "el objeto se protege a sí mismo".
 *
 * No hay una propiedad pública `user.name` a la que se pueda escribir cualquier cosa: lo que
 * hay es un SETTER. Toda escritura pasa por él, y el setter comprueba antes de guardar. Si el
 * valor no sirve, lanza `ValidationError` y NO guarda nada. Consecuencia: nunca existe un
 * `User` a medio validar. Da igual de dónde venga el dato (el formulario, un test, una
 * llamada futura a una API): lo que esté dentro del objeto es válido, siempre.
 *
 * Ese es también el motivo de que el constructor acepte datos PARCIALES: el servicio necesita
 * validar campo a campo mientras el usuario escribe y todavía no tiene el formulario entero
 * (`new User({ name: 'Ada' })` tiene que funcionar y decir si el nombre vale).
 *
 * Qué tiene que hacer exactamente: `user.model.spec.js` (esos tests son la especificación del
 * enunciado, no se tocan).
 */
export class User {
  // Campos privados: con `#` son inalcanzables desde fuera de la clase. Solo se llega a ellos
  // a través de los getters y setters. Es lo que hace imposible "colar" un valor sin validar.
  #name;
  #surname;
  #birthDate;
  #telephone;
  #address;
  #country;

  /**
   * @param {{ name?, surname?, birthDate?, telephone?, address? }} data datos (pueden ser parciales)
   * @param {{ country?: object }} options el país decide las reglas; por defecto, España
   */
  constructor({ name, surname, birthDate, telephone, address } = {}, options = {}) {
    // `??` = si no viene el país, usa el de por defecto. Así `new User()` nunca se queda sin país.
    this.#country = options.country ?? DEFAULT_COUNTRY;

    // Solo se asigna lo que llega: lo que no viene queda sin poner (undefined) y se puede
    // completar más tarde. Es la traducción práctica de "acepto datos parciales".
    // Cada línea pasa por su setter y por tanto cada una puede lanzar ValidationError.
    if (name !== undefined) this.name = name;
    if (surname !== undefined) this.surname = surname;
    if (birthDate !== undefined) this.birthDate = birthDate;
    if (telephone !== undefined) this.telephone = telephone;
    if (address !== undefined) this.address = address;
  }

  get name() {
    return this.#name;
  }

  /** Al escribir `user.name = 'Ada'` se ejecuta esto, no una simple asignación. */
  set name(value) {
    this.#name = User.#validText(value, 'name');
  }

  get surname() {
    return this.#surname;
  }

  set surname(value) {
    this.#surname = User.#validText(value, 'surname');
  }

  /**
   * Regla común de nombre y apellidos: obligatorio, sin espacios de sobra y dentro del máximo.
   *
   * Está aquí, y no duplicada en los dos setters, porque es EXACTAMENTE la misma regla; lo único
   * que cambia es el `field` ('name' o 'surname') para que la vista sepa qué campo pintar de rojo.
   *
   * Es `static` (no depende de un usuario concreto: su trabajo no usa `this.#...`) y privada
   * (solo se usa por dentro de la clase).
   *
   * Devuelve el texto ya limpio: quien la llama se lo guarda. Así la limpieza y la validación
   * no se pueden separar por error.
   */
  static #validText(value, field) {
    // `String(value ?? '')` convierte cualquier cosa a texto y trata `undefined`/`null` como
    // texto vacío. `trim()` recorta los espacios de los extremos: '  Ada  ' → 'Ada'.
    const text = String(value ?? '').trim();

    if (text.length === 0) {
      // Se coloca el `field` en la excepción para que la vista no tenga que leer el mensaje
      // para saber de qué campo se trata.
      throw new ValidationError(field, 'Este campo es obligatorio');
    }
    if (text.length > MAX_NAME_LENGTH) {
      // Frontera exacta: 100 caracteres VALEN, 101 no. Con `>=` se colaría un off-by-one.
      throw new ValidationError(field, `Máximo ${MAX_NAME_LENGTH} caracteres`);
    }
    return text;
  }

  get birthDate() {
    // Se guarda como objeto `Date` (cómodo para comparar y ordenar) y se DEVUELVE como texto con
    // el formato del país, que es lo que se ve en pantalla: dd/MM/yyyy en España, MM/dd/yyyy en
    // EE. UU. Idem el teléfono: dentro un dato, fuera algo legible.
    if (this.#birthDate === undefined) {
      return undefined; // campo todavía sin rellenar
    }
    return format(this.#birthDate, this.dateFormat);
  }

  set birthDate(value) {
    const text = String(value ?? '').trim();

    // ¿Por qué `parse` de date-fns y no `new Date('10/12/1990')`?
    // Porque el constructor de Date adivina: con una barra interpreta el formato AMERICANO, así
    // que '10/12/1990' te daría el 10 de diciembre cuando en España se quiso decir el 10 de
    // diciembre… pero un español escribió 10 de diciembre y un americano 12 de octubre: el mismo
    // texto significa días distintos. `parse` no adivina: se le pasa el molde del país.
    const parsed = parse(text, this.dateFormat, new Date());

    // Truco de IDA Y VUELTA para cazar fechas imposibles:
    // se vuelve a escribir la fecha con el mismo molde y se compara con lo que se escribió.
    // '31/02/1990' no da error al interpretarlo: JavaScript lo "desborda" al 3 de marzo. Al
    // reescribirlo saldría '03/03/1990', que no es igual a '31/02/1990' → inválida.
    // `isValid` cubre además el caso de un texto que no es fecha en absoluto ('hola').
    if (!isValid(parsed) || format(parsed, this.dateFormat) !== text) {
      throw new ValidationError(
        'birthDate',
        `Fecha inválida: se espera el formato ${this.dateFormat}`,
      );
    }

    // Rango razonable: nada anterior a 1900 ni en el futuro. `> new Date()` compara fechas
    // (un objeto Date se compara mejor con `>` que con `===`, que compararía referencias).
    if (parsed.getFullYear() < MIN_BIRTH_YEAR || parsed > new Date()) {
      throw new ValidationError('birthDate', `La fecha debe estar entre ${MIN_BIRTH_YEAR} y hoy`);
    }

    this.#birthDate = parsed;
  }

  get telephone() {
    return this.#telephone;
  }

  set telephone(value) {
    // Se admiten las dos formas: la cadena que escribe el usuario ('612345678') o un `Telephone`
    // ya construido. Con `instanceof` se distingue; si ya es un modelo, no se rehace (evita
    // validar dos veces y perder el número ya convertido).
    this.#telephone = value instanceof Telephone ? value : new Telephone(value, this.#country);
  }

  get address() {
    return this.#address;
  }

  set address(value) {
    // Igual que el teléfono: cadena suelta o `UserAddress` ya montado.
    this.#address = value instanceof UserAddress ? value : new UserAddress(value, this.#country);
  }

  get country() {
    return this.#country;
  }

  /** El formato de fecha es del país, no del usuario: se delega para no duplicar la regla. */
  get dateFormat() {
    return this.#country.dateFormat;
  }

  /** true cuando están puestos TODOS los campos obligatorios. */
  get isComplete() {
    return [this.#name, this.#surname, this.#birthDate, this.#telephone, this.#address].every(
      // `every` devuelve true solo si la condición se cumple en TODOS: basta uno sin poner
      // (undefined) para que el formulario esté incompleto.
      (field) => field !== undefined,
    );
  }

  /** Cómo se imprime el usuario entero (es lo que se muestra en el mensaje de éxito). */
  toString() {
    return `${this.#name} ${this.#surname} · ${this.birthDate} · ${this.#telephone} · ${this.#address}`;
  }
}
