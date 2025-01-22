import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { DateExtractor } from './DateExtractor';
import { RegexDateExtractor } from './RegexDateExtractor';

const createRoute = (
  regex: RegExp,
  extractor: DateExtractor,
): RegexDateExtractor => ({
  regex,
  extractor,
});

// TODO: A Supprimer à servi pour l'implémentation
type YYYYMMDDMatch = [string, string, string, string];
const regexYYYYMMDD = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const extractYYYYMMDD: DateExtractor = (filename) =>
  pipe(
    filename.match(regexYYYYMMDD),
    O.fromNullable,
    O.filter(
      (matches): matches is YYYYMMDDMatch =>
        matches.length === 4 && matches.every((matche) => matche !== undefined),
    ),
    O.map(
      ([_, year, month, day]) =>
        new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
    ),
  );

const routes: RegexDateExtractor[] = [
  createRoute(regexYYYYMMDD, extractYYYYMMDD),
];

export default routes;
