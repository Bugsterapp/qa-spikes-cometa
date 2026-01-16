import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { DynamicFormConfiguration } from '/src/components/admissions/setup/admission-steps/dynamic-forms';

export default function ConsentmentFormConfigurationPage() {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const { data: schoolSteps } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const consentFormStep = schoolSteps?.find((step) => step.tag === SchoolStepTags.ConsentForm);
  const stepNumber = consentFormStep?.order || 1;

  return (
    <DynamicFormConfiguration
      tag={SchoolStepTags.ConsentForm}
      title="Acuerdos y permisos"
      description="Elige los consentimientos y autorizaciones que las familias deberán aceptar en un formulario digital. Activa solo los que correspondan a tu colegio."
      stepNumber={stepNumber}
    />
  );
}

ConsentmentFormConfigurationPage.auth = true;
