import { Button } from '@cometa/recreo';
import { GuardianResponse } from '@cometa/trpc/src/types';
import { useSendTrackEvent } from '@cometa/utils';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Dialog from '/src/components/atoms/Dialog';
import ErrorToast from '/src/components/ErrorToast';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';

import { AssignGuardianTab } from './AssignGuardianTab';
import { CreateGuardianTab } from './CreateGuardianTab';

export type DrawerStateType = {
  isOpen: boolean;
  selectedTab: 'search' | 'create' | null;
  guardian: GuardianResponse | null;
  disabled: boolean;
  studentGuardians: GuardianResponse[] | null;
};

export const initialDrawerState: DrawerStateType = {
  isOpen: false,
  guardian: null,
  disabled: true,
  studentGuardians: null,
  selectedTab: null,
};

type AssignTutorTabProps = {
  onClose?: (exit?: boolean) => void;
  studentId?: string;
  onCancel?: () => void;
};

const schema = z.object({
  relationship: z.string().min(1, 'Falta completar este campo.'),
});

type FormValues = z.infer<typeof schema>;

export const StudentGuardianTab = ({ onClose, studentId, onCancel }: AssignTutorTabProps) => {
  const { data: session } = useSession();
  const [drawerState, setDrawerState] = useState<DrawerStateType>(initialDrawerState);
  const router = useRouter();
  const sendTrackEvent = useSendTrackEvent();
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const [guardian, setGuardian] = useState<GuardianResponse>();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { relationship: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const {
    handleSubmit,
    getValues,
    formState: { isValid: formIsValid },
  } = form;

  const onAssignedGuardian = () => {
    setAlertState({
      open: true,
      severity: 'success',
      message: 'Tutor asignado correctamente',
      alertTime: defaultAlertTime,
    });
    sendTrackEvent('dashboard: New Student Parent Assigned', session);
  };

  const assignGuardianMutation = useMutation({
    mutationFn: ({ guardianId, studentId, relationship = null }: any) =>
      ApiClient.assignGuardianToStudent(studentId, guardianId, relationship),
    onSuccess: async () => {
      setLoading(false);
      setDrawerState({ ...drawerState, isOpen: false, guardian: null });
      onAssignedGuardian();
      await utils.guardian.getDetails.invalidate();
      await utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      onClose?.(true);
      if (studentId) {
        router.push(`/students/${studentId}`);
      }
    },
    onMutate: () => {
      setLoading(true);
      setDrawerState({ ...drawerState, disabled: true });
    },
    onError: (err) => {
      setLoading(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Hubo un error al asignar el tutor. Ponte en contacto con nuestro equipo de soporte.',
        alertTime: defaultAlertTime,
      });
      setDrawerState({ ...drawerState, guardian: null, disabled: false });

      Sentry.captureException(err);
    },
  });

  const onSubmit = async () => {
    const formData = getValues();
    await assignGuardianMutation.mutateAsync({
      guardianId: guardian?.id,
      studentId: studentId,
      relationship: formData.relationship,
    });
  };

  const onGuardianExists = () => {
    setDrawerState((prev) => ({ ...prev, selectedTab: 'search' }));
  };

  function handleSetGuardian(guardian?: GuardianResponse) {
    setGuardian(guardian);
    setDrawerState((prev) => ({ ...prev, guardian: guardian ?? null, disabled: guardian === undefined }));
  }

  const disableSubmit = Boolean(drawerState.disabled || loading || !formIsValid || !guardian);

  return (
    <div className="flex flex-col h-full">
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            guardian: drawerState.guardian,
            disabled: drawerState.disabled,
          });
        }}
      >
        <ErrorToast
          message="Ocurrió un error inesperado, por favor intenta de nuevo."
          show={assignGuardianMutation.isError}
          onClose={() => setDrawerState({ ...initialDrawerState, isOpen: true })}
        />
        <div className="items-center flex-1 h-full gap-6 px-8 py-6 overflow-auto">
          <div className="grid grid-cols-[1fr_auto] gap-6 mb-8 items-center justify-between">
            <h4 className="text-[#212B36] text-xl col-start-1 font-bold">Asignar tutor</h4>

            {onClose ? (
              <Button className="col-start-2 bg-transparent justify-self-end" onClick={() => onClose?.()}>
                <Plus className="rotate-45 text-[#637381] w-4" />
              </Button>
            ) : (
              <Dialog.Close className="col-start-2 bg-transparent justify-self-end">
                <Plus className="rotate-45 text-[#637381] w-4" />
              </Dialog.Close>
            )}
          </div>

          <div className="grid grid-cols-2 col-span-2 gap-6 mb-10">
            <span className="col-span-2 text-[#637381] text-sm">¿Cómo quieres asignar el tutor?</span>
            <label
              className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center rounded-lg data-[selected=true]:border-green border-2 border-[#DFE3E8] p-4"
              data-selected={drawerState.selectedTab === 'search'}
            >
              Buscar un tutor existente
              <input
                type="radio"
                className="ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                checked={drawerState.selectedTab === 'search'}
                onChange={() => {
                  setDrawerState({ ...drawerState, selectedTab: 'search', disabled: !drawerState.disabled });
                }}
              />
            </label>
            <label
              className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center rounded-lg data-[selected=true]:border-green border-2 border-[#DFE3E8] p-4"
              data-selected={drawerState.selectedTab === 'create'}
            >
              Registrar un nuevo tutor
              <input
                type="radio"
                className="ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                data-testid="createGuardianRadio"
                checked={drawerState.selectedTab === 'create'}
                onChange={() => {
                  setDrawerState({
                    ...drawerState,
                    selectedTab: 'create',
                    disabled: !drawerState.disabled,
                  });
                }}
              />
            </label>
          </div>
          {drawerState.selectedTab === 'create' && (
            <CreateGuardianTab
              studentId={studentId || ''}
              setGuardian={handleSetGuardian}
              onGuardianExists={onGuardianExists}
              onClose={onClose}
            />
          )}
          {drawerState.selectedTab === 'search' && (
            <AssignGuardianTab<FormValues> guardian={guardian} setGuardian={handleSetGuardian} form={form} />
          )}
        </div>
        {drawerState.selectedTab != 'create' && (
          <div className="p-6 border-t-[#919EAB3D] border grid grid-cols-2 gap-5 flex-shrink-0">
            {onCancel ? (
              <Button
                className="p-3 font-bold bg-transparent rounded-lg text-green"
                onClick={() => {
                  onCancel?.();
                }}
              >
                Atrás
              </Button>
            ) : (
              <Dialog.Close className="p-3 font-bold bg-transparent rounded-lg text-green">Atrás</Dialog.Close>
            )}
            <Button
              disabled={disableSubmit}
              onClick={handleSubmit(onSubmit)}
              className="bg-green hover:bg-[#007B55] p-3 text-white rounded-lg disabled:text-[#919EABCC] disabled:bg-[#919EAB3D]"
            >
              Asignar
            </Button>
          </div>
        )}
      </Sentry.ErrorBoundary>
    </div>
  );
};
