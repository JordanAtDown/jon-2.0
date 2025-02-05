import { DateTime } from 'luxon';
import { pipe } from 'fp-ts/function';
import { filter, fromNullable, map, Option } from 'fp-ts/Option';
import DateGenerator from '../../../domain/shared/tag/DateGenerator.js';

class HashDateGenerator implements DateGenerator {
  private readonly dictionary: Record<string, string>;

  constructor(dictionary: Record<string, string>) {
    this.dictionary = dictionary;
  }

  generate(item: string): Option<DateTime> {
    return pipe(
      fromNullable(this.dictionary[item]),
      map(DateTime.fromISO),
      filter((date) => date.isValid),
    );
  }
}

export default HashDateGenerator;
