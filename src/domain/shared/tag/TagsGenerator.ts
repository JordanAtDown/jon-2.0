import Tags from './Tags.js';

interface TagsGenerator {
  generate(items: string[]): Tags;
}

export default TagsGenerator;
