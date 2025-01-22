import * as O from 'fp-ts/Option';

export type DateExtractor = (filename: string) => O.Option<Date>;
