import { describe, it, beforeEach, expect, afterAll } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { deleteFileOrDirectory } from '../../../shared/utils/test/Filesystem.js';
import {
  expectLeft,
  expectRight,
} from '../../../shared/utils/test/Expected.js';
import fastGlobScanner from '../../../../infra/shared/filesystem/FastGlobScanner.js';

describe('FastGlobScanner', () => {
  const testDir = path.join(__dirname, 'fastGlobScanner');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'contenu 1');
    await fs.writeFile(path.join(testDir, 'file2.log'), 'contenu 2');

    const subDir = path.join(testDir, 'subdir');
    await fs.mkdir(subDir, { recursive: true });
    await fs.writeFile(path.join(subDir, 'file3.md'), 'contenu 3');
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDir);
  });

  it('should scan files matching specific patterns', async () => {
    const patterns = ['**/*.txt', '**/*.md'];
    const result = await fastGlobScanner.scanFiles(testDir, patterns)();

    expectRight(result, (files) => {
      const expectedFiles = [
        path.join(testDir, 'file1.txt'),
        path.join(testDir, 'subdir/file3.md'),
      ];
      expect(files.sort()).toEqual(expectedFiles.sort());
    });
  });

  it('should handle errors gracefully for invalid paths', async () => {
    const invalidPath = path.join(testDir, 'non-existent'); // Chemin inexistant
    const result = await fastGlobScanner.scanFiles(invalidPath, ['**/*'])();

    expectLeft(result, (error) => {
      expect(error.message).toContain("Le dossier spécifié n'existe pas");
    });
  });

  it('should handle no matching files gracefully', async () => {
    const patterns = ['**/*.json'];
    const result = await fastGlobScanner.scanFiles(testDir, patterns)();

    expectLeft(result, (error) => {
      expect(error.message).toContain(
        'Aucun fichier ne correspond aux patterns spécifiés.',
      );
    });
  });

  it('should handle invalid glob patterns', async () => {
    const invalidPattern = '**/*.[';
    const result = await fastGlobScanner.scanFiles(testDir, [invalidPattern])();

    expectLeft(result, (error) => {
      expect(error.message).toContain('Pattern glob invalide');
    });
  });

  it('should handle permission errors', async () => {
    const restrictedDir = path.join(testDir, 'restricted');
    await fs.mkdir(restrictedDir, { recursive: true });
    await fs.chmod(restrictedDir, 0o000);

    const result = await fastGlobScanner.scanFiles(restrictedDir, ['**/*'])();

    expectLeft(result, (error) => {
      expect(error.message).toContain('EACCES: permission denied');
    });

    await fs.chmod(restrictedDir, 0o755);
  });
});
