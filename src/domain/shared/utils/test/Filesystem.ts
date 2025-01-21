import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Represents a structure of files and directories.
 * Each key is a file or directory name, and the value is either:
 * - A string (content of the file), or
 * - An object describing a nested directory structure.
 */
type FileStructure = {
  [fileName: string]: string | FileStructure;
};

/**
 * Recursively creates a structure of files and directories.
 * @param basePath - The base path where the structure should be created.
 * @param structure - The structure of files and directories to create.
 */
const createFileStructure = async (
  basePath: string,
  structure: FileStructure,
): Promise<void> => {
  for (const [name, content] of Object.entries(structure)) {
    const targetPath = path.join(basePath, name);
    if (typeof content === 'string') {
      await fs.writeFile(targetPath, content);
    } else {
      await fs.mkdir(targetPath, { recursive: true });
      await createFileStructure(targetPath, content);
    }
  }
};

/**
 * Recursively deletes a file or directory (with tolerance for non-existing paths).
 * @param targetPath - Path of the file or directory to delete.
 */
const deleteFileOrDirectory = async (targetPath: string): Promise<void> => {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error while deleting ${targetPath}:`, error);
  }
};

export { createFileStructure, deleteFileOrDirectory, FileStructure };
