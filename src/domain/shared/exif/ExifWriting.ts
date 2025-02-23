import { ExifProperty, ExifValue } from './ExifProperty.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import Logger from '../../../presentation/commands/utils/Logger.js';
import { ExifTool } from 'exiftool-vendored';

let maxProcs = 3;

const setMaxProcs = (newMaxProcs: number): void => {
  Logger.verbose(`Setting max procs to ${newMaxProcs}`);
};

const exiftoolCustom = new ExifTool({ maxProcs: maxProcs });

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
      () => {
        Logger.verbose(
          `START_EXIF_WRITE: Writing EXIF data to file ${filePath} with data ${JSON.stringify(exifData)}`,
        );
        return exiftoolCustom.write(filePath, exifData, {
          writeArgs: ['-overwrite_original'],
        });
      },
      (reason) => {
        Logger.error(
          `FAILED_EXIF_WRITE: on file ${filePath} with exif ${JSON.stringify(exifData)}`,
        );
        console.error(
          `FAILED_EXIF_WRITE: on file ${filePath} with exif ${exifData}`,
        );
        return new Error(`FAILED_EXIF_WRITE: ${reason}`);
      },
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

export { exifApplyTo, setMaxProcs };
