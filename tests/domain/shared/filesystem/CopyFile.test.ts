import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pipe } from 'fp-ts/function';
import copyFile from '../../../../src/domain/shared/filesystem/CopyFile';
import {
  expectLeft,
  expectRight,
} from '../../../../src/domain/shared/utils/test/Expected';
import {
  createFileStructure,
  deleteFileOrDirectory,
} from '../../../../src/domain/shared/utils/test/Filesystem';

describe('copyFile', () => {
  const baseTestDir = path.join(__dirname, 'copyFile');
  const sourceDir = path.join(baseTestDir, 'source');
  const destinationDir = path.join(baseTestDir, 'destination');

  const fileStructure = {
    source: {
      'file1.txt': 'This is the content of file1.',
      'file2.md': 'This is some markdown content.',
    },
  };

  beforeAll(async () => {
    await createFileStructure(baseTestDir, fileStructure);
  });

  afterAll(async () => {
    await deleteFileOrDirectory(baseTestDir);
  });

  it('should copy a file from the source directory to the destination directory', async () => {
    const sourceFilePath = path.join(sourceDir, 'file1.txt');
    const expectedDestinationPath = path.join(destinationDir, 'file1.txt');

    const result = await copyFile(sourceFilePath, destinationDir)();

    expectRight(result, (successPath) => {
      expect(successPath).toBe(expectedDestinationPath);
    });

    const destinationFileExists = await fs
      .access(expectedDestinationPath)
      .then(() => true)
      .catch(() => false);
    expect(destinationFileExists).toBe(true);

    const originalContent = await fs.readFile(sourceFilePath, 'utf-8');
    const copiedContent = await fs.readFile(expectedDestinationPath, 'utf-8');
    expect(copiedContent).toBe(originalContent);
  });

  it('should return an error if the source file does not exist', async () => {
    const nonExistingSourcePath = path.join(sourceDir, 'non-existing.txt');

    const result = await pipe(
      copyFile(nonExistingSourcePath, destinationDir),
    )();

    expectLeft(result, (error) => {
      expect(error.message).toContain('Error while copying');
    });
  });

  it('should create the destination directory if it does not exist', async () => {
    const nonexistentSubDir = path.join(destinationDir, 'subdir');
    const sourceFilePath = path.join(sourceDir, 'file2.md');
    const expectedDestinationPath = path.join(nonexistentSubDir, 'file2.md');

    const result = await pipe(copyFile(sourceFilePath, nonexistentSubDir))();

    expectRight(result, (successPath) => {
      expect(successPath).toBe(expectedDestinationPath);
    });

    const destinationFileExists = await fs
      .access(expectedDestinationPath)
      .then(() => true)
      .catch(() => false);
    expect(destinationFileExists).toBe(true);

    const originalContent = await fs.readFile(sourceFilePath, 'utf-8');
    const copiedContent = await fs.readFile(expectedDestinationPath, 'utf-8');
    expect(copiedContent).toBe(originalContent);
  });
});
