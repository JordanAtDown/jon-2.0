import Tags from './Tags';

interface TagsGenerator {
  generate(items: string[]): Tags;
}

export default TagsGenerator;
