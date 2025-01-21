import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import MetadataRepository from '../../domain/catalog/MetadataRepository';
import YearMonth from '../../domain/catalog/YearMonth';
import Metadata from '../../domain/catalog/Metadata';
import {
  CompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
} from '../sharedkernel/CompileMetadataEntity';
import { BaseRepository } from '../shared/utils/BaseRepository';

class NeDBMetadataRepository
  extends BaseRepository<CompileMetadataEntity>
  implements MetadataRepository
{
  getAllUniqueYearsMonths(): TE.TaskEither<Error, Array<YearMonth>> {
    return pipe(
      this.find({}),
      TE.map((entities) =>
        this.extractUniqueYearMonths(entities as Array<YearMonth>),
      ),
    );
  }

  findByYearMonth(yearMonth: YearMonth): TE.TaskEither<Error, Metadata[]> {
    return pipe(
      this.find({ year: yearMonth.year, month: yearMonth.month }),
      TE.map((compileMetadataEntities) =>
        compileMetadataEntities.map(mapCompileMetadataEntityToMetadata),
      ),
    );
  }

  private extractUniqueYearMonths(
    yearMonths: Array<YearMonth>,
  ): Array<YearMonth> {
    const yearMonthEntriesUnique = new Map(
      yearMonths.map((yearMonth) => [
        `${yearMonth.year}-${yearMonth.month}`,
        { year: yearMonth.year, month: yearMonth.month },
      ]),
    );
    return Array.from(yearMonthEntriesUnique.values());
  }
}

export default NeDBMetadataRepository;
