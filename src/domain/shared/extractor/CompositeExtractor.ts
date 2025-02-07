import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as path from 'path';
import Extractor from './Extractor.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import { getTypeFromExtension } from '../filesystem/Type.js';

const compositeExtractor =
  (extractors: Extractor[]) =>
  (filePath: string): TE.TaskEither<Error, FileMetadata> => {
    const standarMetadata = extractStandardMetadata(filePath);

    return pipe(
      TE.sequenceArray(
        extractors.map((extractor) => extractor.extract(filePath)),
      ),
      TE.map((results) =>
        results.reduce<FileMetadata>((acc, metadata) => {
          Object.assign(acc, metadata);
          return acc;
        }, standarMetadata),
      ),
    );
  };

const extractStandardMetadata = (filePath: string): FileMetadata => {
  const parsedPath = path.parse(filePath);

  return new FileMetadata(
    parsedPath.base,
    parsedPath.name,
    filePath,
    parsedPath.dir,
    parsedPath.ext,
    getTypeFromExtension(parsedPath.ext),
  );
};

export default compositeExtractor;
