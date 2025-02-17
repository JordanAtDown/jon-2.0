import { pipe } from 'fp-ts/lib/function.js';
import * as RA from 'fp-ts/lib/ReadonlyArray.js';

export class DuplicateFile {
  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly folder: string,
  ) {}
}

export class DuplicateFiles {
  constructor(public readonly files: Array<DuplicateFile>) {}

  public mergePaths = (): string =>
    pipe(
      this.allFolders(),
      RA.map((folder) => folder.replace(/\\/g, '/')),
      RA.map((folder) => folder.split('/')),
      RA.reduce<Array<string>, Array<string>>([], (mergedPath, currentPath) =>
        pipe(mergedPath, (result) =>
          currentPath.reduce<Array<string>>((acc, segment, index) => {
            if (acc[index] !== segment) {
              return [...acc, segment];
            }
            return acc;
          }, result),
        ),
      ),
      (finalArray) => finalArray.join('/'),
    );

  private allFolders(): Array<string> {
    return pipe(
      this.files,
      RA.map((file) => file.folder),
      (folders) => [...folders],
    );
  }
}
