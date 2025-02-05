import { DateExtractor } from './DateExtractor.js';

export interface RegexDateExtractor {
  regex: RegExp;
  extractor: DateExtractor;
}
