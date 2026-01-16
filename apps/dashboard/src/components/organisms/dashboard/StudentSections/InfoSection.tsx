import * as Sentry from '@sentry/nextjs';
import { DownloadIcon, Plus } from 'lucide-react';
import GuardianDrawerSheet from '/src/components/AssignTutorDrawer';
import { AnimatedCard } from '/src/components/atoms/AnimatedCard';
import { DashboardSchoolSection, DashboardStudentDetail, Guardian, InternalSchool } from '@cometa/trpc';
import { Dialog } from '@cometa/recreo';
import { Skeleton } from '/src/components/ui/Skeleton';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { useRef, useState } from 'react';
import { useSetOpen } from '/src/stores/studentCreationStore';
import { api } from '/src/utils/api';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import StudentDetailEdit from '../StudentDataEdit';
import { StudentSectionsTable } from '../StudentSectionsTable';
import GeneralInformation from '/src/components/molecules/dashboard/StudentGeneralInformation';
import useAlert from '/src/hooks/useAlert';
import { useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import ApiClient from '/src/services/ApiClient';
import { useToggle } from '@cometa/hooks';
import { StudentCreate, StudentUpdate } from '/src/server/api/routers/students';
import Sheet from '/src/components/atoms/Sheet';
import AssingStudentRFC from '../AssingStudentRFC';
import RFCDetail, { IUpdateData } from '../RFCDetail';
import { cn } from '@cometa/utils';
import { AxiosError } from 'axios';
import { createColumnHelper } from '@tanstack/react-table';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import IcEyeFill from '/public/assets/icons/ic_eye-fill.svg';
import IcTrashLight from '/public/assets/icons/ic_trash_light.svg';
import SettingsDropDown from '/src/components/SettingsDropDown';
import { DropdownActionItem } from '/src/components/concepts/DropdownActionItem';
import { useRouter } from 'next/router';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { GuardianAccountStatementDownloadDialog } from '../GuardianAccountStatementDownloadDialog';
import { Button } from '@cometa/recreo/v2';

export function InfoSection({ student, isLoading }: { student?: DashboardStudentDetail; isLoading?: boolean }) {
  const studentId = student?.id as string;
  const permissions = useGetPermissions();
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  const selectedSchool = useSelectedSchool();
  const { toggle: isOpen, onClose, onOpen } = useToggle();

  const { editStudentDetailMutation, levels, sections } = useEditStudent({ studentId });

  return (
    <div className="flex flex-col gap-6">
      <GeneralInformation student={student} isLoading={isLoading} action={onOpen} className="pb-0" />
      <EditMoreInfo
        student={student}
        isOpen={isOpen}
        onClose={onClose}
        mutation={editStudentDetailMutation}
        levels={levels || []}
        sections={sections || []}
      />

      <StudentSectionsTable id={studentId} schoolId={selectedSchool?.id} />

      <div className="flex flex-col gap-4">
        <h5 className="text-xl font-bold text-foreground">Tutores asignados</h5>
        <div className="w-full space-y-4">
          <Guardians student={student} isLoading={isLoading} />
        </div>
      </div>

      {shouldShowAccountSections ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold text-foreground">Facturación</h5>
          </div>
          <Billing student={student} isLoading={isLoading} mutation={editStudentDetailMutation} />
        </div>
      ) : null}
    </div>
  );
}

function EditMoreInfo({
  student,
  isOpen,
  onClose,
  mutation,
  levels,
  sections,
}: {
  student?: DashboardStudentDetail;
  isOpen: boolean;
  onClose: () => void;
  mutation: any;
  levels: InternalSchool[];
  sections: DashboardSchoolSection[];
}) {
  const studentId = student?.id as string;
  const { data: session } = useSession();

  const { data: studentMoreInfo } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    { enabled: !!studentId && !!session }
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.Content>
        <StudentDetailEdit
          student={studentMoreInfo}
          onClose={onClose}
          levels={levels || []}
          sections={sections || []}
          studentSection={student?.section}
          mutation={mutation}
        />
      </Sheet.Content>
    </Sheet>
  );
}

function Guardians({ student, isLoading }: { student?: DashboardStudentDetail; isLoading?: boolean }) {
  const session = useSession();
  const studentId = student?.id as string;
  const router = useRouter();

  const permissions = useGetPermissions();
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);
  const setOpen = useSetOpen();
  const utils = api.useUtils();

  const { isFieldBlocked, getTooltipMessage } = useIntegrationsBlockedFields();

  const isStudentGuardianRelationshipBlocked = () => isFieldBlocked('student_guardian.relationship');
  const getAssignGuardianTooltipMessage = () => getTooltipMessage('student_guardian.relationship');

  const [downloadDialog, setDownloadDialog] = useState<{ open: boolean; guardian: Guardian | null }>({
    open: false,
    guardian: null,
  });

  function openDownloadDialog(guardian: Guardian) {
    setDownloadDialog({ open: true, guardian });
  }

  function handleCancel() {
    setDownloadDialog({ open: false, guardian: null });
  }

  const [unassignModalConfirm, setUnassignModalConfirm] = useState({ open: false, guardian_id: '' });

  function DownloadAccountStatementButton({ guardian }: { guardian: Guardian }) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          openDownloadDialog(guardian);
        }}
      >
        <DownloadIcon size={12} className="mb-0.5" />
        <span>Estado de cuenta</span>
      </Button>
    );
  }

  const columnHelper = createColumnHelper<Guardian>();
  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'name',
      header: 'Nombres',
      cell: (info) => {
        const guardian = info.row.original;
        return (
          <span
            data-testid={`${guardian.first_name} ${guardian.last_name}`}
            className="flex items-center text-wrap flex-wrap gap-2 line-clamp-2 truncate"
            title={info.getValue()}
          >
            <span>{info.getValue()}</span>
            {guardian.relationship && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-[#23272E] bg-[#E9EEF7]">
                {guardian.relationship}
              </span>
            )}
          </span>
        );
      },
    }),
    columnHelper.accessor('email', {
      header: 'Correo',
      cell: (info) => (
        <div className="truncate" title={info.getValue() ?? ''}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Teléfono',
      cell: (info) => (
        <div className="truncate" title={info.getValue() ?? ''}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'accountStatus',
      header: '',
      cell: (info) => {
        const guardian = info.row.original;
        return (
          <div className="flex items-center gap-1">
            {shouldShowAccountSections ? <DownloadAccountStatementButton guardian={guardian} /> : null}
            <div
              tabIndex={0}
              role="button"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
              }}
            >
              <SettingsDropDown>
                {isRFCAssigned(guardian) ? (
                  <Tooltip message="No puedes desasignar este tutor porque el estudiante factura a su RFC. Cambia el RFC primero.">
                    <div>
                      <DropdownActionItem
                        icon={<IcTrashLight className="text-gray-400" />}
                        label="Desasignar tutor"
                        labelClassName="text-gray-400"
                        disabled
                        onClick={() => void 0}
                      />
                    </div>
                  </Tooltip>
                ) : (
                  <DropdownActionItem
                    icon={<IcTrashLight className="text-red-500" />}
                    label="Desasignar tutor"
                    labelClassName="text-red-500"
                    onClick={() => {
                      setUnassignModalConfirm({ open: true, guardian_id: guardian.id });
                    }}
                  />
                )}
                <DropdownActionItem
                  icon={
                    <span className="flex items-center justify-center min-w-[28px] min-h-[28px] w-7 h-7">
                      <IcEyeFill className="text-[#212B36]" />
                    </span>
                  }
                  label="Ver detalle"
                  onClick={() => {
                    router.push(`/guardian/${guardian.id}`);
                  }}
                />
              </SettingsDropDown>
            </div>
          </div>
        );
      },
    }),
  ];

  const { data: studentAdditionalInfo } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    { enabled: !!studentId && !!session }
  );

  const hasRFC = !!studentAdditionalInfo?.billing_guardian_info;

  const unassignMutation = api.students.unassignGuardian.useMutation({
    onSuccess() {
      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
    },
  });

  async function handleUnassignTutor(guardian_id: string) {
    await unassignMutation.mutateAsync({ guardianId: guardian_id, studentId });
  }

  function isRFCAssigned(guardian: Guardian) {
    return (
      hasRFC &&
      guardian?.tax_id === student?.billing_guardian_info?.tax_id &&
      guardian?.billing_name === student?.billing_guardian_info?.billing_name
    );
  }

  const guardiansWrapperRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="border-[#83A9FF] justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card px-6 py-5">
        <div className="grid grid-cols-5">
          <Skeleton className="w-[50%] col-span-2" />
          <Skeleton className="col-span-2 w-[50%]" />
          <Skeleton className="w-[50%]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {downloadDialog.guardian && (
        <GuardianAccountStatementDownloadDialog
          guardianId={downloadDialog.guardian.id}
          open={downloadDialog.open}
          onClose={handleCancel}
        />
      )}
      <div ref={guardiansWrapperRef} className="mb-4 rounded-lg border border-[#E4EBF6]">
        <TableVirtualized
          data={student?.guardians || []}
          columns={columns}
          isLoading={isLoading || false}
          totalCount={student?.guardians?.length || 0}
          totalFetched={student?.guardians?.length || 0}
          hasNextPage={false}
          isFetchingNextPage={false}
          fetchNextPage={() => void 0}
          hideFooter
          maxHeight={((student?.guardians?.length ?? 0) + 1) * 70.5}
          onRowClick={(guardian) => {
            router.push(`/guardian/${guardian.id}`);
          }}
        />
        <Dialog.Root
          open={unassignModalConfirm.open}
          onOpenChange={(open) =>
            setUnassignModalConfirm({ open, guardian_id: open ? unassignModalConfirm.guardian_id : '' })
          }
        >
          <Dialog.Title>¿Estás seguro que deseas desasignar este tutor?</Dialog.Title>
          <Dialog.Description>
            El tutor ya no tendrá acceso a la información y órdenes de este estudiante.
          </Dialog.Description>
          <div className="flex items-center justify-center w-full gap-4">
            <button
              className="bg-transparent text-[#637381] font-bold"
              onClick={() => setUnassignModalConfirm({ open: false, guardian_id: '' })}
            >
              Cancelar
            </button>
            <Dialog.Close>
              <button
                className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-[#FF4843] shadow-[0_8px_16px_#FF48423D]"
                onClick={() => handleUnassignTutor(unassignModalConfirm.guardian_id)}
              >
                Sí, desasignar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Root>
      </div>

      {permissions?.can_assign_guardian && (
        <>
          <Tooltip disableHover={!isStudentGuardianRelationshipBlocked()} message={getAssignGuardianTooltipMessage()}>
            <button
              className={cn(
                'flex items-center p-1 text-sm font-semibold transition-colors bg-transparent',
                isStudentGuardianRelationshipBlocked()
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green hover:text-green-400'
              )}
              data-testid="assignNewGuardian-button"
              disabled={isStudentGuardianRelationshipBlocked()}
              onClick={() => !isStudentGuardianRelationshipBlocked() && setOpen(true)}
            >
              <Plus className="w-4 mr-3" /> Asignar Tutor
            </button>
          </Tooltip>
          <GuardianDrawerSheet studentId={studentId} />
        </>
      )}
    </>
  );
}

function Billing({
  student,
  isLoading,
  mutation,
}: {
  student?: DashboardStudentDetail;
  isLoading?: boolean;
  mutation: any;
}) {
  const studentId = student?.id as string;

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const permissions = useGetPermissions();
  const utils = api.useUtils();

  const { data: studentMoreInfo } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    { enabled: !!studentId && !!session }
  );

  const { data: guardianDetail } = api.guardian.getDetails.useQuery(
    { id: studentMoreInfo?.billing_guardian ?? '', schoolId: selectedSchool?.id as string },
    {
      refetchOnWindowFocus: false,
      enabled: !!session && !!studentMoreInfo?.billing_guardian && !!selectedSchool?.id,
    }
  );

  const [unassignRFCModalConfirm, setUnassignRFCModalConfirm] = useState(false);
  const { toggle: isOpenRFC, onClose: onCloseRFC, onOpen: onOpenRFC } = useToggle();
  const { toggle: isOpenDetailRFC, onClose: onCloseDetailRFCModal, onOpen: onOpenDetailRFC } = useToggle();
  const { toggle: openOrder, onOpen: onOpenOrder, onClose: onCloseOrder } = useToggle(false);

  function onCloseDetailRFC() {
    onCloseDetailRFCModal();
    onCloseOrder();
  }

  const hasRFC = !!studentMoreInfo?.billing_guardian_info;

  async function handleUnassignRFC() {
    mutation.mutate({ billing_guardian: null });
  }

  const updateGuardianMutation = useMutation({
    mutationFn: (guardianBillingInf: IUpdateData) =>
      ApiClient.patchGuardianDetail(guardianBillingInf.id, {
        billing_info: guardianBillingInf.billing_info,
        school_id: selectedSchool?.id,
      }),
    onSuccess: () => {
      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      onCloseDetailRFC();
    },
    onError: (error: AxiosError) => {
      Sentry.captureException(error.response);
    },
  });

  if (isLoading) {
    return (
      <div className="border-[#83A9FF] bg-[#3366FF] bg-opacity-8 hover:bg-[#3366FF] hover:bg-opacity-12 justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card px-6 py-5">
        <div className="flex gap-4 w-[75%]">
          <div className="flex flex-col gap-4 w-[30%] border-r pr-4 border-[#9D9D9D]">
            <Skeleton className="col-span-1 w-[60%]" />
            <Skeleton className="col-span-2" />
          </div>
          <Skeleton className="w-[30%]" />
        </div>
      </div>
    );
  }

  if (!hasRFC) {
    return (
      <>
        <div>
          <div className="w-full mb-8 space-y-4 px-6 py-4 bg-[#919EAB] bg-opacity-[0.08] rounded-xl border border-[#637381]">
            <label className="text-sm font-normal">
              {selectedSchool?.does_invoice
                ? 'Las órdenes de este estudiante se facturan a "Público en General'
                : 'No se emitirán facturas'}
            </label>
          </div>
          <button
            className="flex items-center p-1 text-sm font-semibold transition-colors bg-transparent text-green hover:text-green-400 disabled:text-[#919EABCC]"
            onClick={onOpenRFC}
            data-testid="assignRfcToGuardian-button"
            disabled={!selectedSchool?.does_invoice}
          >
            <Plus className="w-4 mr-3" /> Asignar RFC de tutor
          </button>
        </div>

        <Sheet
          open={isOpenRFC}
          onOpenChange={(open) => {
            if (!open) onCloseRFC();
          }}
        >
          <Sheet.Content
            className={cn({
              'max-w-[612px]': openOrder,
            })}
          >
            <AssingStudentRFC
              onClose={onCloseRFC}
              student={studentMoreInfo}
              onCloseDetailRFC={onCloseOrder}
              onOpeDetailRFC={onOpenOrder}
              mutation={updateGuardianMutation}
              /**
               * TODO: Refactor any when using TRPC
               */
              errorsMutation={
                updateGuardianMutation.isError ? (updateGuardianMutation.error.response?.data as any) : null
              }
              openDetailRFC={openOrder}
            />
          </Sheet.Content>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <AnimatedCard
        canDelete={permissions && !!permissions.can_assign_billing_guardian}
        onClick={() => onOpenDetailRFC()}
        cancelTooltipLabel="Desasignar RFC"
        key={studentMoreInfo?.billing_guardian_info?.tax_id}
        onCancel={() => setUnassignRFCModalConfirm(true)}
        className="bg-[#3366FF] bg-opacity-8 hover:bg-[#3366FF] hover:bg-opacity-12"
      >
        <div className="flex w-full gap-2 py-4">
          <div className="flex flex-col items-start gap-2 border-r pr-4 border-[#9D9D9D]">
            <label className="text-base font-semibold">RFC: {studentMoreInfo?.billing_guardian_info?.tax_id}</label>
            <label className="text-sm font-normal">
              Razón social: {studentMoreInfo?.billing_guardian_info?.billing_name}
            </label>
          </div>
          <div className="flex flex-col ml-4">
            <label className="text-xs font-semibold text-[#637381] text-left">Estudiantes facturando con ese RFC</label>
            <div className="flex mt-2">
              {studentMoreInfo?.billing_guardian_info?.billable_dependents?.map((dependent) => (
                <div key={dependent.id} className="flex items-center mr-5">
                  <div className="w-2 h-2 mr-1 rounded-[50%] bg-[#3366FF]" />
                  <div>
                    {dependent?.first_name} {dependent?.last_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedCard>

      <Dialog.Root open={unassignRFCModalConfirm} onOpenChange={(open) => setUnassignRFCModalConfirm(open)}>
        <Dialog.Title>¿Estás seguro que deseas desasignar este RFC?</Dialog.Title>
        <Dialog.Description>
          A partir de ahora los pagos de este estudiante se facturarán a público en general.
        </Dialog.Description>
        <div className="flex items-center justify-center w-full gap-4">
          <button className="bg-transparent text-[#637381] font-bold" onClick={() => setUnassignRFCModalConfirm(false)}>
            Cancelar
          </button>
          <Dialog.Close>
            <button
              className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90 whitespace-nowrap bg-[#FF4843] shadow-[0_8px_16px_#FF48423D]"
              onClick={handleUnassignRFC}
            >
              Sí, desasignar
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Root>

      <Sheet
        open={isOpenDetailRFC}
        onOpenChange={(open) => {
          if (!open) onCloseDetailRFC();
        }}
      >
        <Sheet.Content>
          <RFCDetail
            onClose={onCloseDetailRFC}
            guardianDetail={guardianDetail}
            onSubmit={(values) =>
              updateGuardianMutation.mutate({ billing_info: { ...values }, id: guardianDetail?.id ?? '' })
            }
            isLoading={updateGuardianMutation.isPending}
            errorsMutation={
              updateGuardianMutation.isError ? (updateGuardianMutation.error.response?.data as any) : null
            }
            showTutorDetail
          />
        </Sheet.Content>
      </Sheet>
    </>
  );
}

function useEditStudent({ studentId }: { studentId: string }) {
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();

  const { data: levels } = useLevels(session?.token, selectedSchool?.id);
  const { data: sections } = useSections(session?.token, selectedSchool?.id, true);

  const utils = api.useUtils();

  const { data: studentExtended } = api.students.retrieveStudentAdditionalInfo.useQuery({
    studentId,
  });

  const updateStudentAdditional = api.students.updateStudentAdditionalInfo.useMutation({
    onSuccess: () => {
      utils.students.retrieveStudentAdditionalInfo.invalidate();
    },
  });

  const createStudentAdditional = api.students.createStudentAdditionalInfo.useMutation({
    onSuccess: () => {
      utils.students.retrieveStudentAdditionalInfo.invalidate();
    },
  });

  const editStudentDetailMutation = useMutation({
    mutationFn: (values: StudentCreate | StudentUpdate | { billing_guardian: null }) =>
      ApiClient.patchStudentViewMoreInfo(studentId, values),
    onSuccess: async (_, values) => {
      if (studentExtended) {
        await updateStudentAdditional.mutate({ studentId: studentId, data: values as StudentUpdate });
      } else {
        await createStudentAdditional.mutate({ data: { student_id: studentId, ...values } as StudentCreate });
      }

      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      utils.manualPayments.studentDetails.invalidate();
    },
    onError(err) {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          studentId,
          sections,
          levels,
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

  return { editStudentDetailMutation, levels, sections };
}
