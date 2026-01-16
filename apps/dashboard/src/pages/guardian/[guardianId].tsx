import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/layouts';
import ApiClient from '../../services/ApiClient';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import IcArrowLeft from '/public/assets/icons/ic_arrow_left.svg';
import IcWhatsApp from '/public/assets/icons/ic_whatsapp.svg';
import IcMail from '/public/assets/icons/ic_mail.svg';
import IcCalendar from '/public/assets/icons/ic_calendar.svg';
import IcPhone from '/public/assets/icons/ic_phone.svg';
import IcEdit from '/public/assets/icons/ic_edit.svg';
import IcPerson from '/public/assets/icons/ic_person.svg';
import { useMutation } from '@tanstack/react-query';
import { formatDateNumeric, formatPrice } from '../../utils/general';
import { render_due_orders } from '/src/utils/datagridHeaders';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import useToggle from '/src/hooks/useToggle';
import GuardianEdit from '/src/components/organisms/dashboard/GuardianEdit';
import CornerTooltip from '/src/components/organisms/dashboard/CornerTooltip';
import Dialog from '/src/components/atoms/Dialog';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import useAlert from '/src/hooks/useAlert';
import { AnimatedCard } from '/src/components/atoms/AnimatedCard';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import { Switch } from '../../components/atoms/Switch';
import RFCDetail, { IUpdateData } from '/src/components/organisms/dashboard/RFCDetail';
import { AxiosError } from 'axios';
import { Action, useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Sheet from '/src/components/atoms/Sheet';
import { useSendTrackEvent } from '@cometa/utils';
import { api } from '/src/utils/api';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { GenderKeys, guardianRelationship, RelationshipKeys } from '/src/constants/guardianRelationship';
import { Guardian } from '@cometa/trpc';
import IcDownload from '/public/assets/icons/ic_download.svg';
import { GuardianAccountStatementDownloadDialog } from '/src/components/organisms/dashboard/GuardianAccountStatementDownloadDialog';

GuardianPage.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Detalle del tutor">{page}</Layout>;
};

export const SwitchWithLabel = ({
  id,
  onCheckedChange,
  checked,
  label,
  disabled,
}: {
  id: string;
  onCheckedChange: (checked: boolean) => void;
  checked: boolean;
  label: string;
  disabled?: boolean;
}) => (
  <div className="flex items-center">
    <label htmlFor={id} className="ml-3 text-sm font-semibold text-[#637381] mx-2 cursor-pointer">
      {label}
    </label>
    <Switch id={id} onCheckedChange={onCheckedChange} checked={checked} disabled={disabled} />
  </div>
);

function GuardianPage() {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const permissions = useGetPermissions();
  const router = useRouter();
  const guardianId = router.query.guardianId as string;
  const showRFC = router.query.showRFC as string;
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const { data: session } = useSession();
  const [openRFC, setOpenRFC] = useState<boolean>(showRFC === 'true');
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [openModalInvite, setOpenModalInvite] = useState(false);
  const { toggle: openGuardianEdit, onClose: onCloseGuardianEdit, onOpen: onOpenGuardianEdit } = useToggle();
  const [openModalWP, setOpenModalWP] = useState(false);
  const [openModalMail, setOpenModalMail] = useState(false);
  const [idUnassign, setIdUnassign] = useState('');
  const sendTrackEventWithName = useSendTrackEvent();
  const selectedSchool = useSelectedSchool();
  const selectedSchoolId = selectedSchool?.id;
  const [isWpSelected, setIsWpSelected] = useState<undefined | boolean>(false);
  const { isFieldBlocked, getTooltipMessage } = useIntegrationsBlockedFields();
  const [isMailSelected, setIsMailSelected] = useState<undefined | boolean>(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  const { data: guardianDetail, isPending: isLoading } = api.guardian.getDetails.useQuery(
    { id: guardianId, schoolId: selectedSchoolId as string },
    {
      refetchOnWindowFocus: false,
      enabled: !!guardianId && !!selectedSchoolId,
    }
  );

  useEffect(() => {
    setIsWpSelected(guardianDetail?.send_whatsapps);
    setIsMailSelected(guardianDetail?.send_emails);
  }, [guardianDetail]);

  const changeNotification = async (type: string, value: boolean) =>
    await ApiClient.patchGuardianDetail(guardianId, { [type]: value });

  const updateGuardianMutation = useMutation({
    mutationFn: (guardianBillingInf: IUpdateData) =>
      ApiClient.patchGuardianDetail(guardianBillingInf.id, {
        billing_info: guardianBillingInf.billing_info,
        school_id: selectedSchool?.id,
      }),
    onSuccess: async () => {
      await utils.guardian.getDetails.invalidate();
      await utils.guardian.getDetails.refetch();
      onCloseDetailRFC();
    },
    onError: (error: AxiosError) => {
      Sentry.captureException(error.response);
      setErrors(error.response?.data as Record<string, unknown>);
    },
  });

  const whatsappInviteMutation = api.guardian.sendWhatsappInvitedMail.useMutation({
    onSuccess: () => {
      setAlertState({ open: true, severity: 'success', message: '¡Se envió la invitación de manera exitosa!' });
      setOpenModalInvite(false);
    },
    onError: (err) => {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          permissions,
          guardianId,
          session,
          isWpSelected,
          isMailSelected,
          openRFC,
          openModalInvite,
          openGuardianEdit,
          openModalWP,
          openModalMail,
          idUnassign,
          guardianDetail,
        });
        return scope;
      });
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      setOpenModalInvite(false);
    },
  });
  const wpMutation = useMutation({
    mutationFn: async () => {
      await changeNotification('send_whatsapps', !!isWpSelected);
    },
    onSuccess: async () => {
      await utils.guardian.invalidate();
    },
    onError: (err) => {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          permissions,
          guardianId,
          session,
          isWpSelected,
          isMailSelected,
          openRFC,
          openModalInvite,
          openGuardianEdit,
          openModalWP,
          openModalMail,
          idUnassign,
          guardianDetail,
        });
        return scope;
      });
    },
  });
  const mailMutation = useMutation({
    mutationFn: async () => {
      await changeNotification('send_emails', !!isMailSelected);
    },
    onSuccess: async () => {
      await utils.guardian.getDetails.invalidate();
      await utils.guardian.getDetails.refetch();
    },
    onError: (err) => {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          permissions,
          guardianId,
          session,
          isWpSelected,
          isMailSelected,
          openRFC,
          openModalInvite,
          openGuardianEdit,
          openModalWP,
          openModalMail,
          idUnassign,
          guardianDetail,
        });
        return scope;
      });
    },
  });

  const handleWhatsAppNotification = () => {
    if (!isWpSelected !== true) {
      setOpenModalWP(true);
      sendTrackEventWithUserName(Events.guardian_wa_notifications_off);
    }
    setIsWpSelected(!isWpSelected);
    wpMutation.mutate();
  };

  const handleMailNotification = () => {
    if (!isMailSelected !== true) {
      setOpenModalMail(true);
      sendTrackEventWithUserName(Events.guardian_mail_notifications_off);
    }
    setIsMailSelected(!isMailSelected);
    mailMutation.mutate();
  };

  const handleEditInformation = () => {
    sendTrackEventWithUserName(Events.guardian_detail_viewed);
    onOpenGuardianEdit();
  };

  const handleClickRFC = () => {
    setOpenRFC(!openRFC);
  };

  const openWhatsappModal = () => {
    setOpenModalInvite(true);
    sendTrackEventWithUserName(Events.guardian_click_send_wa);
  };

  const sendWhatsappInvite = () => {
    sendTrackEventWithName('dashboard: Invitation Sent', session);
    whatsappInviteMutation.mutate({ id: guardianId, selectedSchool: selectedSchool?.name as string });
  };

  const onCloseDetailRFC = () => {
    setErrors({});
    setOpenRFC(false);
  };

  const hasRFC = guardianDetail?.billing_info?.tax_id && guardianDetail?.billing_info?.taxing_system;
  const unassignMutation = api.students.unassignGuardian.useMutation({
    onSuccess: () => {
      setIdUnassign('');
      utils.guardian.getDetails.invalidate();
      sendTrackEventWithUserName(Events.guardian_unassign_student);
    },
    onError: (err) => {
      Sentry.captureException(err, (scope) => {
        scope.setContext('state', {
          permissions,
          guardianId,
          session,
          isWpSelected,
          isMailSelected,
          openRFC,
          openModalInvite,
          openGuardianEdit,
          openModalWP,
          openModalMail,
          idUnassign,
          guardianDetail,
        });
        return scope;
      });
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Ocurrió un error inesperado, por favor intenta de nuevo.',
      });
      setIdUnassign('');
    },
  });

  const handleBack = () => {
    router.back();
  };

  const relationship = (relationship: RelationshipKeys, gender: GenderKeys): string =>
    guardianRelationship[relationship]?.[gender] || '-';

  const getGuardian = (id: string, guardians: Guardian[]) => {
    const found = guardians.find((guardian) => guardian?.id === id);
    return found?.relationship || null;
  };

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          permissions,
          guardianId,
          session,
          isWpSelected,
          isMailSelected,
          openRFC,
          openModalInvite,
          openGuardianEdit,
          openModalWP,
          openModalMail,
          idUnassign,
          guardianDetail,
        });
      }}
    >
      <div>
        <div id="header" className="flex items-center justify-between pt-4">
          <div className="flex">
            <div
              className="hover:cursor-pointer hover:bg-gray-100 w-[50px] h-[50px] rounded-[50%] flex items-center justify-center shadow-md mr-[18px]"
              onClick={handleBack}
            >
              <IcArrowLeft />
            </div>
            <label className="flex items-center text-[32px] font-bold">Detalles del tutor</label>
          </div>
          <div className="flex gap-3">
            {shouldShowAccountSections ? (
              <button
                className="border text-[#212B36] bg-[#EDF2FC] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap outline-none h-[40px] rounded-full px-4 py-2 hover:opacity-80 transition"
                onClick={() => setDownloadDialogOpen(true)}
              >
                <IcDownload className="w-5 h-5 text-black" />
                Estado de cuenta
              </button>
            ) : null}
            {permissions?.can_send_whatsapp && (
              <button
                onClick={openWhatsappModal}
                className="text-white bg-[#1C1C1D] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap outline-none h-[40px] rounded-full px-4 py-2"
              >
                <IcWhatsApp className="w-5 h-5 text-white" />
                Enviar invitación
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y">
          <div className="mb-10">
            <div id="general-information-title" className="flex justify-between mt-10">
              <label className="font-bold text-[20px] text-[#454F5B] ">Información general</label>
              {permissions?.can_edit_guardian && (
                <div className="flex">
                  <div className="border-r pr-7">
                    <SwitchWithLabel
                      id="switch-noti-whatsapp"
                      label="Notificaciones por WhatsApp"
                      onCheckedChange={handleWhatsAppNotification}
                      checked={Boolean(isWpSelected)}
                      disabled={wpMutation.isPending}
                    />
                    <CornerTooltip
                      isOpen={openModalWP}
                      title="Desactivaste las notificaciones por WhatsApp"
                      body="Recuerda que si desactivas las notificaciones no se le enviarán recordatorios al tutor a través de WhatsApp."
                      actionText="Entendido"
                      actionMethod={() => setOpenModalWP(false)}
                      corner="tr"
                      placement="top-[230px] right-[380px]"
                      modalBackground
                    />
                  </div>
                  <div className="pl-3">
                    <SwitchWithLabel
                      id="switch-noti-email"
                      label="Notificaciones por correo"
                      onCheckedChange={handleMailNotification}
                      checked={Boolean(isMailSelected)}
                      disabled={mailMutation.isPending}
                    />
                    <CornerTooltip
                      isOpen={openModalMail}
                      title="Desactivaste las notificaciones por correo"
                      body="Recuerda que si desactivas las notificaciones no se le enviarán recordatorios al tutor a través de correo electrónico."
                      actionText="Entendido"
                      actionMethod={() => setOpenModalMail(false)}
                      corner="tr"
                      placement="top-[230px] right-[140px]"
                      modalBackground
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div id="general-information-data" className="col-span-2 mt-4 rounded-lg shadow-card">
                {isLoading && (
                  <div className="w-full max-w-sm p-8 rounded-md">
                    <div className="flex space-x-4 animate-pulse">
                      <div className="flex-1 py-1 space-y-6">
                        <div className="w-2/3 h-4 rounded bg-slate-200" />
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-4 col-span-1 rounded bg-slate-300" />
                            <div className="h-4 col-span-1 rounded bg-slate-300" />
                            <div className="h-4 col-span-1 rounded bg-slate-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {!isLoading && (
                  <div className="grid grid-cols-1 gap-4">
                    <div id="info" className="flex flex-col py-6 pl-8">
                      <div className="flex justify-between">
                        <label className="text-[20px] font-semibold ">
                          {guardianDetail?.first_name} {guardianDetail?.last_name}
                        </label>
                        {permissions?.can_edit_guardian && (
                          <button
                            onClick={handleEditInformation}
                            className="flex items-center bg-white text-[#00AB55] font-bold rounded-lg px-8 cursor-pointer"
                          >
                            <IcEdit fill="#00AB55" />
                            <label className="ml-3 cursor-pointer">Editar</label>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="flex items-center mr-7">
                          <IcMail />
                          <label className="ml-[4px] text-[14px]">{guardianDetail?.email}</label>
                        </div>
                        <div className="flex items-center mr-7">
                          <IcPhone />
                          <label className="ml-[9px] text-[14px]">{guardianDetail?.phone}</label>
                        </div>
                        <div className="flex items-center mr-7">
                          {guardianDetail?.birthdate ? <IcCalendar className="fill-[#919EAB]" /> : null}
                          <label className="ml-2 text-[14px]">
                            {guardianDetail?.birthdate ? formatDateNumeric(guardianDetail?.birthdate) : null}
                          </label>
                        </div>
                        {guardianDetail?.occupation ? (
                          <div className="flex items-center mr-7">
                            <LuggageIcon />
                            <label className="ml-2 text-[14px]">{guardianDetail?.occupation}</label>
                          </div>
                        ) : null}
                        {guardianDetail?.workplace ? (
                          <div className="flex items-center mr-7">
                            <BuildingIcon />
                            <label className="ml-2 text-[14px]">{guardianDetail?.workplace}</label>
                          </div>
                        ) : null}
                        {guardianDetail?.workphone ? (
                          <div className="flex items-center mr-7">
                            <IcPhone className="fill-[#919EAB]" />
                            <label className="ml-2 text-[14px]">{guardianDetail?.workphone}</label>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {shouldShowAccountSections ? (
                <div id="deuda-total" className="flex flex-col px-8 py-6 mt-4 rounded-lg shadow-card">
                  <label className="mb-2 text-sm font-semibold">Deuda por hijos</label>
                  <label className="text-2xl font-semibold">
                    {guardianDetail?.due_total ? formatPrice(guardianDetail?.due_total, 'MXN') : '-'}
                  </label>
                </div>
              ) : null}
            </div>
          </div>
          {shouldShowAccountSections ? (
            <div className="mb-10">
              <div id="invoice-detail" className="mt-10">
                <div className="flex items-center h-11">
                  <p className="text-xl font-bold text-[#454F5B]">Facturación</p>
                </div>
                {isLoading && (
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
                {hasRFC && !isLoading && (
                  <AnimatedCard
                    onClick={handleClickRFC}
                    cancelTooltipLabel="Desasignar RFC"
                    key={guardianDetail?.billing_info?.tax_id}
                    className="bg-[#3366FF] bg-opacity-8 hover:bg-[#3366FF] hover:bg-opacity-12"
                  >
                    <div className="flex w-full gap-2 py-4">
                      <div className="flex flex-col items-start gap-2 border-r pr-4 border-[#9D9D9D]">
                        <p className="text-base font-semibold">RFC: {guardianDetail?.billing_info?.tax_id || '-'}</p>
                        <p className="text-sm font-normal">
                          Razón social: {guardianDetail?.billing_info?.billing_name || '-'}
                        </p>
                      </div>
                      <div className="flex flex-col ml-4">
                        <p className="cursor-pointer text-xs font-semibold text-[#637381] text-left">
                          Estudiantes facturando con ese RFC
                        </p>
                        <div className="flex mt-2">
                          {guardianDetail?.billing_info?.billable_dependents?.map((student) => (
                            <div key={student.id} className="flex items-center mr-5">
                              <div className="w-2 h-2 mr-1 rounded-[50%] bg-[#3366FF]" />
                              <div>
                                {student?.first_name} {student?.last_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                )}
                {!hasRFC && !isLoading && (
                  <div>
                    <div className="w-full mb-8 space-y-4 px-6 py-4 bg-[#919EAB] bg-opacity-[0.08] rounded-xl border border-[#637381]">
                      <p className="text-sm font-normal">
                        Este tutor aún no ha registrado ningún RFC para facturación.
                      </p>
                    </div>
                    <button
                      className="flex items-center p-1 text-sm font-semibold transition-colors bg-transparent text-green hover:text-green-400 disabled:text-[#919EABCC]"
                      onClick={handleClickRFC}
                      disabled={!selectedSchool?.does_invoice}
                    >
                      <Plus className="w-4 mr-3" /> Registrar datos de facturación
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          <div className="mb-10">
            <div id="dependents-detail" className="mt-10">
              <div className="flex items-center h-11">
                <p className="text-xl font-bold text-[#212B36]">Estudiantes asignados</p>
              </div>
              <div className="space-y-4">
                {!isLoading &&
                  guardianDetail?.dependents?.map((dependent) => {
                    const isUnassignBlocked = isFieldBlocked('student_guardian.relationship', Action.Update);
                    const canUnassign = !!permissions?.can_deassign_guardian && !isUnassignBlocked;
                    const tooltipMessage = getTooltipMessage(
                      'student_guardian.relationship',
                      Action.Update,
                      'Desasignar estudiante'
                    );

                    return (
                      <AnimatedCard
                        canDelete={canUnassign}
                        onHoverCancel={() => 0}
                        href={`/students/${dependent.id}`}
                        cancelTooltipLabel={tooltipMessage}
                        key={dependent.id}
                        onCancel={() => setIdUnassign(dependent.id)}
                      >
                        <>
                          <div className="flex col-span-2 py-5">
                            <IcPerson />
                            <div className="flex flex-col ml-5">
                              <p className="mb-1 text-base font-semibold text-start">
                                {dependent?.first_name} {dependent?.last_name}
                              </p>
                              <div className="flex">
                                <p className="mr-8 text-sm font-medium">
                                  Parentesco:{' '}
                                  {relationship(
                                    getGuardian(guardianId, dependent?.guardians) as RelationshipKeys,
                                    dependent?.gender as GenderKeys
                                  )}
                                </p>
                                <p className="mr-8 text-sm font-medium">Nivel: {dependent?.section?.level_name}</p>
                                <p className="mr-8 text-sm font-medium">Grado: {dependent?.section?.grade}</p>
                                <p className="mr-8 text-sm font-medium">Sección: {dependent?.section?.group}</p>
                              </div>
                            </div>
                          </div>
                          {shouldShowAccountSections ? (
                            <>
                              <div className="flex flex-col justify-center py-5">
                                <p className="mb-1 text-xs font-semibold">Deuda total</p>
                                <p className="text-xl font-semibold">
                                  {formatPrice(dependent?.due_total_price, 'MXN')}
                                </p>
                              </div>
                              <div className="flex items-center justify-center py-5 cursor-pointer">
                                {render_due_orders(dependent?.due_orders, 'morosidad', true)}
                              </div>
                            </>
                          ) : null}
                        </>
                      </AnimatedCard>
                    );
                  })}
                {isLoading && (
                  <div className="border-[#83A9FF] justify-between grid grid-cols-[1fr_auto] border w-full min-h-[58px] rounded-2xl group-hover:border-[#F8F8F8] group-hover:shadow-[0px_16px_32px_-4px_rgba(145,158,171,0.16)] group/card px-6 py-5">
                    <div className="grid grid-cols-5">
                      <div className="col-span-3 gap-4 w-[90%]">
                        <Skeleton className="w-[50%] col-span-2 mb-4" />
                        <Skeleton className="col-span-2 w-[40%]" />
                      </div>
                      <Skeleton className="w-[60%]" />
                      <Skeleton className="ml-6 w-[50%]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog.Root
        open={!!idUnassign}
        position="center"
        onOpenChange={(state) => {
          if (!state) setIdUnassign('');
        }}
      >
        <Dialog.Title>¿Estás seguro que deseas desasignar este estudiante?</Dialog.Title>
        <Dialog.Description>
          El tutor ya no tendrá acceso a la información y órdenes de este estudiante.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
            Cancelar
          </Dialog.Close>
          <button
            className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D]"
            onClick={() => {
              if (idUnassign && guardianDetail?.id)
                unassignMutation.mutate({ studentId: idUnassign, guardianId: guardianDetail.id });
            }}
          >
            Sí, desasignar
          </button>
        </div>
      </Dialog.Root>
      <Dialog.Root open={openModalInvite} position="center" onOpenChange={(state) => setOpenModalInvite(state)}>
        <Dialog.Title>
          Se enviará un link de acceso al portal de pagos de Cometa al WhatsApp de este tutor.
        </Dialog.Title>
        <Dialog.Description>
          <div className="flex flex-row justify-center">
            <Phone className="w-4 mr-2 text-[#98A2B3]" />
            {`${guardianDetail?.phone ?? '+52 1 55 2134 3223'}`}
          </div>
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
            Cancelar
          </Dialog.Close>
          <button
            className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D]"
            onClick={() => {
              sendWhatsappInvite();
            }}
          >
            Enviar
          </button>
        </div>
      </Dialog.Root>
      {guardianDetail ? (
        <Sheet
          open={openGuardianEdit}
          onOpenChange={(open) => {
            if (!open) onCloseGuardianEdit();
          }}
        >
          <Sheet.Content>
            <GuardianEdit guardian={guardianDetail} onClose={onCloseGuardianEdit} />{' '}
          </Sheet.Content>
        </Sheet>
      ) : null}
      {!isLoading && (
        <Sheet
          open={openRFC}
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
              errorsMutation={errors}
            />
          </Sheet.Content>
        </Sheet>
      )}
      <GuardianAccountStatementDownloadDialog
        guardianId={guardianId}
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
      />
    </Sentry.ErrorBoundary>
  );
}

function LuggageIcon() {
  return (
    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_26305_15899)">
        <path
          d="M14.25 3.29932H13.425C13.2509 2.45288 12.7904 1.69233 12.1209 1.14585C11.4515 0.599384 10.6142 0.300407 9.75 0.299316L8.25 0.299316C7.38585 0.300407 6.54849 0.599384 5.87906 1.14585C5.20964 1.69233 4.74907 2.45288 4.575 3.29932H3.75C2.7558 3.30051 1.80267 3.69598 1.09966 4.39898C0.396661 5.10198 0.00119089 6.05512 0 7.04932L0 14.5493C0.00119089 15.5435 0.396661 16.4966 1.09966 17.1997C1.80267 17.9027 2.7558 18.2981 3.75 18.2993H14.25C15.2442 18.2981 16.1973 17.9027 16.9003 17.1997C17.6033 16.4966 17.9988 15.5435 18 14.5493L18 7.04932C17.9988 6.05512 17.6033 5.10198 16.9003 4.39898C16.1973 3.69598 15.2442 3.30051 14.25 3.29932ZM8.25 1.79932H9.75C10.2137 1.80124 10.6655 1.94638 11.0435 2.21488C11.4216 2.48338 11.7074 2.86214 11.862 3.29932H6.138C6.29256 2.86214 6.57842 2.48338 6.95648 2.21488C7.33453 1.94638 7.7863 1.80124 8.25 1.79932ZM3.75 4.79932H14.25C14.8467 4.79932 15.419 5.03637 15.841 5.45833C16.2629 5.88028 16.5 6.45258 16.5 7.04932V9.29932H1.5V7.04932C1.5 6.45258 1.73705 5.88028 2.15901 5.45833C2.58097 5.03637 3.15326 4.79932 3.75 4.79932ZM14.25 16.7993H3.75C3.15326 16.7993 2.58097 16.5623 2.15901 16.1403C1.73705 15.7184 1.5 15.1461 1.5 14.5493V10.7993H8.25V11.5493C8.25 11.7482 8.32902 11.939 8.46967 12.0796C8.61032 12.2203 8.80109 12.2993 9 12.2993C9.19891 12.2993 9.38968 12.2203 9.53033 12.0796C9.67098 11.939 9.75 11.7482 9.75 11.5493V10.7993H16.5V14.5493C16.5 15.1461 16.2629 15.7184 15.841 16.1403C15.419 16.5623 14.8467 16.7993 14.25 16.7993ZM14.25 10.0493C14.1017 10.0493 13.9567 10.0933 13.8333 10.1757C13.71 10.2581 13.6139 10.3753 13.5571 10.5123C13.5003 10.6493 13.4855 10.8001 13.5144 10.9456C13.5434 11.0911 13.6148 11.2248 13.7197 11.3296C13.8246 11.4345 13.9582 11.506 14.1037 11.5349C14.2492 11.5638 14.4 11.549 14.537 11.4922C14.6741 11.4355 14.7912 11.3393 14.8736 11.216C14.956 11.0927 15 10.9477 15 10.7993C15 10.6004 14.921 10.4096 14.7803 10.269C14.6397 10.1283 14.4489 10.0493 14.25 10.0493ZM14.25 13.0493C14.1017 13.0493 13.9567 13.0933 13.8333 13.1757C13.71 13.2581 13.6139 13.3753 13.5571 13.5123C13.5003 13.6493 13.4855 13.8001 13.5144 13.9456C13.5434 14.0911 13.6148 14.2248 13.7197 14.3296C13.8246 14.4345 13.9582 14.506 14.1037 14.5349C14.2492 14.5638 14.4 14.549 14.537 14.4922C14.6741 14.4355 14.7912 14.3393 14.8736 14.216C14.956 14.0927 15 13.9477 15 13.7993C15 13.6004 14.921 13.4096 14.7803 13.269C14.6397 13.1283 14.4489 13.0493 14.25 13.0493ZM14.25 7.04932C14.1017 7.04932 13.9567 7.0933 13.8333 7.17571C13.71 7.25813 13.6139 7.37526 13.5571 7.5123C13.5003 7.64935 13.4855 7.80015 13.5144 7.94563C13.5434 8.09112 13.6148 8.22476 13.7197 8.32965C13.8246 8.43454 13.9582 8.50597 14.1037 8.53491C14.2492 8.56384 14.4 8.54899 14.537 8.49223C14.6741 8.43546 14.7912 8.33933 14.8736 8.21599C14.956 8.09266 15 7.94765 15 7.79932C15 7.6004 14.921 7.40964 14.7803 7.26899C14.6397 7.12833 14.4489 7.04932 14.25 7.04932ZM14.25 13.0493C14.1017 13.0493 13.9567 13.0933 13.8333 13.1757C13.71 13.2581 13.6139 13.3753 13.5571 13.5123C13.5003 13.6493 13.4855 13.8001 13.5144 13.9456C13.5434 14.0911 13.6148 14.2248 13.7197 14.3296C13.8246 14.4345 13.9582 14.506 14.1037 14.5349C14.2492 14.5638 14.4 14.549 14.537 14.4922C14.6741 14.4355 14.7912 14.3393 14.8736 14.216C14.956 14.0927 15 13.9477 15 13.7993C15 13.6004 14.921 13.4096 14.7803 13.269C14.6397 13.1283 14.4489 13.0493 14.25 13.0493ZM14.25 7.04932C14.1017 7.04932 13.9567 7.0933 13.8333 7.17571C13.71 7.25813 13.6139 7.37526 13.5571 7.5123C13.5003 7.64935 13.4855 7.80015 13.5144 7.94563C13.5434 8.09112 13.6148 8.22476 13.7197 8.32965C13.8246 8.43454 13.9582 8.50597 14.1037 8.53491C14.2492 8.56384 14.4 8.54899 14.537 8.49223C14.6741 8.43546 14.7912 8.33933 14.8736 8.21599C14.956 8.09266 15 7.94765 15 7.79932C15 7.6004 14.921 7.40964 14.7803 7.26899C14.6397 7.12833 14.4489 7.04932 14.25 7.04932Z"
          fill="#98A2B3"
        />
      </g>
      <defs>
        <clipPath id="clip0_26305_15899">
          <rect width="18" height="18" fill="white" transform="translate(0 0.299316)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_26305_15909)">
        <path
          d="M5.25 10.7993C5.25 10.9982 5.17098 11.189 5.03033 11.3296C4.88968 11.4703 4.69891 11.5493 4.5 11.5493H3.75C3.55109 11.5493 3.36032 11.4703 3.21967 11.3296C3.07902 11.189 3 10.9982 3 10.7993C3 10.6004 3.07902 10.4096 3.21967 10.269C3.36032 10.1283 3.55109 10.0493 3.75 10.0493H4.5C4.69891 10.0493 4.88968 10.1283 5.03033 10.269C5.17098 10.4096 5.25 10.6004 5.25 10.7993ZM8.25 10.0493H7.5C7.30109 10.0493 7.11032 10.1283 6.96967 10.269C6.82902 10.4096 6.75 10.6004 6.75 10.7993C6.75 10.9982 6.82902 11.189 6.96967 11.3296C7.11032 11.4703 7.30109 11.5493 7.5 11.5493H8.25C8.44891 11.5493 8.63968 11.4703 8.78033 11.3296C8.92098 11.189 9 10.9982 9 10.7993C9 10.6004 8.92098 10.4096 8.78033 10.269C8.63968 10.1283 8.44891 10.0493 8.25 10.0493ZM4.5 13.0493H3.75C3.55109 13.0493 3.36032 13.1283 3.21967 13.269C3.07902 13.4096 3 13.6004 3 13.7993C3 13.9982 3.07902 14.189 3.21967 14.3296C3.36032 14.4703 3.55109 14.5493 3.75 14.5493H4.5C4.69891 14.5493 4.88968 14.4703 5.03033 14.3296C5.17098 14.189 5.25 13.9982 5.25 13.7993C5.25 13.6004 5.17098 13.4096 5.03033 13.269C4.88968 13.1283 4.69891 13.0493 4.5 13.0493ZM8.25 13.0493H7.5C7.30109 13.0493 7.11032 13.1283 6.96967 13.269C6.82902 13.4096 6.75 13.6004 6.75 13.7993C6.75 13.9982 6.82902 14.189 6.96967 14.3296C7.11032 14.4703 7.30109 14.5493 7.5 14.5493H8.25C8.44891 14.5493 8.63968 14.4703 8.78033 14.3296C8.92098 14.189 9 13.9982 9 13.7993C9 13.6004 8.92098 13.4096 8.78033 13.269C8.63968 13.1283 8.44891 13.0493 8.25 13.0493ZM4.5 4.04932H3.75C3.55109 4.04932 3.36032 4.12833 3.21967 4.26899C3.07902 4.40964 3 4.6004 3 4.79932C3 4.99823 3.07902 5.18899 3.21967 5.32965C3.36032 5.4703 3.55109 5.54932 3.75 5.54932H4.5C4.69891 5.54932 4.88968 5.4703 5.03033 5.32965C5.17098 5.18899 5.25 4.99823 5.25 4.79932C5.25 4.6004 5.17098 4.40964 5.03033 4.26899C4.88968 4.12833 4.69891 4.04932 4.5 4.04932ZM8.25 4.04932H7.5C7.30109 4.04932 7.11032 4.12833 6.96967 4.26899C6.82902 4.40964 6.75 4.6004 6.75 4.79932C6.75 4.99823 6.82902 5.18899 6.96967 5.32965C7.11032 5.4703 7.30109 5.54932 7.5 5.54932H8.25C8.44891 5.54932 8.63968 5.4703 8.78033 5.32965C8.92098 5.18899 9 4.99823 9 4.79932C9 4.6004 8.92098 4.40964 8.78033 4.26899C8.63968 4.12833 8.44891 4.04932 8.25 4.04932ZM4.5 7.04932H3.75C3.55109 7.04932 3.36032 7.12833 3.21967 7.26899C3.07902 7.40964 3 7.6004 3 7.79932C3 7.99823 3.07902 8.18899 3.21967 8.32965C3.36032 8.4703 3.55109 8.54932 3.75 8.54932H4.5C4.69891 8.54932 4.88968 8.4703 5.03033 8.32965C5.17098 8.18899 5.25 7.99823 5.25 7.79932C5.25 7.6004 5.17098 7.40964 5.03033 7.26899C4.88968 7.12833 4.69891 7.04932 4.5 7.04932ZM8.25 7.04932H7.5C7.30109 7.04932 7.11032 7.12833 6.96967 7.26899C6.82902 7.40964 6.75 7.6004 6.75 7.79932C6.75 7.99823 6.82902 8.18899 6.96967 8.32965C7.11032 8.4703 7.30109 8.54932 7.5 8.54932H8.25C8.44891 8.54932 8.63968 8.4703 8.78033 8.32965C8.92098 8.18899 9 7.99823 9 7.79932C9 7.6004 8.92098 7.40964 8.78033 7.26899C8.63968 7.12833 8.44891 7.04932 8.25 7.04932ZM18 7.79932V14.5493C17.9988 15.5435 17.6033 16.4966 16.9003 17.1997C16.1973 17.9027 15.2442 18.2981 14.25 18.2993H3.75C2.7558 18.2981 1.80267 17.9027 1.09966 17.1997C0.396661 16.4966 0.00119089 15.5435 0 14.5493L0 4.04932C0.00119089 3.05512 0.396661 2.10198 1.09966 1.39898C1.80267 0.695978 2.7558 0.300507 3.75 0.299316L8.25 0.299316C9.2442 0.300507 10.1973 0.695978 10.9003 1.39898C11.6033 2.10198 11.9988 3.05512 12 4.04932H14.25C15.2442 4.05051 16.1973 4.44598 16.9003 5.14898C17.6033 5.85198 17.9988 6.80512 18 7.79932ZM3.75 16.7993H10.5V4.04932C10.5 3.45258 10.2629 2.88028 9.84099 2.45833C9.41903 2.03637 8.84674 1.79932 8.25 1.79932H3.75C3.15326 1.79932 2.58097 2.03637 2.15901 2.45833C1.73705 2.88028 1.5 3.45258 1.5 4.04932V14.5493C1.5 15.1461 1.73705 15.7184 2.15901 16.1403C2.58097 16.5623 3.15326 16.7993 3.75 16.7993ZM16.5 7.79932C16.5 7.20258 16.2629 6.63028 15.841 6.20833C15.419 5.78637 14.8467 5.54932 14.25 5.54932H12V16.7993H14.25C14.8467 16.7993 15.419 16.5623 15.841 16.1403C16.2629 15.7184 16.5 15.1461 16.5 14.5493V7.79932ZM14.25 10.0493C14.1017 10.0493 13.9567 10.0933 13.8333 10.1757C13.71 10.2581 13.6139 10.3753 13.5571 10.5123C13.5003 10.6493 13.4855 10.8001 13.5144 10.9456C13.5434 11.0911 13.6148 11.2248 13.7197 11.3296C13.8246 11.4345 13.9582 11.506 14.1037 11.5349C14.2492 11.5638 14.4 11.549 14.537 11.4922C14.6741 11.4355 14.7912 11.3393 14.8736 11.216C14.956 11.0927 15 10.9477 15 10.7993C15 10.6004 14.921 10.4096 14.7803 10.269C14.6397 10.1283 14.4489 10.0493 14.25 10.0493ZM14.25 13.0493C14.1017 13.0493 13.9567 13.0933 13.8333 13.1757C13.71 13.2581 13.6139 13.3753 13.5571 13.5123C13.5003 13.6493 13.4855 13.8001 13.5144 13.9456C13.5434 14.0911 13.6148 14.2248 13.7197 14.3296C13.8246 14.4345 13.9582 14.506 14.1037 14.5349C14.2492 14.5638 14.4 14.549 14.537 14.4922C14.6741 14.4355 14.7912 14.3393 14.8736 14.216C14.956 14.0927 15 13.9477 15 13.7993C15 13.6004 14.921 13.4096 14.7803 13.269C14.6397 13.1283 14.4489 13.0493 14.25 13.0493ZM14.25 7.04932C14.1017 7.04932 13.9567 7.0933 13.8333 7.17571C13.71 7.25813 13.6139 7.37526 13.5571 7.5123C13.5003 7.64935 13.4855 7.80015 13.5144 7.94563C13.5434 8.09112 13.6148 8.22476 13.7197 8.32965C13.8246 8.43454 13.9582 8.50597 14.1037 8.53491C14.2492 8.56384 14.4 8.54899 14.537 8.49223C14.6741 8.43546 14.7912 8.33933 14.8736 8.21599C14.956 8.09266 15 7.94765 15 7.79932C15 7.6004 14.921 7.40964 14.7803 7.26899C14.6397 7.12833 14.4489 7.04932 14.25 7.04932ZM14.25 13.0493C14.1017 13.0493 13.9567 13.0933 13.8333 13.1757C13.71 13.2581 13.6139 13.3753 13.5571 13.5123C13.5003 13.6493 13.4855 13.8001 13.5144 13.9456C13.5434 14.0911 13.6148 14.2248 13.7197 14.3296C13.8246 14.4345 13.9582 14.506 14.1037 14.5349C14.2492 14.5638 14.4 14.549 14.537 14.4922C14.6741 14.4355 14.7912 14.3393 14.8736 14.216C14.956 14.0927 15 13.9477 15 13.7993C15 13.6004 14.921 13.4096 14.7803 13.269C14.6397 13.1283 14.4489 13.0493 14.25 13.0493Z"
          fill="#98A2B3"
        />
      </g>
      <defs>
        <clipPath id="clip0_26305_15909">
          <rect width="18" height="18" fill="white" transform="translate(0 0.299316)" />
        </clipPath>
      </defs>
    </svg>
  );
}

GuardianPage.auth = true;

export default GuardianPage;
