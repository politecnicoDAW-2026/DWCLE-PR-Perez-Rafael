/**
 * Selector de tema: sistema, claro u oscuro.
 *
 * Esto NO es parte de la práctica: se entrega hecho y no hace falta tocarlo.
 * Se apoya en dos cosas del CSS:
 *   - sin `data-theme`, manda el sistema operativo (`prefers-color-scheme`);
 *   - con `data-theme="light"` o `"dark"` en <html>, manda la elección del usuario.
 *
 * La elección se guarda en localStorage. Ojo: en modo privado o con las cookies
 * bloqueadas, `localStorage` lanza al leer o al escribir; por eso van con try/catch.
 * La persistencia se estudia a fondo en la P6.
 */
const STORAGE_KEY = 'dwcle-p2-theme';
const THEMES = new Set(['system', 'light', 'dark']);

const LABELS = {
  es: { theme: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro' },
  en: { theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
};

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.has(stored) ? stored : 'system';
  } catch {
    return 'system'; // sin almacenamiento, se sigue con el del sistema
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // No poder guardar la preferencia no es motivo para romper la página
  }
};

/** 'system' quita el atributo y devuelve el mando al sistema operativo. */
export function applyTheme(theme) {
  if (theme === 'system') {
    delete document.documentElement.dataset.theme;
    return;
  }
  document.documentElement.dataset.theme = theme;
}

function translateSwitcher(select) {
  const labels = LABELS[document.documentElement.lang] ?? LABELS.es;

  select.previousElementSibling.textContent = labels.theme;
  for (const option of select.options) {
    option.textContent = labels[option.value];
  }
}

export function initThemeSwitcher() {
  const select = document.querySelector('#theme');
  if (!select) {
    return;
  }

  select.value = readStoredTheme();
  applyTheme(select.value);
  translateSwitcher(select);
  select.parentElement.hidden = false; // ya sabemos qué poner: se puede enseñar

  select.addEventListener('change', () => {
    applyTheme(select.value);
    storeTheme(select.value);
  });

  // La vista escribe el idioma en <html lang>: observarlo evita acoplar este
  // fichero con el resto de la aplicación (observadores, unidad 4).
  new MutationObserver(() => translateSwitcher(select)).observe(document.documentElement, {
    attributeFilter: ['lang'],
  });
}

initThemeSwitcher();
