import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags, SchoolStepStatusEnum, SchoolStepTypeEnum } from '@cometa/trpc/src/admissions/types';
import { presetDefaultRedirectUrl, presetDefaultCompletedByRules } from '../utils/step-defaults';

export function useUpdateStepStatus(tag: SchoolStepTags) {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });
  const upsertSchoolSteps = api.admissions.upsertSchoolSteps.useMutation();
  const utils = api.useUtils();

  const currentStep = schoolSteps?.find((step) => step.tag === tag);

  const updateStepToDraft = useCallback(async () => {
    if (!currentStep) return;

    await upsertSchoolSteps.mutateAsync([
      {
        id: currentStep.id,
        name: currentStep.name as string,
        description: currentStep.description as string,
        school_id: currentStep.school_id as string,
        order: currentStep.order as number,
        tag: currentStep.tag as SchoolStepTags,
        type: currentStep.type as SchoolStepTypeEnum,
        actions: {
          to_do: {
            label: currentStep.actions?.to_do?.label || 'Completar',
            redirect_url:
              currentStep.actions?.to_do?.redirect_url ||
              presetDefaultRedirectUrl(currentStep.tag as SchoolStepTags, currentStep.type as SchoolStepTypeEnum),
          },
          in_progress: {
            label: currentStep.actions?.in_progress?.label || 'Continuar',
            redirect_url: currentStep.actions?.in_progress?.redirect_url || '',
          },
          completed: {
            label: currentStep.actions?.completed?.label || 'Revisar',
            redirect_url:
              currentStep.actions?.completed?.redirect_url ||
              presetDefaultRedirectUrl(currentStep.tag as SchoolStepTags, currentStep.type as SchoolStepTypeEnum),
          },
        },
        status: SchoolStepStatusEnum.Draft,
        rules: currentStep.rules || presetDefaultCompletedByRules(currentStep.tag as SchoolStepTags),
      },
    ]);

    await utils.admissions.getSchoolSteps.invalidate({ schoolId });
  }, [currentStep, upsertSchoolSteps, utils, schoolId]);

  const handleSaveAndUpdateStatus = useCallback(
    async (additionalSaveAction?: () => Promise<void>) => {
      if (additionalSaveAction) {
        await additionalSaveAction();
      }

      await updateStepToDraft();

      router.push('/admissions/setup');
    },
    [updateStepToDraft, router]
  );

  return {
    updateStepToDraft,
    handleSaveAndUpdateStatus,
    currentStep,
    upsertSchoolSteps,
  };
}
