import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { LokiJSBaseRepository } from '../../../tests/infra/utils/LokiJSBaseRepository.js';
import CheckpointEntity, {
  mapCheckpointDataToEntity,
  mapCheckpointEntityToData,
} from './CheckpointEntity.js';
import {
  AggregatedCheckpointData,
  CheckpointData,
} from '../../../domain/sharedkernel/checkpoint/CheckpointData.js';
import Checkpoint, {
  FilterCheckpoint,
} from '../../../domain/sharedkernel/checkpoint/Checkpoint.js';
import {
  aggregateCheckpoints,
  aggregateCheckpointsEntitiesWithFilter,
} from './Aggregation.js';

const checkpoint = 'checkpoint';

export class LokiJSCheckpoint
  extends LokiJSBaseRepository<CheckpointEntity>
  implements Checkpoint
{
  constructor(db: Loki) {
    super(db, checkpoint);
  }

  findBy(id: string): TE.TaskEither<Error, Option<AggregatedCheckpointData>> {
    return pipe(this.find({ _id: id }), TE.map(aggregateCheckpoints));
  }

  save(
    checkpoint: CheckpointData,
  ): TE.TaskEither<Error, Option<CheckpointData>> {
    return pipe(
      this.add(mapCheckpointDataToEntity(checkpoint)),
      TE.map(O.map(mapCheckpointEntityToData)),
    );
  }

  findCheckpoints(
    filter: FilterCheckpoint,
  ): TE.TaskEither<Error, Array<AggregatedCheckpointData>> {
    return this.aggregate<CheckpointEntity, Array<AggregatedCheckpointData>>(
      (entity: CheckpointEntity) => ({
        _id: entity._id,
        category: entity.category,
        lastUpdate: entity.lastUpdate,
        source: entity.source,
        processed: entity.processed,
      }),
      (entities) => aggregateCheckpointsEntitiesWithFilter(entities, filter),
    );
  }
}

export default LokiJSCheckpoint;
