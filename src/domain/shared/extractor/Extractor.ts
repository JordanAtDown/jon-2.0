import * as TE from 'fp-ts/TaskEither';
import FileMetadata from '../../restore/FileMetadata';

interface Extractor {
  extract: (filePath: string) => TE.TaskEither<Error, Partial<FileMetadata>>;
}

export default Extractor;
