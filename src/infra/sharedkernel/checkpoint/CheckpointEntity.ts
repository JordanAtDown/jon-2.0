import {
  CategorySource,
  CheckpointData,
} from '../../../domain/sharedkernel/checkpoint/CheckpointData';

type CheckpointEntity = {
  _id: string;
  category: string;
  lastUpdate: Date;
  source: string;
  processed: string[];
};

export const mapCheckpointDataToEntity = (
  data: CheckpointData,
): CheckpointEntity => ({
  _id: data._id,
  category: data.category,
  lastUpdate: data.lastUpdate,
  source: data.source,
  processed: data.processed,
});

export const mapCheckpointEntityToData = (
  entity: CheckpointEntity,
): CheckpointData => ({
  _id: entity._id,
  category: entity.category as CategorySource,
  lastUpdate: entity.lastUpdate,
  source: entity.source,
  processed: entity.processed,
});

export default CheckpointEntity;
