/**
 * PAÍSES DEL FORMULARIO
 * =====================
 *
 * Un país aquí no es solo un nombre: es un PAQUETE DE REGLAS. Cuando el usuario cambia el
 * `<select id="country">`, el resto del programa deja de mirar España y mira este objeto. Por
 * eso todo lo que cambia de un país a otro está aquí, junto, y no repartido por los modelos.
 *
 * Ventaja: añadir Francia sería añadir un objeto más. Ni `Telephone`, ni `UserAddress`, ni
 * `User` se tocarían. Eso es lo que se llama "que la regla viva con el dato".
 *
 * AVISO SOBRE LAS EXPRESIONES REGULARES (esto se avisa en el enunciado y es una trampa real):
 * `zipPattern` y `phonePattern` se usan con `.test(...)`. Una expresión regular creada con la
 * bandera `g` recuerda en `lastIndex` dónde acabó la búsqueda anterior, así que dos llamadas
 * seguidas con el MISMO objeto devuelven una vez `true` y la siguiente `false`. Traducido al
 * formulario: el icono parpadearía sin motivo. Regla de oro: NUNCA pongas `g` a una expresión
 * regular que vayas a usar con `test()`.
 */
export const COUNTRIES = {
  ES: {
    code: 'ES', // el valor que devuelve el <select>
    name: 'España', // el nombre que se muestra (el enunciado no pide traducirlo)
    prefix: '+34', // lo que se pinta en #prefix, delante del número
    dateFormat: 'dd/MM/yyyy', // molde de date-fns: primero el DÍA (día/mes/año)
    phoneExample: '612345678', // ejemplo que aparece en el mensaje de error
    allowsLetters: false, // ¿se admite 1-800-FLOWERS? En España no
    // --- reglas de validación (SIN la bandera `g`, ver el aviso de arriba) ---
    zipPattern: /^\d{5}$/, // ^...$ = "exactamente esto": 5 dígitos y nada más
    zipExample: '29001',
    phonePattern: /^\d{9}$/, // 9 dígitos exactos
  },
  US: {
    code: 'US',
    name: 'Estados Unidos',
    prefix: '+1',
    dateFormat: 'MM/dd/yyyy', // molde de date-fns: primero el MES (mes/día/año)
    phoneExample: '8003569377',
    allowsLetters: true, // números "vanity", como 800FLOWERS
    // Ojo: este patrón se comprueba DESPUÉS de convertir las letras en dígitos.
    zipPattern: /^[A-Za-z0-9]{6}$/, // 6 caracteres, letras o números (por ejemplo K1A0B1)
    zipExample: 'K1A0B1',
    phonePattern: /^\d{10}$/, // 10 dígitos exactos
  },
};

/** País con el que arranca el formulario: el <select> del HTML viene con "ES" marcado. */
export const DEFAULT_COUNTRY = COUNTRIES.ES;

/**
 * Traduce el código del `<select>` a un país de verdad.
 *
 * Si llega un código que no existe devuelve el país por defecto en lugar de reventar. No es
 * paranoia: cualquiera puede abrir la consola del navegador y dejar el `<select>` con un valor
 * inventado. Un dato que viene de fuera (del HTML, del usuario) no debe poder tumbar la app.
 */
export function getCountry(code) {
  return COUNTRIES[code] ?? DEFAULT_COUNTRY; // ?? = "si es undefined/null, usa esto otro"
}
