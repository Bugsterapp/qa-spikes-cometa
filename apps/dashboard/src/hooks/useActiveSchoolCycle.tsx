import SelectChip from '../components/atoms/SelectChip';
import { useSelectedSchoolId } from '../guards/AuthGuard';
import { api } from '../utils/api';

const useGetActiveSchoolCycleElement = (elementId: string) => {
  const selectedSchoolId = useSelectedSchoolId();
  const { data: schoolarCycles } = api.schools.schoolsCycles.useQuery(
    { school_id: selectedSchoolId || '' },
    { enabled: !!selectedSchoolId }
  );

  const activeSchoolCycle = schoolarCycles?.find((cycle) => cycle.is_active)?.id;

  if (activeSchoolCycle === elementId) {
    return <SelectChip theme="blue">Ciclo actual</SelectChip>;
  }
  return null;
};

export default useGetActiveSchoolCycleElement;
