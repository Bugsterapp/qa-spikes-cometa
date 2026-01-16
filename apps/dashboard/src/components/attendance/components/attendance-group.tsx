import { AttendanceSessionEntity } from '@cometa/trpc/src/students/types';
import { AttendanceRow } from './attendance-row';
import { differenceInDays, parse, format } from 'date-fns';
import { es } from 'date-fns/locale';

type AttendanceGroupProps = {
  date: string;
  sessions: AttendanceSessionEntity[];
  onSessionClick?: (session: AttendanceSessionEntity) => void;
};

const TODAY_TEXT = 'HOY';
const YESTERDAY_TEXT = 'AYER';

function getDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  date.setHours(0, 0, 0, 0);

  const diffDays = differenceInDays(today, date);

  if (diffDays === 0) return TODAY_TEXT;
  if (diffDays === 1) return YESTERDAY_TEXT;
  return format(date, "EEEE, d 'de' MMMM", { locale: es }).toUpperCase();
}

export function AttendanceGroup({ date, sessions, onSessionClick }: AttendanceGroupProps) {
  const label = getDateLabel(date);
  const count = sessions.length;

  return (
    <div className="flex flex-col pb-6 bg-gradient-to-r from-[#E6F2FA] to-[#F1F1FD] rounded-xl p-8 gap-4">
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
        <span className="text-xs font-semibold text-gray-500 rounded-full border border-[#D0D8E9] bg-white w-5 h-5 flex items-center justify-center text-center leading-3">
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sessions.map((session) => (
          <AttendanceRow key={session.id} session={session} onClick={() => onSessionClick?.(session)} />
        ))}
      </div>
    </div>
  );
}
