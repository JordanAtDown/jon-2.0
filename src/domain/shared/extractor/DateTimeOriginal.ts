import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { exiftool } from 'exiftool-vendored';
import Extractor from './Extractor.js';
import { filterDefinedKeys, tryCatchTask } from '../utils/fp/FP.js';
import getDateTimeOriginal from './matcher/GetDateTimeOriginal.js';
import ExifMetadata from '../../sharedkernel/metadata/ExifMetadata.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';

const dateTimeOriginal: Extractor = {
  extract: (filePath: string) =>
    pipe(
      tryCatchTask(() => exiftool.read(filePath)),
      TE.map((exifData) => ({
        dateTimeOriginal: getDateTimeOriginal(exifData.DateTimeOriginal),
      })),
      TE.map((exif) => filterDefinedKeys<ExifMetadata>(exif)),
      TE.map(
        (exifMetadata) => ({ exif: exifMetadata }) as Partial<FileMetadata>,
      ),
    ),
};

export default dateTimeOriginal;
