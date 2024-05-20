import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/layouts';
import ApiClient from '../../services/ApiClient';
import { useState } from 'react';
import type { GetServerSideProps } from 'next';
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
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Sheet from '/src/components/atoms/Sheet';
import { useSendTrackEvent } from '@cometa/utils';
import { api } from '/src/utils/api';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';

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
  const [isMailSelected, setIsMailSelected] = useState<undefined | boolean>(false);

  const { data: guardianDetail, isLoading } = api.guardian.getDetails.useQuery(
    { id: guardianId, schoolId: selectedSchoolId || '' },
    {
      refetchOnWindowFocus: false,
      enabled: !!guardianId && !!selectedSchoolId,
      onSuccess: (data) => {
        setIsWpSelected(data.send_whatsapps);
        setIsMailSelected(data.send_emails);
      },
    }
  );

  const changeNotification = async (type: string, value: boolean) =>
    await ApiClient.patchGuardianDetail(session?.token, guardianId, { [type]: value });

  const sendWhatsappInviteQuery = async () => await ApiClient.sendWhatsappInvite(session?.token, guardianId, 'onboard');

  const updateGuardianMutation = useMutation({
    mutationFn: (guardianBillingInf: IUpdateData) =>
      ApiClient.patchGuardianDetail(session?.token, guardianBillingInf.id, {
        billing_info: guardianBillingInf.billing_info,
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

  const whatsappInviteMutation = useMutation({
    mutationFn: sendWhatsappInviteQuery,
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
      sendTrackEventWithUserName('dashboard: Guardian | WA Notifications off');
    }
    setIsWpSelected(!isWpSelected);
    wpMutation.mutate();
  };

  const handleMailNotification = () => {
    if (!isMailSelected !== true) {
      setOpenModalMail(true);
      sendTrackEventWithUserName('dashboard: Guardian | Mail Notifications off');
    }
    setIsMailSelected(!isMailSelected);
    mailMutation.mutate();
  };

  const handleEditInformation = () => {
    sendTrackEventWithUserName('dashboard: Guardian | Detail viewed');
    onOpenGuardianEdit();
  };

  const handleClickRFC = () => {
    setOpenRFC(!openRFC);
  };

  const openWhatsappModal = () => {
    setOpenModalInvite(true);
    sendTrackEventWithUserName('dashboard: Guardian | Click Send WA');
  };

  const sendWhatsappInvite = () => {
    sendTrackEventWithName('dashboard: Invitation Sent', session);
    whatsappInviteMutation.mutate();
  };
  const unassignPost = async (student_id: string, guardian_id: string) =>
    ApiClient.unassignTutorsAndStudents(session?.token, student_id, guardian_id);

  const onCloseDetailRFC = () => {
    setErrors({});
    setOpenRFC(false);
  };

  const hasRFC = guardianDetail?.billing_info?.tax_id && guardianDetail?.billing_info?.taxing_system;
  const unassignMutation = useMutation(
    ({ student_id, guardian_id }: { student_id: string; guardian_id: string }) => unassignPost(student_id, guardian_id),
    {
      onSuccess: () => {
        setIdUnassign('');
        utils.guardian.getDetails.invalidate();
        utils.guardian.getDetails.refetch();
        sendTrackEventWithUserName('dashboard: Guardian | Unassign student');
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
    }
  );

  const handleBack = () => {
    router.back();
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
        <div id="header" className="flex items-center justify-between">
          <div className="flex">
            <div
              className="hover:cursor-pointer hover:bg-gray-100 w-[50px] h-[50px] rounded-[50%] flex items-center justify-center shadow-md mr-[18px]"
              onClick={handleBack}
            >
              <IcArrowLeft />
            </div>
            <label className="flex items-center text-[32px] font-bold">Detalles del tutor</label>
          </div>
          {permissions?.can_send_whatsapp && (
            <button
              onClick={openWhatsappModal}
              className="text-white bg-[#3366FF] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap outline-none h-[48px] rounded-lg px-5 py-3"
            >
              Enviar invitación
              <IcWhatsApp />
            </button>
          )}
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
                      disabled={wpMutation.isLoading}
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
                      disabled={mailMutation.isLoading}
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
                      <div className="flex pt-4">
                        <div className="flex items-center mr-7">
                          <IcMail />
                          <label className="ml-[4px] text-[14px]">{guardianDetail?.email}</label>
                        </div>
                        <div className="flex items-center mr-7 min-w-[100px]">
                          <IcPhone />
                          <label className="ml-[9px] text-[14px]">{guardianDetail?.phone}</label>
                        </div>
                        <div className="flex items-center mr-7 min-w-[75px]">
                          <IcCalendar />
                          <label className="ml-2 text-[14px]">
                            {guardianDetail?.birthdate ? formatDateNumeric(guardianDetail?.birthdate) : null}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div id="deuda-total" className="flex flex-col px-8 py-6 mt-4 rounded-lg shadow-card">
                <label className="mb-2 text-sm font-semibold">Deuda por hijos</label>
                <label className="text-2xl font-semibold">
                  {guardianDetail?.due_total ? formatPrice(guardianDetail?.due_total, 'MXN') : '-'}
                </label>
              </div>
            </div>
          </div>
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
                    <p className="text-sm font-normal">Este tutor aún no ha registrado ningún RFC para facturación.</p>
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
          <div className="mb-10">
            <div id="dependents-detail" className="mt-10">
              <div className="flex items-center h-11">
                <p className="text-xl font-bold text-[#212B36]">Estudiantes asignados</p>
              </div>
              <div className="space-y-4">
                {!isLoading &&
                  guardianDetail?.dependents?.map((dependent) => (
                    <AnimatedCard
                      canDelete={!!permissions?.can_deassign_guardian}
                      onHoverCancel={() => 0}
                      href={`/student/detail/${dependent.id}`}
                      cancelTooltipLabel="Desasignar estudiante"
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
                              <p className="mr-8 text-sm font-medium">Nivel: {dependent?.section?.level_name}</p>
                              <p className="mr-8 text-sm font-medium">Grado: {dependent?.section?.grade}</p>
                              <p className="mr-8 text-sm font-medium">Sección: {dependent?.section?.group}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center py-5">
                          <p className="mb-1 text-xs font-semibold">Deuda total</p>
                          <p className="text-xl font-semibold">{formatPrice(dependent?.due_total_price, 'MXN')}</p>
                        </div>
                        <div className="flex items-center justify-center py-5 cursor-pointer">
                          {render_due_orders(dependent?.due_orders, 'morosidad', true)}
                        </div>
                      </>
                    </AnimatedCard>
                  ))}
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
                unassignMutation.mutate({ student_id: idUnassign, guardian_id: guardianDetail?.id });
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
            {`${guardianDetail?.phone || '+52 1 55 2134 3223'}`}
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
              //TODO: Check why we have to cast this type in comparison to line 594 🤔
              guardianDetail={guardianDetail}
              mutation={updateGuardianMutation}
              errorsMutation={errors}
            />
          </Sheet.Content>
        </Sheet>
      )}
    </Sentry.ErrorBoundary>
  );
}

GuardianPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  try {
    if (isMobile) {
      return {
        redirect: {
          permanent: false,
          destination: '/only-desktop',
        },
      };
    }
    return {
      props: {},
    };
  } catch (e: any) {
    Sentry.captureException(e);
    throw new Error(e);
  }
};

export default GuardianPage;
