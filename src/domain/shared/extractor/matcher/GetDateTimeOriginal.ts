import { ExifDateTime } from 'exiftool-vendored';
import { DateTime } from 'luxon';
import { pipe } from 'fp-ts/lib/function.js';
import { match } from 'fp-ts/lib/Option.js';
import { matchDateTimeOriginal } from './MatchDateTimeOriginal.js';

const getDateTimeOriginal = (
  dateTimeOriginal: string | ExifDateTime | undefined,
): DateTime | undefined =>
  dateTimeOriginal
    ? pipe(
        matchDateTimeOriginal(dateTimeOriginal),
        match(
          () => undefined,
          (value) => value,
        ),
      )
    : undefined;

export default getDateTimeOriginal;
