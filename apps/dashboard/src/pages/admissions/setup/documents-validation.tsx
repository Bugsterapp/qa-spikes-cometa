import { useRouter } from 'next/router';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags, SchoolStepEntity } from '@cometa/trpc/src/admissions/types';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  ConfigurationContent,
  PhoneBody,
  PhoneContainer,
  PhoneStepsPreview,
} from '/src/components/admissions/setup/shared';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';

export default function DocumentsValidationConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const documentsValidationStep = schoolSteps?.find((step) => step.tag === SchoolStepTags.DocumentsValidation);

  const stepNumber = documentsValidationStep?.order || 10;

  function handleBack() {
    router.push('/admissions/setup?config=true');
  }

  function handleClose() {
    router.push('/admissions/setup?config=true');
  }

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Validación de documentos" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={<DocumentsValidationContent stepNumber={stepNumber} totalSteps={schoolSteps.length} />}
        rightContent={<PhoneContent steps={schoolSteps} currentStepId={documentsValidationStep?.id} />}
      />
    </div>
  );
}

function DocumentsValidationContent({ stepNumber, totalSteps }: { stepNumber: number; totalSteps: number }) {
  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.DocumentsValidation);

  return (
    <ConfigurationContent
      title="Validación de documentos"
      stepNumber={stepNumber}
      description={
        <div className="space-y-6">
          <p>
            Este paso aparecerá en la app de la familia para informarle que los documentos serán revisados por el
            colegio.
          </p>
          <p>
            Tú podrás hacer la validación desde la sección de Admisiones una vez que el flujo esté publicado. Por ahora,
            no necesitas configurar nada más acá.
          </p>
        </div>
      }
      onSave={() => handleSaveAndUpdateStatus()}
      totalSteps={totalSteps}
    />
  );
}

function PhoneContent({ steps, currentStepId }: { steps: SchoolStepEntity[]; currentStepId?: string | null }) {
  return (
    <PhoneContainer>
      <PhoneBody isFullHeight>
        <PhoneStepsPreview steps={steps} currentStepId={currentStepId} />
      </PhoneBody>
    </PhoneContainer>
  );
}

DocumentsValidationConfigurationPage.auth = true;
