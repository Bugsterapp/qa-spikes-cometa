'use client';

import * as Sentry from '@sentry/nextjs';
import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import LinearProgress from '~/components/atoms/LinearProgress';
import { useEffect, useMemo, useState } from 'react';
import {
  PersonalStep,
  MedicalStep,
  ConsentmentsStep,
  DocumentsStep,
  ThankYouStep,
} from '~/components/ProfileSteps/steps';
import { Button, Drawer } from '@cometa/recreo';
import { useToggle } from '@cometa/hooks';
import {
  FormActionKeys,
  FormActionsProvider,
  useFormActions,
} from '~/components/ProfileSteps/context/FormActionsContext';
import { useSchoolInscriptionConfig } from '~/hooks/useSchoolInscriptionConf';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { SchoolStepTags } from '@cometa/trpc/src/admissions/types';
import { MainStudentEntity } from '@cometa/trpc/src/students/types';

type StepConfig = {
  title?: string;
  content: React.ReactNode;
  contextKey?: string;
};

function ProfileStepPageContent() {
  const router = useRouter();
  const { guardianHash } = router.query;

  const { toggle: isOpen, onOpen, onClose } = useToggle();

  const { getAction, subscribe } = useFormActions();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { inscriptionSteps, schoolCycle } = useSchoolInscriptionConfig();

  const studentId = router.query.studentId as string;
  const { data: student, isLoading: isLoadingStudent } = api.students.getStudent.useQuery({ studentId });
  const { data: studentAdditionalInfo, isLoading: isLoadingStudentAdditionalInfo } =
    api.student.getStudentAdditionalInfo.useQuery({ studentId });
  const { data: form, isLoading: isLoadingForm } = api.forms.getDynamicForm.useQuery(
    { createdBy: student?.school_id, category: SchoolStepTags.ConsentForm, includeLayout: false },
    { enabled: !!student?.school_id }
  );
  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: student?.school_id as string },
    {
      enabled: !!student?.school_id,
    }
  );

  const hiddenFields = schoolConfig?.hidden_medical_form_fields?.split(',') ?? [];

  const currentInscription = student?.inscriptions?.find(
    (inscription) => inscription?.school_cycle?.id === schoolCycle?.id
  );

  const updateInscription = api.students.updateInscription.useMutation({
    onError(error) {
      Sentry.captureException(error);
    },
  });

  async function handleUpdateInscription(inscription: Partial<InscriptionEntity>) {
    if (currentInscription?.id) {
      await updateInscription.mutateAsync({
        inscriptionId: currentInscription?.id,
        data: inscription,
      });
    }
  }

  const steps: StepConfig[] = useMemo<StepConfig[]>(() => {
    const allSteps = [
      {
        title: `Completa la información registrada de ${student?.first_name} ${student?.last_name}`,
        content: (
          <PersonalStep
            student={student}
            studentAdditionalInfo={studentAdditionalInfo}
            onUpdateInscription={handleUpdateInscription}
            onNext={handleNext}
          />
        ),
        contextKey: FormActionKeys.PersonalStep,
        isActive: inscriptionSteps?.enable_personal_step ?? false,
      },
      {
        title: 'Revisa y actualiza su información médica en caso de ser necesario',
        content: (
          <MedicalStep
            studentId={studentId}
            studentAdditionalInfo={studentAdditionalInfo}
            hiddenFields={hiddenFields}
            onUpdateInscription={handleUpdateInscription}
            onNext={handleNext}
          />
        ),
        contextKey: FormActionKeys.MedicalStep,
        isActive: inscriptionSteps?.enable_medical_step ?? false,
      },
      {
        title: 'Carga de documentos',
        content: (
          <DocumentsStep
            student={student as MainStudentEntity}
            currentInscription={currentInscription}
            onNext={handleNext}
          />
        ),
        contextKey: FormActionKeys.DocumentsStep,
        isActive: inscriptionSteps?.enable_documents_step ?? false,
      },
      {
        title: `Responde los acuerdos y consentimientos para el ${schoolCycle?.name}`,
        content: (
          <ConsentmentsStep
            studentId={studentId}
            schoolId={student?.school_id as string}
            inscriptionId={currentInscription?.id as string}
            onUpdateInscription={handleUpdateInscription}
            onNext={handleNext}
          />
        ),
        contextKey: FormActionKeys.ConsentmentsStep,
        isActive: (inscriptionSteps?.enable_consentments_step && !!form) ?? false,
      },
      {
        content: <ThankYouStep />,
        isActive: true,
      },
    ];
    return allSteps.filter((step) => step.isActive);
  }, [student, studentAdditionalInfo, studentId, form, currentInscription]);

  const currentContextKey = useMemo(() => steps[currentStep]?.contextKey, [currentStep, steps]);

  useEffect(() => {
    if (currentContextKey) {
      const unsubscribe = subscribe(currentContextKey, () => {
        const action = getAction(currentContextKey);
        setCurrentAction(action);
      });
      setCurrentAction(getAction(currentContextKey));
      return () => unsubscribe();
    } else {
      setCurrentAction(null);
    }
  }, [currentContextKey, subscribe, getAction]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (isSubmitting) return;

    if (currentContextKey && currentAction) {
      if (currentAction.isEditing && currentAction.isDirty) {
        onOpen();
        return;
      }
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      return;
    }
    router.push(`/guardians/${guardianHash}/students/`);
  }

  function handleDiscard() {
    if (currentContextKey && currentAction) {
      if (currentAction.setIsEditing) {
        currentAction?.restoreForm();
        currentAction?.setIsEditing(false);
      }
    }
    onClose();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      return;
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isLoadingStudent && !isLoadingStudentAdditionalInfo && !isLoadingForm) {
      setIsLoading(false);
    }
  }, [isLoadingStudent, isLoadingStudentAdditionalInfo, isLoadingForm]);

  return (
    <main className="flex flex-col gap-6 px-5 py-6 font-lota">
      <div className="flex items-center">
        <div onClick={handleBack} className="flex items-center gap-3 hover:cursor-pointer">
          <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
        </div>
        <LinearProgress className="h-1 bg-[#E0E5FB] [--progress-color:#7B3CFF] ml-4 flex-grow" value={progress} />
      </div>

      {!isLoading && (
        <>
          {steps[currentStep].title && (
            <header className="flex flex-col gap-2">
              <h1 className="text-xl font-bold not-italic text-[#1C1C1D]">{steps[currentStep].title}</h1>
            </header>
          )}
          <section className="flex flex-col gap-4">{steps[currentStep].content}</section>
          <DiscardDialog isOpen={isOpen} isLoading={isLoading} onClose={onClose} onDiscard={handleDiscard} />
        </>
      )}
    </main>
  );
}

function ProfileStepPage() {
  return (
    <FormActionsProvider>
      <ProfileStepPageContent />
    </FormActionsProvider>
  );
}

function DiscardDialog({
  isOpen,
  isLoading,
  onClose,
  onDiscard,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Drawer.Root open={isOpen} className="max-w-sm gap-3 text-center" minHeight="30%">
      <div className="flex flex-col items-center gap-3">
        <DiscardIcon />
        <Drawer.Title>Descartar cambios</Drawer.Title>
      </div>

      <Drawer.Description>
        <p>Los cambios realizados no se guardarán.</p>
        <p>¿Estás seguro que quieres continuar?</p>
      </Drawer.Description>

      <div className="flex flex-col gap-3">
        <Button
          className="bg-[#FD6262] hover:bg-[#FD6262]/90 text-white text-sm font-semibold px-5 py-2.5 w-full"
          onClick={onDiscard}
          disabled={isLoading}
        >
          Descartar
        </Button>
        <Drawer.Close
          onClick={onClose}
          className="bg-transparent text-[#1C1C1D] hover:bg-[#F3F6FB] text-sm font-semibold px-5 py-2.5 w-full rounded-full"
          disabled={isLoading}
        >
          Volver
        </Drawer.Close>
      </div>
    </Drawer.Root>
  );
}

function DiscardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Discard Icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16C32 11.7565 30.3143 7.68687 27.3137 4.68629C24.3131 1.68571 20.2435 0 16 0ZM17.6 22.4C17.6 23.2837 16.8837 24 16 24C15.1163 24 14.4 23.2837 14.4 22.4V14.4C14.4 13.5163 15.1163 12.8 16 12.8C16.8837 12.8 17.6 13.5163 17.6 14.4V22.4ZM14.4 9.6C14.4 10.4837 15.1163 11.2 16 11.2C16.8837 11.2 17.6 10.4837 17.6 9.6C17.6 8.71634 16.8837 8 16 8C15.1163 8 14.4 8.71634 14.4 9.6Z"
        fill="#FD6262"
      />
    </svg>
  );
}

ProfileStepPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Perfil del estudiante</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

ProfileStepPage.auth = true;

export default ProfileStepPage;
