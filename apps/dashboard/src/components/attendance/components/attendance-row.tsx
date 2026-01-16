import { AttendanceSessionEntity } from '@cometa/trpc/src/students/types';
import SelectChip from '/src/components/atoms/SelectChip';
import { MoreHorizontalIcon } from 'lucide-react';
import { getContextDisplayName, getContextTypeConfig } from '../utils';
import { Button } from '@cometa/recreo/v2';

type AttendanceRowProps = {
  session: AttendanceSessionEntity;
  onClick?: () => void;
};

export function AttendanceRow({ session, onClick }: AttendanceRowProps) {
  const displayName = getContextDisplayName(session);
  const typeConfig = getContextTypeConfig(session.context_type);

  // @TODO: extract info from schools endpoints directly instead of ussing session data
  // @ts-ignore
  const level = session.context_type === 'group' ? session.group?.level?.name : session.classroom?.level?.name;
  // @ts-ignore
  const grade = session.context_type === 'group' ? session.group?.grade?.name : session.classroom?.grade?.name;
  const group = session.context_type === 'group' ? session.group?.name : session.classroom?.group?.name;

  const professorName = 'Carlos Ramírez'; // Placeholder
  const time = '10:35 am'; // Placeholder

  // @TODO: Add when the backend is ready
  // const attendanceCount = { present: 23, total: 25 }; // Placeholder
  // const progressPercentage = (attendanceCount.present / attendanceCount.total) * 100;

  return (
    <div
      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-6 transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <h3 className="text-[#212B36] text-lg font-semibold mb-1">{displayName}</h3>
        <p className="text-sm text-gray-500">
          {professorName} · {time}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SelectChip theme={typeConfig.theme}>{typeConfig.label}</SelectChip>

        {level && <span className="text-xs text-gray-700 bg-neutral-25 py-1 px-2 rounded-lg">{level}</span>}
        {grade && (
          <span className="text-xs text-gray-700 bg-neutral-25 py-1 px-2 rounded-lg">
            {grade} {group}
          </span>
        )}

        {/* @TODO: Add when the backend is ready */}
        {/*<div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 bg-[#D9D9D9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#637381] rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-700 min-w-[60px]">
          <UserIcon size={16} className="text-gray-500" />
          <span>
            {attendanceCount.present}/{attendanceCount.total}
          </span>
        </div>*/}

        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontalIcon size={20} className="text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
