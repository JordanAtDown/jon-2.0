import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';

type FileMetadata = {
  filename: string;
  name: string;
  extension: string;
  fullPath: string;
  directory: string;
};

const fileTypeMap: Record<string, string | null> = {
  mp4: 'video',
  avi: 'video',
  mkv: 'video',
  mov: 'video',
  wmv: 'video',
  jpg: 'photo',
  jpeg: 'photo',
  png: 'photo',
  gif: 'photo',
  webp: 'photo',
  bmp: 'photo',
  arw: 'photo',
  raw: 'photo',
};

const getFileTypeByExtension = (extension: string): O.Option<string> =>
  pipe(
    O.fromNullable(fileTypeMap[extension.toLowerCase()]),
    O.chain(O.fromNullable),
  );

const deriveFileType = (file: FileMetadata): O.Option<string> =>
  pipe(file.extension, getFileTypeByExtension);

export { deriveFileType };
