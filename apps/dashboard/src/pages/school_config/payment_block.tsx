import type { GetServerSideProps } from 'next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@cometa/recreo/v2/components/ui/alert-dialog';
import DateRangeForm from '../../components/DateRangeForm';
import CAlert from '../../components/atoms/CAlert';
import IcCheck from 'public/assets/icons/ic_check.svg';
import TrashIcon from 'public/assets/icons/trash.svg';
import DeviceIcon from '/public/assets/payment_block/device.svg';
import CalendarIcon from '/public/assets/payment_block/calendar_outline.svg';
import EmailIcon from '/public/assets/payment_block/ic_email.svg';
import { PageStateHandler } from '../../components/school_config';
import Layout from '../../components/layouts';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import { useSelectedSchool, useGetMembership } from '../../guards/AuthGuard';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import useAlert, { defaultAlertTime } from '../../hooks/useAlert';
import { api } from '../../utils/api';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { TrackEvents } from '../../constants/events';
import Sheet from '../../components/atoms/Sheet';
import {
  HistoryDrawerContent,
  type HistoryDrawerConfig,
  useHistoryDrawer,
  type HistoryDataResponse,
} from '@cometa/recreo';
import SidebarHeader from '../../components/molecules/dashboard/SidebarHeader';
import { format } from 'date-fns';
import { parseISODateLocal, formatDateRangeSpanish } from '../../utils/date-utils';

const BLOCKED_PERIODS_FIELD_MAP: Record<string, string> = {
  start_date: 'Fecha de inicio',
  end_date: 'Fecha de fin',
};

const formatBlockedPeriodsValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'No especificado';
  }

  if (field === 'start_date' || field === 'end_date') {
    try {
      const date = parseISODateLocal(String(value));
      return format(date, 'dd/MM/yyyy');
    } catch {
      return String(value);
    }
  }

  return String(value);
};

interface BlockedPeriod {
  id: string;
  start_date: string;
  end_date: string;
  created_at?: string;
}

const allowedMemberships = new Set(['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR']);

export default function PaymentBlockPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const sendTrackEvent = useSendTrackEventWithUserName();

  const { isEnabled: enablePaymentBlockFlag } = useFlagWithVariableMatching('enable_payment_block_config');

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const isOverlayDialogOpen = showConfirmDialog || showDeleteConfirmDialog || showEmailPreview;

  const reset = useCallback(() => {
    setSelectedDates([]);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
    setShowConfirmDialog(false);
    setShowDeleteConfirmDialog(false);
    setShowEmailPreview(false);
    reset();
  }, [reset]);

  const handleDrawerOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isOverlayDialogOpen) {
        return;
      }
      if (!nextOpen) {
        handleCloseDrawer();
      } else {
        setShowDrawer(true);
      }
    },
    [isOverlayDialogOpen, handleCloseDrawer]
  );

  const historyConfig: HistoryDrawerConfig = useMemo(
    () => ({
      fieldNameMap: BLOCKED_PERIODS_FIELD_MAP,
      formatValue: formatBlockedPeriodsValue,
      collapseThreshold: 2,
      normalFontWeight: true,
      texts: {
        created: 'creado',
        deleted: 'eliminado',
        entityName: 'Bloqueo de pagos de fin de año',
        formatCreatedMessage: (_changedFields, entry) => {
          const startDate = entry?.changed_fields?.start_date?.new;
          const endDate = entry?.changed_fields?.end_date?.new;

          if (startDate && endDate) {
            const formattedStart = format(parseISODateLocal(String(startDate)), 'dd/MM/yy');
            const formattedEnd = format(parseISODateLocal(String(endDate)), 'dd/MM/yy');
            return `Bloqueó pagos del ${formattedStart} al ${formattedEnd}`;
          }
          return 'Eliminó el bloqueo de pagos';
        },
        formatDeletedMessage: () => 'Bloqueo de pagos de fin de año eliminado',
      },
    }),
    []
  );

  const utils = api.useUtils();

  const { data: allowedPeriods } = api.payments.getAvailableBlockPeriods.useQuery();

  const { data: schoolBlockedPeriods } = api.payments.getSchoolBlockedPeriods.useQuery(
    { schoolId: selectedSchool?.id ?? '' },
    { enabled: !!selectedSchool?.id }
  );

  const createBlockedPeriodMutation = api.payments.createBlockedPeriod.useMutation({
    onSuccess: async () => {
      await utils.payments.getSchoolBlockedPeriods.invalidate();
      await utils.bookKeeper.getSchoolHistory.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Bloqueo de pagos programado correctamente',
        alertTime: defaultAlertTime,
      });

      handleCloseDrawer();
    },
    onError: (_error) => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al programar el bloqueo de pagos',
        alertTime: defaultAlertTime,
      });
    },
  });

  const deleteBlockedPeriodMutation = api.payments.deleteBlockedPeriod.useMutation({
    onSuccess: async () => {
      await utils.payments.getSchoolBlockedPeriods.invalidate();
      await utils.bookKeeper.getSchoolHistory.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Bloqueo de pagos finalizado',
        alertTime: defaultAlertTime,
      });
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al finalizar el bloqueo de pagos',
        alertTime: defaultAlertTime,
      });
    },
  });

  const { data: historyData, isFetching: isHistoryFetching } = api.bookKeeper.getSchoolHistory.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
      modelName: 'payins.SchoolBlockedPeriod',
      includeFields: 'start_date,end_date',
      excludeStaff: true,
      historyTypes: 'created,changed,deleted',
      pageSize: 8,
      page: historyPage,
    },
    {
      enabled: !!selectedSchool?.id && showHistoryDrawer,
      staleTime: 30000,
    }
  );

  const accumulatedHistory = useHistoryDrawer({
    historyData: historyData as HistoryDataResponse,
    showHistoryDrawer,
    historyPage,
  });

  useEffect(() => {
    if (!showHistoryDrawer) {
      setHistoryPage(1);
    }
  }, [showHistoryDrawer]);

  const hasMorePages = historyData?.next !== null;

  useSendPageViewedEvent('Bloqueo de pagos', selectedSchool);

  const canViewPage = allowedMemberships.has(membership ?? '') && enablePaymentBlockFlag;

  const activeBlockedPeriod: BlockedPeriod | undefined = schoolBlockedPeriods?.results?.[0];

  const allowedRanges = useMemo(
    () =>
      allowedPeriods?.results?.map((period: { start_date: string; end_date: string }) => ({
        start_date: period.start_date,
        end_date: period.end_date,
      })) || [],
    [allowedPeriods]
  );

  const formattedBlockedPeriodRange = useMemo(() => {
    if (!activeBlockedPeriod) return '';

    const startDate = parseISODateLocal(activeBlockedPeriod.start_date);
    const endDate = parseISODateLocal(activeBlockedPeriod.end_date);

    return formatDateRangeSpanish(
      startDate,
      endDate,
      'Vigente del {startDay} de {startMonth} de {startYear} al {endDay} de {endMonth} de {endYear}'
    );
  }, [activeBlockedPeriod]);

  const formattedAllowedPeriod = useMemo(() => {
    if (!allowedPeriods?.results || allowedPeriods.results.length === 0) return null;

    const lastPeriod = allowedPeriods.results[allowedPeriods.results.length - 1];
    const startDate = parseISODateLocal(lastPeriod.start_date);
    const endDate = parseISODateLocal(lastPeriod.end_date);

    return formatDateRangeSpanish(
      startDate,
      endDate,
      '{startDay} de {startMonth} del {startYear} y el {endDay} de {endMonth} del {endYear}'
    );
  }, [allowedPeriods]);

  const handleConfirmSubmit = () => {
    if (!selectedSchool?.id || selectedDates.length !== 2) return;

    const [start, end] = selectedDates;
    const startDateStr = format(start, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');

    sendTrackEvent(TrackEvents.paymentBlock.createBlockConfirmed);

    createBlockedPeriodMutation.mutate({
      schoolId: selectedSchool.id,
      startDate: startDateStr,
      endDate: endDateStr,
    });

    setShowConfirmDialog(false);
    setSelectedDates([]);
  };

  const handleCreateBlockClick = () => {
    if (selectedDates.length !== 2) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Por favor selecciona las fechas de inicio y fin',
        alertTime: defaultAlertTime,
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleDeleteBlock = () => {
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteBlockConfirm = () => {
    if (!selectedSchool?.id || !activeBlockedPeriod) return;

    sendTrackEvent(TrackEvents.paymentBlock.deleteBlockConfirmed);

    deleteBlockedPeriodMutation.mutate({
      schoolId: selectedSchool.id,
      blockedPeriodId: activeBlockedPeriod.id,
    });

    setShowDeleteConfirmDialog(false);
  };

  return (
    <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="w-full top-0 sticky z-10 bg-white">
          <div className="w-full max-w-[540px] mx-auto pt-[24px] pb-[8px] px-8 sm:px-0">
            <div className="flex items-center justify-between h-[72px] gap-[24px]">
              <h1 className="text-[#212B36] text-2xl font-bold font-lota">Bloqueo pagos de fin de año</h1>
              <Button
                variant="light"
                size="default"
                onClick={() => {
                  sendTrackEvent(TrackEvents.paymentBlock.historyClicked);
                  setShowHistoryDrawer(true);
                }}
              >
                Ver historial
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start px-8 sm:px-0 pt-0 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[540px] mx-auto">
            <div className="flex flex-col items-start gap-10 w-full">
              {!activeBlockedPeriod ? (
                <>
                  <div className="flex flex-col gap-4 w-full">
                    <div>
                      <p className="text-[#637381] text-sm leading-5">
                        Prepara tu plataforma para el cierre fiscal. Pausa temporalmente los cobros y pagos mientras tu
                        equipo está de vacaciones.
                      </p>
                    </div>

                    <CAlert
                      type="info"
                      title="El bloqueo de fin de año NO se activa automáticamente."
                      message="Si no lo configuras, los pagos y cobros seguirán funcionando con normalidad."
                      className="items-start bg-[#E8F4FF]"
                    />

                    <div className="bg-[#F9F9F9] border border-[#E4EBF6] rounded-lg p-6 w-full">
                      <h3 className="text-[#22283a] text-base font-semibold mb-4">¿Cómo funciona el bloqueo?</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                          <DeviceIcon className="w-16 h-16 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm text-[#22283a]">Cobros y pagos pausados</p>
                            <p className="text-sm text-[#637381] mt-1">
                              Durante el bloqueo que puede ir{' '}
                              {formattedAllowedPeriod ? (
                                <strong>desde el {formattedAllowedPeriod}</strong>
                              ) : (
                                <strong>Consulta los periodos disponibles en el calendario.</strong>
                              )}
                              , nadie podrá realizar pagos ni cobros desde el portal o el dashboard.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <CalendarIcon className="w-16 h-16 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm text-[#22283a]">Ajuste de fechas y recargos</p>
                            <p className="text-sm text-[#637381] mt-1">
                              Si hay vencimientos durante el apagado, ajusta las fechas o elimina recargos para evitar
                              que las deudas crezcan.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <EmailIcon className="w-16 h-16 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm text-[#22283a]">Notificación automática por correo</p>
                            <p className="text-sm text-[#637381] mt-1">
                              Cinco días antes del inicio, todos los usuarios recibirán este correo para prepararse.{' '}
                              <a
                                onClick={() => setShowEmailPreview(true)}
                                className="text-primary hover:underline cursor-pointer"
                              >
                                Previsualizar correo
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      <CAlert
                        type="warning"
                        message={
                          <>
                            Programa tu bloqueo con al menos <strong>5 días de anticipación</strong>.
                          </>
                        }
                        className="items-start mt-4"
                      />

                      <Button
                        variant="default"
                        size="lg"
                        onClick={() => {
                          sendTrackEvent(TrackEvents.paymentBlock.createBlockStarted);
                          setShowDrawer(true);
                        }}
                        className="w-full mt-4"
                      >
                        + Programar bloqueo (opcional)
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[#637381] text-sm">
                      Prepara tu plataforma para el cierre fiscal. Pausa temporalmente los cobros y pagos mientras tu
                      equipo está de vacaciones.
                    </p>
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="bg-[#F9F9F9] border border-[#E4EBF6] rounded-lg p-6 w-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#22283a] text-base font-semibold">Bloqueo de fin de año</h3>
                        <span className="bg-[#E8F5E9] text-[#4CAF50] text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          <IcCheck /> Programado
                        </span>
                      </div>
                      <p className="text-sm text-[#637381] mb-4">{formattedBlockedPeriodRange}</p>

                      {allowedMemberships.has(membership ?? '') && (
                        <div className="flex justify-end -mb-2">
                          <button
                            onClick={() => {
                              sendTrackEvent(TrackEvents.paymentBlock.deleteBlockStarted);
                              handleDeleteBlock();
                            }}
                            className="flex items-center gap-2 text-[#FF4842] font-medium text-sm hover:bg-red-50 rounded-lg transition-colors px-3 py-1"
                          >
                            <TrashIcon />
                            Eliminar bloqueo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={showDrawer} onOpenChange={handleDrawerOpenChange}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <SidebarHeader
            title="Programar bloqueo pagos de fin de año"
            onClose={handleCloseDrawer}
            boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
            titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
          />

          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
            <div>
              <p className="text-sm text-[#637381]">
                Selecciona el rango de fechas para el bloqueo.{' '}
                {formattedAllowedPeriod ? (
                  <strong>Solo se permiten fechas entre el {formattedAllowedPeriod}.</strong>
                ) : (
                  <strong>Consulta los periodos disponibles en el calendario.</strong>
                )}{' '}
                Recuerda programar tu bloqueo con al menos <strong>5 días de anticipación</strong>.
              </p>
            </div>

            <DateRangeForm
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              allowedRanges={allowedRanges}
            />

            <CAlert
              type="warning"
              message={
                <>
                  Durante este periodo,{' '}
                  <strong>ningún tutor ni personal del colegio podrá pagar ni cobrar en la plataforma.</strong> Solo un
                  usuario dueño o director podrá finalizar la pausa antes de la fecha programada.
                </>
              }
              className="items-start"
            />

            <CAlert
              type="info"
              message="Si hay vencimientos durante el apagado, ajusta las fechas o elimina recargos para evitar que las deudas crezcan."
              className="items-start bg-[#E8F4FF]"
            />

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="default" onClick={handleCloseDrawer} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={handleCreateBlockClick}
                disabled={selectedDates.length !== 2}
                className="flex-1"
              >
                Programar bloqueo
              </Button>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[60]" />
          <AlertDialogContent className="max-w-[425px] z-[60]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">¿Estás seguro de programar este bloqueo?</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Se pausarán todos los pagos y cobranzas desde el{' '}
                <strong>{selectedDates[0] ? format(selectedDates[0], 'dd/MM/yyyy') : ''}</strong> hasta el{' '}
                <strong>{selectedDates[1] ? format(selectedDates[1], 'dd/MM/yyyy') : ''}</strong>. Esta acción afectará
                a todos los usuarios del colegio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSubmit}>Confirmar</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[60]" />
          <AlertDialogContent className="max-w-[425px] z-[60]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">¿Deseas eliminar el bloqueo de fin de año?</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Esto permitirá que los padres y personal realicen pagos nuevamente. Recuerda que si decides crear un
                nuevo bloqueo este debe ser programado con 5 días de anticipación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBlockConfirm}>Eliminar bloqueo</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      <Sheet open={showHistoryDrawer} onOpenChange={setShowHistoryDrawer}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <SidebarHeader
            title="Historial de cambios"
            onClose={() => setShowHistoryDrawer(false)}
            boxClassName="border-b border-[#d0d8e9] px-8 py-4 rounded-tl-[8px] rounded-tr-[8px] shrink-0"
            titleClassName="text-[#22283a] text-[18px] font-semibold mr-2"
          />
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <HistoryDrawerContent
              data={accumulatedHistory}
              isLoading={isHistoryFetching}
              hasMore={hasMorePages}
              onLoadMore={() => setHistoryPage((prev) => prev + 1)}
              config={historyConfig}
            />
          </div>
        </Sheet.Content>
      </Sheet>

      <AlertDialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <AlertDialogContent className="max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              Importante: Suspensión temporal de pagos en Cometa
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-left space-y-3 text-[#22283a]">
            <p>Hola [Nombre del Tutor] 👋</p>

            <p>
              Para apoyar el cierre fiscal de tu colegio, te informamos que{' '}
              <strong>no podrás realizar pagos en el portal de Cometa ni tampoco físicamente en el Colegio</strong>{' '}
              durante <strong>[fecha inicio]</strong> al <strong>[fecha fin]</strong>.
            </p>

            <p>
              <strong>Podrás seguir utilizando el resto de las funciones del Portal de Cometa con normalidad.</strong>
            </p>

            <p>
              Te recomendamos realizar tus pagos con anticipación, ya que durante ese período no se podrán registrar
              transacciones.
            </p>

            <p>
              Además, del 24 de diciembre al 2 de enero nuestro equipo de soporte operará con capacidad limitada, por lo
              que agradecemos tu paciencia y comprensión mientras atendemos todas las solicitudes.
            </p>

            <p>¡Gracias por acompañarnos este 2025 y por iniciar junto a nosotros un gran 2026! 🙌</p>

            <p>Equipo Cometa</p>
          </AlertDialogDescription>
          <div className="flex justify-end">
            <AlertDialogAction onClick={() => setShowEmailPreview(false)}>Entendido</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageStateHandler>
  );
}

PaymentBlockPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Bloqueo de pagos" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

PaymentBlockPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  if (!isMobile) {
    return { props: {} };
  }

  return {
    redirect: {
      permanent: false,
      destination: '/only-desktop',
    },
  };
};
