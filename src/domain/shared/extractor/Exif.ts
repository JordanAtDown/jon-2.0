import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { exiftool } from 'exiftool-vendored';
import Extractor from './Extractor';
import { tryCatchTask } from '../utils/fp/FP';

const exif: Extractor = {
  extract: (filePath) =>
    pipe(
      tryCatchTask(() => exiftool.read(filePath)),
      TE.map((exif) => ({ exif })),
    ),
};

export default exif;
