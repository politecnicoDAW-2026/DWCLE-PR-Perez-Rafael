/**
 * RAÍZ DE COMPOSICIÓN: el único sitio de todo el proyecto donde se crean el servicio, la vista
 * y el controlador, y se conectan entre sí.
 *
 * Es intencionadamente pequeñito. Que sea el único sitio con `new` tiene una ventaja: si hay que
 * cambiar un colaborador (otro servicio, otra vista), se cambia aquí y ya está.
 *
 * Ejecutar: `npm run dev`  →  http://localhost:5173
 */

// Se importan los estilos de Font Awesome (los iconos `fa-solid fa-circle-check` que pone la
// vista). No se importa `style.css` porque el `index.html` ya lo enlaza con un <link>.
import '@fortawesome/fontawesome-free/css/all.min.css';

import { FormController } from './controllers/form.controller.js';
import { FormService } from './services/form.service.js';
import { FormView } from './views/form.view.js';

/**
 * El orden de lectura es de dentro hacia fuera:
 *   `new FormService()` → la lógica
 *   `new FormView()`    → la que toca el DOM (busca los elementos al construirse, así que el
 *                          <script> tiene que ir al final del <body>, como está en el HTML)
 *   `new FormController(servicio, vista)` → los conecta y deja la aplicación funcionando
 *
 * Se exporta para poder montarla desde un test (mira `form.integration.spec.js`).
 */
export const app = new FormController(new FormService(), new FormView());
