import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import { isFile, readDirectory, isDirectory } from './filesystem.utils';
import { expectLeft, expectRight } from './test.utils';

describe('Read Function Tests', () => {
  it('should return "true" if the filePath refers to file', async () => {
    const mockStat = vi.spyOn(fs.promises, 'stat').mockResolvedValue({
      isFile: () => true,
    } as any);

    const result = await isFile('/valid/path/for')();

    // Utilisation d'un callback pour valider le résultat du côté Right
    expectRight(result, (te) => {
      expect(te).toBe(true); // Vérifie que le fichier est détecté
    });

    vi.restoreAllMocks();
  });

  it('should return false if the filePath does not refer to a file', async () => {
    const mockStat = vi.spyOn(fs.promises, 'stat').mockResolvedValue({
      isFile: () => false,
    } as any);

    const result = await isFile('/valid/path/for')();

    // Utilisation d'un callback pour valider le résultat du côté Right
    expectRight(result, (te) => {
      expect(te).toBe(false); // Vérifie que le fichier est détecté
    });
    vi.restoreAllMocks();
  });

  it('should return an error if fs.stat throw an error', async () => {
    vi.spyOn(fs.promises, 'stat').mockRejectedValue(
      new Error('File not found'),
    );

    const result = await isFile('not-a-valid-file')();

    expectLeft(result, (error) => {
      expect(error.message).toBe('Error: File not found'); // Vérifie le message d'erreur
    });
    vi.restoreAllMocks();
  });

  it('should return a list of files when the directory exists and contains files', async () => {
    const fakeFiles = ['file1.txt', 'file2.txt', 'file3.txt'];
    const readdirMock = vi
      .spyOn(fs.promises, 'readdir')
      .mockResolvedValue(fakeFiles);

    const result = await readDirectory('/valid/directory')();

    expectRight(result, (te) => {
      expect(te).toBe(fakeFiles); // Vérifie que le fichier est détecté
    });
    expect(readdirMock).toBeCalledWith('/valid/directory');
  });

  it('should return a empty array when the directory exists but is empty', async () => {
    const readdirMock = vi.spyOn(fs.promises, 'readdir').mockResolvedValue([]);

    const result = await readDirectory('/valid/directory')();

    expectRight(result, (te) => {
      expect(te).toStrictEqual([]); // Vérifie que le fichier est détecté
    });
    expect(readdirMock).toBeCalledWith('/valid/directory');
  });

  it('should return an error when the directory does not exist', async () => {
    const readdirMock = vi
      .spyOn(fs.promises, 'readdir')
      .mockRejectedValue(new Error('ENOENT: no such file or directory'));

    const result = await readDirectory('/non/existent/directory')();

    expectLeft(result, (error) => {
      expect(error.message).toBe('Error: ENOENT: no such file or directory'); // Vérifie que le fichier est détecté
    });
    expect(readdirMock).toBeCalledWith('/non/existent/directory');
  });

  it('should return an error when permissions are insufficient', async () => {
    const readdirMock = vi
      .spyOn(fs.promises, 'readdir')
      .mockRejectedValue(new Error('EACCES: permission denied'));

    const result = await readDirectory('/restricted/directory')();

    expectLeft(result, (error) => {
      expect(error.message).toBe('Error: EACCES: permission denied'); // Vérifie que le fichier est détecté
    });
    expect(readdirMock).toBeCalledWith('/restricted/directory');
  });

  it('should return "true" if the path refers to a directory', async () => {
    const mockStat = vi.spyOn(fs.promises, 'stat').mockResolvedValue({
      isDirectory: () => true,
    } as any);

    const result = await isDirectory('/valid/directory')();

    // Utilisation d'un callback pour valider le résultat du côté Right
    expectRight(result, (te) => {
      expect(te).toBe(true); // Vérifie que le chemin est un dossier
    });

    vi.restoreAllMocks();
  });

  it('should return false if the path does not refer to a directory', async () => {
    const mockStat = vi.spyOn(fs.promises, 'stat').mockResolvedValue({
      isDirectory: () => false,
    } as any);

    const result = await isDirectory('/valid/path/file')();

    expectRight(result, (te) => {
      expect(te).toBe(false); // Vérifie que le chemin n'est pas un dossier
    });

    vi.restoreAllMocks();
  });

  it('should return an error if fs.stat throws an error', async () => {
    vi.spyOn(fs.promises, 'stat').mockRejectedValue(
      new Error('Path not found'),
    );

    const result = await isDirectory('/non/existent/path')();

    expectLeft(result, (error) => {
      expect(error.message).toBe('Error: Path not found'); // Vérifie le message d'erreur
    });

    vi.restoreAllMocks();
  });

  it('should return an error when permissions are insufficient', async () => {
    vi.spyOn(fs.promises, 'stat').mockRejectedValue(
      new Error('EACCES: permission denied'),
    );

    const result = await isDirectory('/restricted/directory')();

    expectLeft(result, (error) => {
      expect(error.message).toBe('Error: EACCES: permission denied'); // Vérifie le message d'erreur
    });

    vi.restoreAllMocks();
  });
});
