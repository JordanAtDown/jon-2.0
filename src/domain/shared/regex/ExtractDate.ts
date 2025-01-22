import { RegexDateExtractor } from './RegexDateExtractor';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

const extractDate = (
  routes: RegexDateExtractor[],
  filename: string,
): O.Option<Date> =>
  pipe(
    routes.find((route) => route.regex.test(filename)),
    O.fromNullable,
    O.chain((route) => route.extractor(filename)),
  );

export default extractDate;
