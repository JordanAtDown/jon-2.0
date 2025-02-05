/**
 * Represents a possible value type for an EXIF property, which can
 * be a string, an array of strings, a number, or null.
 */
type ExifValue = string | string[] | number | null;

/**
 * Represents an EXIF property with a generic type `VALUE` extending `ExifValue`.
 * It defines metadata for an EXIF property, including its name,
 * a method to retrieve its value, a validation function, and an error message.
 */
interface ExifProperty<VALUE extends ExifValue> {
  /**
   * The name of the EXIF property.
   */
  propertyName: string;

  /**
   * A function to retrieve the value of the EXIF property.
   */
  getValue: () => VALUE;

  /**
   * A function to validate the value of the EXIF property. It takes a `NonNullable`
   * value of type `T`, which means the value cannot be null, and returns `true`
   * if the value is valid, or `false` otherwise.
   */
  validate: (value: NonNullable<VALUE>) => boolean;

  /**
   * An error message that is displayed when validation of the EXIF property fails.
   */
  errorMsg: string;
}

class ExifPropertyBuilder<VALUE extends ExifValue> {
  private readonly propertyName: string;
  private valueGetter: () => VALUE;
  private validator: (value: NonNullable<VALUE>) => boolean;
  private errorMsg: string;

  constructor(propertyName: string) {
    this.propertyName = propertyName;
    this.valueGetter = () => null as VALUE;
    this.validator = () => true;
    this.errorMsg = 'Validation failed.';
  }

  withValueGetter(getter: () => VALUE): this {
    this.valueGetter = getter;
    return this;
  }

  withValidator(validator: (value: NonNullable<VALUE>) => boolean): this {
    this.validator = validator;
    return this;
  }

  withErrorMessage(errorMsg: string): this {
    this.errorMsg = errorMsg;
    return this;
  }

  build(): ExifProperty<VALUE> {
    return {
      propertyName: this.propertyName,
      getValue: this.valueGetter,
      validate: this.validator,
      errorMsg: this.errorMsg,
    };
  }
}

export { ExifProperty, ExifValue, ExifPropertyBuilder };
