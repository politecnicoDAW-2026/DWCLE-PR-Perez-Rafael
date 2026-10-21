import { ValidationError } from '../exceptions/validation.exception.js';
import { DEFAULT_COUNTRY, getCountry } from '../models/country.model.js';
import { User } from '../models/user.model.js';

/** Los campos del formulario que en realidad van DENTRO de la dirección. */
const ADDRESS_FIELDS = ['zip', 'address'];

/** Todos los campos obligatorios, en el mismo orden en que se pintan en la página. */
export const FORM_FIELDS = ['name', 'surname', 'birthDate', 'telephone', 'zip', 'address'];

/**
 * SERVICIO (lógica de negocio). ¿Qué es y qué no es?
 *
 * NO es interfaz: aquí no hay ni un `document.querySelector`. Se puede probar entero sin
 * navegador, y por eso tiene sus propios tests en `form.service.spec.js`.
 *
 * SÍ es el traductor y el portero:
 *   - Traductor: el modelo "habla" con excepciones (`throw new ValidationError`), pero la vista
 *     no quiere excepciones, quiere un sí/no para pintar el icono. `isValid()` hace esa traducción.
 *   - Portero: `sendForm()` solo deja salir un `User` completo y válido.
 *
 * Guarda lo que el usuario escribe SIN interpretarlo (`set`) y lo interpreta cuando se le pregunta
 * (`isValid`). Esa separación permite validar campo a campo sin tener el formulario entero.
 *
 * El IDIOMA no vive aquí: para el modelo, "Nombre" y "Name" son la misma cosa. Solo el PAÍS
 * importa, porque el país sí cambia las reglas (longitudes, formato de fecha, código postal).
 */
export class FormService {
  /** Lo que ha escrito el usuario, tal cual y sin validar. Es un simple almacén de texto. */
  #data = {};
  #country = DEFAULT_COUNTRY;

  get country() {
    return this.#country;
  }

  get dateFormat() {
    return this.#country.dateFormat;
  }

  /**
   * Cambia el país y, con él, las reglas de validación.
   * `getCountry` nunca falla: si el código es raro, cae en el país por defecto.
   */
  setCountry(code) {
    this.#country = getCountry(code);
  }

  /**
   * Guarda el valor crudo de un campo. Fíjate en que NO valida: guardar y juzgar son dos
   * momentos distintos. Si validara aquí, habría que decidir qué hacer con el error, y esa
   * decisión no es del servicio.
   *
   * Los datos van en un objeto (`#data.name = 'Ada'`) para no necesitar seis propiedades ni un
   * `switch` de seis ramas cada vez que se recorre un campo.
   */
  set(property, value) {
    this.#data[property] = value;
  }

  /**
   * ¿El campo `property` sería válido con lo que hay escrito ahora mismo? Devuelve true/false.
   *
   * Cómo lo averigua: intenta construir un `User` con SOLO ese campo y, si el modelo lanza la
   * excepción del dominio, el veredicto es `false`. No hay una segunda copia de las reglas:
   * las reglas están en el modelo y aquí solo se escucha la respuesta.
   */
  isValid(property) {
    try {
      new User(this.#partial(property), { country: this.#country });
      return true; // el modelo lo aceptó: el campo vale
    } catch (error) {
      if (error instanceof ValidationError) {
        return false; // error esperado: "esto que has escrito no vale" → es un false
      }
      // Cualquier OTRO error se relanza. Esto es importante y es una decisión de diseño:
      // si un `TypeError` (un bug nuestro) se convirtiera en `false`, se vería como "el usuario
      // escribió mal" y sería imposible de encontrar. Los bugs tienen que verse.
      throw error;
    }
  }

  /** true solo si TODOS los campos obligatorios son válidos (aquí se enciende el botón). */
  get isFormValid() {
    return FORM_FIELDS.every((field) => this.isValid(field));
  }

  /**
   * Construye el `User` definitivo cuando se pulsa Enviar.
   *
   * Devuelve el modelo ya montado. Si el formulario no está completo o no es válido, lanza
   * `ValidationError` con `field: 'form'`: así el controlador distingue "fallo de un campo
   * suelto" de "fallo del formulario entero" sin tener que leer el mensaje.
   *
   * (Desviación consciente del UML, que decía `boolean`: devolver el `User` evita que el
   * controlador tenga que volver a montarlo y encaja con el patrón de la clase `13-mvp-todo`.)
   */
  sendForm() {
    if (!this.isFormValid) {
      throw new ValidationError('form', 'Hay campos incompletos o incorrectos');
    }

    // Aquí SÍ se pasan todos los campos juntos: es el único momento en que el usuario tiene
    // sentido completo. `zip` y `address` se agrupan porque los dos son la misma dirección.
    return new User(
      {
        name: this.#data.name,
        surname: this.#data.surname,
        birthDate: this.#data.birthDate,
        telephone: this.#data.telephone,
        address: { zip: this.#data.zip, address: this.#data.address },
      },
      { country: this.#country },
    );
  }

  /**
   * Devuelve el trozo de modelo que valida UN SOLO campo.
   *
   * Se construye parcial a propósito: si para juzgar el nombre hubiera que pasar también el
   * código postal, un CP vacío tumbaría el veredicto del nombre y el icono nunca se pondría verde.
   *
   * Detalle clave: `[property]: value` es una CLAVE CALCULADA. Si `property` es 'name', el objeto
   * resultante es `{ name: 'Ada' }`. Un solo código sirve para los seis campos.
   *
   * El `?? ''` es igual de importante: un campo en el que nunca se ha escrito nada vale
   * `undefined`, y el setter espera un texto. Con `''` el propio modelo responde "esto es
   * obligatorio", que es justo lo que queremos.
   */
  #partial(property) {
    const value = this.#data[property] ?? '';

    // Los campos de la dirección van un nivel más adentro: `{ address: { zip: '29001' } }`.
    if (ADDRESS_FIELDS.includes(property)) {
      return { address: { [property]: value } };
    }
    return { [property]: value };
  }
}
