import { InscriptionStepsEntity } from '@cometa/trpc/src/students/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';

interface UseSchoolInscriptionConfigReturn {
  isInscriptionsEnabled: boolean;
  inscriptionSteps: InscriptionStepsEntity | null | undefined;
  schoolCycle: SchoolCycleEntity | null | undefined;
}

export function useSchoolInscriptionConfig(): UseSchoolInscriptionConfigReturn {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id;

  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    {
      school_id: schoolId as string,
    },
    {
      enabled: !!schoolId,
    }
  );

  const inscriptions = schoolConfig?.inscriptions;
  const { dates, steps } = inscriptions || {};

  const atLeastOneStepEnable = (steps: InscriptionStepsEntity): boolean => {
    if (!steps) return false;

    const stepsValues = Object.values(steps);
    return stepsValues.some((step) => step === true);
  };

  const isAtLeastOneStepEnabled = atLeastOneStepEnable(steps as InscriptionStepsEntity);

  const activeDate = dates?.find((date) => date.is_active) ?? null;

  let isOnDate = false;

  if (activeDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(activeDate.start);

    const endDate = new Date(activeDate.end);
    endDate.setHours(23, 59, 59, 999);

    isOnDate = today >= startDate && today <= endDate;
  }

  const isInscriptionsEnabled = !!activeDate && isAtLeastOneStepEnabled && isOnDate;

  const { data: schoolCycle } = api.schools.getSchoolsCycleById.useQuery(
    {
      school_id: schoolId as string,
      school_cycle_id: activeDate?.school_cycle_id as string,
    },
    {
      enabled: !!activeDate?.school_cycle_id,
    }
  );

  return {
    isInscriptionsEnabled,
    inscriptionSteps: steps,
    schoolCycle,
  };
}
