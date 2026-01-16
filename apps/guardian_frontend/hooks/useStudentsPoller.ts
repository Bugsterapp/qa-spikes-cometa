import { useEffect } from 'react';
import { useSelectedSchoolId } from '~/stores/globalStore';
import { useIsPolling, useSetPolling } from '~/pages/guardians/[guardianHash]/onboarding';
import { api } from '~/utils/api';

export const useStudentsPoller = () => {
  const schoolId = useSelectedSchoolId();
  const setStudentPolling = useSetPolling();
  const [isPolling, setIsPolling] = useIsPolling();

  const {
    data: guardianStudents,
    isLoading,
    refetch,
  } = api.guardian.studentList.useQuery(undefined, {
    refetchInterval: isPolling ? 1000 : false,
  });

  const filteredStudentsBySchool = guardianStudents?.filter((student) => student?.school === schoolId) ?? [];

  const totalStudents = filteredStudentsBySchool.length;
  const totalStudentsReady = filteredStudentsBySchool.filter((student) => student?.is_ready).length;

  useEffect(() => {
    if (isPolling) {
      setStudentPolling({
        currentValue: totalStudentsReady,
        maxValue: totalStudents,
      });
    }
  }, [totalStudentsReady, totalStudents, isPolling, setIsPolling, setStudentPolling]);

  return {
    data: filteredStudentsBySchool,
    isLoading,
    refetch,
  };
};
