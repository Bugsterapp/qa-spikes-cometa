import { DynamicFormConfiguration } from '/src/components/admissions/setup/admission-steps/dynamic-forms';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';

export default function PsychopedagogicalFormConfigurationPage() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const { data: schoolSteps } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const psychopedagogicalFormStep = schoolSteps?.find((step) => step.tag === SchoolStepTags.PsychopedagogicalForm);
  const stepNumber = psychopedagogicalFormStep?.order || 1;

  return (
    <DynamicFormConfiguration
      tag={SchoolStepTags.PsychopedagogicalForm}
      title="Información psicopedagógica"
      description="Define qué información psicopedagógica te ayudará a entender mejor el contexto del estudiante. Usa esta plantilla como punto de partida."
      stepNumber={stepNumber}
    />
  );
}

PsychopedagogicalFormConfigurationPage.auth = true;
