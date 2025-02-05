import {
  CategorySource,
  CheckpointData,
} from '../../../domain/sharedkernel/checkpoint/CheckpointData.js';
import { DateTime } from 'luxon';

type CheckpointEntity = {
  _id: string;
  category: string;
  lastUpdate: string;
  source: string;
  processed: string[];
};

export const mapCheckpointDataToEntity = (
  data: CheckpointData,
): CheckpointEntity => ({
  _id: data._id,
  category: data.category,
  lastUpdate: data.lastUpdate.toISO() ?? DateTime.now().toISO(),
  source: data.source,
  processed: Array.from(data.processed),
});

export const mapCheckpointEntityToData = (
  entity: CheckpointEntity,
): CheckpointData => ({
  _id: entity._id,
  category: entity.category as CategorySource,
  lastUpdate: DateTime.fromISO(entity.lastUpdate),
  source: entity.source,
  processed: new Set(entity.processed),
});

export default CheckpointEntity;
