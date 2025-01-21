import EXTENSIONS from './Extensions';

/**
 * Builds glob patterns for Fast Glob from a dictionary of extensions.
 *
 * @param keys - Keys of the extensions/categories to include (e.g., ["MP4", "RAW", "JPG/JPEG"]).
 * @returns List of glob patterns for Fast Glob.
 *
 * Example input: ["MP4", "JPG/JPEG"]
 * Example output: ["**/ /*.mp4", "**/ /*.jpg", "**/ /*.jpeg"]
 */
const buildPatterns = (keys: string[]): string[] => {
  return keys
    .flatMap((key) => EXTENSIONS[key] || [])
    .map((ext) => `**/*.${ext}`);
};

export default buildPatterns;
