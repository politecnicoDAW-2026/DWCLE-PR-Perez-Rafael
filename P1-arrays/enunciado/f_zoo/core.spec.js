import { describe, expect, it } from 'vitest';
import * as zoo from './core.js';

const LIONS = {
  id: '0938aa23-f153-4937-9f88-4858b24d6bce',
  name: 'lions',
  popularity: 4,
  location: 'NE',
  residents: [
    { name: 'Zena', sex: 'female', age: 12 },
    { name: 'Maxwell', sex: 'male', age: 15 },
    { name: 'Faustino', sex: 'male', age: 7 },
    { name: 'Dee', sex: 'female', age: 14 },
  ],
};

const TIGERS = {
  id: 'e8481c1d-42ea-4610-8e11-1752cfc05a46',
  name: 'tigers',
  popularity: 5,
  location: 'NW',
  residents: [
    { name: 'Shu', sex: 'female', age: 19 },
    { name: 'Esther', sex: 'female', age: 17 },
  ],
};

const NIGEL = {
  id: 'c5b83cb3-a451-49e2-ac45-ff3f54fbe7e1',
  firstName: 'Nigel',
  lastName: 'Nelson',
  managers: ['0e7b460e-acf4-4e17-bcb3-ee472265db83', 'fdb2543b-5662-46a7-badc-93d960fdc0a8'],
  responsibleFor: ['0938aa23-f153-4937-9f88-4858b24d6bce', 'e8481c1d-42ea-4610-8e11-1752cfc05a46'],
};

const BURL = {
  id: '0e7b460e-acf4-4e17-bcb3-ee472265db83',
  firstName: 'Burl',
  lastName: 'Bethea',
  managers: ['9e7d4524-363c-416a-8759-8aa7e50c0992'],
  responsibleFor: [
    '0938aa23-f153-4937-9f88-4858b24d6bce',
    'e8481c1d-42ea-4610-8e11-1752cfc05a46',
    'baa6e93a-f295-44e7-8f70-2bcdc6f6948d',
    'ef3778eb-2844-4c7c-b66c-f432073e1c6b',
  ],
};

const EMERY = {
  id: 'b0dc644a-5335-489b-8a2c-4e086c7819a2',
  firstName: 'Emery',
  lastName: 'Elser',
  managers: ['9e7d4524-363c-416a-8759-8aa7e50c0992'],
  responsibleFor: [
    'bb2a76d8-5fe3-4d03-84b7-dba9cfc048b5',
    'baa6e93a-f295-44e7-8f70-2bcdc6f6948d',
    '0938aa23-f153-4937-9f88-4858b24d6bce',
  ],
};

const WILBURN = {
  id: '56d43ba3-a5a7-40f6-8dd7-cbb05082383f',
  firstName: 'Wilburn',
  lastName: 'Wishart',
  managers: ['0e7b460e-acf4-4e17-bcb3-ee472265db83', 'fdb2543b-5662-46a7-badc-93d960fdc0a8'],
  responsibleFor: ['78460a91-f4da-4dea-a469-86fd2b8ccc84', 'bb2a76d8-5fe3-4d03-84b7-dba9cfc048b5'],
};

describe('Zoo', () => {
  describe('entryCalculator()', () => {
    it('devuelve 0 si no recibe argumentos', () => {
      expect(zoo.entryCalculator()).toBe(0);
    });

    it('devuelve 0 si recibe un objeto vacío', () => {
      expect(zoo.entryCalculator({})).toBe(0);
    });

    it('devuelve el precio total según el número de adultos, niños y mayores', () => {
      // toBeCloseTo: con decimales, 0.1 + 0.2 no es exactamente 0.3
      expect(zoo.entryCalculator({ Adult: 2, Child: 3, Senior: 1 })).toBeCloseTo(187.94, 2);
    });
  });

  describe('schedule()', () => {
    it('sin parámetros, devuelve el horario completo en formato legible', () => {
      expect(zoo.schedule()).toEqual({
        Tuesday: 'Open from 8am until 6pm',
        Wednesday: 'Open from 8am until 6pm',
        Thursday: 'Open from 10am until 8pm',
        Friday: 'Open from 10am until 8pm',
        Saturday: 'Open from 8am until 10pm',
        Sunday: 'Open from 8am until 8pm',
        Monday: 'CLOSED',
      });
    });

    it('con un día, devuelve solo ese día en formato legible', () => {
      expect(zoo.schedule('Monday')).toEqual({ Monday: 'CLOSED' });
      expect(zoo.schedule('Tuesday')).toEqual({ Tuesday: 'Open from 8am until 6pm' });
    });
  });

  describe('animalCount()', () => {
    it('sin parámetros, devuelve cada especie con su número de ejemplares', () => {
      expect(zoo.animalCount()).toEqual({
        lions: 4,
        tigers: 2,
        bears: 3,
        penguins: 4,
        otters: 4,
        frogs: 2,
        snakes: 2,
        elephants: 4,
        giraffes: 6,
      });
    });

    it('con el nombre de una especie, devuelve solo su número', () => {
      expect(zoo.animalCount('lions')).toBe(4);
      expect(zoo.animalCount('snakes')).toBe(2);
    });
  });

  describe('animalMap()', () => {
    it('sin parámetros, devuelve las especies agrupadas por ubicación', () => {
      expect(zoo.animalMap()).toEqual({
        NE: ['lions', 'giraffes'],
        NW: ['tigers', 'bears', 'elephants'],
        SE: ['penguins', 'otters'],
        SW: ['frogs', 'snakes'],
      });
    });

    it('con includeNames, devuelve los nombres de los ejemplares', () => {
      expect(zoo.animalMap({ includeNames: true })).toEqual({
        NE: [
          { lions: ['Zena', 'Maxwell', 'Faustino', 'Dee'] },
          { giraffes: ['Gracia', 'Antone', 'Vicky', 'Clay', 'Arron', 'Bernard'] },
        ],
        NW: [
          { tigers: ['Shu', 'Esther'] },
          { bears: ['Hiram', 'Edwardo', 'Milan'] },
          { elephants: ['Ilana', 'Orval', 'Bea', 'Jefferson'] },
        ],
        SE: [
          { penguins: ['Joe', 'Tad', 'Keri', 'Nicholas'] },
          { otters: ['Neville', 'Lloyd', 'Mercedes', 'Margherita'] },
        ],
        SW: [{ frogs: ['Cathey', 'Annice'] }, { snakes: ['Paulette', 'Bill'] }],
      });
    });

    it('con includeNames y sex, devuelve solo los nombres de ese sexo', () => {
      expect(zoo.animalMap({ includeNames: true, sex: 'female' })).toEqual({
        NE: [{ lions: ['Zena', 'Dee'] }, { giraffes: ['Gracia', 'Vicky'] }],
        NW: [{ tigers: ['Shu', 'Esther'] }, { bears: [] }, { elephants: ['Ilana', 'Bea'] }],
        SE: [{ penguins: ['Keri'] }, { otters: ['Mercedes', 'Margherita'] }],
        SW: [{ frogs: ['Cathey', 'Annice'] }, { snakes: ['Paulette'] }],
      });
    });

    it('sin includeNames, sex no tiene efecto', () => {
      expect(zoo.animalMap({ sex: 'female' }).NE[0]).toBe('lions');
    });
  });

  describe('animalPopularity()', () => {
    it('sin parámetros, agrupa las especies por popularidad', () => {
      expect(zoo.animalPopularity()).toEqual({
        2: ['frogs'],
        3: ['snakes'],
        4: ['lions', 'penguins', 'otters', 'giraffes'],
        5: ['tigers', 'bears', 'elephants'],
      });
    });

    it('con una puntuación, devuelve las especies con esa popularidad', () => {
      expect(zoo.animalPopularity(3)).toEqual(['snakes']);
    });
  });

  describe('animalsByIds()', () => {
    it('sin parámetros, devuelve un array vacío', () => {
      expect(zoo.animalsByIds()).toEqual([]);
    });

    it('con un id, devuelve la especie con ese id', () => {
      expect(zoo.animalsByIds(LIONS.id)).toEqual([LIONS]);
    });

    it('con un array de ids, devuelve las especies con esos ids', () => {
      expect(zoo.animalsByIds([LIONS.id, TIGERS.id])).toEqual([LIONS, TIGERS]);
    });
  });

  describe('animalByName()', () => {
    it('sin parámetros, devuelve un objeto vacío', () => {
      expect(zoo.animalByName()).toEqual({});
    });

    it('con un nombre, devuelve el ejemplar y su especie', () => {
      expect(zoo.animalByName('Clay')).toEqual({
        name: 'Clay',
        sex: 'male',
        age: 4,
        species: 'giraffes',
      });
    });
  });

  describe('employeesByIds()', () => {
    it('sin parámetros, devuelve un array vacío', () => {
      expect(zoo.employeesByIds()).toEqual([]);
    });

    it('con un id, devuelve el empleado con ese id', () => {
      expect(zoo.employeesByIds(NIGEL.id)).toEqual([NIGEL]);
    });

    it('con un array de ids, devuelve los empleados con esos ids', () => {
      expect(zoo.employeesByIds([NIGEL.id, BURL.id])).toEqual([NIGEL, BURL]);
    });
  });

  describe('employeeByName()', () => {
    it('sin parámetros, devuelve un objeto vacío', () => {
      expect(zoo.employeeByName()).toEqual({});
    });

    it('con el nombre, devuelve el empleado', () => {
      expect(zoo.employeeByName('Emery')).toEqual(EMERY);
    });

    it('con el apellido, devuelve el empleado', () => {
      expect(zoo.employeeByName('Wishart')).toEqual(WILBURN);
    });
  });

  describe('managersForEmployee()', () => {
    it('con el id, devuelve el empleado con los nombres de sus responsables', () => {
      expect(zoo.managersForEmployee(EMERY.id)).toEqual({
        ...EMERY,
        managers: ['Stephanie Strauss'],
      });
    });

    it('con el nombre, devuelve el empleado con los nombres de sus responsables', () => {
      expect(zoo.managersForEmployee('Ardith')).toEqual({
        id: 'c1f50212-35a6-4ecd-8223-f835538526c2',
        firstName: 'Ardith',
        lastName: 'Azevado',
        managers: ['Emery Elser'],
        responsibleFor: [
          'e8481c1d-42ea-4610-8e11-1752cfc05a46',
          'baa6e93a-f295-44e7-8f70-2bcdc6f6948d',
        ],
      });
    });

    it('con el apellido, devuelve el empleado con los nombres de sus responsables', () => {
      expect(zoo.managersForEmployee('Wishart')).toEqual({
        ...WILBURN,
        managers: ['Burl Bethea', 'Ola Orloff'],
      });
    });
  });

  describe('employeeCoverage()', () => {
    it('sin parámetros, devuelve cada empleado con las especies a su cargo', () => {
      expect(zoo.employeeCoverage()).toEqual({
        'Nigel Nelson': ['lions', 'tigers'],
        'Burl Bethea': ['lions', 'tigers', 'bears', 'penguins'],
        'Ola Orloff': ['otters', 'frogs', 'snakes', 'elephants'],
        'Wilburn Wishart': ['snakes', 'elephants'],
        'Stephanie Strauss': ['giraffes'],
        'Sharonda Spry': ['otters', 'frogs'],
        'Ardith Azevado': ['tigers', 'bears'],
        'Emery Elser': ['elephants', 'bears', 'lions'],
      });
    });

    it('con el id, devuelve las especies a cargo de ese empleado', () => {
      expect(zoo.employeeCoverage('4b40a139-d4dc-4f09-822d-ec25e819a5ad')).toEqual({
        'Sharonda Spry': ['otters', 'frogs'],
      });
    });

    it('con el nombre, devuelve las especies a cargo de ese empleado', () => {
      expect(zoo.employeeCoverage('Stephanie')).toEqual({ 'Stephanie Strauss': ['giraffes'] });
    });

    it('con el apellido, devuelve las especies a cargo de ese empleado', () => {
      expect(zoo.employeeCoverage('Azevado')).toEqual({ 'Ardith Azevado': ['tigers', 'bears'] });
    });
  });
});
