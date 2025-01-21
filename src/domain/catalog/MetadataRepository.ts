import * as TE from 'fp-ts/TaskEither';
import Metadata from './Metadata';
import YearMonth from './YearMonth';

export interface MetadataRepository {
  getAllUniqueYearsMonths(): TE.TaskEither<Error, Array<YearMonth>>;
  findByYearMonth(yearMonth: YearMonth): TE.TaskEither<Error, Metadata[]>;
}

export default MetadataRepository;
