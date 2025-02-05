import { DateTime } from 'luxon';
import FileMetadata from './FileMetadata.js';

type DateMetadata = FileMetadata & {
  date: DateTime;
};

export default DateMetadata;
