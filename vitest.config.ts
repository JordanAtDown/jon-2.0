import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8', // Utilisation du moteur de couverture V8 (rapide et natif)
      reporter: ['text', 'json', 'html'], // Formats de rapport de couverture
      exclude: ['node_modules/', 'tests/'], // Exclure les fichiers de test et dépendances
    },
  },
});
