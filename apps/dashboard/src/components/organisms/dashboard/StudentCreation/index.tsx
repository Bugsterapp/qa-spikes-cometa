import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useRef, useState } from 'react';
import StudentPersonalDataView from './PersonalInformation';
import SchoolarDataView from './ScholarInformation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';
import { DrawerView, useSetDrawerState } from '/src/components/AssignTutorDrawer';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import { useSendTrackEvent } from '@cometa/utils';
import ErrorToast from '/src/components/ErrorToast';

interface IStudentCreationProps {
  onClose: () => void;
}
interface AllFormData {
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

export default function StudentCreation({ onClose }: IStudentCreationProps) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [student, setStudent] = useState<
    (StudentDetails.RootObject & { year: string; month: string; day: string }) | null
  >(null);

  const selectedSchool = useSelectedSchool();
  const setDrawerState = useSetDrawerState();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: levelsData } = useLevels(session?.token, selectedSchool?.id);
  const { data: sectionsData } = useSections(session?.token, selectedSchool?.id);
  const sendTrackEvent = useSendTrackEvent();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [studentCreatedId, setStudentCreatedId] = useState<string | null>(null);

  const handleNext = (data: any) => {
    const dataToPass = data;
    if (data.entry_date) {
      dataToPass.entry_date = data.entry_date.toISOString().split('T')[0];
    }
    setStudent((student) => ({ ...student, ...dataToPass }));
    setStep((step) => step + 1);
    if (step === 1) sendTrackEvent('dashboard: New Student Basic Info Completed', session);
    if (step === 2) sendTrackEvent('dashboard: New Student Academic Completed', session);
  };

  const createStudentMutation = useMutation({
    mutationFn: (payload: AllFormData) => ApiClient.createStudent(session?.token, selectedSchool?.id, payload),
    onMutate: () => {
      setDrawerState({ disabled: true });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['student_detail'] });
      setStudentCreatedId(data.data.id);
      if (data.data.guardians.length > 0) {
        sendTrackEvent('dashboard: New Student Parent Assigned', session);
        setTimeout(() => {
          onClose();
        }, 3000);
        router.push(`/student/detail/${data.data.id}`);
      }
    },
    onError: (err: any) => {
      Sentry.captureException(err);
    },
  });

  const handleCreateStudent = async (guardianId: string | null): Promise<void> => {
    const studentData = {
      ...student,
      school_cycle_id: student?.school_cycle_id === 'null' ? '' : student?.school_cycle_id,
      birthdate: `${student?.year}-${student?.month}-${student?.day}`,
    } as AllFormData;
    if (guardianId) {
      studentData.billing_guardian = guardianId;
    }
    try {
      await createStudentMutation.mutateAsync(studentData);
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const handleBack = () => {
    setStep((step) => step - 1);
    setDrawerState({ guardian: null, selectedTab: null });
  };

  return (
    <>
      <div className="flex flex-col flex-auto h-full">
        <div className="pb-4 px-9">
          {step !== 3 && (
            <SidebarHeader
              title="Nuevo Estudiante"
              onClose={() => {
                if (!isFormDirty) {
                  onClose();
                  return;
                }
                setOpenDialog(true);
              }}
            />
          )}
        </div>
        {step === 1 && (
          <StudentPersonalDataView
            onCancel={setOpenDialog}
            onSubmit={handleNext}
            ref={formRef}
            student={student}
            setIsFormDirty={setIsFormDirty}
            schoolId={selectedSchool?.id}
          />
        )}
        {step === 2 && (
          <SchoolarDataView
            onCancel={handleBack}
            onSubmit={handleNext}
            student={student}
            ref={formRef}
            levels={levelsData || []}
            sections={sectionsData || []}
            postStatus={createStudentMutation}
          />
        )}
        {step === 3 && (
          <div className="h-full">
            <ErrorToast
              message="El nro. de matrícula ya ha sido registrado. Por favor, ingresa un nuevo número"
              show={createStudentMutation.isError}
              // onClose={() => setState({ ...InitialDrawerState, isOpen: true })}
            />
            <DrawerView
              handleCreateStudent={handleCreateStudent}
              onCancel={handleBack}
              student={student}
              isMutating={createStudentMutation.isLoading}
              studentId={createStudentMutation.data?.data.id}
              studentCreatedId={studentCreatedId}
              onClose={(exit) => {
                if (exit) {
                  setDrawerState({
                    isOpen: false,
                    guardian: null,
                    selectedTab: null,
                    disabled: true,
                  });
                  onClose();
                } else {
                  setOpenDialog(true);
                }
              }}
            />
          </div>
        )}
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-28">
        <Dialog.Title>
          {step !== 3 ? '¿Cancelar el registro de estudiante?' : 'Cancelar el registro de tutor'}
        </Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Atrás
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              setOpenDialog(false);
              setTimeout(() => {
                setDrawerState({
                  isOpen: false,
                  guardian: null,
                  selectedTab: null,
                  disabled: true,
                });
                onClose();
              }, 200);
            }}
          >
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
}
