import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as path from 'path';
import { FileMetadata, MetadataExtractor } from './extractor';
import { isDirectory, readDirectory } from './filesystem.utils';
import * as fs from 'fs';

/**
 * Étape 1 : Valider que le chemin est un répertoire
 */
const validateDirectory = (directory: string): TE.TaskEither<Error, string> =>
  pipe(
    isDirectory(directory),
    TE.chain((isDir) =>
      isDir
        ? TE.right(directory)
        : TE.left(new Error(`${directory} is not a valid directory`)),
    ),
  );

/**
 * Étape 2 : Récupérer tous les fichiers (récursivement si nécessaire)
 */
export const findAllFilesRecursively = (
  directory: string,
): TE.TaskEither<Error, string[]> =>
  pipe(
    readDirectory(directory),
    TE.chain((entities) =>
      TE.sequenceArray(
        entities.map((entity) => {
          const fullPath = path.join(directory, entity);
          return pipe(
            isDirectory(fullPath),
            TE.chain((isDir) =>
              isDir ? findAllFilesRecursively(fullPath) : TE.right([fullPath]),
            ),
          );
        }),
      ),
    ),
    TE.map((nestedResults) => nestedResults.flat()),
  );

/**
 * Étape 3 : Extraire les métadonnées des fichiers
 */
const extractFilesMetadata = (
  files: string[],
  extractor: MetadataExtractor,
): TE.TaskEither<Error, FileMetadata[]> =>
  pipe(
    TE.sequenceArray(
      files.map((filePath) =>
        pipe(
          extractor.extract(filePath),
          TE.map((partialMetadata) => ({
            ...partialMetadata,
            name: path.basename(filePath),
            fullPath: filePath,
          })),
        ),
      ),
    ),
    TE.map((fileMetadataArray) => [...fileMetadataArray]), // Conversion vers un tableau mutable
  );

const saveMetadata = (
  filesMetadata: FileMetadata[],
): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      () => {
        filesMetadata.forEach((metadata) => {
          const jsonFilePath = `${metadata.fullPath}/${metadata.name}.metadata.json`;
          fs.writeFileSync(
            jsonFilePath,
            JSON.stringify(metadata, null, 2),
            'utf-8',
          );
        });
        return Promise.resolve();
      },
      (err) => new Error(`Failed to write metadata: ${err}`),
    ),
  );

/**
 * Méthode principale : Chaîne de validation, récupération et extraction
 */
export const extractMetadataWorkflow = (
  directory: string,
  extractor: MetadataExtractor,
): TE.TaskEither<Error, FileMetadata[]> =>
  pipe(
    validateDirectory(directory),
    TE.chain(findAllFilesRecursively),
    TE.chain((files) => extractFilesMetadata(files, extractor)),
    TE.chainFirst((filesMetadata) => saveMetadata(filesMetadata)),
  );
