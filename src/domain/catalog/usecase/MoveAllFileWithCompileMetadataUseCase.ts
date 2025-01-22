import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import MetadataRepository from '../MetadataRepository';
import YearMonth from '../YearMonth';
import Metadata from '../Metadata';
import OccurenceIdentifier from '../../shared/duplicate/OccurenceIdentifier';
import Occurrences from '../../shared/duplicate/Occurences';
import copyFile from '../../shared/filesystem/CopyFile';
import renameFile from '../../shared/filesystem/RenameFile';
import applyExifKeywords from '../../shared/exif/ApplyExifKeywords';

class MovingAllFileWithCompileMetadataUseCase {
  constructor(private readonly compiledMetadataRepository: MetadataRepository) {
    this.compiledMetadataRepository = compiledMetadataRepository;
  }

  public moveAllFiles = (): TE.TaskEither<Error, void> => {
    return pipe(
      this.compiledMetadataRepository.getAllUniqueYearsMonths(),
      TE.chain((yearMonths: YearMonth[]) =>
        pipe(
          yearMonths,
          A.map((yearMonth) =>
            this.processSingleYearMonthBatch(
              yearMonth,
              this.compiledMetadataRepository,
            ),
          ),
          TE.sequenceSeqArray,
          TE.map(() => void 0),
        ),
      ),
    );
  };

  private processSingleYearMonthBatch = (
    yearMonth: YearMonth,
    metadataRepository: MetadataRepository,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      metadataRepository.findByYearMonth(yearMonth),
      TE.chain((metadatas) => {
        const occurrenceManager = this.createOccurrenceManager(metadatas);

        return this.processAllMetadatas(metadatas, occurrenceManager);
      }),
    );
  };

  private createOccurrenceManager = (
    metadatas: Metadata[],
  ): OccurenceIdentifier => {
    const occurrences = metadatas.reduce<Occurrences>((acc, metadata) => {
      const name = metadata.newName;
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

    return new OccurenceIdentifier(occurrences);
  };

  private processAllMetadatas = (
    metadatas: Metadata[],
    occurenceIdentifier: OccurenceIdentifier,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      metadatas,
      A.map((metadata) =>
        pipe(
          copyFile(metadata.fullPath, metadata.destinationFolder),
          TE.chain((filePath) =>
            renameFile(filePath, metadata.newName, occurenceIdentifier),
          ),
          TE.chain(
            (renamedFilePath) =>
              applyExifKeywords(renamedFilePath, metadata.tags),
            // TODO: Apply exif dateTimeOriginal si aucune exif
          ),
          TE.map(() => void 0),
        ),
      ),
      TE.sequenceSeqArray,
      TE.map(() => void 0),
    );
  };
}

export default MovingAllFileWithCompileMetadataUseCase;
