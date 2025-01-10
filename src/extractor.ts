import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as path from 'path';
import * as exifr from 'exifr';
import { tryCatchTask } from './fp.utils';

export interface MetadataExtractor {
  extract: (filePath: string) => TE.TaskEither<Error, Partial<FileMetadata>>;
}

export type FileMetadata = {
  name: string;
  fullPath: string;
  extension?: string;
  [key: string]: unknown; // Permet de stocker d'autres données
};

// Extracteur standard de métadonnées
export const standardExtractor: MetadataExtractor = {
  extract: (filePath) =>
    TE.right({
      name: path.parse(filePath).name,
      fullPath: path.dirname(filePath),
      extension: path.extname(filePath),
    }),
};

// Extracteur EXIF
export const exifExtractor: MetadataExtractor = {
  extract: (filePath) =>
    pipe(
      tryCatchTask(() => exifr.parse(filePath)),
      TE.map((exifData) => ({
        exif: exifData,
      })),
    ),
};

// Combinaison d'extracteurs en un seul
export const compositeExtractor = (
  extractors: MetadataExtractor[],
): MetadataExtractor => ({
  extract: (filePath) =>
    pipe(
      TE.sequenceArray(
        extractors.map((extractor) => extractor.extract(filePath)),
      ),
      TE.map((results) =>
        results.reduce((acc, metadata) => ({ ...acc, ...metadata }), {}),
      ),
    ),
});
