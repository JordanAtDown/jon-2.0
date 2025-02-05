import TagsGenerator from '../../../domain/shared/tag/TagsGenerator.js';
import Tags from '../../../domain/shared/tag/Tags.js';

const SEPARATOR = ';';

class HashTagGenerator implements TagsGenerator {
  private readonly dictionary: Record<string, string>;

  constructor(dictionary: Record<string, string>) {
    this.dictionary = dictionary;
  }

  /**
   * Generates tags from an array of item.
   * @param items - Array of input strings.
   * @returns {Tags} - An set of strings corresponding to the tags.
   */
  public generate(items: string[]): Tags {
    return items.reduce<Tags>((acc, input) => {
      if (this.dictionary[input]) {
        const value = this.dictionary[input];
        if (value.includes(SEPARATOR)) {
          value
            .split(SEPARATOR)
            .filter((tag) => tag.trim() !== '')
            .forEach((tag) => acc.add(tag));
        } else {
          acc.add(value);
        }
      }
      return acc;
    }, new Set<string>());
  }
}

export default HashTagGenerator;
