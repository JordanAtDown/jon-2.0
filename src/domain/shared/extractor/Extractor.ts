import * as TE from 'fp-ts/lib/TaskEither.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';

interface Extractor {
  extract: (filePath: string) => TE.TaskEither<Error, Partial<FileMetadata>>;
}

export default Extractor;
