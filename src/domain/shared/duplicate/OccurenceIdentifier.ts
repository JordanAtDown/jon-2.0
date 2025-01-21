import { pipe } from 'fp-ts/function';
import * as R from 'fp-ts/Record';
import * as O from 'fp-ts/Option';
import Occurrences from './Occurences';

type Identifiers = Record<string, number>;

class OccurenceIdentifier {
  private occurrences: Occurrences;
  private identifiers: Identifiers = {};

  constructor(occurrences: Occurrences = {}) {
    this.occurrences = occurrences;
  }

  /**
   * Generates a unique incremental identifier for a given key.
   *
   * @param {string} value - The key for which the identifier is being generated.
   * @return {O.Option<number>} - The generated identifier, or `O.none` if the key does not exist or the counter equals 0.
   */
  public generateUniqueIdentifier(value: string): O.Option<number> {
    return pipe(
      this.occurrences,
      R.lookup(value),
      O.chain((count) => (count > 0 ? this.decrement(count) : O.none)),
      O.map((newCount) => {
        this.occurrences = { ...this.occurrences, [value]: newCount };
        // Vérifier qu'on génére un identifiant uniquement quand la value existe dans occurences
        const newId = (this.identifiers[value] ?? 0) + 1;
        this.identifiers = { ...this.identifiers, [value]: newId };
        return newId;
      }),
    );
  }

  public getOccurrences(): { key: string; count: number }[] {
    return Object.entries(this.occurrences).map(([key, count]) => ({
      key,
      count,
    }));
  }

  private decrement(count: number) {
    return O.some(count - 1);
  }
}

export default OccurenceIdentifier;
