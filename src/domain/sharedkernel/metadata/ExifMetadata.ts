import { DateTime } from 'luxon';

type ExifMetadata = {
  dateTimeOriginal?: DateTime;
  [property: string]: unknown;
};

export default ExifMetadata;
