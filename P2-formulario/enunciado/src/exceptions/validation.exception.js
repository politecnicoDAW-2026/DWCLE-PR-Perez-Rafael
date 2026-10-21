/**
 * Excepción del dominio. Lleva el campo que ha fallado, para que la vista sepa
 * dónde poner el aviso sin tener que interpretar el mensaje.
 *
 * Recuerda cómo se hereda de `Error`:
 *   - `super(message)` tiene que ir ANTES de tocar `this`: construye la parte `Error` del objeto
 *     y deja el mensaje donde lo espera el resto de JavaScript.
 *   - `this.name` es solo para que, al imprimir el error, se vea "ValidationError" y no "Error".
 *   - `this.field` es lo que hace útil esta excepción: 'name' si el fallo es del nombre,
 *     'zip' si es del código postal, 'form' si es del formulario entero.
 *
 * Así, quien captura el error puede decidir QUÉ hacer sin leer el texto del mensaje (que además
 * podría acabar traducido): mira `field` y ya sabe de quién es el problema.
 */
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
