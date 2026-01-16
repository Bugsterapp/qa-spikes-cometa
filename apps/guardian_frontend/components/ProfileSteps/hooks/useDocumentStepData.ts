import { api } from '~/utils/api';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { MainStudentEntity } from '@cometa/trpc/src/students/types';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { useMemo } from 'react';

interface UseDocumentStepDataParams {
  student: MainStudentEntity | undefined;
  currentInscription: InscriptionEntity | undefined;
  enabled?: boolean;
}

interface UseDocumentStepDataReturn {
  entityId: string | undefined;
  levelId: string | undefined;
  schoolStepId: string | undefined;
  isLoading: boolean;
  isReady: boolean;
}

export function useDocumentStepData({
  student,
  currentInscription,
  enabled = true,
}: UseDocumentStepDataParams): UseDocumentStepDataReturn {
  const isLead = student?.state === 'lead';

  const { data: admissions, isLoading: isLoadingAdmissions } = api.admissions.getAdmissions.useQuery(
    {
      schoolId: student?.school_id as string,
      query: {
        external_id: [student?.id as string],
      },
    },
    {
      enabled: enabled && isLead && !!student?.school_id && !!student?.id,
    }
  );

  const admission = admissions?.results?.[0];

  const { data: schoolSteps, isLoading: isLoadingSchoolSteps } = api.admissions.getSchoolSteps.useQuery(
    {
      school_id: student?.school_id as string,
      query: {
        tag: SchoolStepTags.Documents,
      },
    },
    {
      enabled: enabled && !!student?.school_id,
    }
  );

  const documentStep = schoolSteps?.[0];

  const { entityId, levelId, schoolStepId, isReady } = useMemo(() => {
    const entityId = isLead ? admission?.id : student?.id;
    const levelId = currentInscription?.level_id;
    const schoolStepId = documentStep?.id;

    const isReady = !!entityId && !!schoolStepId;

    return { entityId, levelId, schoolStepId, isReady };
  }, [isLead, admission, student, currentInscription, documentStep]);

  const isLoading = isLoadingAdmissions || isLoadingSchoolSteps;

  return {
    entityId,
    levelId: levelId as string,
    schoolStepId: schoolStepId as string,
    isLoading,
    isReady,
  };
}
