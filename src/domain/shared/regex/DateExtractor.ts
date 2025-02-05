import * as O from 'fp-ts/Option';
import { DateTime } from 'luxon';

export type DateExtractor = (filename: string) => O.Option<DateTime>;
