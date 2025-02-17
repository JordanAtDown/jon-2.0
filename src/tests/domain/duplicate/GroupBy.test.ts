import { describe, it, expect } from 'vitest';
import {
  DuplicateFile,
  DuplicateFiles,
} from '../../../domain/duplicate/DuplicateFiles.js';
import { groupBy } from '../../../domain/duplicate/GroupBy.js';

describe('groupBy', () => {
  it('regroupe les fichiers correctement par id', () => {
    const files = [
      new DuplicateFile('1', 'file1.txt', '/folder1'),
      new DuplicateFile('1', 'file2.txt', '/folder1'),
      new DuplicateFile('2', 'file3.txt', '/folder2'),
    ];

    const grouped = groupBy(files);

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['1']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['2']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['1']!['files']).toHaveLength(2);
    expect(grouped['2']!['files']).toHaveLength(1);
  });

  it('retourne un objet vide pour un tableau vide', () => {
    const files: Array<DuplicateFile> = [];
    const grouped = groupBy(files);

    expect(grouped).toEqual({});
  });

  it('gère les fichiers avec des ids uniques', () => {
    const files = [
      new DuplicateFile('1', 'file1.txt', '/folder1'),
      new DuplicateFile('2', 'file2.txt', '/folder2'),
      new DuplicateFile('3', 'file3.txt', '/folder3'),
    ];

    const grouped = groupBy(files);

    expect(Object.keys(grouped)).toHaveLength(3);
    expect(grouped['1']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['2']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['3']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['1']!['files']).toHaveLength(1);
    expect(grouped['2']!['files']).toHaveLength(1);
    expect(grouped['3']!['files']).toHaveLength(1);
  });

  it('gère les duplications dans les fichiers', () => {
    const file1 = new DuplicateFile('1', 'file1.txt', '/folder1');
    const files = [file1, file1];

    const grouped = groupBy(files);

    expect(Object.keys(grouped)).toHaveLength(1);
    expect(grouped['1']).toBeInstanceOf(DuplicateFiles);
    expect(grouped['1']!['files']).toHaveLength(2);
    expect(grouped['1']!['files'][0]).toBe(file1);
    expect(grouped['1']!['files'][1]).toBe(file1);
  });
});
