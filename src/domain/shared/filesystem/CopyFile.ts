import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { promises as fs } from 'fs';
import * as path from 'path';

const copyFile = (
  sourcePath: string,
  destinationDirectory: string,
): TE.TaskEither<Error, string> => {
  return pipe(
    TE.tryCatch(
      async () => {
        const fileName = path.basename(sourcePath);
        const destinationPath = path.join(destinationDirectory, fileName);
        await fs.mkdir(destinationDirectory, { recursive: true });
        await fs.copyFile(sourcePath, destinationPath);
        return destinationPath;
      },
      (error) => new Error(`Error while copying: ${String(error)}`),
    ),
  );
};

export default copyFile;
