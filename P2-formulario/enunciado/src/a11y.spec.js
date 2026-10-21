import axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';
import html from './index.html?raw';

/**
 * Accesibilidad del formulario que se entrega. Comprueba lo que axe puede decidir
 * sobre el marcado: etiquetas asociadas a su campo, roles, nombres accesibles,
 * idioma del documento, orden de los encabezados…
 *
 * El contraste de color NO se comprueba aquí: axe necesita un navegador de verdad
 * para calcularlo y jsdom no pinta. De eso se encarga `style.contrast.spec.js`,
 * que lo calcula a partir de las variables del CSS.
 */
const runAxe = () =>
  axe.run(document, {
    resultTypes: ['violations'],
    rules: { 'color-contrast': { enabled: false } },
  });

describe('Accesibilidad del formulario', () => {
  beforeEach(() => {
    document.documentElement.lang = 'es';
    document.body.innerHTML = html;
  });

  it('no tiene ninguna violación detectable en el marcado', async () => {
    const { violations } = await runAxe();

    // Si falla, el mensaje dice qué regla y en qué elemento
    expect(violations.map((violation) => `${violation.id}: ${violation.nodes[0]?.html}`)).toEqual(
      [],
    );
  });

  it('cada campo tiene su etiqueta asociada por el atributo for', () => {
    const inputs = [...document.querySelectorAll('input, select')];

    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      expect(
        document.querySelector(`label[for="${input.id}"]`),
        `falta label de #${input.id}`,
      ).not.toBeNull();
    }
  });

  it('los iconos de validación quedan fuera del árbol de accesibilidad', () => {
    const icons = [...document.querySelectorAll('.control i')];

    expect(icons.length).toBe(6);
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('la comprobación detecta de verdad: un campo sin etiqueta se cae', async () => {
    // Sin este caso no sabríamos si el test verde de arriba comprueba algo
    document.body.innerHTML = '<input id="huerfano" type="text" />';
    const { violations } = await runAxe();

    expect(violations.map((violation) => violation.id)).toContain('label');
  });

  it('el mensaje de envío se anuncia sin robar el foco', () => {
    const message = document.querySelector('#message');

    // <output> es el elemento del resultado de un formulario: ya lleva role="status"
    // y aria-live="polite" de serie, así que no hace falta ponerlos a mano.
    expect(message.tagName).toBe('OUTPUT');
    expect(message.role ?? 'status').toBe('status');
  });
});
