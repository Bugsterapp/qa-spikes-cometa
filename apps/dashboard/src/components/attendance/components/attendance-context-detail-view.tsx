import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { XIcon, CircleIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import { InlineVoiceRecorder } from './inline-voice-recorder';
import { getContextTypeConfig } from '../utils';
import { AttendanceContextTypeEnum } from '@cometa/trpc/src/students/types';

type AttendanceContextDetailViewProps = {
  context: any | undefined;
  contextType: AttendanceContextTypeEnum | null;
  date: string;
  availableStudents: any[] | undefined;
  absentStudentIds: Set<string>;
  isLoadingStudents: boolean;
  isProcessing: boolean;
  onRecordingComplete: (blob: Blob) => void;
  onToggleStudentAbsence: (studentId: string) => void;
  onRecordingStarted?: () => void;
};

export function AttendanceContextDetailView({
  context,
  contextType,
  date,
  availableStudents,
  absentStudentIds,
  isLoadingStudents,
  isProcessing,
  onRecordingComplete,
  onToggleStudentAbsence,
  onRecordingStarted,
}: AttendanceContextDetailViewProps) {
  const contextConfig = getContextTypeConfig(contextType);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {contextType === AttendanceContextTypeEnum.Classroom
            ? `${context?.course?.name}${context?.variant ? ` ${context.variant}` : ''}`
            : `${context?.level?.name} · ${context?.grade?.name} ${context?.name}`}
        </h2>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span
            className={`px-3 py-1 bg-${contextConfig.theme}-100 text-${contextConfig.theme}-700 rounded-md text-sm font-medium`}
          >
            {contextConfig.label}
          </span>
          {context?.level?.name && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">{context.level.name}</span>
          )}
          {contextType === AttendanceContextTypeEnum.Classroom && context?.grade?.name && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
              {context.grade.name}
              {context?.group?.name}
            </span>
          )}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {format(parse(date, 'yyyy-MM-dd', new Date()), 'dd MMMM yyyy', { locale: es })}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Estudiantes ({availableStudents?.length || 0})
          </h3>
          <span className="text-sm text-gray-500">
            {(availableStudents?.length || 0) - absentStudentIds.size} presentes · {absentStudentIds.size} ausentes
          </span>
        </div>

        <InlineVoiceRecorder
          onRecordingComplete={onRecordingComplete}
          onRecordingStarted={onRecordingStarted}
          disabled={isProcessing}
          isProcessing={isProcessing}
        />

        <div className="mt-4 flex flex-col gap-2">
          {isLoadingStudents ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                  </div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : availableStudents && availableStudents.length > 0 ? (
            availableStudents.map((availableStudent) => {
              const firstName = availableStudent.student?.first_name;
              const lastName = availableStudent.student?.last_name;
              const fullName = `${firstName} ${lastName}`;
              const isAbsent = absentStudentIds.has(availableStudent.student_id);

              return (
                <button
                  key={availableStudent.student_id}
                  onClick={() => onToggleStudentAbsence(availableStudent.student_id)}
                  disabled={isProcessing}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left w-full bg-[#F8F9FB] hover:bg-[#ECEFF6]',
                    isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-xs font-medium">
                      {firstName?.charAt(0).toUpperCase()}
                      {lastName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-gray-700 truncate">{fullName}</p>
                  </div>
                  {isAbsent && (
                    <>
                      <span className="px-2.5 py-1 bg-[#D0D8E9] text-gray-700 rounded-lg text-xs font-medium">
                        Ausente
                      </span>
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        <XIcon size={16} />
                      </div>
                    </>
                  )}
                  {!isAbsent && <CircleIcon size={24} className="text-gray-400" />}
                </button>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">
                No hay estudiantes asignados a este{' '}
                {contextType === AttendanceContextTypeEnum.Classroom ? 'clase' : 'grupo'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
