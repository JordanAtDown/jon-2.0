import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import * as path from 'path';
import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import {
  createFileStructure,
  deleteFileOrDirectory,
  FileStructure,
  findFiles,
} from '../../../shared/utils/test/Filesystem.js';
import initializeDB from '../../../infra/utils/InitializeDB.js';
import CheckpointDBHelper from '../../../infra/utils/CheckpointDBHelper.js';
import {
  expectRight,
  expectTaskEitherLeft,
  expectTaskEitherRight,
} from '../../../shared/utils/test/Expected.js';
import { DATABASES } from '../../../../infra/shared/config/Database.js';
import MergeDuplicateCommand from '../../../../domain/duplicate/usecase/MergeDuplicateCommand.js';
import MergeDuplicateUseCase from '../../../../domain/duplicate/usecase/MergeDuplicateUseCase.js';
import CheckpointEntity from '../../../../infra/sharedkernel/checkpoint/CheckpointEntity.js';
import * as fs from 'fs/promises';

describe('MergeDuplicateUseCase', () => {
  const testDir = path.join(__dirname, 'merge_duplicates_test');
  const importDir = path.join(testDir, 'import');

  let checkpoint: LokiJSCheckpoint;
  let checkpointHelper: CheckpointDBHelper;
  let dbPath: string;

  beforeAll(async () => {
    dbPath = path.join(testDir, 'db');
    const dbConfig = await initializeDB(dbPath);

    checkpoint = new LokiJSCheckpoint(
      dbConfig.getDatabase(DATABASES.CHECKPOINT.id),
      DATABASES.CHECKPOINT,
    );

    checkpointHelper = new CheckpointDBHelper(
      dbConfig.getDatabase(DATABASES.CHECKPOINT.id),
      DATABASES.CHECKPOINT,
    );

    const fileStructure: FileStructure = {
      Photos: {
        Album1: {
          'Photo_001.bmp': 'Contenu du fichier Photo_001.bmp',
          'Image_002.jpg': 'Contenu du fichier Image_002.jpg',
        },
        Album2: {
          'Photo_001_dup.bmp': 'Contenu du fichier Photo_001_dup.bmp',
          'Photo_003.png': 'Contenu du fichier Photo_003.png',
        },
        Backup: {
          'Image_002_dup.jpg': 'Contenu du fichier Image_002_dup.jpg',
          'Photo_003_copy.png': 'Contenu du fichier Photo_003_copy.png',
        },
      },
    };

    await createFileStructure(testDir, fileStructure);

    //// Create CSV file
    const csvContent = `
    Group ID,Nom de fichier,Dossier
    0,Photo_001.bmp,${testDir}/Photos/Album1
    0,Photo_001_dup.bmp,${testDir}/Photos/Album2
    1,Image_002.jpg,${testDir}/Photos/Album1
    1,Image_002_dup.jpg,${testDir}/Photos/Backup
    2,Photo_003.png,${testDir}/Photos/Album2
    2,Photo_003_copy.png,${testDir}/Photos/Backup
        `;
    await fs.mkdir(path.join(importDir), { recursive: true });
    await fs.writeFile(
      path.join(importDir, 'importfile.csv'),
      csvContent.trim(),
      {
        encoding: 'utf-8',
      },
    );
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDir);
  });

  it('should process duplicate files and update checkpoint', async () => {
    // GIVEN
    const command: MergeDuplicateCommand = {
      importFilePath: path.join(importDir, 'importfile.csv'),
      idCheckpoint: 'id-checkpoint',
      progress: () => {},
      itemCallback: () => {},
    };
    const useCase = new MergeDuplicateUseCase(checkpoint);

    // WHEN
    const taskEither = useCase.withCommand(command);
    await expectTaskEitherRight(taskEither, () => {});

    // THEN
    //// Checkpoint
    const result = await checkpointHelper.find({})();
    expectRight(result, (checkpoints: CheckpointEntity[]) => {
      expect(checkpoints).toHaveLength(0);
    });

    //// Move to New Merge path
    const expectedProcessedFiles = [
      path.join(testDir, 'Photos', 'Album1', 'Album2', 'Photo_001.bmp'),
      path.join(testDir, 'Photos', 'Album1', 'Backup', 'Image_002.jpg'),
      path.join(testDir, 'Photos', 'Album2', 'Backup', 'Photo_003.png'),
    ];
    const processedFiles = await findFiles(
      path.join(testDir, 'Photos', '**/*'),
    );
    expect(processedFiles).toHaveLength(3);
    expect(processedFiles).toEqual(
      expect.arrayContaining(expectedProcessedFiles),
    );

    //// Originals files are remove
    const remainingFilesAlbum1 = await findFiles(
      path.join(testDir, 'Photos/Album1/*'),
    );
    const remainingFilesAlbum2 = await findFiles(
      path.join(testDir, 'Photos/Album2/*'),
    );
    const remainingFilesBackup = await findFiles(
      path.join(testDir, 'Photos/Backup/*'),
    );

    expect(remainingFilesAlbum1.length).toBe(0);
    expect(remainingFilesAlbum2.length).toBe(0);
    expect(remainingFilesBackup.length).toBe(0);
  });
});
