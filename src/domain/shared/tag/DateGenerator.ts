import { DateTime } from 'luxon';
import { Option } from 'fp-ts/lib/Option.js';

interface DateGenerator {
  generate(item: string): Option<DateTime>;
}

export default DateGenerator;
