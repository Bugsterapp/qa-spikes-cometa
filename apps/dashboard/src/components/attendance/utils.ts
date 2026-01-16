import { AttendanceSessionEntity, AttendanceContextTypeEnum } from '@cometa/trpc/src/students/types';

export function getContextDisplayName(session: AttendanceSessionEntity): string {
  if (session.context_type === AttendanceContextTypeEnum.Group) {
    // @TODO: get grade and group names
    // @ts-ignore
    const gradeName = session.group.grade?.name || '';
    // @ts-ignore
    const groupName = session.group.name || '';
    return `${gradeName} ${groupName}`.trim() || '-';
  }

  if (session.context_type === AttendanceContextTypeEnum.Classroom && session.classroom) {
    return session.classroom.course?.name || '-';
  }

  return '-';
}

export function getContextTypeConfig(contextType: AttendanceContextTypeEnum | null): {
  label: string;
  theme: 'blue' | 'green';
} {
  if (contextType === AttendanceContextTypeEnum.Group) {
    return { label: 'Grupo', theme: 'blue' };
  }
  return { label: 'Clase', theme: 'green' };
}

export function getContextLevelGrade(session: AttendanceSessionEntity): string {
  if (session.context_type === AttendanceContextTypeEnum.Group) {
    // @TODO: get level and grade names
    // @ts-ignore
    const levelName = session.group?.level?.name || '';
    // @ts-ignore
    const gradeName = session.group?.grade?.name || '';
    return `${levelName} ${gradeName}`.trim() || '-';
  }

  if (session.context_type === AttendanceContextTypeEnum.Classroom) {
    const levelName = session.classroom?.level?.name || '';
    const gradeName = session.classroom?.grade?.name || '';
    return `${levelName} ${gradeName}`.trim() || '-';
  }

  return '-';
}

export function groupSessionsByDate(sessions: AttendanceSessionEntity[]): Map<string, AttendanceSessionEntity[]> {
  const grouped = new Map<string, AttendanceSessionEntity[]>();

  sessions.forEach((session) => {
    const date = session.date;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)?.push(session);
  });

  const sortedEntries = Array.from(grouped.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );

  return new Map(sortedEntries);
}
