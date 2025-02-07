import path from 'path';
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';

const buildDirectoryPath = (
  destDir: string,
  date: DateTime,
  filename: string,
): string =>
  pipe(
    getYearMonth(date),
    O.map(({ year, month }) => path.join(destDir, year, month, filename)),
    O.getOrElse(() => path.join(destDir, filename)),
  );

const getYearMonth = (
  date: DateTime,
): O.Option<{ year: string; month: string }> =>
  pipe(
    O.fromNullable(date),
    O.filter((d) => d.isValid),
    O.map((d) => ({
      year: d.year.toString(),
      month: d.month.toString().padStart(2, '0'),
    })),
  );

export { buildDirectoryPath };
