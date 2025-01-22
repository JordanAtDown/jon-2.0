import { DateExtractor } from './DateExtractor';

export interface RegexDateExtractor {
  regex: RegExp;
  extractor: DateExtractor;
}
