import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { exiftool } from 'exiftool-vendored';

const applyExifKeywords = (
  filePath: string,
  tags: string[],
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.tryCatch(
      async () => {
        await exiftool.write(filePath, { Keywords: tags });
      },
      (error) =>
        new Error(`Error while writing exif keywords: ${String(error)}`),
    ),
    TE.map(() => void 0),
  );
};

export default applyExifKeywords;
