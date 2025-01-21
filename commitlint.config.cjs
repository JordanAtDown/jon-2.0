module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nouvelle fonctionnalité
        'fix', // Correction de bug
        'chore', // Maintenance
        'docs', // Documentation
        'style', // Changements de style (indentation, etc.)
        'refactor', // Refactorisation du code sans changement de comportement
        'test', // Ajout ou modification de tests
        'ci', // Only for CI configuration
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'], // Sujet capitalisé
    'header-max-length': [2, 'always', 100], // Limite de 100 caractères par message
  },
};
