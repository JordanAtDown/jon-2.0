import { ExifProperty, ExifValue } from './ExifProperty.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { exiftool } from 'exiftool-vendored';

const createExifData = (
  exifProperties: ExifProperty<any>[],
): Record<string, ExifValue> => {
  return exifProperties.reduce(
    (acc, property) => {
      const value = property.getValue();

      if (value !== null) {
        acc[property.propertyName] = value;
      }

      return acc;
    },
    {} as Record<string, ExifValue>,
  );
};

const writeExifData = (
  filePath: string,
  exifData: Record<string, ExifValue>,
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.tryCatch(
      () =>
        exiftool.write(filePath, exifData, {
          writeArgs: ['-overwrite_original'],
        }),
      (reason) => new Error(`FAILED_EXIF_WRITE: ${reason}`),
    ),
    TE.map(() => void 0),
  );
};

const exifApplyTo = (
  filePath: string,
  exifProperties: ExifProperty<any>[],
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.of(createExifData(exifProperties)),
    TE.chain((exifData) => writeExifData(filePath, exifData)),
  );
};

export default exifApplyTo;
