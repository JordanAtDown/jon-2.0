import { ExifProperty } from '../ExifProperty.js';
import { DateTime } from 'luxon';

/**
 * Validates keywords.
 * - If the value is an array, all elements must be non-empty strings.
 * - If the value is a string, it must not be empty.
 *
 * @param value - The value to validate (string or array of strings).
 * @returns True if valid, false otherwise.
 */
const validateKeywords = (value: string[]): boolean => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return true;
    }
    return value.every((item) => item.trim() !== '');
  } else {
    return false;
  }
};

/**
 * Validates that the value is a valid ISO date string.
 *
 * @param value - The value to validate.
 * @returns True if valid, false otherwise.
 */
const validateDateTime = (value: string): boolean =>
  DateTime.fromISO(value).isValid;
/**
 * Validates that a string value is not empty.
 *
 * @param value - The string to validate.
 * @returns True if the string is not empty, false otherwise.
 */
const validateNotEmpty = (value: string): boolean => value.trim() !== '';

/**
 * Creates a validator for a numeric range.
 *
 * @param min - Minimum acceptable value.
 * @param max - Maximum acceptable value.
 * @returns A function that validates if a number is within the range.
 */
const validateNumericRange =
  (min: number, max: number) =>
  (value: number): boolean =>
    value >= min && value <= max;

type ValidationError = {
  property: string;
  message: string;
};

const validateExifProperties = (
  exifProperties: ExifProperty<any>[],
): Array<ValidationError> => {
  return exifProperties
    .map((property) => {
      const value = property.getValue();

      if (
        property.validate &&
        value !== null &&
        !property.validate(value as NonNullable<typeof value>)
      ) {
        return {
          property: property.propertyName,
          message: property.errorMsg,
        };
      }
      return undefined;
    })
    .filter((error): error is ValidationError => error !== undefined);
};

export {
  validateKeywords,
  validateDateTime,
  validateNotEmpty,
  validateNumericRange,
  validateExifProperties,
};
