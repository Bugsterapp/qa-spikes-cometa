import dayjs from 'dayjs';
import mx from 'dayjs/locale/es-mx';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';

dayjs.extend(duration);
dayjs.extend(isToday);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter).locale(mx);

export default dayjs;
