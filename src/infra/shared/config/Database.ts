export const DATABASES = {
  FILE_METADATA: {
    id: 'FILE_METADATA',
    filename: 'filemetadata.db',
    name: 'File Metadata',
    collection: 'filemetadata',
    indices: ['_id'],
    unique: ['_id'],
  },
  METADATA_COMPILE: {
    id: 'METADATA_COMPILE',
    filename: 'metadata_compile.db',
    name: 'Metadata Compile',
    collection: 'metadata_compile',
    indices: ['_id'],
    unique: ['_id'],
  },
  CHECKPOINT: {
    id: 'CHECKPOINT',
    filename: 'checkpoint.db',
    name: 'Checkpoint',
    collection: 'checkpoint',
    indices: ['_id'],
    unique: [],
  },
} as const;

export type Database = keyof typeof DATABASES;

export type DatabaseConfig = (typeof DATABASES)[Database];
