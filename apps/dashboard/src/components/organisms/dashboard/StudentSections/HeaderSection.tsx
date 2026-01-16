import Status from '/src/components/Status';
import { DashboardStudentDetail, StateEnum } from '@cometa/trpc';
import StudentStateCard from '/src/components/organisms/dashboard/student/StudentStateChip';
import { Tooltip } from '/src/components/atoms/Tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import useAlert from '/src/hooks/useAlert';
import { useQueryClient } from '@tanstack/react-query';
import Info from '/public/assets/icons/ic_info.svg';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';
import { QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';
import Dialog from '/src/components/atoms/Dialog';
import CheckBox from '/src/components/atoms/CheckBox';
import Button from '/src/components/organisms/dashboard/Button';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { Action, useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import { api } from '/src/utils/api';
import { useState } from 'react';
import { ChevronDownIcon, XCircleIcon, RotateCwIcon, CreditCard } from 'lucide-react';
import AvatarSection from '../AdmissionSections/AvatarSection';
import CredentialTemplateSidePanel from './CredentialTemplateSidePanel';

export function HeaderSection({ student }: { student: DashboardStudentDetail | undefined }) {
  const borderColor: Record<StateEnum, string> = {
    [StateEnum.Active]: 'border-[#229A16]',
    [StateEnum.Graduated]: 'border-info',
    [StateEnum.Inactive]: 'border-[#919EAB]',
    [StateEnum.NewStudent]: 'border-[rgba(183,_129,_3,_1)]',
    [StateEnum.DroppedOut]: 'border-[#D32F2F]',
    [StateEnum.Lead]: 'border-[#919EAB]',
  };

  const status = student?.state ?? StateEnum.Inactive;

  const inscriptionInActiveCycle = student?.inscription_section?.find(
    (inscription) => inscription.school_cycle?.is_active
  );
  const section = inscriptionInActiveCycle?.section;
  const sectionName = section ? `${section.name} - ${section.level_name}` : '-';

  return (
    <header className="flex justify-between items-center py-4 px-8">
      <div className="flex items-center gap-4">
        <AvatarSection id={student?.id as string} borderColor={borderColor[status]} photoUrl={student?.photo} />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#1C1C1D]">
              {student?.first_name} {student?.last_name}
            </h2>
            <div className="flex items-center">
              <StudentStatus student={student} />
            </div>
          </div>
          <p className="text-sm text-[#454D64]">{sectionName}</p>
        </div>
      </div>

      <DropdownActions student={student} />
    </header>
  );
}

function StudentStatus({ student }: { student?: DashboardStudentDetail }) {
  const permissions = useGetPermissions();

  if (permissions?.can_view_student_status && student?.state) {
    return <StudentStateCard state={student?.state} />;
  }

  if (student?.is_active) {
    return (
      <Tooltip message="Este estudiante tiene conceptos del ciclo actual">
        <Status variant="success">Activo</Status>
      </Tooltip>
    );
  }

  return (
    <Tooltip message="Este estudiante fue dado de baja o no tiene conceptos del ciclo actual">
      <Status variant="muted">Inactivo</Status>
    </Tooltip>
  );
}

function DropdownActions({ student }: { student: DashboardStudentDetail | undefined }) {
  const studentId = student?.id as string;

  const selectedSchool = useSelectedSchool();
  const permissions = useGetPermissions();
  const trackEvent = useSendTrackEventWithUserName();
  const { setAlertState } = useAlert();
  const queryClient = useQueryClient();
  const utils = api.useUtils();

  const [showDelete, setShowDelete] = useState(false);
  const [keepDueOrders, setKeepDueOrders] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [showCredentialPanel, setShowCredentialPanel] = useState(false);

  const { isFieldBlocked, getTooltipMessage } = useIntegrationsBlockedFields();

  const isStudentDeactivateBlocked = () => isFieldBlocked('student.deactivate', Action.Delete);
  const getDeactivateTooltipMessage = () =>
    getTooltipMessage(
      'student.deactivate',
      Action.Delete,
      'Este estudiante no puede ser dado de baja porque ya se encuentra Inactivo.'
    );

  const canTerminateStatuses = ['new_student', 'active', 'inactive'];
  const canTerminate = student?.state && canTerminateStatuses.includes(student.state) && !isStudentDeactivateBlocked();

  const inactivateMutation = api.students.inactivateStudent.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        message: 'El estudiante ha sido dado de baja exitosamente.',
        open: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT] });
      utils.students.studentsAssignmentsList.invalidate();
      queryClient.invalidateQueries({ queryKey: ['schoolFulfillments'] });
      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        message:
          'Ha ocurrido un error al dar de baja al estudiante. Intenta nuevamente o contacta a nuestro equipo de soporte.',
        open: true,
      });
    },
    onMutate: () => {
      setKeepDueOrders(false);
      setShowDelete(false);
    },
  });

  const reactivateMutation = api.students.reactivate.useMutation({
    onSuccess: async () => {
      setAlertState({
        severity: 'success',
        message: 'El estudiante ha sido reactivado exitosamente.',
        open: true,
        alertTime: 2000,
      });
      setShowReactivate(false);
      await utils.students.invalidate();
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        message:
          'Ha ocurrido un error al reactivar al estudiante. Intenta nuevamente o contacta a nuestro equipo de soporte.',
        open: true,
      });
      setShowReactivate(false);
    },
  });

  if (!permissions || !permissions.can_edit_student) {
    return null;
  }

  return (
    <>
      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button className="bg-[#00AB5514] text-[#00AB55] hover:bg-[#00AB5544] font-semibold text-sm px-5 py-3 flex items-center gap-3 shadow-none rounded-full">
              Acciones <ChevronDownIcon className="w-5" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="border border-[#E9EEF7] rounded-2xl flex flex-col gap-1 mt-1 text-sm shadow-sm"
              align="end"
            >
              {student?.state === 'dropped_out' ? (
                <DropdownMenu.Item asChild>
                  <Button
                    data-testid="reactivate-button"
                    onClick={() => {
                      trackEvent('dashboard: open reactivate student', {
                        school_id: selectedSchool?.id,
                        student_id: studentId,
                      });
                      setShowReactivate(true);
                    }}
                    className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                  >
                    <RotateCwIcon className="w-5" /> Reactivar estudiante
                  </Button>
                </DropdownMenu.Item>
              ) : (
                <Tooltip disableHover={canTerminate} message={getDeactivateTooltipMessage()}>
                  <DropdownMenu.Item asChild>
                    <Button
                      disabled={!canTerminate}
                      data-testid="unsuscribe-button"
                      onClick={() => {
                        trackEvent('dashboard: open unsuscribe student', {
                          school_id: selectedSchool?.id,
                          student_id: studentId,
                        });
                        setShowDelete(true);
                      }}
                      className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                    >
                      <XCircleIcon className="w-5" /> Dar de baja
                    </Button>
                  </DropdownMenu.Item>
                </Tooltip>
              )}
              {Boolean(selectedSchool?.config_dashboard?.enable_credentials_access) && (
                <DropdownMenu.Item asChild>
                  <Button
                    data-testid="credential-button"
                    onClick={() => {
                      trackEvent('dashboard: open generate credential', {
                        school_id: selectedSchool?.id,
                        student_id: studentId,
                      });
                      setShowCredentialPanel(true);
                    }}
                    className="px-5 py-4 min-w-48 outline-none bg-white text-dark font-normal hover:bg-[#F0F0F0] hover:cursor-pointer rounded-2xl flex items-center gap-2 justify-start shadow-none drop-shadow-none"
                  >
                    <CreditCard className="w-5" /> Generar credencial
                  </Button>
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <Dialog.Root
        open={showDelete}
        onOpenChange={(open) => {
          if (!open) {
            setShowDelete(false);
            setKeepDueOrders(false);
          }
        }}
        classNames="max-w-[433px]"
      >
        <Dialog.Title>¿Quieres dar de baja a este estudiante?</Dialog.Title>
        <Dialog.Description>
          Se desasignarán sus conceptos y se eliminarán todas las órdenes que aún no han sido pagadas.
        </Dialog.Description>

        {!student?.has_partial_payins && Number(student?.due_total_price) !== 0 ? (
          <div className="bg-[#FFF7CD] rounded-lg py-3 px-4 flex items-center justify-between gap-3">
            <Warning className="text-[#FFC107] w-7 h-7" />
            <p className="text-sm text-[#7A4F01] text-left">
              Este estudiante tiene órdenes vencidas que serán eliminadas.
            </p>
          </div>
        ) : null}

        {student?.has_partial_payins && Number(student?.due_total_price) === 0 ? (
          <div className="bg-[#D0F2FF] rounded-lg py-3 px-4 flex items-center justify-between gap-3">
            <Info className="w-14 h-14" />
            <p className="text-sm text-[#04297A] text-left">
              Este estudiante tiene órdenes pagadas parcialmente que permanecerán asignadas y pendientes de ser
              completadas.
            </p>
          </div>
        ) : null}

        {student?.has_partial_payins && Number(student.due_total_price) !== 0 ? (
          <div className="bg-[#FFF7CD] rounded-lg py-3 px-4 flex items-center justify-between gap-10">
            <Warning className="text-[#FFC107] w-7 h-7" />
            <ul className="text-sm text-[#7A4F01] text-left list-disc">
              <li>
                Se mantendrán asignadas las <strong>órdenes pagadas parcialmente.</strong>
              </li>
              <li>
                Se eliminarán las <strong>órdenes vencidas</strong> que no han sido pagadas.
              </li>
            </ul>
          </div>
        ) : null}

        {Number(student?.due_total_price) !== 0 ? (
          <label className="flex items-center gap-3 p-2 mt-3 cursor-pointer select-none">
            <CheckBox checked={keepDueOrders} onChange={() => setKeepDueOrders(!keepDueOrders)} />
            <span className="text-sm">Mantener las órdenes vencidas luego de dar de baja.</span>
          </label>
        ) : null}

        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              trackEvent('dashboard: leave unsuscribe student', {
                school_id: selectedSchool?.id,
                student_id: studentId,
              });
            }}
            asChild
          >
            <Button className="w-full" variant="outline">
              No, volver
            </Button>
          </Dialog.Close>
          <Button
            className="w-full bg-[#FF4842] shadow-[#FF4842] hover:bg-[#c73833]"
            onClick={() => {
              trackEvent('dashboard: confirm unsuscribe student', {
                school_id: selectedSchool?.id,
                student_id: studentId,
              });

              inactivateMutation.mutate({ studentId, forgive_debt: !keepDueOrders });
            }}
          >
            Sí, dar de baja
          </Button>
        </div>
      </Dialog.Root>

      <Dialog.Root
        open={showReactivate}
        onOpenChange={(open) => {
          if (!open) {
            setShowReactivate(false);
          }
        }}
        classNames="max-w-[433px]"
      >
        <Dialog.Title>¿Quieres reactivar a este estudiante?</Dialog.Title>
        <Dialog.Description>
          El estudiante volverá a mostrarse como Activo, Inactivo o Nuevo ingreso según sus conceptos e inscripciones
          asignadas.
        </Dialog.Description>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              trackEvent('dashboard: leave reactivate student', {
                school_id: selectedSchool?.id,
                student_id: studentId,
              });
            }}
            asChild
          >
            <Button className="w-full" variant="outline">
              No, volver
            </Button>
          </Dialog.Close>
          <Button
            variant="primary"
            className="w-full"
            disabled={reactivateMutation.isPending}
            onClick={() => {
              trackEvent('dashboard: confirm reactivate student', {
                school_id: selectedSchool?.id,
                student_id: studentId,
              });
              reactivateMutation.mutate({ id: studentId });
            }}
          >
            {reactivateMutation.isPending ? (
              <img src="/assets/oval.svg" alt="loading" className="mx-auto h-6" />
            ) : (
              'Sí, reactivar'
            )}
          </Button>
        </div>
      </Dialog.Root>

      <CredentialTemplateSidePanel
        open={showCredentialPanel}
        onClose={() => setShowCredentialPanel(false)}
        student={student}
      />
    </>
  );
}
