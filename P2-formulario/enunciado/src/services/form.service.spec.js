import { beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '../exceptions/validation.exception.js';
import { User } from '../models/user.model.js';
import { FORM_FIELDS, FormService } from './form.service.js';

/**
 * TESTS DEL SERVICIO (escritos por nosotros: el enunciado no los da).
 * ==================================================================
 *
 * Mismo esqueleto que los tests del modelo: preparar, actuar, comprobar.
 * Y la misma idea: no se prueba "que funcione", se prueban las fronteras y los
 * casos torcidos, que es donde de verdad se rompe el código.
 *
 * Qué se prueba aquí y no en el modelo:
 *   - el modelo ya está probado campo a campo; el servicio se prueba como TRADUCTOR
 *     (excepción del modelo → booleano para la vista) y como PORTERO del envío.
 *   - lo propio del servicio: que cada campo se juzgue solo, que el país cambie las
 *     reglas, y que `sendForm` solo deje pasar un usuario completo.
 *
 * Se ejecutan con `npm test` (o `npm run test:watch` mientras escribes el código).
 * Cada `it` se lee como una frase: "el código X hace Y".
 *
 * Estructura de CADA test, siempre la misma (se llama preparar – actuar – comprobar):
 *   1. preparar   → `const service = serviceWith({ … })`
 *   2. actuar     → `service.isValid('name')`
 *   3. comprobar  → `expect(...).toBe(true)`
 */

// Un formulario relleno y válido, para no repetir seis líneas en cada test.
// Está pensado para España: fecha dd/MM/yyyy, teléfono de 9 cifras y CP de 5 dígitos.
const VALID_DATA = {
  name: 'Ada',
  surname: 'Lovelace',
  birthDate: '10/12/1990',
  telephone: '612345678',
  zip: '29001',
  address: 'Calle Larios 1',
};

/**
 * Fábrica de servicios: monta un `FormService` ya configurado y con los datos metidos.
 *
 * Es una función y no un `beforeEach` porque cada test necesita datos DISTINTOS: uno quiere el
 * formulario vacío, otro solo el nombre, otro los seis campos. Con un `beforeEach` común habría
 * que "deshacer" cosas en cada test; así cada test pide exactamente el escenario que quiere.
 *
 * Por dentro se ve el uso normal del servicio: `setCountry` para las reglas y `set` para guardar.
 */
function serviceWith(data = {}, countryCode = 'ES') {
  const service = new FormService();
  service.setCountry(countryCode);
  Object.entries(data).forEach(([field, value]) => service.set(field, value));
  return service;
}

describe('FormService · país', () => {
  it('empieza en España', () => {
    const service = new FormService();

    expect(service.country.code).toBe('ES');
    expect(service.dateFormat).toBe('dd/MM/yyyy');
  });

  it('al cambiar de país cambian las reglas', () => {
    const service = serviceWith();

    service.setCountry('US');

    expect(service.country.code).toBe('US');
    expect(service.dateFormat).toBe('MM/dd/yyyy'); // la misma cadena ya no significa lo mismo
  });

  it('un país desconocido cae en el de por defecto en vez de romper', () => {
    // Caso torcido: alguien manipula el <select> desde la consola del navegador.
    const service = serviceWith();

    service.setCountry('FR');

    expect(service.country.code).toBe('ES');
  });
});

describe('FormService · validación campo a campo', () => {
  let service;

  beforeEach(() => {
    service = new FormService();
  });

  it('con el formulario vacío ningún campo es válido', () => {
    // Se recorren los seis campos en bucle en vez de escribir seis `expect`: si mañana se añade
    // un campo a FORM_FIELDS, este test lo cubre solo.
    FORM_FIELDS.forEach((field) => {
      // El segundo argumento de `expect` es el mensaje que se imprime SI falla: así, con seis
      // campos, se sabe cuál de ellos se rompió.
      expect(service.isValid(field), `el campo ${field} debería estar vacío`).toBe(false);
    });
  });

  it('con el formulario relleno todos los campos son válidos', () => {
    service = serviceWith(VALID_DATA);

    FORM_FIELDS.forEach((field) => {
      expect(service.isValid(field), `el campo ${field} debería ser válido`).toBe(true);
    });
  });

  it('un campo se juzga solo, sin esperar a los demás', () => {
    // Por qué: mientras el usuario escribe el nombre, el resto está vacío y aun así
    // el check del nombre tiene que poder ponerse verde.
    service = serviceWith({ name: 'Ada' });

    expect(service.isValid('name')).toBe(true);
    expect(service.isValid('zip')).toBe(false);
  });

  it('solo espacios no es un valor', () => {
    service = serviceWith({ name: '   ' });

    expect(service.isValid('name')).toBe(false);
  });

  it('100 caracteres valen y 101 no (la frontera exacta)', () => {
    service = serviceWith({ name: 'a'.repeat(100) });
    expect(service.isValid('name')).toBe(true);

    service.set('name', 'a'.repeat(101));
    expect(service.isValid('name')).toBe(false);
  });

  it('el teléfono se juzga con las reglas del país', () => {
    const spanish = serviceWith({ telephone: '612345678' }, 'ES');
    const american = serviceWith({ telephone: '612345678' }, 'US');

    expect(spanish.isValid('telephone')).toBe(true);
    expect(american.isValid('telephone')).toBe(false); // en EE. UU. son 10 cifras
  });

  it('en EE. UU. el teléfono admite letras del teclado', () => {
    const service = serviceWith({ telephone: '800FLOWERS' }, 'US');

    expect(service.isValid('telephone')).toBe(true);
  });

  it('en España las letras del teclado NO valen', () => {
    // La frontera que evita el atajo: '61234567A' no puede colarse como '612345672'.
    const service = serviceWith({ telephone: '61234567A' }, 'ES');

    expect(service.isValid('telephone')).toBe(false);
  });

  it('el código postal se juzga con las reglas del país', () => {
    // El MISMO valor: válido en España (5 dígitos) e inválido en EE. UU. (6 caracteres).
    const spanish = serviceWith({ zip: '29001' }, 'ES');
    const american = serviceWith({ zip: '29001' }, 'US');

    expect(spanish.isValid('zip')).toBe(true);
    expect(american.isValid('zip')).toBe(false);
  });

  it('la fecha se interpreta con el formato del país', () => {
    // '31/12/1990' es el 31 de diciembre en España, pero en EE. UU. no existe un mes 31.
    const spanish = serviceWith({ birthDate: '31/12/1990' }, 'ES');
    const american = serviceWith({ birthDate: '31/12/1990' }, 'US');

    expect(spanish.isValid('birthDate')).toBe(true);
    expect(american.isValid('birthDate')).toBe(false);
  });

  it('una fecha imposible no vale', () => {
    const service = serviceWith({ birthDate: '31/02/1990' });

    expect(service.isValid('birthDate')).toBe(false);
  });

  it('una fecha futura o anterior a 1900 no vale', () => {
    const service = serviceWith({ birthDate: '01/01/2100' });
    expect(service.isValid('birthDate')).toBe(false);

    service.set('birthDate', '31/12/1899');
    expect(service.isValid('birthDate')).toBe(false);
  });

  it('un fallo de programación no se disfraza de "campo inválido"', () => {
    // Si CUALQUIER error se convirtiera en `false`, un bug del código se vería como
    // "el usuario escribió mal el nombre" y sería imposible de encontrar.
    const service = serviceWith();
    service.set('name', {
      toString: () => {
        throw new TypeError('boom');
      },
    });

    expect(() => service.isValid('name')).toThrow(TypeError);
  });
});

describe('FormService · validación global', () => {
  it('empieza incompleto', () => {
    expect(serviceWith().isFormValid).toBe(false);
  });

  it('basta con que falte un solo campo', () => {
    const service = serviceWith(VALID_DATA);
    expect(service.isFormValid).toBe(true);

    service.set('zip', '');
    expect(service.isFormValid).toBe(false);
  });

  it('al cambiar de país se revalida todo lo escrito', () => {
    // Los datos siguen ahí, pero las reglas han cambiado: CP de 5 dígitos y teléfono de 9
    // no valen en EE. UU.
    const service = serviceWith(VALID_DATA, 'ES');
    expect(service.isFormValid).toBe(true);

    service.setCountry('US');
    expect(service.isFormValid).toBe(false);
  });
});

describe('FormService · envío', () => {
  it('devuelve un User con los datos del formulario', () => {
    const user = serviceWith(VALID_DATA).sendForm();

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Ada');
    expect(user.telephone.number).toBe('612345678');
    expect(user.address.zip).toBe('29001');
    expect(user.address.address).toBe('Calle Larios 1');
    expect(user.isComplete).toBe(true);
  });

  it('convierte las letras del teléfono antes de crear el usuario', () => {
    // Ojo con el resto de campos: en EE. UU. el CP tiene 6 caracteres y la fecha va MM/dd/yyyy,
    // así que un formulario "de España" con teléfono americano no valdría.
    const service = serviceWith(
      { ...VALID_DATA, birthDate: '12/10/1990', telephone: '800FLOWERS', zip: 'K1A0B1' },
      'US',
    );

    expect(service.sendForm().telephone.number).toBe('8003569377');
  });

  it('la fecha se devuelve con el formato del país', () => {
    const data = { ...VALID_DATA, birthDate: '12/10/1990', telephone: '8003569377', zip: 'K1A0B1' };

    expect(serviceWith(data, 'US').sendForm().birthDate).toBe('12/10/1990');
  });

  it('no deja enviar un formulario incompleto', () => {
    // OJO con `toThrow`: hay que pasarle una FUNCIÓN (`() => …`), no el resultado de llamarla.
    // `expect(serviceWith().sendForm()).toThrow(...)` sería un error: la excepción saltaría antes
    // de que el `expect` pudiera verla, y el test fallaría por el sitio equivocado.
    expect(() => serviceWith({ name: 'Ada' }).sendForm()).toThrow(ValidationError);
  });

  it('no deja enviar un campo mal formado', () => {
    expect(() => serviceWith({ ...VALID_DATA, zip: 'MAL' }).sendForm()).toThrow(ValidationError);
  });

  it('la excepción del envío señala al formulario, no a un campo suelto', () => {
    // Por qué: el controlador necesita distinguir "esto es de un campo" (pinta su icono)
    // de "esto es del formulario entero" (muestra un mensaje general).
    expect(() => serviceWith().sendForm()).toThrow(expect.objectContaining({ field: 'form' }));
  });
});
