import TagsGenerator from '../../../domain/shared/tag/TagsGenerator';
import Tags from '../../../domain/shared/tag/Tags';

class HashTagGenerator implements TagsGenerator {
  private readonly dictionary: Record<string, string>;

  constructor(dictionary: Record<string, string>) {
    this.dictionary = dictionary;
  }

  /**
   * Generates tags from an array of item.
   * @param items - Array of input strings.
   * @returns {Tags} - An array of strings corresponding to the tags.
   */
  public generate(items: string[]): Tags {
    return items.reduce<Tags>((acc, input) => {
      if (this.dictionary[input]) {
        acc.push(this.dictionary[input]);
      }
      return acc;
    }, []);
  }
}

export default HashTagGenerator;
