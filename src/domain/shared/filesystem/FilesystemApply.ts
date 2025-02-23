import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import moveFile from './MoveFile.js';
import { ExifProperty } from '../exif/ExifProperty.js';
import { Either, right, left } from 'fp-ts/lib/Either.js';
import { validateExifProperties } from '../exif/validation/Validations.js';
import Logger from '../../../presentation/commands/utils/Logger.js';
import { exifApplyTo } from '../exif/ExifWriting.js';

type FilesystemApplyCommand = {
  filepath: string;
  destPath: string;
  exifProperties: ExifProperty<any>[];
};

type ExifApplyCommand = {
  filepath: string;
  exifProperties: ExifProperty<any>[];
};

type WithDestPath = FilesystemApplyCommand & {
  destinationPath: string;
};

const check = (
  command: FilesystemApplyCommand,
): Either<Error, FilesystemApplyCommand> => {
  const validationErrors = validateExifProperties(command.exifProperties);

  if (validationErrors.length > 0) {
    return left(
      new Error(
        `EXIF_VALIDATION_ERROR: CAN'T VALIDATE FILE ${command.filepath}`,
      ),
    );
  }

  return right(command);
};

const move = (
  command: FilesystemApplyCommand,
): TE.TaskEither<Error, WithDestPath> => {
  return pipe(
    moveFile(command.filepath, command.destPath, true),
    TE.map((destinationPath) => ({
      ...command,
      destinationPath: destinationPath.path,
    })),
    TE.mapLeft((_error) => {
      Logger.error(_error.message);
      return new Error(
        `FAILED_MOVING_FILE: CAN'T MOVE FILE ${command.filepath}`,
      );
    }),
  );
};

const exif = (
  command: FilesystemApplyCommand,
): TE.TaskEither<Error, FilesystemApplyCommand> => {
  return pipe(
    exifApplyTo(command.filepath, command.exifProperties),
    TE.map(() => command),
    TE.mapLeft((_error: Error) => {
      Logger.error(_error.message);
      return new Error(
        `FAILED_APPLY_EXIF: CAN'T APPLY EXIF ON FILE ${command.filepath}`,
      );
    }),
  );
};

const exif2 = (command: ExifApplyCommand): TE.TaskEither<Error, void> => {
  return pipe(
    exifApplyTo(command.filepath, command.exifProperties),
    TE.mapLeft((_error: Error) => {
      Logger.error(_error.message);
      return new Error(
        `FAILED_APPLY_EXIF: CAN'T APPLY EXIF ON FILE ${command.filepath}`,
      );
    }),
  );
};

const filesystemApply = (
  command: FilesystemApplyCommand,
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.fromEither(check(command)),
    TE.chain(exif),
    TE.chain(move),
    TE.map(() => undefined),
  );
};

const fileMovedOnly = (
  command: FilesystemApplyCommand,
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.of(command),
    TE.chain(move),
    TE.map(() => undefined),
  );
};

const onlyExifApply = (
  command: ExifApplyCommand,
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.right(command),
    TE.chain(exif2),
    TE.map(() => undefined),
  );
};

export {
  filesystemApply,
  FilesystemApplyCommand,
  ExifApplyCommand,
  onlyExifApply,
  fileMovedOnly,
};
