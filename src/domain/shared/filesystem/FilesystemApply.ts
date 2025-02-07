import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import moveFile, { canMove } from './MoveFile.js';
import { ExifProperty } from '../exif/ExifProperty.js';
import { Either, right, left } from 'fp-ts/lib/Either.js';
import { ItemState, ItemTracker } from '../tracker/ItemTracker.js';
import { ItemTrackerBuilder } from '../tracker/ItemTrackBuilder.js';
import { validateExifProperties } from '../exif/validation/Validations.js';
import exifApplyTo from '../exif/ExifWriting.js';

type FilesystemApplyCommand = {
  filepath: string;
  destPath: string;
  exifProperties: ExifProperty<any>[];
  itemTracker: ItemTracker;
};

type WithDestPath = FilesystemApplyCommand & {
  destinationPath: string;
};

const check = (
  command: FilesystemApplyCommand,
): Either<Error, FilesystemApplyCommand> => {
  const move = canMove(command.filepath, command.destPath);
  const validationErrors = validateExifProperties(command.exifProperties);

  if (!move) {
    command.itemTracker.track(
      ItemTrackerBuilder.start()
        .withId(command.filepath)
        .asErrorItem(`CAN'T MOVE FILE ${command.filepath}`)
        .build(),
    );
    return left(
      new Error(`CHECK_MOVING_FILE: CAN'T MOVE FILE ${command.filepath}`),
    );
  }

  if (validationErrors.length > 0) {
    validationErrors.forEach((validationError) => {
      command.itemTracker.track(
        ItemTrackerBuilder.start()
          .withId(command.filepath)
          .asErrorItem(validationError.message)
          .build(),
      );
    });
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
    TE.mapLeft((error) => {
      command.itemTracker.track(
        ItemTrackerBuilder.start()
          .withId(command.filepath)
          .asErrorItem(String(error.message))
          .build(),
      );
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
    TE.mapLeft((error: Error) => {
      command.itemTracker.track(
        ItemTrackerBuilder.start()
          .withId(command.filepath)
          .asErrorItem(error.message)
          .build(),
      );
      return new Error(
        `FAILED_APPLY_EXIF: CAN'T APPLY EXIF ON FILE ${command.filepath}`,
      );
    }),
  );
};

const track = (withDestPath: WithDestPath): TE.TaskEither<Error, void> => {
  return TE.tryCatch(
    () => {
      withDestPath.itemTracker.track(
        ItemTrackerBuilder.start()
          .withId(withDestPath.destinationPath)
          .asNormalItem(ItemState.PROCESS),
      );
      return Promise.resolve();
    },
    (reason) =>
      new Error(
        `FAILED_TRACKING: ${
          reason instanceof Error ? reason.message : String(reason)
        }`,
      ),
  );
};

const filesystemApply = (
  command: FilesystemApplyCommand,
): TE.TaskEither<Error, void> => {
  return pipe(
    TE.fromEither(check(command)),
    TE.chain(exif),
    TE.chain(move),
    TE.chain(track),
  );
};

export { filesystemApply, FilesystemApplyCommand };
