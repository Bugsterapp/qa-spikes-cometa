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
import { motion, AnimatePresence } from 'framer-motion';

export default function AdmissionExamConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const step = schoolSteps.find((step) => step.tag === SchoolStepTags.AdmissionExam);

  const stepNumber = step?.order || 8;
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
      <ConfigurationHeader title="Examen de admisión" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <AdmissionExamContent
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

type AdmissionExamContentProps = {
  stepNumber: number;
  isConfigured: boolean;
  stepName: string;
  onConfigure: () => void;
  totalSteps: number;
};

function AdmissionExamContent({
  stepNumber,
  isConfigured,
  stepName,
  onConfigure,
  totalSteps,
}: AdmissionExamContentProps) {
  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.AdmissionExam);

  return (
    <ConfigurationContent
      title="Agendar examen"
      stepNumber={stepNumber}
      description="Permite a las familias coordinar la fecha y hora para el examen de admisión. Puedes usar un enlace de calendario o gestionar la cita por otro canal."
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
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <PhoneStepsPreview steps={steps} currentStepId={currentStepId} />
          </motion.div>
        </AnimatePresence>
      </PhoneBody>
    </PhoneContainer>
  );
}

AdmissionExamConfigurationPage.auth = true;
