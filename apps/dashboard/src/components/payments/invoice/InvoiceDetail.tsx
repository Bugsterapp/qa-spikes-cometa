import {
  type DashboardGuardian,
  type InvoiceStudentGuardian,
  type RelatedInvoice,
  TypeDb9Enum,
  StatusCf3Enum,
} from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Download from '/public/assets/icons/ic_download.svg';
import Information from '/public/assets/icons/information.svg';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';
import PlusIcon from '/public/assets/icons/studentDetail/plus.svg';
import PaperPlane from '/public/assets/icons/paper-plane.svg';
import UserIcon from '/public/assets/icons/ic_user.svg';
import MailIcon from '/public/assets/icons/studentDetail/mail.svg';

import InvoiceChip from '/src/components/atoms/Chip';
import Dialog from '/src/components/atoms/Dialog';
import LinkDetail from '/src/components/atoms/LinkDetail';
import Sheet from '/src/components/atoms/Sheet';
import { Tooltip } from '/src/components/atoms/Tooltip';
import {
  ETypeFile,
  useAddToQueue,
  useSetIsWorking,
  useSetToError,
  useSetToIdle,
} from '/src/components/BackgroundDownload/BackgroundDownload';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { Button } from '/src/components/ui/Button';
import SidePanelDetail from '/src/components/ui/SidepanelDetail';
import { invoiceStatus, invoiceStatusI18N } from '/src/constants/invoice';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import useToggle from '/src/hooks/useToggle';
import ApiClient from '/src/services/ApiClient';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { formatDateShort, formatPrice } from '/src/utils/general';
import { trimId } from '/src/utils/trim-id';

import type { StudentDetailProps } from '../../molecules/dashboard/StudentGeneralInformation/types';
import OrderDetailSidepanel from '../../order/OrderDetailSidepanel';
import GuardianEdit from '../../organisms/dashboard/GuardianEdit';
import RFCDetail, { type IUpdateData } from '../../organisms/dashboard/RFCDetail';
import StudentDetailEdit from '../../organisms/dashboard/StudentDataEdit';
import CreateCreditNoteSidePanel from './CreateCreditNoteSidePanel';
import InvoicingErrors, { RetriableCodes } from './InvoicingErrors';
import ReinvoiceSidePanel from './ReinvoiceSidePanel';
import { Radio } from '@cometa/recreo';

interface InterfaceInvoiceDetailProps {
  onClose: () => void;
  invoiceId: string;
  open?: boolean;
}

const MESSAGE_HAS_INVOICES_PENDING_TO_CANCEL =
  'No puedes realizar acciones sobre esta factura hasta la cancelación de la factura relacionada.';

const MESSAGE_GUARDIANS_NOT_HAVE_EMAIL = 'Los tutores no tienen un correo electrónico registrado.';
const MESSAGE_GUARDIANS_SEND_EMAILS_DEACTIVATE =
  'Los tutores no tienen activo las notificaciones por correos electrónicos.';
const MESSAGE_GUARDIAN_NOT_HAVE_EMAIL = 'El tutor no tiene un correo electrónico registrado.';
const MESSAGE_GUARDIAN_SEND_EMAILS_DEACTIVATE = 'El tutor no tiene activo las notificaciones por correos electrónicos.';

export default function InvoiceDetail({ onClose, invoiceId, open }: Readonly<InterfaceInvoiceDetailProps>) {
  const addToQueue = useAddToQueue();
  const setIsWorking = useSetIsWorking();
  const setIsError = useSetToError();
  const setToIdle = useSetToIdle();

  const selectedSchool = useSelectedSchool();
  const [fulfillmentDetailId, setFulfillmentDetailId] = useState<string | null>(null);
  const [relatedInvoiceDetailId, setRelatedInvoiceDetailId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const permissions = useGetPermissions();
  const router = useRouter();
  const { data: session } = useSession();

  const { data: levelsData } = useLevels(session?.token, selectedSchool?.id);
  const { data: sectionsData } = useSections(session?.token, selectedSchool?.id, true);

  const {
    toggle: openCreateCreditNote,
    onOpen: onOpenCreateCreditNote,
    onClose: onCloseCreateCreditNote,
  } = useToggle();

  const {
    toggle: openReinvoiceSidePanel,
    onOpen: onOpenReinvoiceSidePanel,
    onClose: onCloseReinvoiceSidePanel,
  } = useToggle();

  const {
    toggle: openRelatedInvoiceTo,
    onOpen: onOpenRelatedInvoiceTo,
    onClose: onCloseRelatedInvoiceTo,
  } = useToggle();

  const { data: invoice, isPending: isLoading } = api.payments.retrieveInvoice.useQuery(
    { schoolId: selectedSchool?.id ?? '', invoiceId },
    { enabled: Boolean(selectedSchool?.id) && Boolean(invoiceId) }
  );

  const [selectedGuardian, setSelectedGuardian] = useState<InvoiceStudentGuardian['id'] | undefined>(undefined);

  const mutation = api.payments.zipInvoice.useMutation({
    onMutate() {
      setIsWorking();
    },
    onSuccess(data) {
      if (data?.id) {
        addToQueue(data.id, ETypeFile.ZIP);
      }
    },
    onError(error) {
      setIsError();
      Sentry.captureException(error);
      setTimeout(() => setToIdle(), 3000);
    },
  });

  const alert = useAlert();

  const retryInvoiceMutation = api.invoices.retry.useMutation({
    onSuccess() {
      alert.setAlertState({
        severity: 'success',
        message: '¡La factura se ha reintentado con éxito! Vuelve en unos minutos para verificar su estado.',
        open: true,
      });
      utils.payments.retrieveInvoice.invalidate({ schoolId: selectedSchool?.id ?? '', invoiceId });
    },
    onError() {
      alert.setAlertState({
        severity: 'error',
        message: 'Ocurrió un error al reintentar la factura, por favor contactate con soporte.',
        open: true,
      });
    },
  });
  const cancelInvoiceMessage =
    invoice && invoice.total > 1000
      ? '¡Su factura entró en proceso de cancelación con aceptación!'
      : '¡Su factura entró en proceso de cancelación!';
  const { setAlertState } = useAlert();
  const [openConfirmCancellation, setOpenConfirmCancellation] = useState(false);
  const [openConfirmSendEmail, setOpenConfirmSendEmail] = useState(false);

  const selectedSchoolId = useSelectedSchoolId();
  const key = invoiceId && trimId(invoiceId);
  const statusI18N = invoiceStatusI18N(selectedSchool?.config_dashboard?.emit_invoice_time);

  const studentId = invoice?.fulfillment?.student_id;
  const guardianId = invoice?.billing_guardian?.id;

  const { data: student } = api.students.dashboardSchoolDueOrdersStudentDetail.useQuery(
    { studentId: studentId as string, schoolId: selectedSchool?.id as string },
    {
      enabled: !!selectedSchool?.id && !!studentId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const { data: studentMoreInfoData } = api.manualPayments.studentDetails.useQuery(
    { studentId: studentId as string },
    {
      enabled: !!studentId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const { data: guardianDetail } = api.guardian.getDetails.useQuery(
    { id: guardianId as string, schoolId: selectedSchoolId as string },
    {
      refetchOnWindowFocus: false,
      enabled: !!guardianId && !!selectedSchoolId,
    }
  );

  const closeExtraDrawer = () => {
    router.push({ ...router, query: { ...router.query, error: null } });
  };

  const utils = api.useUtils();

  const editStudentDetailMutation = useMutation({
    mutationFn: (values: StudentDetailProps | { billing_guardian: string | null }) =>
      ApiClient.patchStudentViewMoreInfo(studentId, values),
    onSuccess: () => {
      utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
      utils.manualPayments.studentDetails.invalidate();
    },
    onError(err) {
      Sentry.captureException(`[Invoice Detail]: Error updating student ${err}`, (scope) => {
        scope.setContext('state', {
          student,
          studentMoreInfoData,
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

  const updateGuardianMutation = useMutation({
    mutationFn: (guardianBillingInf: IUpdateData) =>
      ApiClient.patchGuardianDetail(guardianBillingInf.id, {
        billing_info: guardianBillingInf.billing_info,
        school_id: selectedSchool?.id,
      }),
    onSuccess: async () => {
      await utils.guardian.getDetails.invalidate();
      closeExtraDrawer();
    },
    onError: (error: AxiosError) => {
      Sentry.captureException(error.response);
      setErrors(error.response?.data as Record<string, unknown>);
    },
  });

  const handleOpenFulfillment = (fulfillment_id: string | null) => {
    setFulfillmentDetailId(fulfillment_id);
  };

  const handleOpenRelatedInvoice = (invoice_id: RelatedInvoice['id']) => {
    setRelatedInvoiceDetailId(invoice_id);
    onOpenRelatedInvoiceTo();
  };
  const invoiceCancel = api.payments.cancelInvoice.useMutation({
    async onSuccess() {
      setAlertState({
        message: cancelInvoiceMessage,
        severity: 'info',
        open: true,
        hideCross: true,
        alertTime: defaultAlertTime,
      });
    },
    onError() {
      setAlertState({
        message: 'Ocurrió un error al cancelar la factura. Por favor, intente más tarde.',
        severity: 'error',
        open: true,
        action: undefined,
        hideCross: true,
        alertTime: defaultAlertTime,
      });
    },
  });

  const sendInvoiceEmail = api.invoices.sendEmail.useMutation({
    onSuccess() {
      setAlertState({
        message: 'Correo enviado correctamente',
        severity: 'success',
        open: true,
        hideCross: true,
        alertTime: defaultAlertTime,
      });
      setOpenConfirmSendEmail(false);
    },
    onError() {
      setAlertState({
        message: 'Ocurrió un error al enviar el correo',
        severity: 'error',
        open: true,
        hideCross: true,
        alertTime: defaultAlertTime,
      });
      setOpenConfirmSendEmail(false);
    },
  });

  const handleInvoiceCancellation = () => {
    if (selectedSchoolId) {
      onClose();
      setOpenConfirmCancellation(false);
      invoiceCancel.mutate({ schoolId: selectedSchoolId, invoiceId: invoiceId });
    }
  };

  const amountInCreditNotes = invoice?.credit_notes.reduce((total, credit_note) => total + credit_note.total, 0) ?? 0;

  const disabledReinvoiceButton = amountInCreditNotes > 0;

  const canCancelInvoice = permissions?.can_perform_invoicing && invoice?.enabled_actions.cancel;

  const canReinvoice =
    permissions?.can_perform_invoicing &&
    (invoice?.enabled_actions.reinvoice || invoice?.enabled_actions.reinvoice_with_relation);

  const canCreateCreditNote =
    permissions?.can_perform_invoicing && invoice?.type === TypeDb9Enum.Invoice && invoice?.enabled_actions.credit_note;

  const canCancelCreditNote =
    permissions?.can_perform_invoicing &&
    invoice?.type === TypeDb9Enum.CreditNote &&
    invoice?.enabled_actions.cancel_credit_note;

  const isNotSchoolError = !invoice?.status_error?.includes('L');
  const invoicingError = InvoicingErrors[invoice?.status_error as keyof typeof InvoicingErrors];

  const canRetry =
    permissions?.can_perform_invoicing && invoice?.enabled_actions.retry && isNotSchoolError && invoicingError?.action;

  const disabledCreateCreditNoteButton = invoice && invoice.total === amountInCreditNotes;

  const isFailedInvoice = invoice?.status === 'failed';

  const showStudentInfo = router.query.error === 'student-information';
  const showGuardianInvoicing = router.query.error === 'guardian-invoicing';
  const showGuardianInfo = router.query.error === 'guardian-information';

  const fixInvoiceProblem = () => {
    const errorCode = invoice?.status_error || '';

    const studentInformationErrors = ['S001'];
    const studentInvoicingErrors = ['S002'];
    const guardianInvoicingErrors = ['G001', 'G002', 'G003', 'G004', 'G005', 'G006', 'G013'];
    const guardianInformationErrors = ['G007', 'G008', 'G009', 'G010', 'G011', 'G012'];

    if (studentInformationErrors.includes(errorCode) && studentId) {
      router.push({
        ...router,
        query: { ...router.query, error: 'student-information' },
      });
    } else if (studentInvoicingErrors.includes(errorCode) && studentId) {
      router.push(`/students/${studentId}`);
    } else if (guardianInvoicingErrors.includes(errorCode) && guardianId) {
      router.push({
        ...router,
        query: { ...router.query, error: 'guardian-invoicing' },
      });
    } else if (guardianInformationErrors.includes(errorCode) && guardianId) {
      router.push({
        ...router,
        query: { ...router.query, error: 'guardian-information' },
      });
    } else {
      return;
    }
  };

  const isAutoRetriable = RetriableCodes.includes(invoice?.status_error || '');

  const shouldShowActions = canCancelInvoice || canReinvoice || canRetry || canCancelCreditNote;
  const guardiansInvoice = invoice?.guardians;
  const someGuardianHasSendEmail = invoice?.guardians.some((guardian) => guardian.send_emails);
  const someGuardianHasEmail = invoice?.guardians.some((guardian) => guardian.email);

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        id={key}
        key={key}
      >
        <Sheet.Content>
          <div className="flex flex-col flex-auto h-full">
            <div className="sticky top-0 z-10 w-full bg-white">
              <SidebarHeader
                title={`Detalle de ${invoice?.type === 'invoice' ? 'Factura' : 'Nota de crédito'}`}
                subtitle={
                  <>
                    N°de folio: <strong className="text-[#212B36]">{invoice?.client_identifier ?? ''}</strong>
                  </>
                }
                onClose={onClose}
                boxClassName="px-8 py-5"
              />
            </div>
            <div className="flex flex-col justify-between px-8 py-5 gap-y-5">
              {canCreateCreditNote && (
                <Tooltip
                  message={
                    disabledCreateCreditNoteButton
                      ? 'Ya has facturado como nota de crédito el monto total pagado de la factura'
                      : MESSAGE_HAS_INVOICES_PENDING_TO_CANCEL
                  }
                  disableClick={false}
                  disableHover={!(disabledCreateCreditNoteButton || invoice?.has_invoices_pending_to_cancel)}
                  className="self-end"
                >
                  <Button
                    variant="success"
                    className="gap-x-2 py-1 px-2.5"
                    onClick={onOpenCreateCreditNote}
                    disabled={disabledCreateCreditNoteButton || invoice?.has_invoices_pending_to_cancel}
                    id="credit_note_btn"
                  >
                    <PlusIcon className="w-3" />
                    Nota de crédito
                  </Button>
                </Tooltip>
              )}
              {isFailedInvoice ? (
                <div
                  className={cn('bg-[#FFEFEF] rounded-md py-3 px-4 text-[#E65959] flex items-start gap-6', {
                    'bg-[#FFF9E6] text-[#8C6A04] ': isAutoRetriable,
                  })}
                >
                  {isAutoRetriable ? <Warning className="w-7 h-7" /> : <Information className="w-7 h-7" />}{' '}
                  <div className="grid grid-cols-[1fr,auto] w-full items-center">
                    <div className="flex flex-col col-span-1">
                      <span className="text-base font-semibold">
                        {isAutoRetriable ? 'Factura pendiente de emisión' : 'Factura fallida'}
                      </span>
                      <span className="text-sm">
                        {invoicingError?.description ?? 'Ocurrió un error al procesar la factura'}
                      </span>
                    </div>
                    {canRetry && invoicingError?.action ? (
                      <Button
                        variant="rounded"
                        intent="destruction"
                        size="sm"
                        className="text-sm font-bold"
                        onClick={fixInvoiceProblem}
                      >
                        {invoicingError?.action}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div
                className={cn('border rounded-lg border-solid border-opacity-24 border-[#919EAB3D]', {
                  'border-[#FD6262] border-2 border-opacity-100': isFailedInvoice,
                })}
              >
                <div
                  className={cn('flex justify-between px-8 py-5 border-b bg-[#1890FF0A]', {
                    'border-b-[#FD6262] border-b-2': isFailedInvoice,
                  })}
                >
                  <div className="flex items-center">
                    {!isLoading && invoice ? (
                      <>
                        <span className="font-medium text-xs mr-2 text-[#919EAB]">
                          {invoice?.type === 'invoice' ? 'Factura' : 'Nota de crédito'}
                        </span>
                        <InvoiceChip intent={invoiceStatus[invoice.status]}>
                          {statusI18N[invoice.status].status}
                        </InvoiceChip>
                      </>
                    ) : (
                      <SkeletonText className="h-4 w-28" />
                    )}
                    {invoice?.expedition_date ? (
                      <>
                        <span className="text-[#919EAB] ml-2 h-full text-xl font-medium pl-2 border-l border-[#919EAB3D]" />
                        <span className="font-semibold text-sm text-[#919EAB]">
                          {formatDateShort(invoice?.expedition_date, true)}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {invoice?.files?.length ? (
                    <div>
                      <Download
                        fill="currentColor"
                        className="cursor-pointer text-blue-secondary-200"
                        onClick={() =>
                          mutation.mutate({ schoolId: selectedSchool?.id as string, invoiceId: invoice.id })
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <div className="px-8 pt-1 pb-5">
                  <Container className="mt-4">
                    <Title text="Orden:" />
                    <Value text={invoice?.order_name ?? ''} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="items-start mt-4">
                    <Title text="Facturado a:" />
                    {isLoading ? (
                      <SkeletonText loaderWidth={30} />
                    ) : (
                      <span className="col-span-3">
                        <p className="text-sm font-semibold">{invoice?.billing_guardian_name ?? '-'}</p>
                        <p className="text-xs font-normal">{invoice?.tax_id}</p>
                      </span>
                    )}
                  </Container>
                  <Container className="mt-4">
                    <Title text="Folio de factura:" />
                    <Value text={invoice?.fiscal_identifier ?? '-'} loading={isLoading} loaderWidth={30} />
                  </Container>
                  {invoice?.related_invoice ? (
                    <Container className="mt-4">
                      <Title text="Folio relacionado:" />
                      <div className="col-span-3 w-fit">
                        <SidePanelDetail
                          text={invoice.related_invoice.fiscal_identifier}
                          message="Ver detalle de factura"
                          loading={isLoading}
                          setOnClick={() => handleOpenRelatedInvoice(invoice.related_invoice.id)}
                          className="text-sm font-semibold text-[#212B36]"
                        />
                      </div>
                    </Container>
                  ) : null}
                  <Container className="mt-4">
                    <Title text="ID de orden:" />
                    <div className="col-span-3 w-fit">
                      <SidePanelDetail
                        text={invoice?.fulfillment.correlative_id ?? '-'}
                        message="Ver detalle de orden"
                        loading={isLoading}
                        className="text-sm font-semibold text-[#212B36]"
                        setOnClick={() => handleOpenFulfillment(invoice?.fulfillment.id ?? null)}
                      />
                    </div>
                  </Container>
                  <Container className="mt-4">
                    <Title text="Pagador:" />
                    <div className="col-span-3 w-fit">
                      <LinkDetail
                        href={`/guardian/${invoice?.payin.guardian_id}`}
                        text={invoice?.payin.guardian_name ?? ''}
                        message="Ver detalle de pagador"
                        loading={isLoading}
                        className="text-sm font-semibold text-[#212B36]"
                      />
                    </div>
                  </Container>
                  <Container className="mt-4">
                    <Title text="Subtotal:" />
                    <Value text={formatPrice(invoice?.subtotal ?? '0', 'MXN')} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="mt-4">
                    <Title text="IVA:" />
                    <Value text={formatPrice(invoice?.iva ?? '0', 'MXN')} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="mt-4">
                    <Title text="Retención ISR:" />
                    <Value text={formatPrice(invoice?.isr ?? '0', 'MXN')} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="mt-4">
                    <Title text="Total:" />
                    <Value text={formatPrice(invoice?.total ?? '0', 'MXN')} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="mt-4">
                    <Title text="Medio de pago:" />
                    <Value text={invoice?.payment_method ?? ''} loading={isLoading} loaderWidth={30} />
                  </Container>
                  <Container className="mt-4">
                    <Title text="Comentario:" />
                    <Value text={invoice?.observations ?? ''} loading={isLoading} loaderWidth={30} />
                  </Container>
                </div>
                {(session?.user.is_staff || shouldShowActions) && (
                  <div className="border-opacity-24 border-t border-[#919EAB3D] border-solid p-4 flex flex-row justify-between items-center gap-x-4">
                    {invoice?.status === StatusCf3Enum.Success && (
                      <Tooltip
                        message={
                          someGuardianHasSendEmail
                            ? MESSAGE_GUARDIANS_NOT_HAVE_EMAIL
                            : MESSAGE_GUARDIANS_SEND_EMAILS_DEACTIVATE
                        }
                        disableClick={false}
                        disableHover={!!(someGuardianHasEmail && someGuardianHasSendEmail)}
                      >
                        <Button
                          variant="transparency"
                          className="py-1 text-blue-secondary px-2.5 space-x-2"
                          size="sm"
                          disabled={!someGuardianHasEmail || sendInvoiceEmail.isPending || !someGuardianHasSendEmail}
                          id="send_invoice_btn"
                          onClick={() => setOpenConfirmSendEmail(true)}
                        >
                          {!!invoice.files?.length && (
                            <>
                              <PaperPlane className="w-4 h-4" /> <span>Enviar factura</span>
                            </>
                          )}
                        </Button>
                      </Tooltip>
                    )}
                    <div className="flex flex-row items-center gap-x-4">
                      {invoice?.type === TypeDb9Enum.Invoice && canCancelInvoice && (
                        <Tooltip
                          message={MESSAGE_HAS_INVOICES_PENDING_TO_CANCEL}
                          disableClick={false}
                          disableHover={!invoice?.has_invoices_pending_to_cancel}
                        >
                          <Button
                            onClick={() => {
                              setOpenConfirmCancellation(true);
                            }}
                            variant="destroy"
                            className="self-end gap-x-2 w-fit px-2.5 py-1 shadow-none"
                            size="sm"
                            disabled={invoice?.has_invoices_pending_to_cancel}
                            id="cancel_invoice_btn"
                          >
                            Cancelar factura
                          </Button>
                        </Tooltip>
                      )}
                      {invoice?.type === TypeDb9Enum.CreditNote && canCancelCreditNote && (
                        <Tooltip
                          message={MESSAGE_HAS_INVOICES_PENDING_TO_CANCEL}
                          disableClick={false}
                          disableHover={!invoice?.has_invoices_pending_to_cancel}
                        >
                          <Button
                            onClick={() => {
                              invoiceCancel.mutate({ schoolId: selectedSchoolId as string, invoiceId: invoiceId });
                            }}
                            variant="destroy"
                            className="self-end gap-x-2 w-fit px-2.5 py-1 shadow-none"
                            size="sm"
                            disabled={invoice?.has_invoices_pending_to_cancel}
                            id="cancel_invoice_btn"
                          >
                            Cancelar nota de crédito
                          </Button>
                        </Tooltip>
                      )}
                      {invoice?.type === TypeDb9Enum.Invoice && canReinvoice && (
                        <Tooltip
                          message={
                            invoice?.has_invoices_pending_to_cancel
                              ? MESSAGE_HAS_INVOICES_PENDING_TO_CANCEL
                              : 'Debe cancelar las notas de crédito relacionadas a esta factura.'
                          }
                          disableClick={false}
                          disableHover={!(disabledReinvoiceButton || invoice?.has_invoices_pending_to_cancel)}
                        >
                          <Button
                            onClick={onOpenReinvoiceSidePanel}
                            variant="outline"
                            className="text-green border-green w-fit px-2.5 py-1 shadow-none font-bold"
                            size="sm"
                            disabled={disabledReinvoiceButton || invoice?.has_invoices_pending_to_cancel}
                            id="reinvoice_btn"
                          >
                            Refacturar
                          </Button>
                        </Tooltip>
                      )}
                      {((invoice?.type === TypeDb9Enum.Invoice &&
                        session?.user.is_staff &&
                        invoice?.enabled_actions.retry &&
                        permissions?.can_perform_invoicing) ||
                        canRetry) && (
                        <Button
                          onClick={() =>
                            retryInvoiceMutation.mutate({ schoolId: selectedSchoolId as string, invoiceId: invoice.id })
                          }
                          variant="outline"
                          className="text-green border-green w-fit px-2.5 py-1 shadow-none font-bold"
                          size="sm"
                          disabled={retryInvoiceMutation.isPending || invoice?.has_invoices_pending_to_cancel}
                        >
                          Reintentar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
      {invoice && (
        <>
          <CreateCreditNoteSidePanel
            open={openCreateCreditNote}
            onClose={onCloseCreateCreditNote}
            clientIdentifier={invoice?.client_identifier}
            studentId={invoice?.fulfillment.student_id}
            amount={invoice?.total}
            amountInCreditNotes={amountInCreditNotes}
            invoiceId={invoice.id}
          />
          <ReinvoiceSidePanel
            open={openReinvoiceSidePanel}
            onClose={onCloseReinvoiceSidePanel}
            clientIdentifier={invoice.client_identifier}
            studentId={invoice.fulfillment.student_id}
            amount={invoice.total}
            invoiceId={invoice.id}
            enabledActions={invoice.enabled_actions}
          />
        </>
      )}

      {fulfillmentDetailId && (
        <OrderDetailSidepanel
          typeOfOrder="PAYMENT"
          open={Boolean(fulfillmentDetailId)}
          onClose={() => setFulfillmentDetailId(null)}
          fulfillmentId={fulfillmentDetailId || ''}
        />
      )}
      {relatedInvoiceDetailId ? (
        <InvoiceDetail
          onClose={onCloseRelatedInvoiceTo}
          invoiceId={relatedInvoiceDetailId}
          open={openRelatedInvoiceTo}
        />
      ) : null}
      {/* Confirm Cancellation */}
      <Dialog.Root
        open={openConfirmCancellation}
        position="right"
        centerWhenSidepanelIsOpen
        onOpenChange={() => {
          setOpenConfirmCancellation(false);
        }}
      >
        <Dialog.Title>¿Estás seguro que deseas cancelar la factura?</Dialog.Title>
        <div className="border bg-[#FBFCFD] border-[#E4EBF6] rounded-lg py-3 px-4 w-full mb-6">
          <h3 className="font-bold text-[#1C1C1D] text-sm">Importante</h3>
          <p className="text-sm text-[#637381]">
            Recuerda que si cancelas la factura actual <strong>no podrás emitir una Nota de crédito</strong> asociada a
            esta factura
          </p>
        </div>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close
            className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
            data-testid="cancel-button"
          >
            Atrás
          </Dialog.Close>

          <button
            className="text-white font-bold py-2 px-8 rounded-lg text-sm hover:opacity-90 whitespace-nowrap bg-[#FF4842] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            onClick={() => {
              handleInvoiceCancellation();
            }}
          >
            Si, cancelar
          </button>
        </div>
      </Dialog.Root>
      {/* Confirm Send Email */}
      <Dialog.Root
        open={openConfirmSendEmail}
        position="right"
        classNames="rounded-[10px] pt-6 pb-3 px-8 space-y-2"
        centerWhenSidepanelIsOpen
        onOpenChange={() => {
          setSelectedGuardian(undefined);
          setOpenConfirmSendEmail(false);
        }}
      >
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center py-3">
            <div className="flex items-center justify-center bg-[#EBF0FF] rounded-full w-14 h-14 ">
              <PaperPlane className="w-[22.4px] h-[22.4px] text-blue-secondary" />
            </div>
          </div>
          <Dialog.Title className="my-1 font-bold text-xl/6 font-lota text-[#454D64] text-center">
            Enviar factura
          </Dialog.Title>
          {!!guardiansInvoice?.length && (
            <div className="space-y-2">
              <div className="py-2">
                <span className="text-gray-600 text-sm/5 font-lota">
                  {guardiansInvoice.length > 1
                    ? 'Seleccione a que correo se enviará la factura.'
                    : 'Se enviará la factura al siguiente tutor:'}
                </span>
              </div>
              {guardiansInvoice.length > 1 ? (
                <Radio.Group
                  name="action"
                  className="flex flex-col gap-4"
                  value={selectedGuardian}
                  onValueChange={(value) => {
                    setSelectedGuardian(value);
                  }}
                >
                  {guardiansInvoice.map((guardian) => {
                    const isPayer = guardian.id === invoice?.payin.guardian_id;
                    return (
                      <div
                        key={guardian.id}
                        className={cn(
                          'grid grid-cols-[auto_1fr] w-[348px] justify-center items-center border bg-[#FBFCFD] border-[#E4EBF6] rounded-[10px] py-3 px-4 text-[#454D64] text-sm/4 font-lota',
                          {
                            relative: isPayer,
                          }
                        )}
                      >
                        {isPayer && (
                          <InvoiceChip
                            intent="info"
                            className="absolute right-4 -top-3 bg-[#EFEDFF] text-[10px] text-[#6C61E0]"
                          >
                            PAGADOR
                          </InvoiceChip>
                        )}
                        <Tooltip
                          message={
                            guardian.send_emails
                              ? MESSAGE_GUARDIAN_NOT_HAVE_EMAIL
                              : MESSAGE_GUARDIAN_SEND_EMAILS_DEACTIVATE
                          }
                          disableClick={false}
                          disableHover={!!(guardian.email && guardian.send_emails)}
                        >
                          <Radio.Item
                            id={guardian.id}
                            value={guardian.id}
                            className="self-center cursor-pointer justify-self-center mr-3"
                            disabled={!guardian.send_emails || !guardian.email}
                          />
                        </Tooltip>
                        <div className="flex flex-col gap-3">
                          <h3 className="flex flex-row items-center gap-2">
                            <UserIcon />
                            <span className="font-semibold text-sm break-words">{guardian.full_name}</span>
                          </h3>
                          <h3 className="flex flex-row items-center gap-2">
                            <MailIcon className="w-[18px] h-[18px]" />
                            <span className="break-all">{guardian.email}</span>
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </Radio.Group>
              ) : (
                <div className="flex flex-col w-[348px] justify-center items-center border bg-[#FBFCFD] border-[#E4EBF6] rounded-[10px] py-3 px-4 text-[#454D64] text-sm/4 font-lota">
                  <div className="flex flex-col gap-3">
                    <h3 className="flex flex-row items-center gap-2">
                      <UserIcon />
                      <span className="font-semibold">{guardiansInvoice[0].full_name}</span>
                    </h3>
                    <h3 className="flex flex-row items-center gap-2">
                      <MailIcon className="w-[18px] h-[18px]" />
                      <span className="break-all">{guardiansInvoice[0].email}</span>
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-center px-8 py-4 gap-x-10">
          <Dialog.Close
            className="px-8 py-2 text-sm font-bold bg-transparent text-green hover:opacity-90 whitespace-nowrap"
            data-testid="cancel-button"
          >
            Atrás
          </Dialog.Close>

          <button
            className="px-5 text-sm font-bold text-white rounded-full py-2.5 hover:opacity-90 whitespace-nowrap bg-green disabled:cursor-not-allowed disabled:opacity-50 max-w-[188px] w-full"
            type="submit"
            onClick={() => {
              sendInvoiceEmail.mutate({
                invoiceId: invoiceId,
                schoolId: selectedSchoolId as string,
                guardianId: (selectedGuardian || guardiansInvoice?.[0].id) as string,
              });
            }}
            disabled={
              sendInvoiceEmail.isPending ||
              !guardiansInvoice?.length ||
              (guardiansInvoice?.length > 1 && !selectedGuardian)
            }
          >
            Enviar
          </button>
        </div>
      </Dialog.Root>
      <Sheet
        open={showStudentInfo}
        onOpenChange={(open) => {
          if (!open) closeExtraDrawer();
        }}
      >
        <Sheet.Content>
          <StudentDetailEdit
            student={studentMoreInfoData}
            onClose={closeExtraDrawer}
            levels={levelsData ?? []}
            sections={sectionsData ?? []}
            studentSection={student?.section}
            mutation={editStudentDetailMutation}
          />
        </Sheet.Content>
      </Sheet>
      <Sheet
        open={Boolean(showGuardianInfo && guardianDetail)}
        onOpenChange={(open) => {
          if (!open) closeExtraDrawer();
        }}
      >
        <Sheet.Content>
          <GuardianEdit guardian={guardianDetail as DashboardGuardian} onClose={closeExtraDrawer} />
        </Sheet.Content>
      </Sheet>
      <Sheet
        open={showGuardianInvoicing}
        onOpenChange={(open) => {
          if (!open) closeExtraDrawer();
        }}
      >
        <Sheet.Content>
          <RFCDetail
            onClose={closeExtraDrawer}
            guardianDetail={guardianDetail}
            onSubmit={(values) =>
              updateGuardianMutation.mutate({ billing_info: { ...values }, id: guardianDetail?.id ?? '' })
            }
            isLoading={updateGuardianMutation.isPending}
            errorsMutation={errors}
          />
        </Sheet.Content>
      </Sheet>
    </>
  );
}

export const Container = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid grid-cols-4 gap-x-4', className)} {...props}>
    {children}
  </div>
);

export const Title = ({ text }: { text: string }) => (
  <span className="flex items-center text-xs font-semibold text-[#637381] min-w-[113.5px]">{text}</span>
);

interface ValueProps {
  text: string;
  loading?: boolean;
  loaderWidth?: number;
  className?: string;
}

export const Value = ({ text, loading, loaderWidth, className }: ValueProps) => (
  <>
    {loading ? (
      <SkeletonText loaderWidth={loaderWidth} />
    ) : (
      <span
        className={cn('col-span-3 text-sm font-semibold w-fit text-[#212B36] break-all', className, {
          'border-blue-secondary border p-2 rounded hover:bg-info/8 flex items-center gap-1 group': false,
        })}
      >
        {text}
      </span>
    )}
  </>
);

export const SkeletonText = ({
  loaderWidth,
  className,
}: {
  loaderWidth?: ValueProps['loaderWidth'];
  className?: string;
}) => (
  <div className="max-w-sm animate-pulse">
    <div
      className={cn(
        'h-2.5 bg-gray-200 rounded-full dark:bg-gray-400 w-48',
        { 'w-[var(--loader-width)]': loaderWidth },
        className
      )}
      style={{ '--loader-width': `${loaderWidth}px` } as React.CSSProperties}
    />
  </div>
);
