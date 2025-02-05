import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import * as Either from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import fg from 'fast-glob';
import FileScanner from '../../../domain/shared/filesystem/FileScanner.js';
import { tryCatchTask } from '../../../domain/shared/utils/fp/FP.js';

const fastGlobScanner: FileScanner = {
  scanFiles: (rootPath, patterns) =>
    pipe(
      validatePath(rootPath),
      TE.chain(() => validatePatterns(patterns)),
      TE.chain(() => findFiles(rootPath, patterns)),
      TE.chain(handleEmptyResults),
    ),
};

const validatePath = (path: string): TE.TaskEither<Error, void> =>
  pipe(
    tryCatchTask(() => fs.access(path)),
    TE.mapLeft(() => new Error(`Le dossier spécifié n'existe pas : ${path}`)),
  );

const validatePatterns = (patterns: string[]): TE.TaskEither<Error, string[]> =>
  pipe(
    Either.fromPredicate(
      areValidPatterns,
      (invalidPattern) =>
        new Error(`Pattern glob invalide : ${invalidPattern}`),
    )(patterns),
    TE.fromEither,
  );

const areValidPatterns = (patterns: string[]): boolean =>
  !patterns.some((pattern) => /[\[\]](?![^[]*\])/.test(pattern));

const findFiles = (
  path: string,
  patterns: string[],
): TE.TaskEither<Error, string[]> =>
  tryCatchTask(() =>
    fg(patterns, {
      cwd: path,
      absolute: true,
      onlyFiles: true,
    }),
  );

const handleEmptyResults = (files: string[]): TE.TaskEither<Error, string[]> =>
  files.length === 0
    ? TE.left(new Error('Aucun fichier ne correspond aux patterns spécifiés.'))
    : TE.right(files);

export default fastGlobScanner;
