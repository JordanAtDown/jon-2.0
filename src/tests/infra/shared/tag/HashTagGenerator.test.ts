import { describe, it, expect } from 'vitest';
import HashTagGenerator from '../../../../infra/shared/tag/HashTagGenerator.js';

describe('HashTagGenerator', () => {
  const sampleDictionary: Record<string, string> = {
    apple: '#fruit;#pomme',
    car: '#vehicle',
    laptop: '#technology',
    'red apple': '#redfruit',
    'sports car': '#fastvehicle',
    école: '#education',
    café: '#coffee',
    ÉCOLE: '#education_uppercase',
    CAFÉ: '#coffee_uppercase',
  };

  it.each([
    {
      items: ['apple', 'car', 'laptop'],
      expected: ['#fruit', '#vehicle', '#technology', '#pomme'],
      description: 'should generate all valid tags based on dictionary',
    },
    {
      items: ['apple', 'plane', 'laptop'],
      expected: ['#fruit', '#pomme', '#technology'],
      description: 'should ignore items not in the dictionary',
    },
    {
      items: ['train', 'boat', 'plane'],
      expected: [],
      description:
        'should return an empty array if no items match the dictionary',
    },
    {
      items: [],
      expected: [],
      description:
        'should return an empty array when given an empty input array',
    },
    {
      items: ['red apple', 'sports car'],
      expected: ['#redfruit', '#fastvehicle'],
      description: 'should correctly generate tags for keys with spaces',
    },
    {
      items: ['école', 'café', 'école'],
      expected: ['#education', '#coffee'],
      description: 'should correctly generate tags for keys with accents',
    },
    {
      items: ['ÉCOLE', 'CAFÉ'],
      expected: ['#education_uppercase', '#coffee_uppercase'],
      description:
        'should correctly generate tags for uppercase keys with accents',
    },
    {
      items: ['café', 'CAFÉ', 'apple', 'ÉCOLE', 'sports car'],
      expected: [
        '#coffee',
        '#coffee_uppercase',
        '#pomme',
        '#fruit',
        '#education_uppercase',
        '#fastvehicle',
      ],
      description:
        'should correctly process a mix of keys with accents, uppercase, and spaces',
    },
  ])('$description', ({ items, expected }) => {
    const generator = new HashTagGenerator(sampleDictionary);

    const result = generator.generate(items);

    expect(result).toEqual(new Set(expected));
  });
});
