import * as O from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';

export type DateExtractor = (filename: string) => O.Option<DateTime>;
