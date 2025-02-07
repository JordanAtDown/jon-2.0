import { Semigroup } from 'fp-ts/lib/Semigroup.js';
import { pipe } from 'fp-ts/lib/function.js';
import { fold, none, Option, some } from 'fp-ts/lib/Option.js';
import Array from 'fp-ts/lib/Array.js';
import { DateTime } from 'luxon';
import {
  AggregatedCheckpointData,
  CategorySource,
} from '../../../domain/sharedkernel/checkpoint/CheckpointData.js';
import CheckpointEntity from './CheckpointEntity.js';
import { FilterCheckpoint } from '../../../domain/sharedkernel/checkpoint/Checkpoint.js';

const semigroupAggregatedCheckpointData: Semigroup<AggregatedCheckpointData> = {
  concat: (a, b) => ({
    _id: a._id,
    category: a.category,
    source: a.source,
    lastUpdate: a.lastUpdate > b.lastUpdate ? a.lastUpdate : b.lastUpdate,
    processed: new Set([...a.processed, ...b.processed]),
  }),
};

const entityToAggregatedCheckpoint = (
  entity: CheckpointEntity,
): AggregatedCheckpointData => ({
  _id: entity._id,
  category: entity.category as CategorySource,
  lastUpdate: DateTime.fromISO(entity.lastUpdate),
  source: entity.source,
  processed: new Set(entity.processed),
});

export const aggregateCheckpoints = (
  entities: CheckpointEntity[],
): Option<AggregatedCheckpointData> =>
  pipe(
    entities,
    Array.map(entityToAggregatedCheckpoint),
    Array.reduce(none as Option<AggregatedCheckpointData>, (acc, curr) =>
      acc._tag === 'None'
        ? some(curr)
        : some(semigroupAggregatedCheckpointData.concat(acc.value, curr)),
    ),
  );

const isMatching = (
  entity: CheckpointEntity,
  filter: FilterCheckpoint,
): boolean => {
  const matchesId = filter.id ? entity._id === filter.id : true;
  const matchesCategory = filter.category
    ? entity.category === filter.category
    : true;
  const matchesSource = filter.source ? entity.source === filter.source : true;

  return matchesId && matchesCategory && matchesSource;
};

const filterEntitiesByCheckpoint = (
  entities: CheckpointEntity[],
  filter: FilterCheckpoint,
): CheckpointEntity[] => {
  return entities.filter((entity) => isMatching(entity, filter));
};

export const aggregateCheckpointsEntitiesWithFilter = (
  entities: CheckpointEntity[],
  filter: FilterCheckpoint,
): Array<AggregatedCheckpointData> =>
  pipe(
    filterEntitiesByCheckpoint(entities, filter),
    Array.map(entityToAggregatedCheckpoint),
    Array.reduce([] as AggregatedCheckpointData[], (acc, curr) =>
      pipe(
        acc,
        Array.findFirst(
          (item) =>
            item._id === curr._id &&
            item.category === curr.category &&
            item.source === curr.source,
        ),
        fold(
          () => [...acc, curr],
          (existing) =>
            acc.map((item) =>
              item === existing
                ? semigroupAggregatedCheckpointData.concat(existing, curr)
                : item,
            ),
        ),
      ),
    ),
  );
