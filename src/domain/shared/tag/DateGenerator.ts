import { DateTime } from 'luxon';
import { Option } from 'fp-ts/Option';

interface DateGenerator {
  generate(item: string): Option<DateTime>;
}

export default DateGenerator;
