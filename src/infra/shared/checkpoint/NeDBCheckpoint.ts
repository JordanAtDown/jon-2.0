import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { Option } from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import Checkpoint from '../../../domain/shared/checkpoint/Checkpoint';
import { BaseRepository } from '../utils/BaseRepository';
import CheckpointEntity, {
  mapCheckpointDataToEntity,
  mapCheckpointEntityToData,
} from './CheckpointEntity';
import CheckpointData from '../../../domain/shared/checkpoint/CheckpointData';

export class NeDBCheckpoint
  extends BaseRepository<CheckpointEntity>
  implements Checkpoint
{
  findBy(id: string): TE.TaskEither<Error, Option<CheckpointData>> {
    return pipe(
      this.findCheckpointEntityById(id),
      TE.map(O.fromNullable),
      TE.map(O.map(mapCheckpointEntityToData)),
    );
  }

  update(
    id: string,
    newProcessedFiles: Set<string>,
  ): TE.TaskEither<Error, CheckpointData> {
    return pipe(
      this.findCheckpointEntityById(id),
      TE.map((currentCheckpoint) => ({
        ...currentCheckpoint,
        lastUpdateDate: new Date(),
        processedFiles: Array.from(
          new Set([...currentCheckpoint.processedFiles, ...newProcessedFiles]),
        ),
      })),
      TE.chain((updatedCheckpoint) =>
        this.saveOrUpdate(mapCheckpointDataToEntity(updatedCheckpoint), {
          _id: id,
        }),
      ),
      TE.map(mapCheckpointEntityToData),
    );
  }

  private findCheckpointEntityById(
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
