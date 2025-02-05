import { Semigroup } from 'fp-ts/Semigroup';
import { pipe } from 'fp-ts/function';
import { fold, none, Option, some } from 'fp-ts/Option';
import Array from 'fp-ts/Array';
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

export const aggregateCheckpointsEntitiesWithFilter = (
  entities: CheckpointEntity[],
  filter: FilterCheckpoint,
): Array<AggregatedCheckpointData> =>
  pipe(
    entities,
    Array.filter((entity) => entity._id === filter.id),
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
