import dayjs from 'dayjs';
import mx from 'dayjs/locale/es-mx';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isToday from 'dayjs/plugin/isToday';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

const customMX = { ...mx, weekdays: mx.weekdays?.map((day) => day.charAt(0).toUpperCase() + day.slice(1)) };

dayjs.extend(duration);
dayjs.extend(isToday);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(isSameOrAfter).locale(customMX);

export default dayjs;
