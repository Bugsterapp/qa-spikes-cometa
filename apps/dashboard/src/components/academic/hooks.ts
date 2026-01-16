import { useMemo } from 'react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { TeacherProfileEntity } from '@cometa/trpc/src/students/types';
import { UserDTO } from '@cometa/trpc';

export type UserTeacherProfileType = {
  user: UserDTO;
  teacherProfile: TeacherProfileEntity;
};

type UseGetTeacherProfilesProps = {
  filters?: {
    search?: string;
    role?: string | string[];
  };
};

export function useGetTeacherProfiles({ filters }: UseGetTeacherProfilesProps = {}) {
  const selectedSchool = useSelectedSchool();

  const { data: teachersProfiles, isPending: isLoadingListTeacherProfiles } = api.students.listTeacherProfiles.useQuery(
    {
      school_id: selectedSchool?.id as string,
      role: filters?.role || undefined,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const { data: users, isPending: isLoadingGetUsers } = api.schools.getUsers.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        ignore_company_members: false,
        search: filters?.search || undefined,
      },
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const userTeacherProfiles: UserTeacherProfileType[] = useMemo(() => {
    if (!users || !teachersProfiles) return [];

    const profilesMap = new Map(teachersProfiles.map((tp) => [tp.membership_id, tp]));

    return users
      .filter((u) => profilesMap.has(u.membership_id))
      .map((u) => ({
        user: u,
        teacherProfile: profilesMap.get(u.membership_id) as TeacherProfileEntity,
      }));
  }, [users, teachersProfiles]);

  return {
    data: userTeacherProfiles,
    isLoading: isLoadingListTeacherProfiles || isLoadingGetUsers,
  };
}
