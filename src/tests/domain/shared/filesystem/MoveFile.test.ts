import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import * as path from 'path';
import {
  createFileStructure,
  deleteFileOrDirectory,
  findFiles,
} from '../../../shared/utils/test/Filesystem.js';
import moveFile from '../../../../domain/shared/filesystem/MoveFile.js';
import { expectRight } from '../../../shared/utils/test/Expected.js';

describe('MoveFile', () => {
  const TEST_DIR = path.resolve(__dirname, 'move_file_test');
  const filesStructure = {
    source: {
      'file1.txt': 'Content of file 1',
      'file2.txt': 'Content of file 2',
    },
    destination: {},
  };

  beforeEach(async () => {
    await createFileStructure(TEST_DIR, filesStructure);
  });

  afterEach(async () => {
    await deleteFileOrDirectory(TEST_DIR);
  });

  test.each([
    {
      name: 'should move a file to the destination directory',
      srcFile: 'source/file1.txt',
      destPath: 'destination/file1.txt',
      existingFile: undefined,
      expectedFile: 'destination/file1.txt',
    },
    {
      name: 'should copy and rename to the destination directory',
      srcFile: 'source/file1.txt',
      destPath: 'destination/file_rename.txt',
      existingFile: undefined,
      expectedFile: 'destination/file_rename.txt',
    },
    {
      name: 'should copy to the new destination directory with new name',
      srcFile: 'source/file1.txt',
      destPath: 'destination/new/new/file_rename.txt',
      existingFile: undefined,
      expectedFile: 'destination/new/new/file_rename.txt',
    },
    {
      name: 'should rename file if a conflict occurs in the destination directory',
      srcFile: 'source/file2.txt',
      destPath: 'destination/file2.txt',
      existingFile: 'destination/file2.txt',
      expectedFile: 'destination/file2_1.txt',
    },
  ])('$name', async ({ srcFile, destPath, existingFile, expectedFile }) => {
    const srcPath = path.join(TEST_DIR, srcFile);
    const destFilePath = path.join(TEST_DIR, destPath);
    const expectedFilePath = path.join(TEST_DIR, expectedFile);

    if (existingFile) {
      await createFileStructure(TEST_DIR, {
        [existingFile]: 'Existing content',
      });
    }

    const destinationPath = await moveFile(srcPath, destFilePath, true)();
    expectRight(destinationPath, (value) => {
      expect(value.path).toBe(expectedFilePath);
    });

    const remainingFiles = await findFiles(srcPath);
    expect(remainingFiles).toHaveLength(0);

    const movedFiles = await findFiles(expectedFilePath);
    expect(movedFiles).toHaveLength(1);
    expect(movedFiles[0]).toBe(expectedFilePath);
  });
});
