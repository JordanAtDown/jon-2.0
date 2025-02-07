import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { exiftool } from 'exiftool-vendored';
import Extractor from './Extractor.js';
import { filterDefinedKeys, tryCatchTask } from '../utils/fp/FP.js';
import getDateTimeOriginal from './matcher/GetDateTimeOriginal.js';
import ExifMetadata from '../../sharedkernel/metadata/ExifMetadata.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';

const exif: Extractor = {
  extract: (filePath) =>
    pipe(
      tryCatchTask(() => exiftool.read(filePath)),
      TE.map((exifData) => ({
        dateTimeOriginal: getDateTimeOriginal(exifData.DateTimeOriginal),
        ...exifData,
      })),
      TE.map((exif) => filterDefinedKeys<ExifMetadata>(exif)),
      TE.map(
        (exifMetadata) => ({ exif: exifMetadata }) as Partial<FileMetadata>,
      ),
    ),
};

export default exif;
