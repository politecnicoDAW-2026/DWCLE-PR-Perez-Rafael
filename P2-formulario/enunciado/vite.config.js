import { defineConfig } from 'vitest/config';

export default defineConfig({
  // El código vive en src/: index.html es la entrada y las rutas se resuelven desde ahí
  root: 'src',
  cacheDir: '../node_modules/.vite', // sin esto Vite crea src/node_modules
  build: { outDir: '../dist', emptyOutDir: true },
  test: {
    environment: 'jsdom', // DOM simulado, por si quieres probar también las vistas
    include: ['**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // lcov: el formato que lee SonarQube
      reportOnFailure: true, // cobertura también con tests en rojo: SonarQube tiene datos desde el primer día
      // Todo el código cuenta, también el que ningún test importa
      include: ['**/*.js'],
      exclude: ['**/*.spec.js'],
      // Mínimo en la lógica: por debajo, `npm run test:coverage` (y por tanto `check`) falla
      thresholds: {
        'models/**': { lines: 70, functions: 70, branches: 70, statements: 70 },
        'services/**': { lines: 70, functions: 70, branches: 70, statements: 70 },
      },
      reportsDirectory: '../coverage',
    },
  },
});
