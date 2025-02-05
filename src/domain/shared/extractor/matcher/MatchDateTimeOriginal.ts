import { match, Matcher } from 'domain/shared/utils/fp/PatternMatcher.js';
import { ExifDateTime } from 'exiftool-vendored';
import { DateTime } from 'luxon';

const isString: Matcher<string | ExifDateTime, DateTime> = [
  (value) => typeof value === 'string',
  (value) => DateTime.fromISO(value as string),
];
const isObject: Matcher<string | ExifDateTime, DateTime> = [
  (value) => typeof value === 'object' && value !== null,
  (value) => {
    const exif = value as ExifDateTime;
    return DateTime.fromObject({
      year: exif.year,
      month: exif.month,
      day: exif.day,
      hour: exif.hour,
      minute: exif.minute,
      second: exif.second,
    });
  },
];

const matchDateTimeOriginal = match<string | ExifDateTime, DateTime>(
  isString,
  isObject,
);

export { matchDateTimeOriginal };
