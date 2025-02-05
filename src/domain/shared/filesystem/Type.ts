import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

type Type = 'VIDEO' | 'PHOTO' | 'AUDIO' | 'DOCUMENT' | 'INCONNU';

const extensionToType: Record<string, Type> = {
  // Vidéos
  mp4: 'VIDEO',
  mov: 'VIDEO',
  avi: 'VIDEO',

  // Photos
  jpg: 'PHOTO',
  jpeg: 'PHOTO',
  png: 'PHOTO',
  bmp: 'PHOTO',
  arw: 'PHOTO',
  raw: 'PHOTO',

  // Audio
  mp3: 'AUDIO',
  wav: 'AUDIO',

  // Documents
  pdf: 'DOCUMENT',
  doc: 'DOCUMENT',
  docx: 'DOCUMENT',
};

const sanitizeExtension = (extension: string): string =>
  extension.replace(/[^a-zA-Z0-9]/g, '');

export const getTypeFromExtension = (extension: string): Type =>
  pipe(
    extension,
    sanitizeExtension,
    (cleanedExt) => cleanedExt.toLowerCase(),
    (ext) => O.fromNullable(extensionToType[ext]),
    O.getOrElse<Type>(() => 'INCONNU'),
  );
