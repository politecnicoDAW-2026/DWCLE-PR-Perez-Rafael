# P2 · Formulario (MVP en JavaScript sin frameworks)

Formulario de datos personales resuelto con el patrón **MVP** (modelo – vista – presentador/controlador) en
JavaScript puro con Vite. El código está en [`enunciado/`](./enunciado), que es la carpeta entregada tal cual
(sin tocar el HTML ni el CSS originales).

## Cómo arrancar

```bash
cd enunciado
npm install
npm run dev       # http://localhost:5173
```

Otros comandos:

```bash
npm test          # 87 tests
npm run check     # lint + lint:css + format:check + test:coverage + audit
npm run build     # build de producción en dist/
```

## Cómo está organizado

```
enunciado/src/
├── index.html            # formulario entregado (no se toca)
├── style.css             # estilos entregados (no se tocan)
├── app.js                # raíz de composición: crea y conecta las tres capas
├── models/               # QUÉ es un dato válido (lanzan ValidationError)
│   ├── user.model.js     # nombre, apellidos, fecha, teléfono y dirección
│   ├── telephone.model.js
│   ├── user-address.model.js
│   └── country.model.js  # reglas por país: CP, teléfono, fecha, prefijo
├── services/
│   └── form.service.js   # guarda lo que se teclea y dice si el formulario vale
├── views/
│   └── form.view.js      # lo único que toca el DOM: iconos, textos, botón
├── controllers/
│   └── form.controller.js# coordina vista y servicio
├── exceptions/           # ValidationError: el error del dominio
└── assets/i18n/          # diccionarios es.json / en.json
```

El recorrido de una tecla es siempre el mismo:

```
input → Vista (bind*) → Controlador → Servicio → Modelo (el setter valida)
                                        ↓
        pinta icono ← Vista (render) ← Controlador ← true / false
```

## Decisiones de diseño

Están explicadas con detalle en [`enunciado/ENTREGA.md`](./enunciado/ENTREGA.md). En resumen:

1. **Las reglas por país viven en `country.model.js`**: `Telephone` y `UserAddress` piden el patrón al país en
   lugar de saberlo ellos. Añadir un país es añadir un objeto.
2. **El servicio convierte los `ValidationError` en `true`/`false`, pero relanza cualquier otro error**: un bug
   nunca debe disfrazarse de "campo inválido".
3. **Validación campo a campo**: cada campo se valida por separado, así un CP vacío no contamina el veredicto del
   nombre.
4. **`sendForm()` devuelve un `User`** (o lanza `ValidationError('form')`). Es la única desviación respecto al UML
   de partida, que decía `boolean`.
5. **El icono aparece cuando el usuario toca el campo**, no al abrir la página.
6. **La i18n es responsabilidad exclusiva de la vista**; el único dato que viene del modelo es el país.

## Documentación

- [`enunciado/README.md`](./enunciado/README.md): enunciado completo de la práctica, tal cual se entregó.
- [`enunciado/ENTREGA.md`](./enunciado/ENTREGA.md): requisito a requisito, decisiones y calidad.
- [`enunciado/docs/uml/class-diagram.puml`](./enunciado/docs/uml/class-diagram.puml): diagrama de clases final.

## Estado de `npm run check`

Lint, estilos, formato y cobertura pasan en verde. `npm audit` informa de 9 vulnerabilidades altas en
dependencias **indirectas de herramientas de desarrollo** (`braces` vía `stylelint`, `node-forge` vía
`sonarqube-scanner`) que ya están en su última versión publicada y por tanto **no tienen arreglo disponible**;
forzarlo degradaría esas dos herramientas. Está documentado con evidencia en `ENTREGA.md`.
