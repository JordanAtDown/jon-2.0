import * as TE from 'fp-ts/lib/TaskEither.js';
import YearMonth from '../sharedkernel/metadata/YearMonth.js';
import CompiledMetadata from '../sharedkernel/metadata/CompiledMetadata.js';
import { NumberPage } from '../../tests/infra/utils/LokiJSBaseRepository.js';

export type FilterCompiledMetadata = {
  id?: string;
};

export interface MetadataRepository {
  getAllUniqueYearsMonths(): TE.TaskEither<Error, Array<YearMonth>>;
  findByYearMonth(
    yearMonth: YearMonth,
  ): TE.TaskEither<Error, CompiledMetadata[]>;
  getTotalBy(
    filter: FilterCompiledMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, NumberPage>;
  getPageBy(
    filter: FilterCompiledMetadata,
    page: number,
    pageSize: number,
  ): TE.TaskEither<Error, Array<CompiledMetadata>>;
}

export default MetadataRepository;
