import { describe, it, expect } from 'vitest';
import {
  DuplicateFile,
  DuplicateFiles,
} from '../../../domain/duplicate/DuplicateFiles.js';

describe('mergePaths', () => {
  it.each([
    {
      description: 'cas avec des chemins qui partagent un préfixe commun',
      input: [
        new DuplicateFile(
          '1',
          'photo1.jpg',
          'D:\\Parents\\Mes photos\\2023\\Vacances',
        ),
        new DuplicateFile(
          '2',
          'photo2.jpg',
          'D:\\Parents\\Mes photos\\2023\\Vacances\\Plage',
        ),
        new DuplicateFile(
          '3',
          'photo3.jpg',
          'D:\\Parents\\Mes photos\\2023\\Vacances\\Montagne',
        ),
      ],
      expected: 'D:/Parents/Mes photos/2023/Vacances/Plage/Montagne',
    },
    {
      description: 'cas avec un seul chemin',
      input: [new DuplicateFile('1', 'photo1.jpg', 'C:/Unique/Path/Here')],
      expected: 'C:/Unique/Path/Here',
    },
    {
      description: 'cas avec aucun chemin (liste vide)',
      input: [],
      expected: '',
    },
  ])('mergePaths - $description', ({ input, expected }) => {
    const myFiles = new DuplicateFiles(input);
    const result = myFiles.mergePaths();
    expect(result).toBe(expected);
  });
});
