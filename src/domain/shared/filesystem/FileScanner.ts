import * as TE from 'fp-ts/lib/TaskEither.js';

interface FileScanner {
  scanFiles: (
    path: string,
    patterns: string[],
  ) => TE.TaskEither<Error, string[]>;
}

export default FileScanner;
