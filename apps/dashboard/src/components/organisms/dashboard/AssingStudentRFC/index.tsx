import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useState } from 'react';
import SidebarActions from '/src/components/atoms/SidebarActions';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import useAlert from '/src/hooks/useAlert';
import RFCDetail, { IUpdateData } from '../RFCDetail';
import { cn } from '/src/utils/cn';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import Sheet from '/src/components/atoms/Sheet';
import { AxiosError } from 'axios';
import { api } from '/src/utils/api';
import { DashboardStudent, Guardian } from '@cometa/trpc/src/types';

export interface IMutationErrors {
  rfc?: string;
  billing_name?: string;
  taxing_system?: string;
  postal_code?: string;
  state?: string;
}

interface AssignStudentRFCProps {
  onClose: () => void;
  student?: DashboardStudent;
  openDetailRFC: boolean;
  onOpeDetailRFC: () => void;
  onCloseDetailRFC: () => void;
  mutation: UseMutationResult<unknown, AxiosError, IUpdateData, unknown>;
  errorsMutation?: IMutationErrors;
}

export default function AssingStudentRFC({
  onClose,
  student,
  onCloseDetailRFC,
  onOpeDetailRFC,
  openDetailRFC,
  mutation,
  errorsMutation,
}: AssignStudentRFCProps) {
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [selectedGuardianBilling, setSelectedGuardianBilling] = useState<Pick<
    Guardian,
    'id' | 'billing_name' | 'tax_id'
  > | null>({
    id: '',
    billing_name: student?.billing_guardian_info?.billing_name,
    tax_id: student?.billing_guardian_info?.tax_id,
  });
  const [guardianDetail, setGuardianDetail] = useState<Guardian | undefined>(undefined);

  const utils = api.useUtils();
  const editStudentRFC = useMutation({
    mutationFn: () =>
      ApiClient.patchStudentViewMoreInfo(student?.id, {
        billing_guardian: selectedGuardianBilling?.id ?? null,
      }),
    onSuccess: () => {
      utils.manualPayments.studentDetails.invalidate();
    },
    onError(err) {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          student,
          session,
        });
        return scope;
      });
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
    },
  });

  const handleCloseAssignRFC = () => {
    onClose();
    onCloseDetailRFC();
  };

  const saveAssignRfc = () => {
    setOpenDialog(false);
    editStudentRFC.mutate();
    handleCloseAssignRFC();
  };

  const isRFCSelected = (guardian: Guardian) =>
    guardian?.tax_id === selectedGuardianBilling?.tax_id &&
    guardian?.billing_name === selectedGuardianBilling?.billing_name;

  const onChangeSelectedGuardianBilling = (guardian: Guardian | null) => {
    if (guardian && !isRFCSelected(guardian)) {
      setSelectedGuardianBilling({
        id: guardian.id,
        billing_name: guardian.billing_name ?? '',
        tax_id: guardian.tax_id ?? '',
      });
    } else {
      setSelectedGuardianBilling(null);
    }
    setDisabled(false);
  };

  const handleOpenRFC = (guardian: Guardian) => {
    setGuardianDetail(guardian);
    onOpeDetailRFC();
  };

  return (
    <>
      <div className="h-full">
        <div className="flex flex-col flex-auto h-full ">
          <div className="fixed z-10 w-full px-8 bg-white">
            <SidebarHeader title="Asignar RFC" onClose={handleCloseAssignRFC} />
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="px-8 mt-24 mb-2">
              <div>
                <span className="text-base font-medium text-[#637381]">Seleccione el RFC que desea asignarle a: </span>
                <span className="font-semibold text-[#637381]">
                  {student?.first_name} {student?.last_name}
                </span>
              </div>
              <div id="tutores">
                <div className="mt-6">
                  <p className="mb-6 text-lg font-semibold">Tutores</p>
                  {student?.guardians?.map((guardian) => (
                    <button
                      key={guardian.id}
                      className="flex flex-col items-start w-full mb-8 bg-transparent"
                      onClick={() => {
                        if (guardian?.tax_id && guardian?.billing_name) onChangeSelectedGuardianBilling(guardian);
                      }}
                    >
                      <span className="text-base font-semibold">
                        {guardian?.first_name} {guardian?.last_name}
                      </span>
                      {guardian?.tax_id && guardian?.billing_name ? (
                        <label
                          className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex w-full items-center justify-between rounded-lg data-[selected=true]:border-green border border-[#DFE3E8] p-4 mt-3"
                          data-selected={isRFCSelected(guardian)}
                        >
                          <div className="flex flex-col items-start">
                            <label className="text-sm font-medium cursor-pointer">RFC {guardian.tax_id}</label>
                            <label className="text-sm font-normal cursor-pointer">
                              Razón social {guardian.billing_name}
                            </label>
                          </div>
                          <div
                            className={cn(
                              'ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2',
                              {
                                'border-green': isRFCSelected(guardian),
                              }
                            )}
                          >
                            <div
                              className={cn('w-full h-full rounded-full', {
                                'bg-green': isRFCSelected(guardian),
                              })}
                            />
                          </div>
                        </label>
                      ) : (
                        <div className="w-full flex justify-between items-center p-4 mt-3 rounded-lg border border-[#DFE3E8] text-[#212B36] text-left text-sm font-medium">
                          <span>No tiene un RFC registrado.</span>
                          <button
                            className="bg-transparent px-4 border border-[#00AB55] rounded-md py-2"
                            onClick={() => handleOpenRFC(guardian)}
                          >
                            <span className="text-[#00AB55] text-sm font-bold">Registrar RFC</span>
                          </button>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div id="general" className="border-t">
                <button
                  key="general"
                  className="flex flex-col items-start w-full mt-2 mb-8 bg-transparent"
                  onClick={() => {
                    onChangeSelectedGuardianBilling(null);
                  }}
                >
                  <label
                    className="select-none cursor-pointer hover:bg-gray-100 transition-colors flex w-full items-center justify-between rounded-lg data-[selected=true]:border-green border border-[#DFE3E8] px-4 py-5 mt-3"
                    data-selected={!selectedGuardianBilling || !selectedGuardianBilling?.tax_id}
                  >
                    <div className="flex flex-col items-start">
                      <label className="text-sm font-medium cursor-pointer">Facturar a Público en General</label>
                    </div>
                    <div
                      className={cn(
                        'ml-6 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2',
                        {
                          'border-green': !selectedGuardianBilling || !selectedGuardianBilling?.tax_id,
                        }
                      )}
                    >
                      <div
                        className={cn('w-full h-full rounded-full', {
                          'bg-green': !selectedGuardianBilling || !selectedGuardianBilling?.tax_id,
                        })}
                      />
                    </div>
                  </label>
                </button>
              </div>
            </div>
            <SidebarActions className="z-10">
              <button
                className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
                type="button"
                onClick={handleCloseAssignRFC}
              >
                Cancelar
              </button>
              <span>
                <button
                  className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
                  type="submit"
                  disabled={disabled}
                  onClick={() => setOpenDialog(true)}
                >
                  Confirmar
                </button>
              </span>
            </SidebarActions>
          </div>
        </div>
      </div>
      <Dialog.Root open={openDialog} position="right">
        <Dialog.Title>
          {selectedGuardianBilling
            ? `¿Estás seguro que deseas asignar el RFC a este estudiante?`
            : '¿Desea que este estsudiante facture a público en general?'}
        </Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Atrás
          </Button>
          <Button
            size="tooltip"
            onClick={() => {
              saveAssignRfc();
            }}
          >
            Si, guardar
          </Button>
        </div>
      </Dialog.Root>
      <Sheet
        open={openDetailRFC}
        onOpenChange={(open) => {
          if (!open) onCloseDetailRFC();
        }}
      >
        <Sheet.Content>
          <RFCDetail
            onClose={onCloseDetailRFC}
            onSubmit={(values) => mutation.mutate({ billing_info: { ...values }, id: guardianDetail?.id ?? '' })}
            guardianDetail={guardianDetail}
            errorsMutation={errorsMutation}
          />
        </Sheet.Content>
      </Sheet>
    </>
  );
}
