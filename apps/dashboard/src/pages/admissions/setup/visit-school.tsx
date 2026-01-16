import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepTags, SchoolStepEntity, SchoolStepStatusEnum } from '@cometa/trpc/src/admissions/types';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  ConfigurationContent,
  SectionHeader,
  PhoneBody,
  PhoneContainer,
  PhoneStepsPreview,
} from '/src/components/admissions/setup/shared';
import { ListItem } from '/src/components/admissions/setup/shared/list';
import {
  AppointmentConfigurationDrawer,
  AppointmentValues,
} from '/src/components/admissions/setup/admission-steps/appointment-drawer';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';

export default function VisitSchoolConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const step = schoolSteps.find((step) => step.tag === SchoolStepTags.VisitSchool);

  const stepNumber = step?.order || 1;
  const stepName = step?.name || '';
  const isConfigured = step?.status === SchoolStepStatusEnum.Draft;

  const url = step?.actions?.to_do?.redirect_url || '';
  const type = url ? 'platform' : 'manual';

  function handleBack() {
    router.push('/admissions/setup?config=true');
  }

  function handleClose() {
    router.push('/admissions/setup?config=true');
  }

  function handleConfigure() {
    setIsConfigurationOpen(true);
  }

  function handleConfigurationSuccess() {
    setIsConfigurationOpen(false);
  }

  function handleConfigurationClose() {
    setIsConfigurationOpen(false);
  }

  let initialValues: AppointmentValues = {
    name: '',
    description: '',
    type: 'manual',
    url: '',
  };
  if (step?.status === SchoolStepStatusEnum.Draft) {
    initialValues = {
      name: stepName,
      description: step?.description || '',
      type,
      url,
    };
  }

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Visita al colegio" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <VisitSchoolContent
            stepNumber={stepNumber}
            isConfigured={isConfigured}
            stepName={stepName}
            onConfigure={handleConfigure}
            totalSteps={schoolSteps.length}
          />
        }
        rightContent={<PhoneContent steps={schoolSteps} currentStepId={step?.id || undefined} />}
      />

      {step ? (
        <AppointmentConfigurationDrawer
          isOpen={isConfigurationOpen}
          onClose={handleConfigurationClose}
          onSuccess={handleConfigurationSuccess}
          schoolStep={step}
          defaultValues={initialValues}
        />
      ) : null}
    </div>
  );
}

type VisitSchoolContentProps = {
  stepNumber: number;
  isConfigured: boolean;
  stepName: string;
  onConfigure: () => void;
  totalSteps: number;
};

function VisitSchoolContent({ stepNumber, isConfigured, stepName, onConfigure, totalSteps }: VisitSchoolContentProps) {
  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.VisitSchool);

  return (
    <ConfigurationContent
      title="Visita al colegio"
      stepNumber={stepNumber}
      description="Facilita a las familias la coordinación de esta cita. Puedes redirigirlas a tu herramienta de agendamiento o gestionarla directamente por otro medio."
      onSave={() => handleSaveAndUpdateStatus()}
      totalSteps={totalSteps}
    >
      <div className="flex flex-col gap-4">
        <SectionHeader title="Configurar agendamiento" />

        <div onClick={onConfigure} className="cursor-pointer">
          <ListItem
            title={isConfigured ? stepName : 'Configurar agendamiento'}
            isCompleted={isConfigured}
            showDragHandle
          />
        </div>
      </div>
    </ConfigurationContent>
  );
}

interface PhoneContentProps {
  steps: SchoolStepEntity[];
  currentStepId: string | null | undefined;
}

function PhoneContent({ steps, currentStepId }: PhoneContentProps) {
  return (
    <PhoneContainer>
      <PhoneBody isFullHeight>
        <PhoneStepsPreview steps={steps} currentStepId={currentStepId} />
      </PhoneBody>
    </PhoneContainer>
  );
}

VisitSchoolConfigurationPage.auth = true;
