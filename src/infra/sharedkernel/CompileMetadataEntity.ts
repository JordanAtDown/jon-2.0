import { DateTime } from 'luxon';
import { none, some } from 'fp-ts/lib/Option.js';
import CompiledMetadata from '../../domain/sharedkernel/metadata/CompiledMetadata.js';
import CompiledDate from '../../domain/sharedkernel/metadata/CompiledDate.js';

type CompileMetadataEntity = {
  _id: string;
  fullPath: string;
  tags: string[];
  year: number;
  month: number;
  hasExif: boolean;
  extension: string;
  type: string;
  date: {
    extraite: string | undefined | null;
    dateTimeOriginal: string | undefined | null;
    dateDictionnaire: string | undefined | null;
  };
};

const mapCompileMetadataEntityToMetadata = (
  entity: CompileMetadataEntity,
): CompiledMetadata => ({
  fullPath: entity.fullPath,
  tags: new Set(entity.tags),
  year: entity.year,
  month: entity.month,
  hasExif: entity.hasExif,
  extension: entity.extension,
  type: entity.type,
  date: new CompiledDate(
    entity.date.extraite ? some(DateTime.fromISO(entity.date.extraite)) : none,
    entity.date.dateTimeOriginal
      ? some(DateTime.fromISO(entity.date.dateTimeOriginal))
      : none,
    entity.date.dateDictionnaire
      ? some(DateTime.fromISO(entity.date.dateDictionnaire))
      : none,
  ),
});

const mapCompiledMetadataToCompileMetadataEntity = (
  compiledMetadata: CompiledMetadata,
): CompileMetadataEntity => ({
  _id: compiledMetadata.fullPath,
  fullPath: compiledMetadata.fullPath,
  tags: Array.from(compiledMetadata.tags),
  year: compiledMetadata.year,
  month: compiledMetadata.month,
  hasExif: compiledMetadata.hasExif,
  extension: compiledMetadata.extension,
  type: compiledMetadata.type,
  date: {
    extraite: extractOptionalDate(compiledMetadata.date.extraite),
    dateTimeOriginal: extractOptionalDate(
      compiledMetadata.date.dateTimeOriginal,
    ),
    dateDictionnaire: extractOptionalDate(
      compiledMetadata.date.dateDictionnaire,
    ),
  },
});

const extractOptionalDate = (option: {
  _tag: string;
  value?: DateTime;
}): string | undefined =>
  option._tag === 'Some' ? option.value?.toString() : undefined;

export {
  CompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
  mapCompiledMetadataToCompileMetadataEntity,
};
