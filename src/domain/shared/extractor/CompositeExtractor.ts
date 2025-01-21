import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as path from 'path';
import Extractor from './Extractor';
import FileMetadata from '../../restore/FileMetadata';

const compositeExtractor =
  (extractors: Extractor[]) =>
  (filePath: string): TE.TaskEither<Error, FileMetadata> =>
    pipe(
      TE.sequenceArray(
        extractors.map((extractor) => extractor.extract(filePath)),
      ),
      TE.map((results) =>
        results.reduce<FileMetadata>(
          (acc, metadata) => ({ ...acc, ...metadata }),
          extractStandardMetadata(filePath),
        ),
      ),
    );

const extractStandardMetadata = (filePath: string): FileMetadata => ({
  name: path.parse(filePath).name,
  fullPath: path.dirname(filePath),
  extension: path.extname(filePath),
});

export default compositeExtractor;
