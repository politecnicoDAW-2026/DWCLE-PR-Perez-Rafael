# DWCLE · P1 · Arrays: map, filter, reduce, every y some

Primera práctica del módulo. Vas a implementar funciones que transforman y consultan arrays usando los métodos
funcionales de JavaScript. Cada bloque tiene su carpeta con un `core.js` que completas tú y un `core.spec.js`
con los tests que deben pasar. No hay interfaz: solo funciones y tests.

## Objetivos

- Elegir el método adecuado para cada problema: `map` transforma, `filter` selecciona, `reduce` acumula,
  `every` y `some` comprueban.
- No mutar los datos recibidos: cada función devuelve un valor nuevo.
- Leer un test que falla, entender qué pide y hacerlo pasar.

## Arranque

Necesitas **Node 24** (`node -v`).

```bash
npm install
npm test              # todos los tests una vez
npm run test:map      # un bloque en modo watch: se repite al guardar
```

| Script                | Bloque                          |
| --------------------- | ------------------------------- |
| `npm run test:map`    | `a_map/`                        |
| `npm run test:filter` | `b_filter/`                     |
| `npm run test:reduce` | `c_reduce/`                     |
| `npm run test:every`  | `d_every/`                      |
| `npm run test:some`   | `e_some/`                       |
| `npm run test:zoo`    | `f_zoo/`                        |
| `npm run test:watch`  | todos los bloques en modo watch |

Al principio todos los tests fallan: es lo esperado. Ve bloque a bloque, en orden.

## Qué hay que hacer

Implementa las funciones de cada `core.js` sin cambiar su nombre ni sus parámetros. **No modifiques los
`core.spec.js`**; puedes añadir tests propios en ficheros nuevos (`mis-tests.spec.js`).

1. **`a_map`**: `multiplyBy10`, `shiftRight`, `onlyVowels`, `doubleMatrix`. Todas con `map`.
2. **`b_filter`**: `onlyEven`, `onlyOneWord`, `positiveRowsOnly`, `allSameVowels`. Todas con `filter`.
3. **`c_reduce`**: `sum`, `productAll`, `objectify`, `luckyNumbers`. Todas con `reduce`.
4. **`d_every`**: `allEven`, `allSameType`, `positiveMatrix`, `allSameVowels`. Todas con `every`.
5. **`e_some`**: `anyGreaterThan10`, `longWord`, `truePossibilities`, `lostCarcosa`. Todas con `some`.
6. **`f_zoo`**: once consultas sobre los datos de un zoo (`data.js`): precio de entrada, horario, recuento y
   mapa de animales por zona, popularidad, búsquedas de animales y empleados por id o nombre, responsables de
   cada empleado y animales a cargo de cada uno. Aquí combinas todo lo anterior y además `find`,
   `Object.entries`, `Object.fromEntries` y `Object.groupBy`. **No modifiques `data.js`.**

El nombre de cada test explica lo que se espera; los datos de entrada y la salida esperada están en el propio
test.

## Reglas

- Nada de bucles `for` ni `forEach` para construir el resultado: el objetivo es practicar los métodos
  funcionales. Un `for…of` solo se admite en `f_zoo` si lo justificas en el README.
- Nada de `var`. `const` por defecto, `let` solo si reasignas.
- Funciones puras: no modifiques los parámetros ni variables de fuera.

## Material de apoyo

- [`02-javaScript-preparacion/06-array-methods.js`](https://github.com/politecnicoDAW-2026/DWCLE-clase/blob/main/02-javaScript-preparacion/06-array-methods.js):
  mutar frente a no mutar, copias.
- [`02-javaScript-preparacion/07-arrays-functional.js`](https://github.com/politecnicoDAW-2026/DWCLE-clase/blob/main/02-javaScript-preparacion/07-arrays-functional.js):
  `map`, `filter`, `reduce`, `find`, `some`, `every`, `Object.groupBy`.
- [`02-javaScript-preparacion/08-spread-rest-destructuring.js`](https://github.com/politecnicoDAW-2026/DWCLE-clase/blob/main/02-javaScript-preparacion/08-spread-rest-destructuring.js):
  parámetros por defecto, desestructuración y objeto de opciones (lo necesitas en `animalMap`).

## Calidad: tests, UML y SonarQube

| Script                  | Qué hace                                                                       |
| ----------------------- | ------------------------------------------------------------------------------ |
| `npm test`              | Ejecuta los tests una vez                                                      |
| `npm run test:watch`    | Tests en modo vigilancia mientras programas                                    |
| `npm run test:coverage` | Tests con cobertura en `coverage/` (`index.html` y `lcov.info` para SonarQube) |
| `npm run check`         | Lint, formato, tests con cobertura mínima y auditoría: lo mismo que la CI      |
| `npm run audit`         | Busca vulnerabilidades graves en las dependencias (`npm audit`)                |
| `npm run uml`           | Regenera los PNG de `docs/uml/*.puml` con PlantUML en Docker                   |
| `npm run sonar:up`      | Arranca SonarQube en local con Docker (http://localhost:3300)                  |
| `npm run sonar:scan`    | Tests con cobertura y análisis en SonarQube (token en `.env`)                  |
| `npm run sonar:down`    | Para SonarQube conservando sus datos                                           |

- **Tests en cada push:** `.github/workflows/ci.yml` ejecuta lint, formato, tests con cobertura y auditoría en GitHub Actions. La entrega se revisa con
  esa ejecución en verde.
- **Cobertura mínima:** el 70 % de líneas, funciones y ramas en la lógica (`*/core.js`). Por debajo, `npm run test:coverage` falla.
- **Antes de cada commit** se ejecutan ESLint y Prettier sobre lo que cambias, y el mensaje debe seguir
  _Conventional Commits_ (`feat: …`, `fix: …`). Si el commit se rechaza, lee el error: es el mismo que verías
  en la CI.
- **VS Code:** al abrir la carpeta te propondrá las extensiones recomendadas. Con ellas se formatea al
  guardar y ESLint marca los errores mientras escribes (`.vscode/settings.json`).
- **UML:** el diagrama vive en `docs/uml/`. Al subir un `.puml`, `.github/workflows/main.yml` genera su PNG.
  En local, `npm run uml` (necesita Docker) o la extensión PlantUML de VS Code.
- **SonarQube, en local:** `npm run sonar:up` y `npm run sonar:scan` antes de entregar. Sin bugs ni
  vulnerabilidades, y los _code smells_ revisados. Es el mismo SonarQube para todas las prácticas: el token
  se crea una vez (`apps/sonarqube/readme.md`) y se copia en el `.env` de cada una.

## Entrega

- Rellena [`ENTREGA.md`](ENTREGA.md): cómo arrancar, qué funciona, decisiones de diseño y calidad.

- **Se publica:** miércoles 23 de septiembre de 2026.
- **Se entrega:** miércoles 30 de septiembre de 2026, antes de las 23:59.
- Repositorio individual con `npm test` en verde.
- Un `README.md` propio breve: cómo ejecutar los tests y una decisión que hayas tomado (por ejemplo, qué
  método elegiste en un caso dudoso y por qué).
- Commits propios con mensajes convencionales (`feat: implementa el bloque map`), al menos uno por bloque.

Se evalúa con la [rúbrica común](https://github.com/politecnicoDAW-2026/DWCLE-clase/blob/main/doc/01-evaluacion-y-seguimiento.md). Pasar los tests es el mínimo
funcional; para el nivel excelente añade tests de casos vacíos, de límites y de no mutación.
