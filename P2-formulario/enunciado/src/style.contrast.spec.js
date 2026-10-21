import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Con `?raw` no vale: Vite trata los .css aparte y devuelve una cadena vacía.
// Se lee el fichero tal cual, desde la raíz del proyecto (donde corre Vitest).
const css = readFileSync('src/style.css', 'utf8');

/**
 * Contraste de color según WCAG 2.1, calculado a partir de las variables del CSS.
 *
 * No se hace con axe porque axe necesita un navegador que pinte de verdad para saber
 * de qué color acaba cada píxel, y aquí solo hay jsdom. A cambio, esto comprueba las
 * DOS paletas (clara y oscura) sin abrir ningún navegador, que con `prefers-color-scheme`
 * es justo lo difícil de revisar a ojo.
 *
 * Mínimos de la norma (nivel AA): 4.5 para texto normal y 3 para texto grande o
 * elementos de interfaz. Los controles deshabilitados están exentos, pero aquí se
 * exigen igual: que algo esté apagado no quiere decir que deba ser ilegible.
 */
const AA_NORMAL_TEXT = 4.5;

/** Saca las variables de un bloque `selector { … }` del CSS. */
function readTokens(selector) {
  // Se lee al recolectar los tests, así que aquí no se puede usar expect
  const block = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (block === null) {
    throw new Error(`No se encontró el bloque ${selector} en style.css`);
  }

  return Object.fromEntries(
    [...block[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}

const toRgb = (hex) => {
  const digits = hex.replace('#', '');
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
};

/** Luminancia relativa, tal y como la define WCAG. */
const luminance = (hex) => {
  const [red, green, blue] = toRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

// Las combinaciones que el formulario pone de verdad en pantalla
const PAIRS = [
  ['texto sobre la tarjeta', '--color-text', '--color-surface'],
  ['etiquetas sobre la tarjeta', '--color-text-soft', '--color-surface'],
  ['texto sobre el fondo', '--color-text', '--color-bg'],
  ['icono de campo válido', '--color-valid', '--color-surface'],
  ['icono de campo inválido', '--color-invalid', '--color-surface'],
  ['mensaje de éxito', '--color-valid', '--color-valid-bg'],
  ['mensaje de error', '--color-invalid', '--color-invalid-bg'],
  ['texto del botón', '--color-on-accent', '--color-accent'],
  ['botón deshabilitado', '--color-disabled-text', '--color-border'],
];

describe.each([
  ['paleta clara', ':root'],
  ['paleta oscura', ":root\\[data-theme='dark'\\]"],
])('Contraste · %s', (_name, selector) => {
  const tokens = readTokens(selector);

  it.each(PAIRS)('%s llega al mínimo AA', (_label, foreground, background) => {
    expect(tokens[foreground], `falta ${foreground}`).toBeDefined();
    expect(tokens[background], `falta ${background}`).toBeDefined();

    const ratio = contrastRatio(tokens[foreground], tokens[background]);
    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('La comprobación de contraste detecta de verdad', () => {
  it('un gris claro sobre blanco no llega a AA', () => {
    expect(contrastRatio('#aaaaaa', '#ffffff')).toBeLessThan(AA_NORMAL_TEXT);
  });

  it('negro sobre blanco da el máximo (21)', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
});
