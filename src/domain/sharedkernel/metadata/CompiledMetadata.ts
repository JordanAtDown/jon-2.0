import CompiledDate from './CompiledDate.js';
import Tags from '../../shared/tag/Tags.js';

class CompiledMetadata {
  fullPath: string;
  tags: Tags;
  year: number;
  month: number;
  hasExif: boolean;
  date: CompiledDate;
  extension: string;
  type: string;

  constructor(
    fullPath: string,
    tags: Tags,
    year: number,
    month: number,
    hasExif: boolean,
    date: CompiledDate,
    extension: string,
    type: string,
  ) {
    this.fullPath = fullPath;
    this.tags = tags;
    this.year = year;
    this.month = month;
    this.hasExif = hasExif;
    this.date = date;
    this.extension = extension;
    this.type = type;
  }
}

export default CompiledMetadata;
