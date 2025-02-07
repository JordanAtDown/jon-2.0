import Loki, { Collection } from 'lokijs';
import { fromNullable, Option } from 'fp-ts/lib/Option.js';
import { TaskEither } from 'fp-ts/lib/TaskEither.js';
import { tryCatchTask } from '../../../domain/shared/utils/fp/FP.js';

export type NumberPage = {
  totalPages: number;
  totalItem: number;
};

export abstract class LokiJSBaseRepository<ENTITY extends Object> {
  protected collection: Collection<ENTITY>;
  protected db: Loki;

  // TODO: Ajouter des options pour l'unicité et l'index
  protected constructor(db: Loki, collectionName: string) {
    this.collection =
      db.getCollection<ENTITY>(collectionName) ??
      db.addCollection<ENTITY>(collectionName);
    this.db = db;
  }

  find(filter: LokiQuery<ENTITY & LokiObj>): TaskEither<Error, ENTITY[]> {
    return tryCatchTask(async () => this.collection.find(filter));
  }

  saveOrUpdate(
    filter: LokiQuery<ENTITY & LokiObj>,
    entity: ENTITY,
  ): TaskEither<Error, ENTITY> {
    return tryCatchTask(async () => {
      const existing = this.collection.findOne(filter);

      if (existing) {
        Object.assign(existing, entity);
        this.collection.update(existing);
      } else {
        this.collection.insert(entity);
      }

      return entity;
    });
  }

  addAll(entities: ENTITY[]): TaskEither<Error, ENTITY[] | undefined> {
    return tryCatchTask(async () => {
      return this.collection.insert(entities);
    });
  }

  add(entity: ENTITY): TaskEither<Error, Option<ENTITY>> {
    return tryCatchTask(async () => {
      const inserted = this.collection.insert(entity);
      return fromNullable(inserted);
    });
  }

  delete(filter: LokiQuery<ENTITY & LokiObj>): TaskEither<Error, number> {
    return tryCatchTask(async () => {
      const deletedCount = this.collection
        .chain()
        .find(filter)
        .remove()
        .count();

      if (deletedCount === 0) {
        throw new Error('WRONG_FILTER: no entity found to delete.');
      }

      return deletedCount;
    });
  }

  findPaginated(
    filter: LokiQuery<ENTITY & LokiObj>,
    page: number,
    pageSize: number,
  ): TaskEither<Error, ENTITY[]> {
    return tryCatchTask(async () => {
      if (page <= 0) {
        throw new Error('INVALID_PAGE_NUMBER: must be greater than 0.');
      }
      if (pageSize <= 0) {
        throw new Error('INVALID_PAGE_SIZE: must be greater than 0.');
      }

      const offset = (page - 1) * pageSize;

      return this.collection
        .chain()
        .find(filter)
        .offset(offset)
        .limit(pageSize)
        .data();
    });
  }

  getTotalNumberPage(
    filter: LokiQuery<ENTITY & LokiObj>,
    pageSize: number,
  ): TaskEither<Error, NumberPage> {
    return tryCatchTask(async () => {
      if (pageSize <= 0) {
        throw new Error('INVALID_PAGE_SIZE: must be greater than 0.');
      }
      const totalCount = this.collection.chain().find(filter).count();
      return {
        totalPages: Math.ceil(totalCount / pageSize),
        totalItem: totalCount,
      };
    });
  }

  getTotal(
    filter: LokiQuery<ENTITY & LokiObj>,
    pageSize: number,
  ): TaskEither<Error, number> {
    return tryCatchTask(async () => {
      if (pageSize <= 0) {
        throw new Error('INVALID_PAGE_SIZE: must be greater than 0.');
      }
      const totalCount = this.collection.chain().find(filter).count();
      return Math.ceil(totalCount / pageSize);
    });
  }

  aggregate<MAPPED, AGGREGATED>(
    mapFn: (entity: ENTITY) => MAPPED,
    reduceFn: (mapped: MAPPED[]) => AGGREGATED,
    sortFn?: (a: MAPPED, b: MAPPED) => number,
  ): TaskEither<Error, AGGREGATED> {
    return tryCatchTask(async () => {
      const mappedData = this.collection.data.map(mapFn);
      const sortedData = sortFn ? mappedData.sort(sortFn) : mappedData;
      return reduceFn(sortedData);
    });
  }
}
