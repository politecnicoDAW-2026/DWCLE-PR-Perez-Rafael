import { ValidationError } from '../exceptions/validation.exception.js';
import { FORM_FIELDS } from '../services/form.service.js';

/**
 * CONTROLADOR (el "presentador"). Es el único que conoce a los dos lados a la vez.
 *
 * Sus tres reglas, y merece la pena tomárselas en serio:
 *   1. NO toca el DOM: ni un `querySelector`. Solo llama a métodos de la vista.
 *   2. NO valida: no hay ni una regla escrita aquí. Pregunta al servicio.
 *   3. Traduce: el modelo habla con excepciones y la vista con llamadas a sus métodos.
 *
 * Si algún día te ves escribiendo un `if` con reglas de validación aquí dentro, es la señal de
 * que eso pertenece al modelo.
 */
export class FormController {
  #service;
  #view;

  /**
   * Inyección de dependencias: el controlador NO crea sus colaboradores, los RECIBE.
   * Beneficio: se puede probar (o cambiar) la vista o el servicio sin tocar esta clase. Quien los
   * monta es `app.js`, la raíz de composición.
   */
  constructor(service, view) {
    this.#service = service;
    this.#view = view;

    // Se conecta el sentido vista → controlador. A partir de aquí, si el usuario escribe,
    // la vista llama a estos métodos. (Nótese que se pasa el método sin paréntesis: no se
    // ejecuta ahora, se le entrega la función para que la llame cuando toque.)
    this.#view.bindFieldInput(this.handleFieldInput);
    this.#view.bindLanguageChange(this.handleLanguageChange);
    this.#view.bindCountryChange(this.handleCountryChange);
    this.#view.bindSubmit(this.handleSubmit);

    // Estado inicial: el país manda en el prefijo, el ejemplo de fecha y el `maxlength`.
    // No hace falta pintar iconos (todavía no se ha tocado ningún campo) ni el mensaje (vacío),
    // pero el botón sí hay que dejarlo en su sitio: con el formulario vacío, desactivado.
    this.#view.setCountry(this.#service.country);
    this.#view.enableSubmit(this.#service.isFormValid);
  }

  /**
   * POR QUÉ ESTOS MÉTODOS SON `handleX = () => {}` Y NO `handleX() {}`
   *
   * En el constructor se pasa el método a la vista (`bindFieldInput(this.handleFieldInput)`).
   * Ahí el método se "despega" del objeto: cuando la vista lo llame, dentro `this` ya no sería
   * el controlador y `this.#service` reventaría.
   *
   * Una función flecha como propiedad de la clase nace atada al `this` de la instancia. Es lo
   * mismo que hacía el `CounterController` de clase.
   */

  /** El usuario ha escrito o ha salido de un campo. */
  handleFieldInput = (property, value) => {
    this.#service.set(property, value); // 1) guardar lo que hay escrito
    this.#view.renderField(property, this.#service.isValid(property)); // 2) pintar SU icono
    this.#view.enableSubmit(this.#service.isFormValid); // 3) ¿se puede enviar ya?
    // 4) Al volver a escribir, el mensaje anterior ("datos enviados") ya no describe la realidad.
    this.#view.clearMessage();
  };

  /** Ha cambiado el idioma: es un asunto exclusivo de la vista. */
  handleLanguageChange = (code) => {
    this.#view.setLanguage(code);
  };

  /** Ha cambiado el país: cambian las reglas, así que toca revalidar lo ya escrito. */
  handleCountryChange = (code) => {
    this.#service.setCountry(code); // 1) el servicio adopta las reglas del país nuevo
    this.#view.setCountry(this.#service.country); // 2) prefijo, fecha y maxlength

    // 3) Se revalida TODO lo que había escrito: '29001' era un CP válido en España y deja de
    //    serlo en EE. UU. Se hace en bucle sobre los campos para no repetir seis líneas.
    for (const field of FORM_FIELDS) {
      this.#view.renderField(field, this.#service.isValid(field));
    }

    this.#view.enableSubmit(this.#service.isFormValid); // 4) y el botón, otra vez
  };

  /** Se pulsa Enviar. */
  handleSubmit = () => {
    try {
      // El servicio es quien decide: si devuelve un `User`, es que el formulario valía.
      // La vista no conoce el modelo (regla de la capa vista en 13-mvp-todo), así que aquí se
      // traduce a texto plano con `user.toString()`: ella solo pinta la cadena que recibe.
      const user = this.#service.sendForm();
      this.#view.showSuccess(user.toString());
    } catch (error) {
      // Aquí está la traducción de la que hablábamos: una excepción del dominio se convierte
      // en algo visible para el usuario.
      if (error instanceof ValidationError) {
        this.#view.showError();
        return;
      }
      // Y cualquier otro error sigue subiendo (nadie lo captura): aparecerá en la consola del
      // navegador. Un bug de programación no es "el formulario está mal" y no debe disfrazarse.
      throw error;
    }
  };
}
