import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSelectedSchoolId } from '~/stores/globalStore';
import { api } from '~/utils/api';

interface UseSchoolCycleReturn {
  schoolCycle: SchoolCycleEntity | null;
  schoolCycles: SchoolCycleEntity[] | undefined;
}

export function useSchoolCycle(): UseSchoolCycleReturn {
  const schoolId = useSelectedSchoolId();
  const { data: schoolCycles } = api.schools.getSchoolsCycles.useQuery(
    {
      school_id: schoolId as string,
    },
    {
      enabled: !!schoolId,
    }
  );

  const activeCycle = schoolCycles?.find((cycle) => cycle.is_active) ?? null;
  let schoolCycle = activeCycle;
  if (activeCycle?.next_id) {
    schoolCycle = schoolCycles?.find((cycle) => cycle.id === activeCycle.next_id) as SchoolCycleEntity;
  }

  return {
    schoolCycle,
    schoolCycles,
  };
}
