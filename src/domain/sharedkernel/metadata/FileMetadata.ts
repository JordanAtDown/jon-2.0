import * as O from 'fp-ts/lib/Option.js';
import { fromNullable, isNone, none, Option, some } from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import path from 'path';
import { filter, map } from 'fp-ts/lib/Array.js';
import ExifMetadata from './ExifMetadata.js';
import { DateExtractor } from '../../shared/regex/DateExtractor.js';
import DateMetadata from './DateMetadata.js';
import CompiledDate from './CompiledDate.js';
import Tags from '../../shared/tag/Tags.js';

export class FileMetadata {
  filename: string;
  name: string;
  type: string;
  fullPath: string;
  directory: string;
  extension: string;
  exif?: ExifMetadata;

  constructor(
    filename: string,
    name: string,
    fullPath: string,
    directory: string,
    extension: string,
    type: string,
    exif?: ExifMetadata,
  ) {
    this.filename = filename;
    this.name = name;
    this.fullPath = fullPath;
    this.directory = directory;
    this.extension = extension;
    this.exif = exif;
    this.type = type;
  }

  public getTags(generate: (items: string[]) => Tags): Tags {
    return pipe(
      this.directory.split(path.sep),
      filter((segment) => segment.trim().length > 0),
      map((segment) => segment.trim()),
      generate,
    );
  }

  public enrichWithDate = (
    extractDateFn: DateExtractor,
  ): O.Option<DateMetadata> => {
    return pipe(
      O.fromNullable(this.exif?.dateTimeOriginal),
      O.alt(() => extractDateFn(this.name)),
      O.map((date) => {
        return {
          ...this,
          date,
        };
      }),
    );
  };

  public toCompiledDate(
    dateExtractorFn: DateExtractor,
    dateGeneratorFn: DateExtractor,
  ): Option<CompiledDate> {
    const extraite = dateExtractorFn(this.name);
    const dateTimeOriginal = fromNullable(this.exif?.dateTimeOriginal);
    const dateDictionnaire = dateGeneratorFn(this.name);

    if (
      isNone(extraite) &&
      isNone(dateTimeOriginal) &&
      isNone(dateDictionnaire)
    ) {
      return none;
    }

    return some(new CompiledDate(extraite, dateTimeOriginal, dateDictionnaire));
  }
}

export default FileMetadata;
