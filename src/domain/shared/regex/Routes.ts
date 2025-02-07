import * as O from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';
import { RegexDateExtractor } from './RegexDateExtractor.js';
import { pipe } from 'fp-ts/lib/function.js';
import { DateExtractor } from './DateExtractor.js';

const createRoute = (
  regex: RegExp,
  extractor: DateExtractor,
): RegexDateExtractor => ({
  regex,
  extractor,
});

type YYYYMMDDMatch = [string, string, string, string];

const regexImageOrVideoWithDateAndTime = /(IMG|VID|PANO)_([0-9]{8})_([0-9]{6})/;
const extractImageOrVideoWithDateAndTime: DateExtractor = (filename) => {
  const match = filename.match(regexImageOrVideoWithDateAndTime);
  return pipe(
    O.fromNullable(match),
    O.filter(
      (matches): matches is YYYYMMDDMatch =>
        matches.length === 4 && matches.every((matche) => matche !== undefined),
    ),
    O.map(([_, __, date, time]) =>
      DateTime.fromFormat(`${date}${time}`, 'yyyyMMddHHmmss'),
    ),
  );
};

const regexImageOrVideoWithDateAndShortTime =
  /(IMG|VID|PANO)_([0-9]{8})_([0-9]{4})/;
const extractImageOrVideoWithDateAndShortTime: DateExtractor = (filename) => {
  const match = filename.match(regexImageOrVideoWithDateAndShortTime);
  return pipe(
    O.fromNullable(match),
    O.filter(
      (matches): matches is YYYYMMDDMatch =>
        matches.length === 4 && matches.every((matche) => matche !== undefined),
    ),
    O.map(([_, __, date, time]) => {
      const year = date.substring(4, 8);
      const month = date.substring(2, 4);
      const day = date.substring(0, 2);
      return DateTime.fromFormat(
        `${year}${month}${day}${time}00`,
        'yyyyMMddHHmmss',
      );
    }),
  );
};

const regexImageOrVideoWithFullTimestamp = /(IMG|VID)_([0-9]{14})/;
const extractImageOrVideoWithFullTimestamp: DateExtractor = (filename) => {
  const match = filename.match(regexImageOrVideoWithFullTimestamp);
  return pipe(
    O.fromNullable(match),
    O.filter(
      (matches): matches is [string, string, string] =>
        matches.length === 3 && matches.every((matche) => matche !== undefined),
    ),
    O.map(([_, __, combined]) => {
      const date = combined.substring(0, 8);
      const time = combined.substring(8, 14);
      return DateTime.fromFormat(`${date}${time}`, 'yyyyMMddHHmmss');
    }),
  );
};

const regexGeneralDateAndTime =
  /([0-9]{8})_([0-9]{6})|^(Resized)_([0-9]{8})_([0-9]{6})/;
const extractGeneralDateAndTime: DateExtractor = (filename) => {
  const match = filename.match(regexGeneralDateAndTime);
  return pipe(
    O.fromNullable(match),
    O.map(([_, date1, time1, __, date2, time2]) => {
      const date = date1 || date2;
      const time = time1 || time2;
      return DateTime.fromFormat(`${date}${time}`, 'yyyyMMddHHmmss');
    }),
  );
};

const regexHyphenatedDateWithDotTime =
  /([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2})\.([0-9]{2})\.([0-9]{2})/;
const extractHyphenatedDateWithDotTime: DateExtractor = (filename) => {
  const match = filename.match(regexHyphenatedDateWithDotTime);
  return pipe(
    O.fromNullable(match),
    O.map(([_, date, hour, minute, second]) => {
      return DateTime.fromFormat(
        `${date}T${hour}:${minute}:${second}`,
        "yyyy-MM-dd'T'HH:mm:ss",
      );
    }),
  );
};

const regexDetailedPhotoOrVideoTimestamp =
  /(PHOTO|Photo|photo|VIDEO|Video|video)-([0-9]{4})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})/;
const extractDetailedPhotoOrVideoTimestamp: DateExtractor = (filename) => {
  const match = filename.match(regexDetailedPhotoOrVideoTimestamp);
  return pipe(
    O.fromNullable(match),
    O.map(([_, __, year, month, day, hour, minute, second]) =>
      DateTime.fromFormat(
        `${year}-${month}-${day}T${hour}:${minute}:${second}`,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
    ),
  );
};

const regexPhotoWithStructuredTimestamp =
  /(photo)_([0-9]{4})_([0-9]{2})_([0-9]{2})-([0-9]{2})_([0-9]{2})_([0-9]{2})/;
const extractPhotoWithStructuredTimestamp: DateExtractor = (filename) => {
  const match = filename.match(regexPhotoWithStructuredTimestamp);
  return pipe(
    O.fromNullable(match),
    O.map(([_, __, year, month, day, hour, minute, second]) =>
      DateTime.fromFormat(
        `${year}-${month}-${day}T${hour}:${minute}:${second}`,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
    ),
  );
};

const regexEuropeanStyleDateWithTime =
  /([0-9]{2})-([0-9]{2})-([0-9]{4}) ([0-9]{2})-([0-9]{2})-([0-9]{2})/;
const extractEuropeanStyleDateWithTime: DateExtractor = (filename) => {
  const match = filename.match(regexEuropeanStyleDateWithTime);
  return pipe(
    O.fromNullable(match),
    O.map(([_, day, month, year, hour, minute, second]) =>
      DateTime.fromFormat(
        `${year}-${month}-${day}T${hour}:${minute}:${second}`,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
    ),
  );
};

const routes: RegexDateExtractor[] = [
  createRoute(
    regexImageOrVideoWithDateAndTime,
    extractImageOrVideoWithDateAndTime,
  ),
  createRoute(
    regexImageOrVideoWithDateAndShortTime,
    extractImageOrVideoWithDateAndShortTime,
  ),
  createRoute(
    regexImageOrVideoWithFullTimestamp,
    extractImageOrVideoWithFullTimestamp,
  ),
  createRoute(regexGeneralDateAndTime, extractGeneralDateAndTime),
  createRoute(regexHyphenatedDateWithDotTime, extractHyphenatedDateWithDotTime),
  createRoute(
    regexDetailedPhotoOrVideoTimestamp,
    extractDetailedPhotoOrVideoTimestamp,
  ),
  createRoute(
    regexPhotoWithStructuredTimestamp,
    extractPhotoWithStructuredTimestamp,
  ),
  createRoute(regexEuropeanStyleDateWithTime, extractEuropeanStyleDateWithTime),
];

export default routes;
