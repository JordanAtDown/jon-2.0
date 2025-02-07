import { Option, none, alt, map } from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';
import { pipe } from 'fp-ts/lib/function.js';
import YearMonth from './YearMonth.js';

class CompiledDate {
  extraite: Option<DateTime>;
  dateTimeOriginal: Option<DateTime>;
  dateDictionnaire: Option<DateTime>;

  constructor(
    extraite: Option<DateTime> = none,
    dateTimeOriginal: Option<DateTime> = none,
    dateDictionnaire: Option<DateTime> = none,
  ) {
    this.extraite = extraite;
    this.dateTimeOriginal = dateTimeOriginal;
    this.dateDictionnaire = dateDictionnaire;
  }

  public getYearMonth(): Option<YearMonth> {
    return this.getFirstValidDate((dateTime) => ({
      year: dateTime.year,
      month: dateTime.month,
    }));
  }

  public getDate(): Option<DateTime> {
    return this.getFirstValidDate((dateTime) => dateTime);
  }

  private getFirstValidDate<T>(
    transform: (dateTime: DateTime) => T,
  ): Option<T> {
    return pipe(
      this.dateTimeOriginal,
      alt(() => this.extraite),
      alt(() => this.dateDictionnaire),
      map(transform),
    );
  }
}

export default CompiledDate;
