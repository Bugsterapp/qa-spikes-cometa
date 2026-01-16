import { DashboardStudent } from '@cometa/trpc/src/types';
import { useSendTrackEvent } from '@cometa/utils';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import CAlert from '/src/components/atoms/CAlert';
import Dialog from '/src/components/atoms/Dialog';
import ErrorToast from '/src/components/ErrorToast';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { defaultAlertTime } from '/src/hooks/useAlert';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';

import Button from '../Button';
import ScholarInformationTab from './ScholarInformationTab';
import { StudentGuardianTab } from './StudentGuardianTab';
import StudentPersonalTab from './StudentPersonalTab';
import { StudentCreateType } from './types';

export interface StudentCreationProps {
  onClose: () => void;
}

export interface StudentFormType {
  first_name: string;
  last_name: string;
  identifier: string;
  gender: string;
  year: string;
  month: string;
  day: string;
  enrollment_code: string;
  level: string;
  grade: string;
  group: string;
  entry_date: string;
  billing_guardian: string;
  birthdate: string;
  school_cycle_id: string;
}

export default function StudentCreation({ onClose }: StudentCreationProps) {
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [studentFormFields, setStudentFormFields] = useState<StudentCreateType | null>(null);
  const [student, setStudent] = useState<DashboardStudent | undefined>();
  const selectedSchool = useSelectedSchool();
  const utils = api.useUtils();
  const sendTrackEvent = useSendTrackEvent();
  const [showStudentCreatedAlert, setShowStudentCreatedAlert] = useState(false);
  const [showStudentCreationFailAlert, setShowStudentCreationFailAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCloseDrawer = (exit?: boolean) => {
    if (exit) {
      onClose();
    } else {
      setOpenDialog(true);
    }
  };

  const onBack = () => {
    setOpenDialog(false);
  };

  const onCancel = () => {
    setOpenDialog(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleNext = () => {
    setStep((step) => step + 1);
    if (step === 1) sendTrackEvent('dashboard: New Student Basic Info Completed', session);
    if (step === 2) sendTrackEvent('dashboard: New Student Academic Completed', session);
  };

  useEffect(() => {
    if (showStudentCreatedAlert || showStudentCreationFailAlert) {
      const timer = setTimeout(() => {
        setShowStudentCreatedAlert(false);
        setShowStudentCreationFailAlert(false);
      }, defaultAlertTime);

      return () => clearTimeout(timer);
    }
  }, [showStudentCreatedAlert, showStudentCreationFailAlert]);

  const createStudentMutation = useMutation({
    mutationFn: (payload: StudentFormType) => ApiClient.createStudent(selectedSchool?.id, payload),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async (response: DashboardStudent) => {
      setLoading(false);
      await utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      setStudent(response);
      handleNext();
      setShowStudentCreatedAlert(true);
    },
    onError: (err) => {
      setLoading(false);
      setShowStudentCreationFailAlert(true);
      Sentry.captureException(err);
    },
  });

  const handleCreate = async (stepFormValues: StudentFormType): Promise<void> => {
    const payload = {
      ...studentFormFields,
      ...stepFormValues,
      school_cycle_id: stepFormValues?.school_cycle_id === 'null' ? '' : stepFormValues?.school_cycle_id,
      birthdate: `${stepFormValues?.year}-${stepFormValues?.month}-${stepFormValues?.day}`,
    } as StudentFormType;

    createStudentMutation.mutateAsync(payload);
  };

  const handleBack = () => {
    setStep((step) => step - 1);
  };

  return (
    <>
      <div className="flex flex-col flex-auto h-full">
        {showStudentCreatedAlert && (
          <CAlert
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
            type="success"
            message="Estudiante creado correctamente."
          />
        )}
        {showStudentCreationFailAlert && (
          <CAlert
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
            type="error"
            message="Hubo un error al crear el estudiante. Ponte en contacto con nuestro equipo de soporte."
          />
        )}
        <div className="pb-4 px-9">
          {step !== 3 && <SidebarHeader title="Nuevo Estudiante" onClose={onCloseDrawer} />}
        </div>

        {step === 1 && (
          <StudentPersonalTab
            handleNext={handleNext}
            setStudent={setStudentFormFields}
            onCancel={setOpenDialog}
            student={studentFormFields}
          />
        )}

        {step === 2 && (
          <ScholarInformationTab handleCreate={handleCreate} onCancel={handleBack} student={studentFormFields} />
        )}

        {step === 3 && (
          <div className="h-full">
            <ErrorToast
              message="El nro. de matrícula ya ha sido registrado. Por favor, ingresa un nuevo número"
              show={createStudentMutation.isError}
            />
            <StudentGuardianTab onCancel={handleBack} studentId={student?.id} onClose={onCloseDrawer} />
          </div>
        )}
      </div>

      <Dialog.Root open={!!openDialog} position="right" classNames="right-28">
        <Dialog.Title>
          {step !== 3 ? '¿Cancelar el registro de estudiante?' : 'Cancelar el registro de tutor'}
        </Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={onBack}>
            Atrás
          </Button>
          <Button variant="cancel" size="tooltip" onClick={onCancel} disabled={loading}>
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
}
