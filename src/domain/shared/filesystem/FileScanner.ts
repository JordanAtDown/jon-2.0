import * as TE from 'fp-ts/TaskEither';

interface FileScanner {
  scanFiles: (
    path: string,
    patterns: string[],
  ) => TE.TaskEither<Error, string[]>;
}

export default FileScanner;
