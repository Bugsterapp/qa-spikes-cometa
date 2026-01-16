import { useMemo } from 'react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import {
  AttendanceContextTypeEnum,
  AttendanceSessionIncludeEnum,
  AttendanceSessionEntity,
  ClassroomIncludeEnum,
} from '@cometa/trpc/src/students/types';

export function useAttendanceSessions() {
  const selectedSchool = useSelectedSchool();
  // const { activeCycle } = useSchoolCycleSelector();

  const { data: sessions, isPending: isLoadingSessions } = api.students.listAttendanceSessions.useQuery(
    {
      school_id: selectedSchool?.id as string,
      include: [
        AttendanceSessionIncludeEnum.Group,
        AttendanceSessionIncludeEnum.Classroom,
        AttendanceSessionIncludeEnum.EvaluationPeriod,
      ],
    },
    {
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
    }
  );

  const classroomIds = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter((s) => s.context_type === AttendanceContextTypeEnum.Classroom && s.context_id)
      .map((s) => s.context_id);
  }, [sessions]);

  const { data: classroomsData } = api.students.listClassrooms.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        id: classroomIds,
        include: [
          ClassroomIncludeEnum.Course,
          ClassroomIncludeEnum.Level,
          ClassroomIncludeEnum.Grade,
          ClassroomIncludeEnum.Group,
        ] as string[],
      },
    },
    {
      enabled: !!selectedSchool?.id && classroomIds.length > 0,
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  const { data: levelsData } = api.students.getLevelsGroupsGrades.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
      staleTime: 60 * 1000 * 60,
      refetchOnWindowFocus: false,
    }
  );

  const enrichedSessions = useMemo(() => {
    if (!sessions) return [];

    const classroomsMap = new Map((classroomsData?.results || []).map((classroom) => [classroom.id, classroom]));

    const groupsMap = new Map();
    levelsData?.forEach((level) => {
      level.grades?.forEach((grade) => {
        grade.groups?.forEach((group) => {
          groupsMap.set(group.id, {
            ...group,
            grade,
            level,
          });
        });
      });
    });

    return sessions.map((session) => {
      const enrichedSession = { ...session };

      if (session.context_type === AttendanceContextTypeEnum.Classroom && session.context_id) {
        const classroom = classroomsMap.get(session.context_id);
        if (classroom) {
          enrichedSession.classroom = classroom;
        }
      }

      if (session.context_type === AttendanceContextTypeEnum.Group && session.context_id) {
        const groupData = groupsMap.get(session.context_id);
        if (groupData) {
          enrichedSession.group = groupData;
        }
      }

      return enrichedSession;
    }) as AttendanceSessionEntity[];
  }, [sessions, classroomsData, levelsData]);

  const isLoading = isLoadingSessions;

  return {
    data: enrichedSessions,
    isLoading,
  };
}
