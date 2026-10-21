/**
 * DICCIONARIOS DE LA INTERFAZ
 * ===========================
 *
 * Los textos viven en dos ficheros JSON, uno por idioma:
 *
 *   es.json   { "name": "Nombre", "submit": "Enviar", … }
 *   en.json   { "name": "Name",   "submit": "Send",   … }
 *
 * Se han separado del código A PROPÓSITO: traducir no debe obligar a tocar el JavaScript, y
 * añadir un idioma debe ser añadir un fichero y una línea aquí.
 *
 * ¿POR QUÉ LOS JSON NO LLEVAN COMENTARIOS? Porque, aunque parezca mentira, el formato JSON no
 * admite comentarios: cualquier marca de comentario dentro del fichero haría que dejara de poder
 * leerse como JSON. Por eso las claves están explicadas aquí al lado:
 *
 *   title      → el <h1> de la página
 *   language   → la etiqueta del desplegable de idioma
 *   country    → la etiqueta del desplegable de país
 *   name       → etiqueta del campo nombre
 *   surname    → etiqueta del campo apellidos
 *   birthDate  → etiqueta del campo fecha de nacimiento
 *   telephone  → etiqueta del campo teléfono
 *   zip        → etiqueta del campo código postal
 *   address    → etiqueta del campo dirección
 *   submit     → el texto del botón Enviar (el botón no lleva `data-i18n`, se traduce a mano)
 *   sent       → el principio del mensaje de éxito ("Datos enviados: …")
 *   error      → el mensaje que aparece si el envío no se puede hacer
 *
 * Los dos ficheros tienen EXACTAMENTE las mismas claves. Si añades una en uno, añádela en el otro:
 * si falta, la vista deja el texto que ya hubiera en el HTML (no rompe, pero se queda sin traducir).
 */
import en from './en.json';
import es from './es.json';

/** La vista pide `languages[codigo][clave]`. Un idioma nuevo es un JSON más: el código no cambia. */
export const languages = { es, en };

/** Idioma con el que arranca la página (el `<select id="language">` viene con "es" marcado). */
export const DEFAULT_LANGUAGE = 'es';
