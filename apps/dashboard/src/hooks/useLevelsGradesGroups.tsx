import { api } from '../utils/api';
import { useSelectedSchool, useGetMembership } from '../guards/AuthGuard';
import { Status2B3Enum } from '@cometa/trpc/src/types';
import { useSession } from 'next-auth/react';

export function useLevelsGradeGroups() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { data: session } = useSession();

  const {
    data: levels,
    isPending: isLoading,
    refetch,
  } = api.students.getLevelsGroupsGrades.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const isSchoolOnboarding = selectedSchool?.status === Status2B3Enum.Onboarding;
  const allowedMemberships = ['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR'];
  const isStaff = Boolean(session?.user?.is_staff);

  const canEdit = (isSchoolOnboarding && allowedMemberships.includes(membership)) || isStaff;

  return {
    levels,
    isLoading,
    refetch,
    canEdit,
  };
}
