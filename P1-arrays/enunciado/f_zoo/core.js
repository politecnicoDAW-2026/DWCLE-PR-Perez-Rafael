// El zoo: combina map, filter, reduce, find, some y every sobre los datos de data.js.
// No modifiques data.js: todas las funciones deben devolver datos nuevos.
// En otras palabras: cada función crea un nuevo resultado, pero no toca el array original.
import { animals, employees, hours, prices } from './data.js';

// -----------------------------------------------------------------------------
// Helpers: pequeñas funciones que reutilizamos en varias partes.
// -----------------------------------------------------------------------------

// normalizeList(): recibe 1 valor o un array y siempre devuelve un array.
// Ejemplo: "abc" -> ["abc"] ; [1,2,3] -> [1,2,3]
const normalizeList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// employeeName(): junta nombre y apellido para tener texto legible.
// Ejemplo: { firstName: 'Emery', lastName: 'Elser' } -> 'Emery Elser'
const employeeName = (employee) => `${employee.firstName} ${employee.lastName}`;

// findAnimalById(): busca una especie concreta por su id.
const findAnimalById = (id) => animals.find((animal) => animal.id === id);

// findEmployeeById(): busca un empleado concreto por su id.
const findEmployeeById = (id) => employees.find((employee) => employee.id === id);

// findEmployeeByName(): busca al empleado por nombre, apellido o nombre completo.
// Es útil porque en algunos ejercicios el dato llega por id y en otros por texto.
const findEmployeeByName = (value) => {
  if (!value) return null;

  const search = String(value).toLowerCase();

  return (
    employees.find(
      (employee) =>
        employee.id === search ||
        employee.firstName.toLowerCase() === search ||
        employee.lastName.toLowerCase() === search ||
        employeeName(employee).toLowerCase() === search,
    ) ?? null
  );
};

// -----------------------------------------------------------------------------
// 1) entryCalculator(): calcula el precio total de la entrada.
// -----------------------------------------------------------------------------
export function entryCalculator(entrants = {}) {
  // Si no hay personas, no hay gasto: total 0.
  if (!entrants || Object.keys(entrants).length === 0) {
    return 0;
  }

  // Object.entries() convierte un objeto en pares [clave, valor].
  // Por ejemplo: { Adult: 2, Child: 3 } -> [['Adult', 2], ['Child', 3]]
  // Después usamos reduce para ir sumando el total.
  return Object.entries(entrants).reduce((total, [type, qty]) => {
    const count = Number(qty) || 0;
    const price = prices[type] ?? 0;
    return total + count * price;
  }, 0);
}

// -----------------------------------------------------------------------------
// 2) schedule(): devuelve el horario del zoo.
// -----------------------------------------------------------------------------
export function schedule(dayName) {
  // toClock() transforma una hora del tipo 18 en '6pm'.
  // Así el horario queda en formato más natural para leer.
  const toClock = (value) => {
    const hour = Number(value);
    if (hour === 0) return '12am';
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return '12pm';
    return `${hour - 12}pm`;
  };

  // Object.entries(hours) nos da cada día y su horario.
  // Con reduce, construimos un objeto final con texto legible.
  const fullSchedule = Object.entries(hours).reduce((result, [day, hoursData]) => {
    const isClosed = hoursData.open === 0 && hoursData.close === 0;
    result[day] = isClosed ? 'CLOSED' : `Open from ${toClock(hoursData.open)} until ${toClock(hoursData.close)}`;
    return result;
  }, {});

  // Si no se pide un día concreto, devolvemos todo el calendario.
  if (!dayName) {
    return fullSchedule;
  }

  // Si sí se pide un día concreto, buscamos ese nombre y devolvemos solo ese caso.
  const foundDay = Object.keys(fullSchedule).find(
    (day) => day.toLowerCase() === String(dayName).toLowerCase(),
  );

  return foundDay ? { [foundDay]: fullSchedule[foundDay] } : {};
}

// -----------------------------------------------------------------------------
// 3) animalCount(): cuenta cuántos animales hay por especie.
// -----------------------------------------------------------------------------
export function animalCount(species) {
  // Si no pasamos especie, devolvemos un objeto con todas las especies y su total.
  // Reduce va sumando 1 por cada animal en cada especie.
  if (!species) {
    return animals.reduce((countMap, animal) => {
      countMap[animal.name] = animal.residents.length;
      return countMap;
    }, {});
  }

  // Si pedimos una especie concreta, buscamos esa especie y devolvemos su número.
  const target = String(species).toLowerCase();
  const animal = animals.find((item) => item.name.toLowerCase() === target);
  return animal ? animal.residents.length : 0;
}

// -----------------------------------------------------------------------------
// 4) animalMap(): agrupa animales por zona.
// -----------------------------------------------------------------------------
export function animalMap(options = {}) {
  // options puede traer includeNames y sex.
  // includeNames = true -> queremos también los nombres de los animales, no solo la especie.
  const { includeNames = false, sex } = options;

  // Primera versión: simplemente agrupamos nombres de especies según la zona.
  // Resultado esperado: { NE: ['lions', 'giraffes'], ... }
  const byLocation = animals.reduce((grouped, animal) => {
    if (!grouped[animal.location]) {
      grouped[animal.location] = [];
    }

    grouped[animal.location].push(animal.name);
    return grouped;
  }, {});

  if (!includeNames) {
    return byLocation;
  }

  // Segunda versión: cada zona tiene un array de objetos.
  // Ejemplo: { NE: [{ lions: ['Zena', 'Maxwell'] }, { giraffes: [...] }] }
  return animals.reduce((grouped, animal) => {
    if (!grouped[animal.location]) {
      grouped[animal.location] = [];
    }

    const names = animal.residents
      .filter((resident) => (!sex ? true : resident.sex.toLowerCase() === String(sex).toLowerCase()))
      .map((resident) => resident.name);

    grouped[animal.location].push({ [animal.name]: names });
    return grouped;
  }, {});
}

// -----------------------------------------------------------------------------
// 5) animalPopularity(): agrupa especies por su nivel de popularidad.
// -----------------------------------------------------------------------------
export function animalPopularity(rating) {
  // Aquí usamos reduce para crear grupos por popularidad.
  // Resultado: { 2: ['frogs'], 3: ['snakes'], 4: ['lions', ...] }
  const grouped = animals.reduce((result, animal) => {
    if (!result[animal.popularity]) {
      result[animal.popularity] = [];
    }

    result[animal.popularity].push(animal.name);
    return result;
  }, {});

  // Si no se pasa una puntuación, devolvemos el mapa completo.
  // Si sí se pasa, devolvemos solo esas especies con esa popularidad.
  if (rating === undefined) {
    return grouped;
  }

  return grouped[Number(rating)] ?? [];
}

// -----------------------------------------------------------------------------
// 6) animalsByIds(): devuelve animales cuando le pasas un id o varios.
// -----------------------------------------------------------------------------
export function animalsByIds(ids) {
  // normaliza los datos para que el código siempre trabaje con un array.
  const list = normalizeList(ids);

  if (list.length === 0) {
    return [];
  }

  // flatMap() es útil porque cada id puede devolver 0 o 1 animal.
  // Si encontramos varios, los junta en un solo array.
  return list.flatMap((id) => animals.filter((animal) => animal.id === id));
}

// -----------------------------------------------------------------------------
// 7) animalByName(): busca a un animal concreto por su nombre.
// -----------------------------------------------------------------------------
export function animalByName(animalName) {
  // Si no llega nada, devolvemos un objeto vacío.
  if (!animalName) {
    return {};
  }

  const target = String(animalName).toLowerCase();

  // Recorremos todas las especies y luego también los residentes de cada especie.
  // Esto es importante porque el nombre buscado puede ser el nombre del animal (por ejemplo Clay),
  // no el nombre de la especie (por ejemplo giraffes).
  for (const animal of animals) {
    const resident = animal.residents.find((item) => item.name.toLowerCase() === target);
    if (resident) {
      return {
        name: resident.name,
        sex: resident.sex,
        age: resident.age,
        species: animal.name,
      };
    }
  }

  return {};
}

// -----------------------------------------------------------------------------
// 8) employeesByIds(): igual que con los animales, pero con empleados.
// -----------------------------------------------------------------------------
export function employeesByIds(ids) {
  const list = normalizeList(ids);

  if (list.length === 0) {
    return [];
  }

  return list.flatMap((id) => employees.filter((employee) => employee.id === id));
}

// -----------------------------------------------------------------------------
// 9) employeeByName(): busca un empleado por nombre, apellido o nombre completo.
// -----------------------------------------------------------------------------
export function employeeByName(employeeName) {
  // Si no llega nada, no hay empleado que buscar.
  if (!employeeName) {
    return {};
  }

  const target = String(employeeName).toLowerCase();
  const employee = employees.find(
    (item) =>
      item.firstName.toLowerCase() === target ||
      item.lastName.toLowerCase() === target ||
      `${item.firstName} ${item.lastName}`.toLowerCase() === target,
  );

  return employee ?? {};
}

// -----------------------------------------------------------------------------
// 10) managersForEmployee(): cambia los ids de los managers por nombres reales.
// -----------------------------------------------------------------------------
export function managersForEmployee(idOrName) {
  // Primero localizamos al empleado usando id o nombre.
  const employee = findEmployeeById(idOrName) ?? findEmployeeByName(idOrName);

  if (!employee) {
    return {};
  }

  // Cada manager en employee.managers es un id, así que lo transformamos en texto humano.
  const managers = employee.managers.map((managerId) => {
    const manager = findEmployeeById(managerId);
    return manager ? employeeName(manager) : managerId;
  });

  return {
    ...employee,
    managers,
  };
}

// -----------------------------------------------------------------------------
// 11) employeeCoverage(): dice qué especies tiene cada empleado a su cargo.
// -----------------------------------------------------------------------------
export function employeeCoverage(idOrName) {
  // Si no se pasa nada, devolvemos todo el mapa global.
  // Aquí employee.responsibleFor contiene los ids de especies que ese empleado cuida.
  if (idOrName === undefined || idOrName === null || idOrName === '') {
    return employees.reduce((result, employee) => {
      result[employeeName(employee)] = employee.responsibleFor
        .map((animalId) => findAnimalById(animalId))
        .filter(Boolean)
        .map((animal) => animal.name);

      return result;
    }, {});
  }

  // Si se pasa un id o nombre, devolvemos solo ese empleado concreto.
  const employee = findEmployeeById(idOrName) ?? findEmployeeByName(idOrName);

  if (!employee) {
    return {};
  }

  return {
    [employeeName(employee)]: employee.responsibleFor
      .map((animalId) => findAnimalById(animalId))
      .filter(Boolean)
      .map((animal) => animal.name),
  };
}
