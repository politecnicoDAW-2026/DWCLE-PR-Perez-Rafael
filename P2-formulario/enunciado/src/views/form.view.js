import { DEFAULT_LANGUAGE, languages } from '../assets/i18n/languages.js';

/**
 * Propiedad del modelo → id del input en el HTML.
 *
 * Es el ÚNICO sitio donde se relacionan los nombres del modelo (`name`, `zip`…) con los del
 * marcado (`#name`, `#zip`). Si el día de mañana el HTML usa otros ids, se cambia aquí y punto.
 *
 * Recorrer esto con un bucle evita escribir seis veces lo mismo (tres eventos por campo serían
 * dieciocho líneas casi idénticas, y ahí es donde se cuelan las erratas).
 */
const FIELD_IDS = {
  name: 'name',
  surname: 'surname',
  birthDate: 'birthDate',
  telephone: 'telephone',
  zip: 'zip',
  address: 'address',
};

/**
 * Clases que se le ponen al `<i>` que hay detrás de cada input.
 *
 * Son DOS cosas en una sola cadena:
 *   - `fa-solid fa-circle-check` / `fa-circle-xmark`: el dibujo, de Font Awesome.
 *   - `valid` / `invalid`: el color y el borde del campo, que los pone el CSS con `:has(.valid)`.
 *
 * Se asigna el `className` ENTERO (no `classList.add`) porque hay que quitar la clase contraria:
 * si se fuera acumulando, un campo tendría el check verde y la cruz roja a la vez.
 */
const ICON_VALID = 'fa-solid fa-circle-check valid';
const ICON_INVALID = 'fa-solid fa-circle-xmark invalid';

/**
 * VISTA. Es lo ÚNICO que toca el DOM.
 *
 * Reglas de esta capa:
 *   - NO valida nada y NO sabe por qué algo es válido: recibe `true`/`false` y elige un icono.
 *   - NO conoce al servicio ni al modelo (fíjate en los `import`: solo los diccionarios).
 *   - NO decide: avisa. Cuando pasa algo, llama a la función que le dio el controlador.
 *
 * Su contrato con el controlador tiene solo tres formas:
 *   `bindXxx(handler)` → "cuando pase esto, avisa por aquí"      (vista → controlador)
 *   `renderXxx(datos)` → "pinta esto, que ya lo he decidido yo"  (controlador → vista)
 *   `setLanguage` / `setCountry` → "cambia de aspecto"
 */
export class FormView {
  // Referencias a los elementos del HTML. Se buscan UNA vez, en el constructor: buscar dentro
  // del DOM en cada tecla sería hacer el mismo trabajo cientos de veces sin motivo.
  #form;
  #submit;
  #message;
  #prefix;
  #languageSelect;
  #countrySelect;
  /** Propiedad → { input, icon }: la pareja de cada campo, ya resuelta. */
  #fields = {};
  /** Campos que el usuario ya ha tocado (con `input` o `blur`). Ver `renderField`. */
  #touched = new Set();
  #language = DEFAULT_LANGUAGE;

  constructor() {
    this.#form = document.querySelector('#user-form');
    this.#submit = document.querySelector('#submit');
    this.#message = document.querySelector('#message');
    this.#prefix = document.querySelector('#prefix');
    this.#languageSelect = document.querySelector('#language');
    this.#countrySelect = document.querySelector('#country');

    for (const [property, id] of Object.entries(FIELD_IDS)) {
      const input = document.querySelector(`#${id}`);
      // El icono es el HERMANO SIGUIENTE del input, así que no hay que darle un id en el HTML:
      // `nextElementSibling` lo encuentra. Por eso el enunciado exige que el `<i>` vaya justo
      // detrás: es el enganche que evita tocar el marcado.
      this.#fields[property] = { input, icon: input.nextElementSibling };
    }

    // Se aplican los textos desde el primer momento (el HTML ya viene en español, así que en la
    // práctica deja todo igual, pero así la vista y el diccionario no se pueden desincronizar).
    this.#applyLanguage();
  }

  // ---------------------------------------------------------------------------
  // Enganches: la vista recibe funciones y las dispara cuando ocurre algo
  // ---------------------------------------------------------------------------

  /** Registra qué hacer en cada tecla y al salir de cada campo. */
  bindFieldInput(handler) {
    for (const [property, { input }] of Object.entries(this.#fields)) {
      // `input` se dispara en CADA tecla: sirve para que el icono reaccione mientras se escribe.
      input.addEventListener('input', () => {
        this.#touched.add(property); // a partir de aquí, este campo ya se puede pintar
        handler(property, input.value);
      });

      // `blur` se dispara al SALIR del campo (pulsar Tab, hacer clic fuera…). Hace falta porque
      // hay un caso que `input` no cubre: entrar en un campo y dejarlo vacío. Ahí no se ha
      // escrito nada nuevo y, sin embargo, toca pintar la cruz roja de "es obligatorio".
      input.addEventListener('blur', () => {
        this.#touched.add(property);
        handler(property, input.value);
      });
    }
  }

  /** Avisa de que ha cambiado el idioma elegido en el `<select>`. */
  bindLanguageChange(handler) {
    this.#languageSelect.addEventListener('change', () => handler(this.#languageSelect.value));
  }

  /** Avisa de que ha cambiado el país: eso cambia las reglas, no solo el dibujo. */
  bindCountryChange(handler) {
    this.#countrySelect.addEventListener('change', () => handler(this.#countrySelect.value));
  }

  /** Avisa de que se pulsa Enviar (o se aprieta Enter dentro de un campo). */
  bindSubmit(handler) {
    this.#form.addEventListener('submit', (event) => {
      // SIN esto el navegador hace lo que hace por defecto con un formulario: recargar la página
      // (o navegar) y perder todo lo escrito. Es el error número uno con los formularios.
      event.preventDefault();
      handler();
    });
  }

  // ---------------------------------------------------------------------------
  // Pintado: el controlador ya ha decidido; aquí solo se dibuja
  // ---------------------------------------------------------------------------

  /**
   * Pinta el icono de un campo: check verde si `isValid`, cruz roja si no.
   *
   * El detalle del `#touched`: si el campo no se ha tocado todavía, no se pinta NADA. Mostrar
   * seis cruces rojas nada más abrir la página es feo y además injusto (¿"inválido" antes de que
   * el usuario haga nada?). Cuando empieza a escribir o salta de un campo, ahí sí.
   */
  renderField(property, isValid) {
    if (!this.#touched.has(property)) return;

    this.#fields[property].icon.className = isValid ? ICON_VALID : ICON_INVALID;
  }

  /**
   * Enciende o apaga el botón Enviar.
   * `disabled` es una propiedad booleana del HTML: el botón no se puede pulsar ni con Enter.
   */
  enableSubmit(isEnabled) {
    this.#submit.disabled = !isEnabled;
  }

  /** Cambia el idioma de toda la interfaz. Si el código es desconocido, vuelve al de por defecto. */
  setLanguage(code) {
    this.#language = languages[code] ? code : DEFAULT_LANGUAGE;
    this.#applyLanguage();
  }

  /**
   * Ajusta lo que depende del PAÍS (no del idioma).
   *
   * Cambiar de país no es solo traducir: cambia el prefijo del teléfono, el ejemplo de fecha que
   * se muestra en el `placeholder` y cuántos caracteres caben en el teléfono (9 en España, 10 en
   * EE. UU.). Todo eso sale del propio país, así que no hay nada escrito a mano aquí.
   */
  setCountry(country) {
    this.#prefix.textContent = country.prefix;
    this.#fields.birthDate.input.placeholder = country.dateFormat;
    // `maxLength` limita lo que se puede teclear: en España el 10.º carácter ni entra.
    this.#fields.telephone.input.maxLength = country.phoneExample.length;
  }

  /** Mensaje verde con los datos enviados. Recibe TEXTO PLANO: la vista no conoce el modelo. */
  showSuccess(text) {
    this.#showMessage(`${languages[this.#language].sent}: ${text}`, 'success');
  }

  /** Mensaje rojo cuando el envío no ha podido hacerse. */
  showError() {
    this.#showMessage(languages[this.#language].error, 'error');
  }

  /**
   * Deja el hueco del mensaje vacío.
   * El CSS lo oculta mientras está vacío (`.message:not(:empty)`), así que limpiarlo lo esconde.
   */
  clearMessage() {
    this.#message.textContent = '';
    this.#message.className = 'message';
  }

  // ---------------------------------------------------------------------------
  // Interno
  // ---------------------------------------------------------------------------

  /**
   * Aplica el idioma actual a todas las etiquetas del HTML.
   *
   * El truco: cada etiqueta lleva `data-i18n="clave"`, así que no hay que ir una a una. Se buscan
   * todas de golpe y se les pone el texto que el diccionario tenga para esa clave.
   * `element.dataset.i18n` es la forma de leer un atributo `data-i18n` desde JavaScript.
   */
  #applyLanguage() {
    const texts = languages[this.#language];

    for (const element of document.querySelectorAll('[data-i18n]')) {
      const text = texts[element.dataset.i18n];
      // Si la clave no existe en el diccionario, se deja el texto que ya tenía: mejor un texto
      // en el otro idioma que un hueco vacío.
      if (text !== undefined) {
        element.textContent = text;
      }
    }

    // El botón Enviar es el único texto sin `data-i18n` (viene así en el HTML entregado),
    // así que se traduce a mano.
    this.#submit.textContent = texts.submit;
  }

  /** Único sitio que escribe en el mensaje: así el texto y el color nunca se separan. */
  #showMessage(text, type) {
    this.#message.textContent = text;
    this.#message.className = `message ${type}`; // 'message success' o 'message error'
  }
}
