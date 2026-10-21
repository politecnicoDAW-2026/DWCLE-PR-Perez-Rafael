import { describe, expect, it } from 'vitest';
import { COUNTRIES } from './country.model.js';
import { Telephone } from './telephone.model.js';
import { User } from './user.model.js';
import { UserAddress } from './user-address.model.js';
import { ValidationError } from '../exceptions/validation.exception.js';

/**
 * TESTS DEL MODELO · léelos antes de escribir nada
 * ================================================
 *
 * Estos tests vienen escritos y **empiezan en rojo**: son la definición exacta de lo que
 * tiene que hacer tu modelo. Tu trabajo es ponerlos en verde. En otras prácticas los
 * tendrás que escribir tú; en esta se te dan para que veas cómo se hace uno.
 *
 *     npm run test:watch      se relanzan solos cada vez que guardas
 *
 * Cómo está montado cada test
 * ---------------------------
 * Todos siguen el mismo esqueleto de tres pasos (se llama *arrange-act-assert*):
 *
 *     const user = new User(VALID_USER);        // 1. preparar: los datos de partida
 *     const nombre = user.name;                 // 2. actuar: lo que se quiere probar
 *     expect(nombre).toBe('Ada');               // 3. comprobar: qué se espera
 *
 * En los tests cortos los pasos 1 y 2 caben en la misma línea, pero el orden es siempre ese.
 *
 * Qué comparador usar
 * -------------------
 *   toBe(x)         valores sueltos: números, cadenas, booleanos (compara con ===)
 *   toEqual(x)      objetos y arrays: compara el CONTENIDO, no que sean el mismo objeto
 *   toThrow(Error)  cuando lo correcto es fallar; hay que pasarle una FUNCIÓN, no el valor
 *   toHaveLength(n) longitud de cadenas y arrays
 *
 * Por qué estos casos y no otros
 * ------------------------------
 * No se prueba "que funcione": se prueban las FRONTERAS, que es donde vive el 90 % de los
 * errores. Por cada regla hay tres tipos de caso:
 *
 *   1. el camino feliz     un valor normal y corriente que debe pasar
 *   2. el límite exacto    100 caracteres vale, 101 no; el 29 de febrero de 2020 sí, el de 2021 no
 *   3. el caso torcido     vacío, solo espacios, otro formato, el tipo equivocado
 *
 * Probar solo el camino feliz no sirve de nada: un modelo que acepta TODO lo pasa.
 */

// Un usuario válido, para no repetir estos datos en cada test
const VALID_USER = {
  name: 'Ada',
  surname: 'Lovelace',
  birthDate: '10/12/1990',
  telephone: '612345678',
  address: { zip: '29001', address: 'Calle Larios 1' },
};

describe('User', () => {
  it('se crea con datos válidos', () => {
    // El camino feliz. Si este falla, no sigas con los demás: algo básico no está.
    const user = new User(VALID_USER);

    expect(user.name).toBe('Ada');
    expect(user.surname).toBe('Lovelace');
    expect(user.birthDate).toBe('10/12/1990');
    expect(user.isComplete).toBe(true);
  });

  it('está incompleto mientras falten campos', () => {
    // Por qué: el servicio valida campo a campo mientras se escribe, así que el modelo
    // tiene que admitir datos a medias sin dar un usuario por bueno.
    expect(new User({ name: 'Ada' }).isComplete).toBe(false);
  });

  it('lanza una excepción si el nombre está vacío o supera 100 caracteres', () => {
    // Ojo al `() =>`: a toThrow se le pasa una función, no el resultado. Si escribes
    // expect(new User({ name: '' })).toThrow(...) la excepción salta ANTES de llegar a
    // expect y el test se rompe en vez de pasar.
    expect(() => new User({ name: '' })).toThrow(ValidationError);
    expect(() => new User({ name: '   ' })).toThrow(ValidationError); // solo espacios: también vacío
    expect(() => new User({ name: 'a'.repeat(101) })).toThrow(ValidationError);
  });

  it('acepta un nombre de exactamente 100 caracteres', () => {
    // El límite exacto. 100 vale y 101 no: hay que probar los dos lados de la frontera,
    // porque es donde se cuela el error de poner < en lugar de <=.
    expect(new User({ name: 'a'.repeat(100) }).name).toHaveLength(100);
  });

  it('lanza una excepción si los apellidos están vacíos o superan 100 caracteres', () => {
    expect(() => new User({ surname: '' })).toThrow(ValidationError);
    expect(() => new User({ surname: 'a'.repeat(101) })).toThrow(ValidationError);
  });

  it('recorta los espacios de nombre y apellidos', () => {
    // Por qué: la gente escribe con espacios de más al copiar y pegar. Decidimos que el
    // modelo los quita en vez de rechazar el valor.
    expect(new User({ name: '  Ada  ' }).name).toBe('Ada');
  });

  it('la excepción dice qué campo ha fallado', () => {
    // Por qué importa: la vista necesita saber DÓNDE poner el aviso. Si el error solo
    // trajera un mensaje, habría que leer el texto para adivinarlo.
    // objectContaining comprueba solo las propiedades que le indicas, no el objeto entero.
    expect(() => new User({ surname: '' })).toThrow(expect.objectContaining({ field: 'surname' }));
  });

  it('lanza una excepción si la fecha de nacimiento no es válida', () => {
    expect(() => new User({ birthDate: '' })).toThrow(ValidationError);
    expect(() => new User({ birthDate: '31/02/1990' })).toThrow(ValidationError); // no existe
    expect(() => new User({ birthDate: '1990-12-10' })).toThrow(ValidationError); // otro formato
  });

  it('rechaza una fecha futura o anterior a 1900', () => {
    // Por qué: nadie nace mañana, y una fecha de 1850 casi siempre es una errata.
    expect(() => new User({ birthDate: '01/01/2100' })).toThrow(ValidationError);
    expect(() => new User({ birthDate: '31/12/1899' })).toThrow(ValidationError);
  });

  it('interpreta y devuelve la fecha con el formato del país', () => {
    // El test más importante de la práctica: la MISMA cadena significa días distintos
    // según el país. 10/12/1990 es el 10 de diciembre en España y el 12 de octubre en
    // EE. UU. Si tu modelo usa new Date(texto), este test lo va a cazar.
    const spanish = new User({ birthDate: '10/12/1990' }, { country: COUNTRIES.ES });
    const american = new User({ birthDate: '12/10/1990' }, { country: COUNTRIES.US });

    expect(spanish.birthDate).toBe('10/12/1990');
    expect(american.birthDate).toBe('12/10/1990');
  });

  it('acepta modelos ya construidos para el teléfono y la dirección', () => {
    // Por qué: el servicio a veces tiene la cadena y a veces el objeto ya montado.
    // Admitir las dos cosas evita tener que deshacer y rehacer el modelo.
    const user = new User({
      telephone: new Telephone('612345678'),
      address: new UserAddress({ zip: '29001', address: 'Calle Larios 1' }),
    });

    expect(user.telephone.number).toBe('612345678');
    expect(user.address.address).toBe('Calle Larios 1');
  });
});

describe('Telephone', () => {
  it('acepta un teléfono español: prefijo + 9 dígitos', () => {
    const telephone = new Telephone('612345678', COUNTRIES.ES);

    expect(telephone.prefix).toBe('+34');
    expect(telephone.number).toBe('612345678');
    expect(telephone.country.code).toBe('ES');
    // Cómo se MUESTRA el número (con espacios, con guiones…) lo decides tú:
    // por eso no hay ningún test sobre toString().
  });

  it('rechaza un teléfono que no cumple el formato del país', () => {
    // Uno por debajo y uno por encima de la longitud, más un carácter que no toca.
    expect(() => new Telephone('61234567', COUNTRIES.ES)).toThrow(ValidationError); // 8 dígitos
    expect(() => new Telephone('6123456789', COUNTRIES.ES)).toThrow(ValidationError); // 10
    expect(() => new Telephone('61234567A', COUNTRIES.ES)).toThrow(ValidationError); // letra
    expect(() => new Telephone('', COUNTRIES.ES)).toThrow(ValidationError);
  });

  it('en EE. UU. son 10 dígitos', () => {
    expect(new Telephone('8003569377', COUNTRIES.US).number).toBe('8003569377');
    expect(() => new Telephone('800356937', COUNTRIES.US)).toThrow(ValidationError); // 9
  });

  it('en EE. UU. las letras se convierten con el teclado del teléfono', () => {
    // 2=ABC, 3=DEF, 4=GHI, 5=JKL, 6=MNO, 7=PQRS, 8=TUV, 9=WXYZ.
    // 1-800-FLOWERS es en realidad 1-800-356-9377.
    expect(new Telephone('800FLOWERS', COUNTRIES.US).number).toBe('8003569377');
  });

  it('en España las letras NO se convierten', () => {
    // El test que evita el atajo fácil. Si conviertes las letras siempre, "61234567A"
    // se volvería "612345672" y pasaría por un teléfono válido que no existe.
    // Por eso cada país dice si las admite (`allowsLetters` en country.model.js).
    expect(() => new Telephone('61234567A', COUNTRIES.ES)).toThrow(ValidationError);
  });
});

describe('UserAddress', () => {
  it('acepta un código postal español de 5 dígitos', () => {
    const address = new UserAddress({ zip: '29001', address: 'Calle Larios 1' }, COUNTRIES.ES);

    expect(address.zip).toBe('29001');
    expect(address.isComplete).toBe(true);
  });

  it('rechaza un código postal que no cumple el formato del país', () => {
    expect(() => new UserAddress({ zip: '2900' }, COUNTRIES.ES)).toThrow(ValidationError); // 4
    expect(() => new UserAddress({ zip: '2900A' }, COUNTRIES.ES)).toThrow(ValidationError); // letra
    // El mismo valor, válido en un país e inválido en otro: en EE. UU. son 6 caracteres.
    expect(() => new UserAddress({ zip: '29001' }, COUNTRIES.US)).toThrow(ValidationError);
  });

  it('en EE. UU. el código postal admite 6 números o letras', () => {
    expect(new UserAddress({ zip: 'K1A0B1' }, COUNTRIES.US).zip).toBe('K1A0B1');
  });

  it('exige una dirección no vacía', () => {
    expect(() => new UserAddress({ address: '' })).toThrow(ValidationError);
  });
});
