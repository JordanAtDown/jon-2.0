import { describe, it, expect } from 'vitest';
import {
  validateDateTime,
  validateExifProperties,
  validateKeywords,
  validateNotEmpty,
  validateNumericRange,
} from '../../../../../domain/shared/exif/validation/Validations.js';
import { ExifPropertyBuilder } from '../../../../../domain/shared/exif/ExifProperty';

describe('validateExifProperties', () => {
  it('should return no validation errors for valid properties', () => {
    const validProperty1 = new ExifPropertyBuilder<string>('Date')
      .withValueGetter(() => '2023-10-25T15:30:00Z')
      .withValidator(validateDateTime)
      .withErrorMessage('Invalid date format.')
      .build();

    const validProperty2 = new ExifPropertyBuilder<string[]>('Keywords')
      .withValueGetter(() => ['sunset', 'landscape'])
      .withValidator(validateKeywords)
      .withErrorMessage('Invalid keywords.')
      .build();

    const validProperties = [validProperty1, validProperty2];

    const errors = validateExifProperties(validProperties);

    expect(errors).toEqual([]);
  });

  it('should return validation errors for invalid properties', () => {
    const invalidProperty1 = new ExifPropertyBuilder<string>('Date')
      .withValueGetter(() => 'invalid-date')
      .withValidator(validateDateTime)
      .withErrorMessage('Invalid date format.')
      .build();

    const invalidProperty2 = new ExifPropertyBuilder<string[]>('Keywords')
      .withValueGetter(() => ['sunset', ''])
      .withValidator(validateKeywords)
      .withErrorMessage('Invalid keywords.')
      .build();

    const invalidProperties = [invalidProperty1, invalidProperty2];

    const errors = validateExifProperties(invalidProperties);

    expect(errors).toEqual([
      {
        property: 'Date',
        message: 'Invalid date format.',
      },
      {
        property: 'Keywords',
        message: 'Invalid keywords.',
      },
    ]);
  });

  it('should skip properties with null values', () => {
    const nullableProperty = new ExifPropertyBuilder<string | null>(
      'Description',
    )
      .withValueGetter(() => null)
      .withValidator(validateNotEmpty)
      .withErrorMessage('Description cannot be empty.')
      .build();

    const properties = [nullableProperty];

    const errors = validateExifProperties(properties);

    expect(errors).toEqual([]);
  });

  it('should validate numeric range correctly', () => {
    const validNumericProperty = new ExifPropertyBuilder<number>('Rating')
      .withValueGetter(() => 4)
      .withValidator(validateNumericRange(1, 5))
      .withErrorMessage('Rating must be between 1 and 5.')
      .build();

    const invalidNumericProperty = new ExifPropertyBuilder<number>('Rating')
      .withValueGetter(() => 10)
      .withValidator(validateNumericRange(1, 5))
      .withErrorMessage('Rating must be between 1 and 5.')
      .build();

    const properties = [validNumericProperty, invalidNumericProperty];

    const errors = validateExifProperties(properties);

    expect(errors).toEqual([
      {
        property: 'Rating',
        message: 'Rating must be between 1 and 5.',
      },
    ]);
  });

  it('should handle properties with no validation function', () => {
    const propertyWithoutValidation = new ExifPropertyBuilder<string>('Author')
      .withValueGetter(() => 'John Doe')
      .build();

    const properties = [propertyWithoutValidation];

    const errors = validateExifProperties(properties);

    expect(errors).toEqual([]);
  });
});
