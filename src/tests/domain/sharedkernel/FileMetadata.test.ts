import { describe, expect, it } from 'vitest';
import { DateTime } from 'luxon';
import * as O from 'fp-ts/lib/Option.js';
import FileMetadata from '../../../domain/sharedkernel/metadata/FileMetadata.js';
import CompiledDate from '../../../domain/sharedkernel/metadata/CompiledDate.js';
import ExifMetadata from '../../../domain/sharedkernel/metadata/ExifMetadata.js';
import { DateExtractor } from '../../../domain/shared/regex/DateExtractor.js';
import { expectNone, expectSome } from '../../shared/utils/test/Expected.js';

describe('FileMetadata', () => {
  describe('should getTags', () => {
    it('generate tags based on directory structure', () => {
      const generateMock = (items: string[]) => new Set(items);
      const fileMetadata = new FileMetadata(
        'image.jpg',
        'image',
        '/path/to/image.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
      );

      const tags = fileMetadata.getTags(generateMock);

      expect(tags).toBeInstanceOf(Set);
      expect(Array.from(tags)).toEqual(['path', 'to']);
    });

    it('handle empty directory gracefully', () => {
      const generateMock = (items: string[]) => new Set(items);
      const fileMetadata = new FileMetadata(
        'image.jpg',
        'image',
        '/image.jpg',
        '/',
        '.jpg',
        'PHOTO',
      );

      const tags = fileMetadata.getTags(generateMock);

      expect(tags).toBeInstanceOf(Set);
      expect(Array.from(tags)).toEqual([]);
    });
  });

  describe('should enrichWithDate', () => {
    const extractDateMock: DateExtractor = (filename: string) =>
      filename === 'image_with_date'
        ? O.some(DateTime.fromISO('2023-03-15T12:00:00'))
        : O.none;

    it('return date from Exif metadata when present', () => {
      const exif: ExifMetadata = {
        dateTimeOriginal: DateTime.fromISO('2023-03-14T10:00:00'),
      };
      const fileMetadata = new FileMetadata(
        'image.jpg',
        'image',
        '/path/to/image.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
        exif,
      );

      const enrichedDate = fileMetadata.enrichWithDate(extractDateMock);

      expectSome(enrichedDate, (result) => {
        expect(
          result.date.toISO({
            suppressMilliseconds: true,
            includeOffset: false,
          }),
        ).toEqual('2023-03-14T10:00:00');
      });
    });

    it('return date using extractor when Exif metadata is missing', () => {
      const fileMetadata = new FileMetadata(
        'image_with_date.jpg',
        'image_with_date',
        '/path/to/image_with_date.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
      );

      const enrichedDate = fileMetadata.enrichWithDate(extractDateMock);

      expectSome(enrichedDate, (result) => {
        expect(
          result.date.toISO({
            suppressMilliseconds: true,
            includeOffset: false,
          }),
        ).toEqual('2023-03-15T12:00:00');
      });
    });

    it('return None when no date is found', () => {
      const fileMetadata = new FileMetadata(
        'image.jpg',
        'image',
        '/path/to/image.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
      );

      const enrichedDate = fileMetadata.enrichWithDate(extractDateMock);

      expectNone(enrichedDate);
    });
  });

  describe('should compiled Date', () => {
    const dateExtractorMock: DateExtractor = (filename: string) =>
      filename.includes('extracted')
        ? O.some(DateTime.fromISO('2023-03-16T15:30:00'))
        : O.none;

    const dateGeneratorMock: DateExtractor = (filename: string) =>
      filename.includes('generated')
        ? O.some(DateTime.fromISO('2023-03-17T18:45:00'))
        : O.none;

    it('return compiled dates when all sources have values', () => {
      const exif: ExifMetadata = {
        dateTimeOriginal: DateTime.fromISO('2023-03-14T12:00:00'),
      };
      const fileMetadata = new FileMetadata(
        'file_extracted_generated.jpg',
        'file_extracted_generated',
        '/path/to/file_extracted_generated.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
        exif,
      );

      const compiledDate = fileMetadata.toCompiledDate(
        dateExtractorMock,
        dateGeneratorMock,
      );

      expectSome(compiledDate, (result) => {
        expect(result).toBeInstanceOf(CompiledDate);
        expectSome(result.extraite, (date) => {
          expect(
            date.toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            }),
          ).toEqual('2023-03-16T15:30:00');
        });
        expectSome(result.dateTimeOriginal, (date) => {
          expect(
            date.toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            }),
          ).toEqual('2023-03-14T12:00:00');
        });
        expectSome(result.dateDictionnaire, (date) => {
          expect(
            date.toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            }),
          ).toEqual('2023-03-17T18:45:00');
        });
      });
    });

    it('return None when no dates are available', () => {
      const fileMetadata = new FileMetadata(
        'file_without_dates.jpg',
        'file_without_dates',
        '/path/to/file_without_dates.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
      );

      const compiledDate = fileMetadata.toCompiledDate(
        dateExtractorMock,
        dateGeneratorMock,
      );

      expectNone(compiledDate);
    });

    it('handle cases where some but not all dates are present', () => {
      const exif: ExifMetadata = {
        dateTimeOriginal: DateTime.fromISO('2023-03-14T12:00:00Z'),
      };
      const fileMetadata = new FileMetadata(
        'file_extracted.jpg',
        'file_extracted',
        '/path/to/file_extracted.jpg',
        '/path/to',
        '.jpg',
        'PHOTO',
        exif,
      );

      const compiledDate = fileMetadata.toCompiledDate(
        dateExtractorMock,
        dateGeneratorMock,
      );

      expectSome(compiledDate, (result) => {
        expect(result).toBeInstanceOf(CompiledDate);
        expectSome(result.extraite, (date) => {
          expect(
            date.toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            }),
          ).toEqual('2023-03-16T15:30:00');
        });
        expectSome(result.dateTimeOriginal, (date) => {
          expect(
            date.toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            }),
          ).toEqual('2023-03-14T13:00:00');
        });
        expectNone(result.dateDictionnaire);
      });
    });
  });
});
