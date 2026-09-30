# SonarQube en local

Análisis de calidad de tu código en tu máquina: bugs, vulnerabilidades, _code smells_, duplicados y cobertura
de tests. Usa **SonarQube Community Build** (la edición gratuita, siempre la última versión) con PostgreSQL,
todo en Docker.

Hay **un solo SonarQube para todo el curso**: da igual desde qué proyecto lo arranques, siempre son los mismos
contenedores y los mismos datos. Cada práctica aparece como un proyecto distinto dentro de él.

## Requisitos

- Docker con Docker Compose (Docker Desktop en Windows y macOS).
- Unos 4 GB de RAM libres mientras está encendido.
- Solo en Linux, si al arrancar SonarQube se para con un error de `vm.max_map_count`:
  `sudo sysctl -w vm.max_map_count=524288` (para que sea permanente, añádelo a `/etc/sysctl.conf`).

## La primera vez (una sola vez en todo el curso)

1. Desde la raíz del proyecto: `npm run sonar:up`. La primera vez descarga las imágenes y tarda unos minutos.
2. Abre <http://localhost:3300> y entra con `admin` / `admin`. Te obliga a cambiar la contraseña.
3. **My Account > Security > Generate Tokens**: tipo **Global Analysis Token**, sin caducidad. Copia el token.
4. En la raíz del proyecto, copia `.env.example` como `.env` y pega el token en `SONAR_TOKEN=`.
   `.env` está en `.gitignore`: el token nunca se sube. En cada práctica nueva copia el mismo `.env`.

## Cada vez que quieras analizar

```bash
npm run sonar:up      # si no estaba encendido
npm run sonar:scan    # tests con cobertura + análisis
```

Al terminar, el análisis indica la URL del proyecto en SonarQube. La primera vez que analizas una práctica,
el proyecto se crea solo con la clave de `sonar-project.properties`.

`npm run sonar:down` para los contenedores y conserva los datos. Para borrarlo todo y empezar de cero:
`docker compose -f apps/sonarqube/docker-compose.yml down -v`.

## Qué mirar

- **Quality Gate**: aprobado o suspendido según el código nuevo. Es lo primero que se revisa en una entrega.
- **Bugs y vulnerabilidades**: a cero antes de entregar.
- **Code smells**: léelos todos. Si no estás de acuerdo con uno, debes poder explicar por qué.
- **Coverage**: el porcentaje de líneas que ejecutan tus tests. Sale de `coverage/lcov.info`, que genera
  `npm run test:coverage`.
- **Duplications**: código copiado y pegado que debería ser una función.
