import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  createFileStructure,
  deleteFileOrDirectory,
} from '../../../../src/domain/shared/utils/test/Filesystem';
import OccurenceIdentifier from '../../../../src/domain/shared/duplicate/OccurenceIdentifier';
import renameFile from '../../../../src/domain/shared/filesystem/RenameFile';
import {
  expectLeft,
  expectRight,
} from '../../../../src/domain/shared/utils/test/Expected';

describe('renameFile', () => {
  const TEMP_DIR = path.join(__dirname, 'renameFile');

  beforeEach(async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  });

  afterEach(async () => {
    await deleteFileOrDirectory(TEMP_DIR);
  });

  it('renames a file without conflicts', async () => {
    const structure = {
      'test.txt': 'Initial file content',
    };

    await createFileStructure(TEMP_DIR, structure);

    const occurenceIdentifier = new OccurenceIdentifier({});

    const originalFilePath = path.join(TEMP_DIR, 'test.txt');
    const newFileName = 'renamed.txt';

    const result = await renameFile(
      originalFilePath,
      newFileName,
      occurenceIdentifier,
    )();

    expectRight(result, async (newFilePath: string) => {
      expect(await fs.stat(newFilePath)).toBeTruthy();
      expect(newFilePath).toBe(path.join(TEMP_DIR, 'renamed.txt'));
    });

    await expect(fs.stat(originalFilePath)).rejects.toThrow();
  });

  it('renames a file by generating a unique name in case of conflict', async () => {
    const structure = {
      'test.txt': 'Content of file 1',
      'renamed.txt': 'Existing file content',
    };

    await createFileStructure(TEMP_DIR, structure);

    const occurenceIdentifier = new OccurenceIdentifier({ 'renamed.txt': 2 });

    const originalFilePath = path.join(TEMP_DIR, 'test.txt');
    const newFileName = 'renamed.txt';

    const result = await renameFile(
      originalFilePath,
      newFileName,
      occurenceIdentifier,
    )();

    expectRight(result, async (newFilePath: string) => {
      expect(await fs.stat(newFilePath)).toBeTruthy();
      expect(newFilePath).toBe(path.join(TEMP_DIR, 'renamed-1.txt'));
    });

    await expect(fs.stat(originalFilePath)).rejects.toThrow();
  });

  it('fails if the original file does not exist', async () => {
    const occurenceIdentifier = new OccurenceIdentifier({});

    const invalidFilePath = path.join(TEMP_DIR, 'nonexistent.txt');
    const newFileName = 'new.txt';

    const result = await renameFile(
      invalidFilePath,
      newFileName,
      occurenceIdentifier,
    )();

    expectLeft(result, (error: Error) => {
      expect(error.message).toContain('Error while renaming file');
    });
  });
});
