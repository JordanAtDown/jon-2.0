import * as fs from 'fs';
import { validateCondition } from './CombineValidations.js';
import * as E from 'fp-ts/Either';
import EXTENSIONS from '../../../domain/shared/filesystem/Extensions.js';
import { validateFormat } from '../../../domain/shared/filesystem/BuildDirectoryPath.js';

const isDirectory = (path: string): boolean => {
  try {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
  } catch {
    return false;
  }
};

export type Validation<TYPE> = (input: TYPE) => E.Either<Error, TYPE>;

export const validateDirectoryExists = validateCondition<string>(
  `Le répertoire n'existe pas ou est inaccessible.`,
  (path) => isDirectory(path),
);

export const validateExtensions = validateCondition<string>(
  `Les extensions doivent être une liste correcte de clés supportées (comme MP4, MOV, IMAGE, VIDEO, etc.).`,
  (input) => {
    const allowedKeys = Object.keys(EXTENSIONS);
    return input
      .split(',')
      .map((key) => key.trim().toUpperCase())
      .every((key) => allowedKeys.includes(key));
  },
);

export const validateBatchSize = validateCondition<string>(
  'La taille du batch doit être un entier strictement positif.',
  (input) => {
    const batchSize = Number(input);
    return Number.isInteger(batchSize) && batchSize > 0;
  },
);

export const validateIdChekpoint = validateCondition<string>(
  "L'identifiant du checkpoint doit être une chaîne non vide.",
  (input) => input.trim().length > 0,
);

export const validateIsCSV = validateCondition<string>(
  `Le fichier doit être au format CSV.`,
  (filePath) => {
    try {
      if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
        return false;
      }
      return filePath.trim().toLowerCase().endsWith('.csv');
    } catch {
      return false;
    }
  },
);

export const validateFormatPath = validateCondition<string>(
  `Le format contient des placeholders invalides. Seuls YYYY, MM, TYPE et EXT sont autorisés.`,
  (format) => validateFormat(format),
);
