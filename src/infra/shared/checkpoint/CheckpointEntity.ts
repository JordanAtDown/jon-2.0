import CheckpointData from '../../../domain/shared/checkpoint/CheckpointData';

type CheckpointEntity = {
  _id: string;
  lastUpdateDate: Date;
  path: string;
  processedFiles: string[];
};

export const mapCheckpointDataToEntity = (
  data: CheckpointData,
): CheckpointEntity => ({
  _id: data._id,
  lastUpdateDate: data.lastUpdateDate,
  path: data.path,
  processedFiles: data.processedFiles,
});

export const mapCheckpointEntityToData = (
  entity: CheckpointEntity,
): CheckpointData => ({
  _id: entity._id,
  lastUpdateDate: entity.lastUpdateDate,
  path: entity.path,
  processedFiles: entity.processedFiles,
});

export default CheckpointEntity;
