import { Guardian } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import File from '/public/assets/icons/download/file.svg';
import Table from '/public/assets/icons/download/table.svg';
import XML from '/public/assets/icons/download/xml.svg';
import IcArrowLeft from '/public/assets/icons/ic_arrow_left.svg';
import Info from '/public/assets/icons/ic_info.svg';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import GuardianDrawerSheet from '/src/components/AssignTutorDrawer';
import {
  DownloadButton,
  DownloadMenu,
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import Select from '/src/components/Select';
import Status from '/src/components/Status';
import { AnimatedCard } from '/src/components/atoms/AnimatedCard';
import CheckBox from '/src/components/atoms/CheckBox';
import Dialog from '/src/components/atoms/Dialog';
import Sheet from '/src/components/atoms/Sheet';
import { Tooltip } from '/src/components/atoms/Tooltip';
import Layout from '/src/components/layouts';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import GeneralInformation from '/src/components/molecules/dashboard/StudentGeneralInformation';
import AssingStudentRFC from '/src/components/organisms/dashboard/AssingStudentRFC';
import Button from '/src/components/organisms/dashboard/Button';
import CornerTooltip from '/src/components/organisms/dashboard/CornerTooltip';
import OrderTableForAssignments from '/src/components/organisms/dashboard/OrderTableForAssignments';
import OrderTableForCharge from '/src/components/organisms/dashboard/OrderTableForCharge';
import OrderTableForDueOrders from '/src/components/organisms/dashboard/OrderTableForDueOrders';
import RFCDetail, { IUpdateData } from '/src/components/organisms/dashboard/RFCDetail';
import StudentDetailEdit from '/src/components/organisms/dashboard/StudentDataEdit';
import { StudentSectionsTable } from '/src/components/organisms/dashboard/StudentSectionsTable';
import TabsTablesScholarships from '/src/components/organisms/dashboard/TabsTablesScholarships';
import StudentStateCard from '/src/components/organisms/dashboard/student/StudentStateChip';
import StudentScholarshipsTable from '/src/components/students/StudentScholarshipsTable';
import { TabsWrapper as Tabs } from '/src/components/ui/Tabs';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { Action, useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import useAlert from '/src/hooks/useAlert';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import useToggle from '/src/hooks/useToggle';
import { PATH_PORTAL } from '/src/routes/paths';
import { StudentCreate, StudentUpdate } from '/src/server/api/routers/students';
import ApiClient from '/src/services/ApiClient';
import { useSetOpen } from '/src/stores/studentCreationStore';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { sendTrackEvent } from '/src/utils/events';
import { QUERY_KEY_DUE_ORDERS_STUDENT } from '/src/utils/reactQueryKeys';

StudentDetail.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Detalle del estudiante">{page}</Layout>;
};
function StudentDetail() {
  const { setAlertState } = useAlert();
  const permissions = useGetPermissions();
  const setOpen = useSetOpen();
  const router = useRouter();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();
  const { data: session } = useSession();
  const studentId = router.query.studentId as string;
  const [tab, setTab] = useState('due');
  const selectedSchool = useSelectedSchool();
  const [selectedConcept, setSelectedConcept] = useState<string | null>('all');
  const [selectedSchoolCycle, setSelectedSchoolCycle] = useState<string | null>('all');
  const { data: levelsData } = useLevels(session?.token, selectedSchool?.id);
  const { data: sectionsData } = useSections(session?.token, selectedSchool?.id, true);
  const [showDelete, setShowDelete] = useState(false);
  const [keepDueOrders, setKeepDueOrders] = useState(false);
  const [tutorAssignTooltip, setTutorAssignTooltip] = useState(false);
  const setIsWorking = useSetIsWorking();
  const addToQueue = useAddToQueue();
  const queryClient = useQueryClient();
  const utils = api.useUtils();
  const { isEnabled: scholarshipsFlag } = useFlagWithVariableMatching('hk_scholarships');

  const { isFieldBlocked, getTooltipMessage } = useIntegrationsBlockedFields();

  const isStudentDeactivateBlocked = () => isFieldBlocked('student.deactivate', Action.Delete);
  const getDeactivateTooltipMessage = () =>
    getTooltipMessage(
      'student.deactivate',
      Action.Delete,
      'Este estudiante no puede ser dado de baja porque ya se encuentra Inactivo.'
    );

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool?.id),
      staleTime: 60 * 1000 * 60,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const { data: student, isPending: isStudentLoading } = api.students.dashboardSchoolDueOrdersStudentDetail.useQuery(
    { studentId, schoolId: selectedSchool?.id as string },
    {
      enabled: !!selectedSchool?.id && !!studentId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const canTerminateStatuses = ['new_student', 'active', 'inactive'];
  const canTerminate = student?.state && canTerminateStatuses.includes(student.state) && !isStudentDeactivateBlocked();
  const [unassignModalConfirm, setUnassignModalConfirm] = useState({ open: false, guardian_id: '' });
  const [unassignRFCModalConfirm, setUnassignRFCModalConfirm] = useState(false);
  const { toggle: isOpenEditStudentData, onClose: onCloseEditStudentData, onOpen: onOpenEditStudentData } = useToggle();
  const { toggle: isOpenRFC, onClose: onCloseRFC, onOpen: onOpenRFC } = useToggle();
  const { toggle: isOpenDetailRFC, onClose: onCloseDetailRFCModal, onOpen: onOpenDetailRFC } = useToggle();
  const { toggle: openOrder, onOpen: onOpenOrder, onClose: onCloseOrder } = useToggle(false);

  const { data: studentMoreInfoData, isPending: studentLoading } = api.manualPayments.studentDetails.useQuery(
    { studentId },
    {
      enabled: !!studentId && !!session,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const selectedSchoolId = useSelectedSchoolId();

  const { data: guardianDetail } = api.guardian.getDetails.useQuery(
    { id: studentMoreInfoData?.billing_guardian ?? '', schoolId: selectedSchoolId ?? '' },
    {
      refetchOnWindowFocus: false,
      enabled: !!session && !!studentMoreInfoData?.billing_guardian && !!selectedSchoolId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const {
    data: assignmentsData,
    isPending: isAssignmentsLoading,
    error: assignmentsError,
  } = api.students.studentsAssignmentsList.useQuery(
    { studentId },
    {
      enabled: !!studentId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  useEffect(() => {
    if (assignmentsError) {
      Sentry.captureException(assignmentsError);
    }
  }, [assignmentsError]);

  const concepts = assignmentsData?.map((assignment) => assignment.concept);
  const sections = sectionsData || [];
  const levels = levelsData || [];
  const studentMoreInfo = studentMoreInfoData;
  const loading = isStudentLoading || isAssignmentsLoading;

  useSendPageViewedEvent('Detalle de Estudiante', selectedSchool);

  const handleBack = () => {
    router.push(PATH_PORTAL.student.root);
  };

  const handleChangeTab = (newValue: string) => {
    setSelectedConcept(null);
    setTab(newValue);
  };

  const handleChangeConcept = (value: string) => {
    setSelectedConcept(value);
  };

  const handleChangeSchoolCycle = (value: string) => {
    setSelectedSchoolCycle(value);
  };

  const getStatementsAccountReport = async () =>
    ApiClient.generateStudentStatementsReport(selectedSchool?.id, {
      student: student?.id,
      school_cycle: selectedSchoolCycle,
    });

  const unassignMutation = api.students.unassignGuardian.useMutation({
    onSuccess() {
      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
    },
  });

  const mutation = useMutation({
    mutationFn: getStatementsAccountReport,
    async onSuccess(data) {
      addToQueue(data.id);
    },
    onError(err) {
      setIsError();
      Sentry.captureException(err);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const onCloseDetailRFC = () => {
    onCloseDetailRFCModal();
    onCloseOrder();
  };

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
  const handleAdd = async () => {
    sendTrackEvent(tab === 'due' ? 'dashboard: Paid Orders Downloaded' : 'dashboard: Outstanding Orders Downloaded', {
      Type: 'Tabla',
      Source: 'Detalle de Estudiante',
    });
    await mutation.mutate();
    setIsWorking();
  };

  const downloadInvoices = async (extension: string) => {
    setIsWorking();
    sendTrackEvent(tab === 'due' ? 'dashboard: Paid Orders Downloaded' : 'dashboard: Outstanding Orders Downloaded', {
      Type: `Facturas ${extension.toUpperCase()}`,
      Source: 'Detalle de Estudiante',
    });

    return ApiClient.getInvoicesByStudent(studentId, extension)
      .then((data: Record<string, string>) => {
        addToQueue(data.id, ETypeFile.ZIP);
      })
      .catch(() => {
        setIsError();
        setTimeout(() => setToIdle(), 3000);
      });
  };

  const DownloadMenuItems = [
    {
      key: 'invoices-zip',
      children: (
        <>
          <File className="w-4" />
          <span>Descargar facturas PDF</span>
        </>
      ),
      onClick: () => downloadInvoices('pdf'),
    },
    {
      key: 'invoices-xml',
      children: (
        <>
          <XML className="w-4" />
          <span>Descargar facturas XML</span>
        </>
      ),
      onClick: () => downloadInvoices('xml'),
    },
    {
      key: 'table-report',
      children: (
        <>
          <Table className="w-5" />
          <span>Descargar Estado de Cuentas</span>
        </>
      ),
      onClick: () => handleAdd(),
      disabled: selectedSchoolCycle == 'all',
    },
  ];

  const { data: studentExtended } = api.students.retrieveStudentAdditionalInfo.useQuery({
    studentId: student?.id || '',
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
          student,
          concepts,
          sections,
          levels,
          studentMoreInfo,
          permissions,
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

  const hasRFC = !!studentMoreInfo?.billing_guardian_info;

  const handleUnassignTutor = async (guardian_id: string) => {
    await unassignMutation.mutateAsync({ guardianId: guardian_id, studentId: student?.id as string });
  };
  const isRFCAssigned = (guardian: Guardian) =>
    hasRFC &&
    guardian?.tax_id === student?.billing_guardian_info?.tax_id &&
    guardian?.billing_name === student?.billing_guardian_info?.billing_name;

  const handleOnHoverCancel = (hoverState: boolean, guardian: Guardian) => {
    if (isRFCAssigned(guardian)) {
      setTutorAssignTooltip(hoverState);
    }
  };

  const handleUnassignRFC = async () => {
    editStudentDetailMutation.mutate({ billing_guardian: null });
  };

  const inactivateMutation = api.students.inactivateStudent.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        message: 'El estudiante ha sido dado de baja exitosamente.',
        open: true,
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DUE_ORDERS_STUDENT, selectedConcept] });
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

  const [showReactivate, setShowReactivate] = useState(false);

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

  const tabsData = [
    {
      value: 'due',
      label: 'Órdenes por pagar',
    },
    {
      value: 'complete',
      label: 'Órdenes pagadas',
    },
  ];

  const trackEvent = useSendTrackEventWithUserName();

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) =>
        scope.setContext('state', {
          student,
          concepts,
          sections,
          levels,
          studentMoreInfo,
          permissions,
          session,
        })
      }
    >
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
            <Button className="w-full" variant="ghost">
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
            <Button className="w-full" variant="ghost">
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
              <img src="/assets/oval.svg" alt="loading" className="h-6 mx-auto" />
            ) : (
              'Sí, reactivar'
            )}
          </Button>
        </div>
      </Dialog.Root>
      <div>
        <div className="mb-16 flex items-center">
          <div className="flex">
            <div
              className="hover:cursor-pointer hover:bg-gray-100 w-[50px] h-[50px] rounded-[50%] flex items-center justify-center shadow-md mr-[18px]"
              onClick={handleBack}
            >
              <IcArrowLeft />
            </div>
            <label className="flex items-center text-[32px] font-bold" data-testid="studentDetail-header">
              Detalles del estudiante
            </label>
            <div className="flex items-center pl-4">
              {permissions?.can_view_student_status && student?.state ? (
                <StudentStateCard state={student?.state} />
              ) : student?.is_active ? (
                <Tooltip message="Este estudiante tiene conceptos del ciclo actual">
                  <Status variant="success">Activo</Status>
                </Tooltip>
              ) : (
                <Tooltip message="Este estudiante fue dado de baja o no tiene conceptos del ciclo actual">
                  <Status variant="muted">Inactivo</Status>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <div className="pb-8">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xl font-bold text-foreground">Información General</h5>

            {permissions &&
              !!permissions.can_edit_student &&
              (student?.state === 'dropped_out' ? (
                <Button
                  variant="primary"
                  size="small"
                  className="bg-white border rounded-lg shadow-none border-green text-green hover:bg-green hover:text-white"
                  data-testid="reactivate-button"
                  onClick={() => {
                    trackEvent('dashboard: open reactivate student', {
                      school_id: selectedSchool?.id,
                      student_id: studentId,
                    });
                    setShowReactivate(true);
                  }}
                >
                  Reactivar estudiante
                </Button>
              ) : (
                <Tooltip disableHover={canTerminate} message={getDeactivateTooltipMessage()}>
                  <Button
                    variant="outline"
                    intent="danger"
                    size="small"
                    disabled={!canTerminate}
                    data-testid="unsuscribe-button"
                    onClick={() => {
                      trackEvent('dashboard: open unsuscribe student', {
                        school_id: selectedSchool?.id,
                        student_id: studentId,
                      });
                      setShowDelete(true);
                    }}
                  >
                    Dar de baja
                  </Button>
                </Tooltip>
              ))}
          </div>
          <GeneralInformation student={student} isLoading={loading} action={onOpenEditStudentData} />
          <StudentSectionsTable id={studentId} schoolId={selectedSchool?.id} />
          <h5 className="mb-8 text-xl font-bold text-foreground">Tutores asignados</h5>
          <div className="w-full mb-8 space-y-4">
            {!loading &&
              student?.guardians?.map((guardian) => (
                <>
                  <AnimatedCard
                    disabledMutation={isRFCAssigned(guardian)}
                    canDelete={permissions && !!permissions.can_deassign_guardian}
                    cancelTooltipLabel="Desasignar tutor"
                    href={`/guardian/${guardian.id}`}
                    key={guardian.id}
                    onHoverCancel={(e) => handleOnHoverCancel(e, guardian)}
                    onCancel={() => setUnassignModalConfirm({ open: true, guardian_id: guardian.id })}
                    tooltip={
                      isRFCAssigned(guardian) ? (
                        <CornerTooltip
                          isOpen={tutorAssignTooltip}
                          modalBackground
                          title="No puedes desasignar a este tutor porque el estudiante factura a su RFC"
                          body="Cambia el RFC al que factura el estudiante primero"
                          actionText="Entendido"
                          actionMethod={() => setTutorAssignTooltip(false)}
                          corner="br"
                          placement="right-[100px] top-[300px]"
                        />
                      ) : (
                        <></>
                      )
                    }
                  >
                    <>
                      <div className="flex items-center justify-between w-full gap-2 py-4">
                        <h1
                          className="font-bold w-full max-w-[250px] break-words text-ellipsis text-start"
                          data-testid="guardianName-text"
                        >
                          {guardian.first_name} {guardian.last_name}
                        </h1>

                        <p className="flex items-center gap-2 w-full max-w-[250px] justify-start">
                          <span className="break-words max-w-[250px] text-left whitespace-nowrap text-ellipsis overflow-hidden">
                            {guardian?.relationship}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 w-full max-w-[250px] justify-start">
                          <span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.25 0.75H3.75C2.7558 0.751191 1.80267 1.14666 1.09966 1.84966C0.396661 2.55267 0.00119089 3.5058 0 4.5L0 13.5C0.00119089 14.4942 0.396661 15.4473 1.09966 16.1503C1.80267 16.8533 2.7558 17.2488 3.75 17.25H14.25C15.2442 17.2488 16.1973 16.8533 16.9003 16.1503C17.6033 15.4473 17.9988 14.4942 18 13.5V4.5C17.9988 3.5058 17.6033 2.55267 16.9003 1.84966C16.1973 1.14666 15.2442 0.751191 14.25 0.75ZM3.75 2.25H14.25C14.6991 2.25088 15.1376 2.38614 15.5092 2.63835C15.8808 2.89057 16.1684 3.24821 16.335 3.66525L10.5915 9.4095C10.1688 9.83049 9.59656 10.0669 9 10.0669C8.40344 10.0669 7.83118 9.83049 7.4085 9.4095L1.665 3.66525C1.83161 3.24821 2.11921 2.89057 2.49079 2.63835C2.86236 2.38614 3.30091 2.25088 3.75 2.25ZM14.25 15.75H3.75C3.15326 15.75 2.58097 15.5129 2.15901 15.091C1.73705 14.669 1.5 14.0967 1.5 13.5V5.625L6.348 10.47C7.05197 11.1722 8.00569 11.5665 9 11.5665C9.99431 11.5665 10.948 11.1722 11.652 10.47L16.5 5.625V13.5C16.5 14.0967 16.2629 14.669 15.841 15.091C15.419 15.5129 14.8467 15.75 14.25 15.75Z"
                                fill="#98A2B3"
                              />
                            </svg>
                          </span>

                          <span
                            className="break-words max-w-[250px] text-left whitespace-nowrap text-ellipsis overflow-hidden"
                            data-testid="guardianEmail-text"
                          >
                            {guardian.email}
                          </span>
                        </p>

                        <p className="flex items-center gap-2 w-full max-w-[200px] text-ellipsis justify-start">
                          <span>
                            <svg
                              width="12"
                              height="18"
                              viewBox="0 0 12 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.25 0H3.75C2.7558 0.00119089 1.80267 0.396661 1.09966 1.09966C0.396661 1.80267 0.00119089 2.7558 0 3.75V14.25C0.00119089 15.2442 0.396661 16.1973 1.09966 16.9003C1.80267 17.6033 2.7558 17.9988 3.75 18H8.25C9.2442 17.9988 10.1973 17.6033 10.9003 16.9003C11.6033 16.1973 11.9988 15.2442 12 14.25V3.75C11.9988 2.7558 11.6033 1.80267 10.9003 1.09966C10.1973 0.396661 9.2442 0.00119089 8.25 0V0ZM3.75 1.5H8.25C8.84674 1.5 9.41903 1.73705 9.84099 2.15901C10.2629 2.58097 10.5 3.15326 10.5 3.75V12H1.5V3.75C1.5 3.15326 1.73705 2.58097 2.15901 2.15901C2.58097 1.73705 3.15326 1.5 3.75 1.5ZM8.25 16.5H3.75C3.15326 16.5 2.58097 16.2629 2.15901 15.841C1.73705 15.419 1.5 14.8467 1.5 14.25V13.5H10.5V14.25C10.5 14.8467 10.2629 15.419 9.84099 15.841C9.41903 16.2629 8.84674 16.5 8.25 16.5Z"
                                fill="#98A2B3"
                              />
                            </svg>
                          </span>

                          <span data-testid="guardianPhone-text">{guardian.phone}</span>
                        </p>
                      </div>
                    </>
                  </AnimatedCard>
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
                </>
              ))}
            {loading && (
              <div className="border-[#83A9FF] justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card px-6 py-5">
                <div className="grid grid-cols-5">
                  <Skeleton className="w-[50%] col-span-2" />
                  <Skeleton className="col-span-2 w-[50%]" />
                  <Skeleton className="w-[50%]" />
                </div>
              </div>
            )}
          </div>
          {permissions?.can_assign_guardian && (
            <>
              <button
                className="flex items-center p-1 text-sm font-semibold transition-colors bg-transparent text-green hover:text-green-400"
                data-testid="assignNewGuardian-button"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 mr-3" /> Asignar nuevo tutor
              </button>
              <GuardianDrawerSheet studentId={studentId} />
            </>
          )}
        </div>
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h5 className="text-xl font-bold text-foreground">Facturación</h5>
          </div>
          {studentLoading && (
            <div className="border-[#83A9FF] bg-[#3366FF] bg-opacity-8 hover:bg-[#3366FF] hover:bg-opacity-12 justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card px-6 py-5">
              <div className="flex gap-4 w-[75%]">
                <div className="flex flex-col gap-4 w-[30%] border-r pr-4 border-[#9D9D9D]">
                  <Skeleton className="col-span-1 w-[60%]" />
                  <Skeleton className="col-span-2" />
                </div>
                <Skeleton className="w-[30%]" />
              </div>
            </div>
          )}
          {!studentLoading && !hasRFC && (
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
          )}
          {!studentLoading && hasRFC && (
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
                    <label className="text-base font-semibold">
                      RFC: {studentMoreInfo?.billing_guardian_info?.tax_id}
                    </label>
                    <label className="text-sm font-normal">
                      Razón social: {studentMoreInfo?.billing_guardian_info?.billing_name}
                    </label>
                  </div>
                  <div className="flex flex-col ml-4">
                    <label className="text-xs font-semibold text-[#637381] text-left">
                      Estudiantes facturando con ese RFC
                    </label>
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
                  <button
                    className="bg-transparent text-[#637381] font-bold"
                    onClick={() => setUnassignRFCModalConfirm(false)}
                  >
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
            </>
          )}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div>
                <div className="pt-4">
                  <Tabs tabs={tabsData} tab={tab} handleChangeTab={handleChangeTab} defaultValue="due">
                    <DownloadMenu items={DownloadMenuItems}>
                      <DownloadButton theme="blue" />
                    </DownloadMenu>
                  </Tabs>
                </div>
                <div className="flex items-center px-6 py-5">
                  <Select
                    containerClassName="w-full max-w-[25%]"
                    className="w-full"
                    placeholder="Conceptos"
                    disabled={loading}
                    onValueChange={handleChangeConcept}
                    value={selectedConcept ?? 'all'}
                  >
                    <Select.Content>
                      <Select.Item value="all" key="concepts-all">
                        <em>Todos</em>
                      </Select.Item>
                      {concepts?.map((option) => (
                        <Select.Item key={option.id} value={option.id}>
                          {option.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>

                  <Select
                    containerClassName="w-full max-w-[25%] ml-4"
                    className="w-full"
                    placeholder="Ciclo"
                    disabled={loading}
                    onValueChange={handleChangeSchoolCycle}
                    value={selectedSchoolCycle ?? 'all'}
                  >
                    <Select.Content>
                      <Select.Item value="all" key="school-cycles-all">
                        <em>Todos</em>
                      </Select.Item>
                      {schoolCycles?.map((option) => (
                        <Select.Item key={option.id} value={option.id as string}>
                          {option.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                {tab === 'due' && (
                  <OrderTableForDueOrders
                    studentId={studentId}
                    concept={selectedConcept === 'all' ? '' : selectedConcept ?? undefined}
                    schoolCycle={selectedSchoolCycle === 'all' ? '' : selectedSchoolCycle ?? undefined}
                  />
                )}
                {tab === 'complete' && (
                  <OrderTableForCharge
                    hideHeader
                    hideSum
                    studentId={studentId}
                    conceptId={selectedConcept === 'all' ? '' : selectedConcept ?? undefined}
                    schoolCycleId={selectedSchoolCycle === 'all' ? '' : selectedSchoolCycle ?? undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <hr className="my-10 border-t border-gray-300" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <OrderTableForAssignments studentId={studentId} student={student} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6 mt-10">
          <div className="col-span-12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {scholarshipsFlag ? (
                <StudentScholarshipsTable student={studentMoreInfoData} schoolCycles={schoolCycles ?? []} />
              ) : (
                <TabsTablesScholarships student={studentMoreInfoData} />
              )}
            </div>
          </div>
        </div>
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
      <Sheet
        open={isOpenEditStudentData}
        onOpenChange={(open) => {
          if (!open) onCloseEditStudentData();
        }}
      >
        <Sheet.Content>
          <StudentDetailEdit
            student={studentMoreInfo}
            onClose={onCloseEditStudentData}
            levels={levels}
            sections={sections}
            studentSection={student?.section}
            mutation={editStudentDetailMutation}
          />
        </Sheet.Content>
      </Sheet>
    </Sentry.ErrorBoundary>
  );
}

StudentDetail.auth = true;

export default StudentDetail;
