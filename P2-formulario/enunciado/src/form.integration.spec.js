import { beforeEach, describe, expect, it } from 'vitest';
import { FormController } from './controllers/form.controller.js';
import html from './index.html?raw';
import { FormService } from './services/form.service.js';
import { FormView } from './views/form.view.js';

/**
 * PRUEBA DE INTEGRACIÓN: EL FORMULARIO DE UN EXTREMO AL OTRO
 * =========================================================
 *
 * Los otros tests prueban piezas por separado (el modelo, el servicio). Este prueba lo que
 * ninguno de ellos puede ver: que las piezas ENCAJEN. Simula a una persona de verdad delante de
 * la página: escribe, cambia de país, pulsa Enviar, cambia de idioma.
 *
 * Cómo se hace sin navegador: `index.html?raw` trae el HTML de verdad como texto (el `?raw` es de
 * Vite: "no me des el fichero procesado, dame su contenido"), se mete en el DOM simulado (jsdom,
 * que es el `environment: 'jsdom'` de `vite.config.js`) y se montan las tres capas encima.
 *
 * El enunciado dice que los tests de la vista son opcionales. Este es el motivo de escribirlos
 * igualmente: cuando algo se rompe, casi siempre se rompe en la costura entre capas.
 */

/** Devuelve el `<i>` que hay detrás de un input, que es donde se pinta el icono. */
const icon = (selector) => document.querySelector(`${selector} + i`);

/** Monta la aplicación completa sobre el HTML de verdad, como hace `app.js`. */
function mount() {
  document.body.innerHTML = html; // el DOM simulado empieza limpio en cada test
  new FormController(new FormService(), new FormView());
}

/** Escribe en un campo como lo haría el usuario: asigna el valor y dispara el evento `input`. */
function type(selector, value) {
  const input = document.querySelector(selector);
  input.value = value;
  input.dispatchEvent(new Event('input')); // sin esto, la vista no se enteraría de nada
}

/** Rellena los seis campos con datos válidos del país indicado. */
function fillValidForm(country = 'ES') {
  // Los mismos datos valen o no según el país: en EE. UU. el CP tiene 6 caracteres, la fecha va
  // MM/dd/yyyy y el teléfono tiene 10 cifras.
  const data =
    country === 'ES'
      ? ['Ada', 'Lovelace', '10/12/1990', '612345678', '29001', 'Calle Larios 1']
      : ['Ada', 'Lovelace', '12/10/1990', '8003569377', 'K1A0B1', '1 Infinite Loop'];

  ['#name', '#surname', '#birthDate', '#telephone', '#zip', '#address'].forEach((selector, i) => {
    type(selector, data[i]);
  });
}

describe('Formulario · de un extremo al otro', () => {
  beforeEach(mount); // cada test empieza con la página recién cargada

  it('al empezar el botón está apagado y no hay ningún icono', () => {
    expect(document.querySelector('#submit').disabled).toBe(true);
    // El estado "sin tocar": no se pintan cruces rojas nada más abrir la página.
    expect(document.querySelectorAll('.control i.valid, .control i.invalid')).toHaveLength(0);
  });

  it('mientras escribe, ese campo se pone verde y los demás siguen neutros', () => {
    type('#name', 'Ada');

    expect(icon('#name').classList.contains('valid')).toBe(true);
    // Los campos que el usuario no ha tocado no se pintan: por eso la clase sigue vacía.
    expect(icon('#zip').className).toBe('');
  });

  it('un campo que no vale se pone con la cruz roja', () => {
    type('#telephone', '123'); // tres cifras en un país que pide nueve

    expect(icon('#telephone').classList.contains('invalid')).toBe(true);
  });

  it('el botón se enciende solo cuando los seis campos valen', () => {
    fillValidForm();

    expect(document.querySelector('#submit').disabled).toBe(false);
  });

  it('cambiar de país revalida todo y apaga el botón', () => {
    fillValidForm(); // formulario español completo y válido
    const country = document.querySelector('#country');
    country.value = 'US';
    country.dispatchEvent(new Event('change'));

    // Los datos siguen escritos, pero ya no valen para las reglas de EE. UU.
    expect(document.querySelector('#submit').disabled).toBe(true);
    expect(icon('#zip').classList.contains('invalid')).toBe(true);
    // Y lo que solo se ve: el prefijo, el ejemplo de fecha y el límite del teléfono.
    expect(document.querySelector('#prefix').textContent).toBe('+1');
    expect(document.querySelector('#birthDate').placeholder).toBe('MM/dd/yyyy');
    expect(document.querySelector('#telephone').maxLength).toBe(10);
  });

  it('con un formulario de EE. UU. válido, el botón se enciende', () => {
    const country = document.querySelector('#country');
    country.value = 'US';
    country.dispatchEvent(new Event('change'));
    fillValidForm('US');

    expect(document.querySelector('#submit').disabled).toBe(false);
  });

  it('al enviar aparece el mensaje de éxito con los datos', () => {
    fillValidForm();
    // Se lanza el evento `submit` a mano (en un navegador lo haría el botón o la tecla Enter).
    document.querySelector('#user-form').dispatchEvent(new Event('submit', { cancelable: true }));

    const message = document.querySelector('#message');
    expect(message.classList.contains('success')).toBe(true);
    // En el mensaje se imprime el `User`, así que sale su `toString()`.
    expect(message.textContent).toContain('Ada Lovelace');
  });

  it('cambiar de idioma traduce las etiquetas y el botón', () => {
    const language = document.querySelector('#language');
    language.value = 'en';
    language.dispatchEvent(new Event('change'));

    // Una etiqueta que lleva `data-i18n`…
    expect(document.querySelector('label[for="name"]').textContent).toBe('Name');
    // …y el botón, que no lo lleva y se traduce en la vista a mano.
    expect(document.querySelector('#submit').textContent).toBe('Send');
  });
});
