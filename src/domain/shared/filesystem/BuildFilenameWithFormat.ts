import { DateTime } from 'luxon';

const buildFilenameWithFormat = (
  date: DateTime,
  extension: string,
  type: string,
  format: string = '{type}_{date}-{time}{extension}',
): string =>
  format
    .replace('{type}', type)
    .replace('{date}', date.toFormat('yyyy_MM_dd'))
    .replace('{time}', date.toFormat('HH:mm:ss'))
    .replace('{extension}', extension);

export default buildFilenameWithFormat;
