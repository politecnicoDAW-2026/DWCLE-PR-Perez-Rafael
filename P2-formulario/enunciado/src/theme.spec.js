import { beforeEach, describe, expect, it, vi } from 'vitest';
import html from './index.html?raw';
import { applyTheme, initThemeSwitcher } from './theme.js';

const STORAGE_KEY = 'dwcle-p2-theme';

const select = () => document.querySelector('#theme');

const choose = (value) => {
  select().value = value;
  select().dispatchEvent(new Event('change'));
};

describe('Selector de tema', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.lang = 'es';
    document.body.innerHTML = html;
  });

  it('sin preferencia guardada, manda el sistema operativo', () => {
    initThemeSwitcher();

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(select().value).toBe('system');
  });

  it('aplica la preferencia guardada al arrancar', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    initThemeSwitcher();

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(select().value).toBe('light');
  });

  it('elegir un tema lo aplica y lo guarda', () => {
    initThemeSwitcher();
    choose('dark');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('volver a "sistema" quita el atributo y devuelve el mando al sistema', () => {
    initThemeSwitcher();
    choose('dark');
    choose('system');

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('un valor guardado que no existe no rompe nada', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');
    initThemeSwitcher();

    expect(select().value).toBe('system');
  });

  it('si localStorage falla, la página sigue funcionando', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('almacenamiento bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('almacenamiento bloqueado');
    });

    expect(() => initThemeSwitcher()).not.toThrow();
    expect(() => choose('dark')).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('dark');

    vi.restoreAllMocks();
  });

  it('el selector se muestra solo cuando ya sabe qué tema toca', () => {
    expect(select().parentElement.hidden).toBe(true);
    initThemeSwitcher();
    expect(select().parentElement.hidden).toBe(false);
  });

  it('sus textos siguen al idioma de la página', async () => {
    initThemeSwitcher();
    expect(select().options[0].textContent).toBe('Sistema');

    // La vista escribe el idioma en <html lang>; theme.js lo observa
    document.documentElement.lang = 'en';
    await vi.waitFor(() => expect(select().options[0].textContent).toBe('System'));
    expect(document.querySelector('label[for="theme"]').textContent).toBe('Theme');
  });
});

describe('applyTheme', () => {
  it('pone y quita el atributo data-theme', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    applyTheme('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
