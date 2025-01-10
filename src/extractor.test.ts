import { describe, it, expect, vi } from 'vitest';
import * as TE from 'fp-ts/TaskEither';
import {
  standardExtractor,
  exifExtractor,
  compositeExtractor,
} from './extractor';
import { expectRight, expectLeft } from './test.utils';
import * as exifr from 'exifr';

describe('extractor.ts', () => {
  describe('standardExtractor', () => {
    it('should extract standard metadata from a file', async () => {
      const filePath = '/path/to/file.jpg';
      const result = await standardExtractor.extract(filePath)();

      expectRight(result, (metadata) => {
        expect(metadata).toMatchObject({
          name: 'file',
          fullPath: '/path/to',
          extension: '.jpg',
        });
      });
    });
  });

  describe('exifExtractor', () => {
    it('should extract EXIF metadata from a file', async () => {
      const filePath = '/path/to/file.jpg';
      const mockExifData = { make: 'Canon', model: 'EOS' };
      const spy = vi.spyOn(exifr, 'parse').mockResolvedValue(mockExifData);

      const result = await exifExtractor.extract(filePath)();

      expectRight(result, (metadata) => {
        expect(metadata).toMatchObject({ exif: mockExifData });
      });

      expect(spy).toHaveBeenCalledWith(filePath);

      // Restore the mocked method
      spy.mockRestore();
    });

    it('should return an error if exifr.parse fails', async () => {
      const filePath = '/path/to/file.jpg';
      const mockError = new Error('Failed to parse EXIF data');

      // Spy on the parse method of exifr and mock it to throw an error
      const spy = vi.spyOn(exifr, 'parse').mockRejectedValue(mockError);

      const result = await exifExtractor.extract(filePath)();

      // Validate that the result is a failure (Left) and contains the error
      expectLeft(result, (error) => {
        expect(error.message).toEqual('Error: Failed to parse EXIF data');
      });

      // Ensure that exifr.parse was called with the correct argument
      expect(spy).toHaveBeenCalledWith(filePath);

      // Restore the mocked method
      spy.mockRestore();
    });
  });

  describe('compositeExtractor', () => {
    it('should merge metadata extracted from multiple extractors', async () => {
      const filePath = '/path/to/file.jpg';
      const combinedExtractor = compositeExtractor([
        standardExtractor,
        exifExtractor,
      ]);

      const mockExifData = { make: 'Canon', model: 'EOS' };

      // Spy on the parse method of exifr and mock the return value
      const spy = vi.spyOn(exifr, 'parse').mockResolvedValue(mockExifData);

      const result = await combinedExtractor.extract(filePath)();

      // Validate that the combined metadata is correct
      expectRight(result, (metadata) => {
        expect(metadata).toMatchObject({
          name: 'file',
          fullPath: '/path/to',
          extension: '.jpg',
          exif: mockExifData,
        });
      });

      // Ensure that exifr.parse was called with the correct argument
      expect(spy).toHaveBeenCalledWith(filePath);

      // Restore the mocked method
      spy.mockRestore();
    });

    it('should return an error if one of the extractors fails', async () => {
      const filePath = '/path/to/file.jpg';
      const failingExtractor = {
        extract: () => TE.left(new Error('Extraction failed')), // Retourne un TaskEither avec l'erreur
      };

      const combinedExtractor = compositeExtractor([
        standardExtractor,
        failingExtractor,
      ]);

      // No need to spy here since we simulate a failing extractor
      const result = await combinedExtractor.extract(filePath)();

      // Validate that the result is a failure
      expectLeft(result, (error) => {
        expect(error).toEqual(new Error('Extraction failed'));
      });
    });
  });
});
