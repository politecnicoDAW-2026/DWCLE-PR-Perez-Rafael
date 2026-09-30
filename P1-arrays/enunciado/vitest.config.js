import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.spec.js'],
    exclude: ['node_modules/**', 'apps/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // lcov: el formato que lee SonarQube
      reportOnFailure: true, // cobertura también con tests en rojo: SonarQube tiene datos desde el primer día
      // Mínimo en la lógica: por debajo, `npm run test:coverage` (y por tanto `check`) falla
      thresholds: {
        '*/core.js': { lines: 70, functions: 70, branches: 70, statements: 70 },
      },
      include: ['*/core.js'],
    },
  },
});
