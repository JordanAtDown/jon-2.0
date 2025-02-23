import path from 'path';
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';

/**
 * Generates a custom file path based on a provided format string.
 *
 * This function constructs a file path by replacing placeholders in the provided format string
 * (e.g., "YYYY/MM/TYPE") with actual values derived from the file's metadata, such as date, type,
 * and extension. The placeholders supported are as follows:
 *
 * - `YYYY`: The year extracted from the file's date.
 * - `MM`: The month (zero-padded) extracted from the file's date.
 * - `TYPE`: A string representing the type of the file.
 * - `EXT`: The file's extension (e.g., "jpg", "png").
 *
 * If the file's date is invalid, the function falls back to placing the file directly in the `destDir`.
 *
 * @param destDir - The base destination directory where the file will be stored.
 * @param file - An object containing metadata about the file:
 *   - `date` - A `DateTime` object (from Luxon) representing the file's date.
 *   - `type` - A string indicating the type of the file (e.g., "image").
 *   - `extension` - The file's extension (e.g., "jpg", "png").
 * @param format - A customizable string that defines the desired directory structure.
 *   You can use placeholders (`YYYY`, `MM`, `TYPE`, `EXT`) to control the generated structure.
 *   Example formats:
 *     - `"YYYY/MM"`: Groups files by year and month.
 *     - `"YYYY/MM/TYPE"`: Groups files by year, month, and type.
 *     - `"TYPE/YYYY/MM"`: Groups files by type, year, and month.
 *     - `"YYYY/MM/EXT"`: Groups files by year, month, and file extension.
 * @param filename - The name of the file to be saved.
 *
 * @returns The fully constructed file path as a string.
 * If the file's date is invalid, the path will default to placing the file directly in the `destDir`.
 */
const buildDirectoryPath = (
  destDir: string,
  file: { date: DateTime; type: string; extension: string },
  filename: string,
  format: string = 'YYYY/MM',
): string =>
  pipe(
    getYearMonth(file.date),
    O.map(({ year, month }) =>
      buildCustomPath(
        destDir,
        year,
        month,
        file.type,
        file.extension,
        format,
        filename,
      ),
    ),
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

/**
 * Validates a format string to ensure it only contains allowed placeholders.
 *
 * The following placeholders are considered valid:
 * - `YYYY` for year
 * - `MM` for month
 * - `TYPE` for file type
 * - `EXT` for file extension
 *
 * Any other placeholders or invalid characters will cause the validation to fail.
 *
 * @param format - The format string to validate (e.g., "YYYY/MM/TYPE").
 * @returns `true` if the format is valid, `false` otherwise.
 */
const validateFormat = (format: string): boolean => {
  const allowedPlaceholders = ['YYYY', 'MM', 'TYPE', 'EXT'];

  const formatPlaceholders = format.match(/\b([A-Z]+)\b/g) || [];

  return formatPlaceholders.every((placeholder) =>
    allowedPlaceholders.includes(placeholder),
  );
};

const buildCustomPath = (
  destDir: string,
  year: string,
  month: string,
  type: string,
  extension: string,
  format: string,
  filename: string,
): string => {
  const customPath = format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('TYPE', type.toUpperCase())
    .replace('EXT', extension.replace(/^\./, '').toUpperCase());

  return path.join(destDir, customPath, filename);
};

export { buildDirectoryPath, validateFormat };
