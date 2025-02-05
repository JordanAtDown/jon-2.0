import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import {
  LokiJSBaseRepository,
  NumberPage,
} from '../../tests/infra/utils/LokiJSBaseRepository.js';
import {
  CompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
} from '../sharedkernel/CompileMetadataEntity.js';
import MetadataRepository, {
  FilterCompiledMetadata,
} from '../../domain/catalog/MetadataRepository.js';
import YearMonth from '../../domain/sharedkernel/metadata/YearMonth.js';
import CompiledMetadata from '../../domain/sharedkernel/metadata/CompiledMetadata.js';

const COMPILED_METADATA_COLLECTION = 'compiled_metadata';

class LokiJSMetadataRepository
  extends LokiJSBaseRepository<CompileMetadataEntity>
  implements MetadataRepository
{
  constructor(db: Loki) {
    super(db, COMPILED_METADATA_COLLECTION);
  }

  getTotalBy(
    filter: FilterCompiledMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, NumberPage> {
    return this.getTotalNumberPage(this.buildQuery(filter), pageSize);
  }
  getPageBy(
    filter: FilterCompiledMetadata,
    page: number,
    pageSize: number,
  ): TE.TaskEither<Error, Array<CompiledMetadata>> {
    return pipe(
      this.findPaginated(this.buildQuery(filter), page, pageSize),
      TE.map((entities) => entities.map(mapCompileMetadataEntityToMetadata)),
    );
  }

  getAllUniqueYearsMonths(): TE.TaskEither<Error, Array<YearMonth>> {
    return this.aggregate<YearMonth, Array<YearMonth>>(
      (entity) => ({ year: entity.year, month: entity.month }),
      (mapped) => {
        return Array.from(
          mapped.reduce((uniqueMap, entry) => {
            const key = `${entry.year}-${entry.month}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, entry);
            }
            return uniqueMap;
          }, new Map<string, YearMonth>()),
        ).map(([, value]) => value);
      },
    );
  }

  findByYearMonth(
    yearMonth: YearMonth,
  ): TE.TaskEither<Error, CompiledMetadata[]> {
    return pipe(
      this.find({ year: yearMonth.year, month: yearMonth.month }),
      TE.map((compileMetadataEntities) =>
        compileMetadataEntities.map(mapCompileMetadataEntityToMetadata),
      ),
    );
  }

  private buildQuery(
    filter: FilterCompiledMetadata,
  ): LokiQuery<CompileMetadataEntity> {
    const query: LokiQuery<CompileMetadataEntity> = {};

    if (filter.id) {
      query._id = filter.id;
    }

    return query;
  }
}

export default LokiJSMetadataRepository;
