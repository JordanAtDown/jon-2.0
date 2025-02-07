import * as O from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import { DateTime } from 'luxon';
import { RegexDateExtractor } from './RegexDateExtractor.js';

const extractDate = (
  routes: RegexDateExtractor[],
  filename: string,
): O.Option<DateTime> =>
  pipe(
    routes.find((route) => route.regex.test(filename)),
    O.fromNullable,
    O.chain((route) => route.extractor(filename)),
  );

const isFilenameMatching = (
  routes: RegexDateExtractor[],
  filename: string,
): boolean => routes.some((route) => route.regex.test(filename));

export { extractDate, isFilenameMatching };
