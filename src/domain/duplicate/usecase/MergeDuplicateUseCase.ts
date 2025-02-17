import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as path from 'path';
import MergeDuplicateCommand from './MergeDuplicateCommand.js';
import { safeParse } from '../Parse.js';
import {
  copyFile,
  deleteFile,
  ensureDirExists,
  readFile,
} from '../../shared/filesystem/FPfilesystem.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';
import WrapperMutableProgressTracker from '../../shared/tracker/WrapperMutableProgressTracker.js';
import ProgressTracker from '../../shared/tracker/ProgressTracker.js';
import WrapperMutableItemTracker from '../../shared/tracker/WrapperMutableItemTracker.js';
import { ItemTrackerBuilder } from '../../shared/tracker/ItemTrackBuilder.js';
import { ItemState, ItemTracker } from '../../shared/tracker/ItemTracker.js';
import { safeGroupBy } from '../GroupBy.js';
import { DuplicateFile, DuplicateFiles } from '../DuplicateFiles.js';
import {
  CategorySource,
  resolveDefaultCheckpoint,
} from '../../sharedkernel/checkpoint/CheckpointData.js';
import { DateTime } from 'luxon';

class MergeDuplicateUseCase {
  constructor(private readonly checkpoint: Checkpoint) {}

  withCommand(command: MergeDuplicateCommand): TE.TaskEither<Error, void> {
    return pipe(
      readFile(command.importFilePath),
      TE.chain((content: string) => {
        return safeParse(content);
      }),
      TE.chain((parsedFiles: Array<DuplicateFile>) => safeGroupBy(parsedFiles)),
      TE.chain((groupedFiles) =>
        pipe(
          this.checkpoint.findBy(command.idCheckpoint),
          TE.chain((optionAggrCheckpoint) => {
            return resolveDefaultCheckpoint(
              optionAggrCheckpoint,
              {
                _id: '',
                category: CategorySource.Dir,
                lastUpdate: DateTime.now(),
                processed: new Set(),
                source: command.importFilePath,
              },
              command.idCheckpoint,
            );
          }),
          TE.map((checkpointDetails) => {
            const checkpointProcessed = checkpointDetails.processed;
            return this.filterUnprocessedFiles(
              groupedFiles,
              checkpointProcessed,
            );
          }),
          TE.chain((filteredGroupDuplicateFiles) => {
            const progressTracker = new WrapperMutableProgressTracker(
              ProgressTracker.init(
                Object.keys(filteredGroupDuplicateFiles).length,
                command.progress,
              ),
            );
            const itemTracker = new WrapperMutableItemTracker(
              ItemTracker.init(command.itemCallback),
            );
            return this.processDuplicatesFileByGroup(
              filteredGroupDuplicateFiles,
              progressTracker,
              itemTracker,
              command.importFilePath,
              command.idCheckpoint,
            );
          }),
        ),
      ),
    );
  }

  private filterUnprocessedFiles(
    groupedFiles: Record<string, DuplicateFiles>,
    checkpointProcessed: Set<string>,
  ): Record<string, DuplicateFiles> {
    return Object.fromEntries(
      Object.entries(groupedFiles)
        .map(([key, files]) => {
          const unprocessedFiles = files.files.filter(
            (file) => !checkpointProcessed.has(file.filename),
          );
          return unprocessedFiles.length > 0
            ? [key, { ...files, files: unprocessedFiles }]
            : null;
        })
        .filter((entry): entry is [string, DuplicateFiles] => entry !== null),
    );
  }

  private processDuplicatesFileByGroup(
    groupedFiles: Record<string, DuplicateFiles>,
    progress: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
    source: string = '',
    idCheckpoint: string,
  ): TE.TaskEither<Error, void> {
    return pipe(
      Object.entries(groupedFiles),
      TE.traverseArray(([id, files]) =>
        this.handleDuplicateFiles(
          id,
          idCheckpoint,
          source,
          files,
          progress,
          itemTracker,
        ),
      ),
      TE.map(() => undefined),
    );
  }

  private handleDuplicateFiles(
    id: string,
    idCheckpoint: string,
    source: string,
    files: DuplicateFiles,
    progress: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, void> {
    return pipe(files.mergePaths(), (newMergePath) =>
      pipe(
        ensureDirExists(newMergePath),
        TE.chain(() => this.copyFile(files.files[0]!, newMergePath)),
        TE.chain(() => this.deleteFiles(files.files)),
        TE.chain(() => {
          progress.increment();
          itemTracker.track(
            ItemTrackerBuilder.start()
              .withId(id)
              .asNormalItem(ItemState.PROCESS),
          );
          this.checkpoint.save({
            _id: idCheckpoint,
            category: CategorySource.ID,
            lastUpdate: DateTime.now(),
            processed: new Set([id]),
            source: source,
          });
          return TE.right(void 0);
        }),
      ),
    );
  }

  private copyFile(
    fileDT: DuplicateFile,
    targetFolderPath: string,
  ): TE.TaskEither<Error, DuplicateFile> {
    return pipe(
      copyFile(
        path.join(fileDT.folder, fileDT.filename), // Source
        path.join(targetFolderPath, fileDT.filename), // Destination
      ),
      TE.map(() => fileDT),
    );
  }

  private deleteFiles(
    fileToRemove: Array<DuplicateFile>,
  ): TE.TaskEither<Error, void> {
    return pipe(
      fileToRemove,
      (files) =>
        TE.traverseArray((fileToDelete: DuplicateFile) =>
          deleteFile(path.join(fileToDelete.folder, fileToDelete.filename)),
        )(files),
      TE.map(() => void 0),
    );
  }
}

export default MergeDuplicateUseCase;
