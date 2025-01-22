import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { v4 as uuidv4 } from 'uuid';
import CheckpointEntity, {
  mapCheckpointDataToEntity,
  mapCheckpointEntityToData,
} from './CheckpointEntity';
import { BaseRepository } from '../../shared/utils/BaseRepository';
import Checkpoint from '../../../domain/sharedkernel/checkpoint/Checkpoint';
import { CheckpointData } from '../../../domain/sharedkernel/checkpoint/CheckpointData';

export class NeDBCheckpoint
  extends BaseRepository<CheckpointEntity>
  implements Checkpoint
{
  findCheckpoints(
    filter: Partial<CheckpointData>,
  ): TE.TaskEither<Error, Array<CheckpointData>> {
    return pipe(
      this.find(filter),
      TE.map((entities) => entities.map(mapCheckpointEntityToData)),
    );
  }
  create(checkpoint: CheckpointData): TE.TaskEither<Error, CheckpointData> {
    const entity: CheckpointEntity = {
      ...mapCheckpointDataToEntity(checkpoint),
      _id: uuidv4(),
    };
    return pipe(
      this.saveOrUpdate(entity, { _id: entity._id }),
      TE.map(mapCheckpointEntityToData),
    );
  }
  findBy(id: string): TE.TaskEither<Error, Option<CheckpointData>> {
    return pipe(
      this.findCheckpointById(id),
      TE.map(O.fromNullable),
      TE.map(O.map(mapCheckpointEntityToData)),
    );
  }

  update(
    id: string,
    process: Set<string>,
  ): TE.TaskEither<Error, CheckpointData> {
    return pipe(
      this.findCheckpointById(id),
      TE.map((currentCheckpoint) => ({
        ...currentCheckpoint,
        lastUpdate: new Date(),
        processed: Array.from(
          new Set([...currentCheckpoint.processed, ...process]),
        ),
      })),
      TE.chain((updatedCheckpoint) =>
        this.saveOrUpdate(updatedCheckpoint, {
          _id: id,
        }),
      ),
      TE.map(mapCheckpointEntityToData),
    );
  }

  private findCheckpointById(
    id: string,
  ): TE.TaskEither<Error, CheckpointEntity> {
    return pipe(
      this.find({ _id: id }),
      TE.map((results) => results[0]),
      TE.chain(
        flow(
          O.fromNullable,
          TE.fromOption(
            () => new Error(`Checkpoint with ID "${id}" not found.`),
          ),
        ),
      ),
    );
  }
}

export default NeDBCheckpoint;
