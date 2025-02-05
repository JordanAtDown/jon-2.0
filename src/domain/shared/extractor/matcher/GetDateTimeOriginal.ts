import { ExifDateTime } from 'exiftool-vendored';
import { DateTime } from 'luxon';
import { pipe } from 'fp-ts/function';
import { match } from 'fp-ts/Option';
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
