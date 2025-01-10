import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as E from 'fp-ts/Either';
import { isFile, readDirectory, isDirectory } from './read';

/**
 * Vérifie qu'un Either est un succès (`Right`) et exécute une validation sur le résultat.
 * @param either - Le Either à vérifier.
 * @param validate - Une fonction de validation qui reçoit la valeur (Right) et exécute les assertions.
 */
export const expectRight = <L, A>(
  either: E.Either<L, A>,
  validate: (result: A) => void,
): void => {
  if (E.isRight(either)) {
    validate(either.right); // Exécute la validation sur la valeur du succès
  } else {
    throw new Error(
      `Expected Right but got Left with: ${JSON.stringify(either.left)}`,
    );
  }
};

/**
 * Vérifie qu'un Either est un échec (`Left`) et exécute une validation sur l'erreur.
 * @param either - Le Either à vérifier.
 * @param validate - Une fonction de validation qui reçoit l'erreur (Left) et exécute les assertions.
 */
export const expectLeft = <L, A>(
  either: E.Either<L, A>,
  validate: (error: L) => void,
): void => {
  if (E.isLeft(either)) {
    validate(either.left); // Exécute la validation sur l'erreur
  } else {
    throw new Error(
      `Expected Left but got Right with: ${JSON.stringify(either.right)}`,
    );
  }
};

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
