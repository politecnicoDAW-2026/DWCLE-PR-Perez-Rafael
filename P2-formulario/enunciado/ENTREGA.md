# P2 · formulario · entrega

## Autoría

- Nombre: Rafael Pérez
- Repositorio y _tag_ entregado: `DWCLE-PR-Perez-Rafael` (rama `main`), carpeta `P2-formulario/enunciado/`

## Cómo arrancar

```bash
cd P2-formulario/enunciado
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm test          # 87 tests
npm run check     # lint + lint:css + format:check + test:coverage + audit
npm run build     # build de producción en dist/
```

## Qué funciona

| Requisito                                                                      | Estado  | Notas                                                                                                                                   |
| ------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Arquitectura MVP en tres capas (`models`, `services`, `views` + `controllers`) | Hecho   | La vista es lo único que toca el DOM; el controlador solo coordina                                                                      |
| Validación por campo con icono al lado                                         | Hecho   | Se cambia el `className` del `<i>` hermano del input; el color del borde lo pone el CSS con `:has()`                                    |
| Iconos de Font Awesome                                                         | Hecho   | `fa-solid fa-circle-check` / `fa-solid fa-circle-xmark` + clase `valid` / `invalid`                                                     |
| Botón Enviar deshabilitado hasta que todo el formulario es válido              | Hecho   | Se recalcula en cada tecla, en cada `blur` y al cambiar de país                                                                         |
| Validación global al enviar y mensaje de resultado                             | Hecho   | Mensaje verde con `user.toString()`; en caso de error, mensaje rojo                                                                     |
| Nombre y apellidos obligatorios, máximo 100 caracteres                         | Hecho   | Ayudante privado `#validText` compartido por los dos setters                                                                            |
| Fecha de nacimiento con `date-fns` y formato del país                          | Hecho   | Ida y vuelta `parse` + `format` para cazar fechas imposibles (`31/02/1990`); rango 1900–hoy                                             |
| Teléfono: 9 dígitos en España, 10 en EE. UU.                                   | Hecho   | La tabla del teclado (2=ABC…) vive en `Telephone`                                                                                       |
| Letras en el teléfono **solo** donde el país lo permite                        | Hecho   | `800FLOWERS` → `8003569377` en EE. UU.; `61234567A` es inválido en España                                                               |
| Código postal con el formato del país + dirección obligatoria                  | Hecho   | El patrón lo aporta `country.zipPattern`: el mismo CP puede valer en un país y no en otro                                               |
| Cambiar de país actualiza prefijo, ejemplo de fecha y longitud máxima          | Hecho   | Al cambiar de país se revalidan los seis campos porque cambian las reglas                                                               |
| Interfaz en español e inglés                                                   | Hecho   | Diccionarios en `src/assets/i18n/`; se recorre `[data-i18n]`. Las opciones de los desplegables no se traducen (el enunciado no lo pide) |
| Tests del modelo en verde                                                      | Hecho   | 20 tests dados, sin modificar                                                                                                           |
| Tests del servicio (obligatorios)                                              | Hecho   | 25 tests propios en `form.service.spec.js`                                                                                              |
| Tests de la vista (opcionales)                                                 | Hecho   | 8 tests de integración en `form.integration.spec.js`                                                                                    |
| HTML y CSS originales sin tocar                                                | Hecho   | Ni una línea: se conservan los `id`, los `<i>` y los `data-i18n`                                                                        |
| Diagrama UML actualizado                                                       | Hecho   | `docs/uml/class-diagram.puml` refleja el diseño final                                                                                   |
| `npm run check` en verde                                                       | Parcial | Todo pasa salvo `npm audit` (ver _Calidad_)                                                                                             |

## Decisiones de diseño

1. **Las reglas de cada país viven en `country.model.js`** (`zipPattern`, `zipExample`, `phonePattern`,
   `dateFormat`, `allowsLetters`). Ni `Telephone` ni `UserAddress` saben nada de España o de EE. UU.: piden el
   patrón al país. Añadir un país nuevo es añadir un objeto, no tocar los modelos.
2. **El servicio traduce excepciones a booleanos, pero no se traga cualquier error.** `isValid()` solo convierte
   un `ValidationError` en `false`; cualquier otro error se relanza. Si un `TypeError` se convirtiera en `false`,
   un bug se disfrazaría de "campo inválido" y sería muy difícil de encontrar. Por el mismo motivo, la validación
   es campo a campo: un código postal vacío no puede tumbar el veredicto del nombre.
3. **`sendForm()` devuelve un `User` y lanza `ValidationError('form')` si el formulario no es válido.** El UML de
   partida decía `boolean`; devolver el modelo ya construido evita que el controlador tenga que volver a montarlo
   y encaja con el patrón de la clase `13-mvp-todo`. Es la única desviación del diagrama y está anotada en él.
4. **El icono de un campo aparece la primera vez que el usuario lo toca** (`input` o `blur`). Mostrar seis cruces
   rojas nada más abrir el formulario es feo e injusto; además, así al cambiar de país solo se repintan los campos
   que el usuario ya ha visto. La vista lleva la cuenta con un `Set`.
5. **El idioma es cosa de la vista, no del servicio** (que solo sabe de países). Las opciones de los desplegables
   no se traducen para no tocar el HTML entregado.

## Calidad

- `npm run check`: ❌ (lint ✅ · lint:css ✅ · format:check ✅ · test:coverage ✅ · **audit ❌**)
- Cobertura de la lógica (`npm run test:coverage`): **95,77 %** en `models/` y **100 %** en `services/`
  (94,66 % de líneas en todo el proyecto; los umbrales del 70 % se superan de sobra)
- SonarQube (`npm run sonar:scan`): no ejecutado, pendiente (necesita un contenedor Docker o un servidor
  SonarQube, no disponibles en este equipo)

### Las 9 vulnerabilidades de `npm audit`

`npm audit --audit-level=high` informa de 9 vulnerabilidades altas, todas **indirectas** y todas **sin versión
corregida publicada**:

| Paquete      | Dependencia que lo arrastra             | Versión instalada | ¿Hay arreglo?                    |
| ------------ | --------------------------------------- | ----------------- | -------------------------------- |
| `braces`     | `stylelint` (→ `micromatch` → `braces`) | 3.0.3             | No: 3.0.3 es la última publicada |
| `node-forge` | `sonarqube-scanner`                     | 1.4.0             | No: 1.4.0 es la última publicada |

`npm audit fix` (sin `--force`) reduce de 11 a 9 y no puede bajar de ahí. `npm audit fix --force` tampoco las
elimina: lo único que consigue es _degradar_ `stylelint` y `sonarqube-scanner` a versiones más antiguas, lo que
rompería dos herramientas que sí se usan en la entrega (`lint:css` y `sonar:scan`). Decisión: **no forzar**. El
riesgo real es nulo en este proyecto: ninguna de las dos se ejecuta en el navegador ni procesa entrada del usuario
(son herramientas de desarrollo). Queda documentado aquí, que es lo que pide el enunciado.

## Capturas

Pendientes de añadir en `docs/` (claro y oscuro) desde el navegador con `npm run dev`.

## Qué mejoraría con más tiempo

- **Un país que no sea España ni EE. UU.** para comprobar de verdad que la arquitectura aguanta: ahora mismo
  añadir uno debería ser solo un objeto nuevo en `country.model.js`.
- **Mensaje de error por campo** en vez de un único mensaje del formulario: `ValidationError` ya lleva el `field`,
  así que la vista podría pintar el texto del error dentro del propio `.control`.
- **Traducir los mensajes del modelo.** Hoy son cadenas en español; con la i18n montada, lo limpio sería que el
  modelo lance una _clave_ (`invalid.birthDate`) y que la vista la traduzca. No lo hice porque el enunciado deja
  la i18n como responsabilidad de la vista y los tests del modelo esperan los mensajes literales.
- **SonarQube en local** para cerrar del todo el `npm run check`.
