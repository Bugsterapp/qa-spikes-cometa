import * as Sentry from '@sentry/nextjs';
import Layout from '../../../components/layouts';
import ApiClient from '../../../services/ApiClient';
import { useEffect, useState, useMemo, Fragment, useRef } from 'react';
import StudentSelectorCard from '../../../components/organisms/dashboard/StudentSelectorCard';
import OrderTableForManualPay, { usePayStore } from '../../../components/organisms/dashboard/OrderTableForManualPay';
import { useSession } from 'next-auth/react';
import DatePicker from '../../../components/organisms/dashboard/DatePicker';
import IcArrowLeft from '/public/assets/icons/ic_arrow_left.svg';
import { useRouter } from 'next/router';
import { sendTrackEvent } from '../../../utils/events';
import {
  useSetIdToHighlight,
  useSetTypeOfPayment,
} from '../../../components/organisms/dashboard/OrderTableForPayins/SeePaymentStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import CAlert from '/src/components/atoms/CAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { Menu, Transition } from '@headlessui/react';
import CloseIcon from 'dashboard/public/assets/icons/ic_close.svg';
import Select from '/src/components/Select';
import { formatDateShort, formatPrice, payMethods } from '/src/utils/general';
import { ServiceClient, api } from 'src/utils/api';
import Combobox from '/src/components/molecules/dashboard/Combobox';
import useDebounce from '/src/hooks/useDebounce';
import SearchIcon from '/public/assets/icons/ic_search.svg';
import YDivider from 'dashboard/public/assets/icons/ic_divider.svg';
import { cn } from '/src/utils/cn';
import ArrowRight from 'public/assets/images/arrow_right.svg';
import Person from 'public/assets/images/person.svg';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { GetServerSideProps } from 'next';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tooltip } from 'src/components/atoms/Tooltip';
import { NumberFormatBase as NumericFormat } from 'react-number-format';
import Button from '/src/components/organisms/dashboard/Button';
import { Toast, ToastDescription, ToastProvider, ToastViewport } from '/src/components/molecules/dashboard/Toast/Toast';
import SuccessIcon from 'dashboard/public/assets/icons/ic_success.svg';
import { DependentFulfillmentOrder, useSelectionStore } from '@cometa/hooks';
import { DependantErrorRFC, useVerifyGuardians } from '/src/hooks/useVerifyGuardians';
import Sheet from '/src/components/atoms/Sheet';
import RFCDetail, { IUpdateData } from '/src/components/organisms/dashboard/RFCDetail';
import { AxiosError } from 'axios';
import useAlert from '/src/hooks/useAlert';
import Dialog from '/src/components/atoms/Dialog';
import { TRPCError } from '@trpc/server';
import { BillingStudent, DashboardDependentFulfillment, GuardianDependentOrder } from '@cometa/trpc/src/types';
import useToggle from '/src/hooks/useToggle';
import ConceptAssignment from '/src/components/organisms/dashboard/ConceptAssignment';

function isDashboardDependentFulfillment(element: DependentFulfillmentOrder): element is DashboardDependentFulfillment {
  return 'is_billable' in element;
}

const RenderStep = ({ step, title }: { step: number; title: string }) => (
  <div className="mt-12 mb-10 flex items-center gap-5 py-3 border-b-[1px] border-[#919EAB52]">
    <div className="w-[30px] h-[30px] rounded-[50%] bg-[#00AB55] flex justify-center items-center font-semibold text-white ml-2">
      {step}
    </div>
    <h3 className="text-2xl font-bold leading-10">{title}</h3>
  </div>
);

ManualPay.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Pagos Manuales">{page}</Layout>;
};

const schema = z.object({
  selectedStudent: z.string(),
  selectedGuardian: z
    .object({
      id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
      phone: z.string(),
      dependents_count: z.number(),
    })
    .optional(),
  selectedPayMethod: z.string().min(1),
  selectedBankAccount: z.string().min(1),
  payDate: z.string().min(1),
  generateInvoice: z.boolean(),
  totalToPartialPay: z.number(),
  comment: z.string(),
  card_last_digits: z.string().min(4, 'Ingrese los 4 últimos dígitos de la tarjeta').max(4).optional(),
  bank_name: z.string(),
  transaction_reference: z.string(),
  sender_account_number: z.string(),
});

interface PaymentAlertData {
  correlativeId: string;
  amount: number;
  paymentDate: string;
  href: string;
}

interface RenderInvoiceConfigProps {
  students: DependantErrorRFC[];
  generateInvoice: boolean;
  paymentErrors: IPaymentErrors;
  isFetchingVerifyRfc: boolean;
}

function RenderInvoiceConfig({
  students,
  generateInvoice,
  paymentErrors,
  isFetchingVerifyRfc,
}: RenderInvoiceConfigProps) {
  const utils = api.useUtils();
  const [openRFC, setOpenRFC] = useState<boolean>(false);
  const [guardianIdEdit, setGuardianIdEdit] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const selectedSchoolId = useSelectedSchoolId();

  const onCloseDetailRFC = () => {
    setErrors({});
    setOpenRFC(false);
  };

  const { data: guardianDetail, isFetching } = api.guardian.getDetails.useQuery(
    { id: guardianIdEdit || '', schoolId: selectedSchoolId || '' },
    {
      refetchOnWindowFocus: false,
      enabled: !!guardianIdEdit && !!selectedSchoolId,
    }
  );

  const billingGuardianMutation = api.manualPayments.patchRFC.useMutation({
    onSettled: async () => {
      await utils.manualPayments.studentDetails.invalidate();
      await utils.guardian.getGuardianById.invalidate();
      await utils.guardian.verifyGuardians.invalidate();
    },
  });

  const handleBillingGuardian = (studentId: string, billingGuardian: string) => {
    const billingGuardianId = billingGuardian === 'Público en general' ? null : billingGuardian;
    billingGuardianMutation.mutate({
      studentId: studentId,
      billing_guardian: billingGuardianId,
    });
  };

  const updateGuardianMutation = useMutation({
    mutationFn: (guardianBillingInf: IUpdateData) =>
      ApiClient.patchGuardianDetail(session?.token, guardianBillingInf.id, {
        billing_info: guardianBillingInf.billing_info,
      }),
    onSuccess: async () => {
      await utils.guardian.getDetails.invalidate();
      await utils.guardian.getGuardianById.invalidate();
      await utils.guardian.verifyGuardians.invalidate();
      onCloseDetailRFC();
      setAlertState({ open: true, severity: 'success', message: '¡Los datos de RFC se guardaron de manera exitosa!' });
    },
    onError: (error: AxiosError) => {
      Sentry.captureException(error.response);
      setErrors(error.response?.data as Record<string, unknown>);
      onCloseDetailRFC();
    },
  });

  if (students.length > 0 && generateInvoice) {
    return (
      <>
        <span className="text-[#212B36] text-xl font-semibold">Seleccionar facturación</span>
        <div className="flex flex-row gap-4 mb-8">
          {students.map((student) => {
            const hasError = paymentErrors.billing_guardian || student.errorRFC;
            return (
              <div
                key={student.id}
                className="rounded-lg bg-white pt-6 px-6 pb-6 mb-5 mt-4 shadow-cardStrong w-[300px]  relative"
              >
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-sm font-semibold text-gray-600">Estudiante:</span>
                  <span className="text-base font-semibold text-green">
                    {student?.first_name + ' ' + student?.last_name}
                  </span>
                </div>
                <div className="border-b-[1px] border-[#D9D9D9] w-full left-0 right-0 absolute h-2" />

                <Select
                  placeholder="Facturación"
                  labelClassNames={hasError ? 'text-red-500' : ''}
                  className={cn('w-full mt-12 h-[54px]', {
                    'border-red-500': hasError,
                  })}
                  disabled={isFetchingVerifyRfc}
                  value={student?.billing_guardian?.billing_name ? student?.billing_guardian?.id : 'Público en general'}
                  onValueChange={(value) => {
                    handleBillingGuardian(student?.id, value);
                  }}
                >
                  <Select.Content className="flex flex-col overflow-hidden rounded-lg min-w-[230px]">
                    <Select.Item value="Público en general">Público en general</Select.Item>
                    {student.guardians
                      .filter((guardian) => Boolean(guardian.billing_name))
                      .map((guardian) => (
                        <Select.Item value={guardian.id} key={guardian.id}>
                          {guardian.billing_name || 'Público en general'}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select>
                {hasError && (
                  <button
                    type="button"
                    className={cn(
                      'flex justify-center w-full mt-6 border border-green/48 text-green rounded-lg py-1 px-2.5 active:bg-green/8 disabled:border-gray-500 disabled:text-secondary disabled:cursor-not-allowed disabled:active:bg-transparent',
                      student.errorRFC ? 'animate-in' : 'animate-out'
                    )}
                    disabled={isFetchingVerifyRfc}
                    onClick={() => {
                      setGuardianIdEdit(student?.billing_guardian?.id);
                      setOpenRFC(true);
                    }}
                  >
                    Editar RFC
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <Sheet
          open={openRFC && Boolean(guardianDetail) && !isFetching}
          onOpenChange={(open) => {
            if (!open) onCloseDetailRFC();
          }}
        >
          <Sheet.Content>
            <RFCDetail
              onClose={onCloseDetailRFC}
              guardianDetail={guardianDetail}
              mutation={updateGuardianMutation}
              errorsMutation={errors}
            />
          </Sheet.Content>
        </Sheet>
      </>
    );
  }

  if (!generateInvoice) {
    return (
      <span className="flex items-center justify-center mb-4 text-[#212B36] text-sm font-semibold w-full h-14 bg-[#F9FAFB] rounded-lg">
        No se emitirán facturas
      </span>
    );
  }

  return null;
}

type FormValues = z.infer<typeof schema>;
interface IPaymentErrors {
  paymentMethod: boolean;
  bankAccount: boolean;
  billing_guardian: boolean;
}

const todayDate = new Date();
todayDate.setHours(0, 0, 0);

function ManualPay() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const user = session?.user;
  const selectedSchool = useSelectedSchool();
  const schoolInvoice = selectedSchool?.does_invoice;
  const now = useMemo(() => new Date(), []);
  const threeDaysBefore = new Date().setDate(now.getDate() - 3);
  const [isPaymentDone, setIsPaymentDone] = useState(false);
  const isOrinoco = selectedSchool?.name.toLocaleLowerCase().includes('orinoco');
  const invoiceDefault =
    !schoolInvoice || isOrinoco ? false : selectedSchool?.config_dashboard?.['default_manual_pay_invoice'];
  const [minDate, setMinDate] = useState<any>(invoiceDefault ? threeDaysBefore : null);
  const [paymentAlertData, setPaymentAlertData] = useState<PaymentAlertData | null>(null);
  const setId = useSetIdToHighlight();
  const setTypeOfPayment = useSetTypeOfPayment();
  const { selectedItems, clear } = useSelectionStore();
  const [totalToPartialPay, setTotalToPartialPay] = useState(0.0);
  const permissions = useGetPermissions();
  const [hasPartialPaymentSelected, setHasPartialPaymentSelected] = useState(false);
  const [openConceptsBillables, setOpenConceptsBillables] = useState(false);
  const {
    toggle: openConceptAssignment,
    onClose: onCloseConceptAssignment,
    onOpen: onOpenConceptAssignment,
  } = useToggle();
  const [studentSelectedToAddConcept, setStudentSelectedToAddConcept] = useState<BillingStudent | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<IPaymentErrors>({
    paymentMethod: false,
    bankAccount: false,
    billing_guardian: false,
  });
  const canViewConceptPage = permissions?.can_view_concepts_page;

  const utils = api.useUtils();

  const handlePartialPaymentSelected = (value: boolean) => {
    setHasPartialPaymentSelected(value);
  };

  const checkboxEnable = schoolInvoice ? selectedSchool?.config_dashboard?.['enable_manual_pay_invoice'] : false;
  const invoiceTime = selectedSchool?.config_dashboard?.['emit_invoice_time'];
  const concepts_not_billable = selectedItems.filter((item) =>
    isDashboardDependentFulfillment(item) ? !item.is_billable : !item?.concept.is_billable
  );

  const initialFormValues = {
    payDate: todayDate.toISOString(),
    totalToPartialPay: 0.0,
    generateInvoice: invoiceDefault,
  };
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
    resetField,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onSubmit',
    defaultValues: initialFormValues,
  });

  const queryClient = useQueryClient();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const { setAlertState } = useAlert();

  const selectedGuardian = watch('selectedGuardian');
  const selectedStudent = watch('selectedStudent');
  const selectedPayMethod = watch('selectedPayMethod');
  const selectedBankAccount = watch('selectedBankAccount');
  const payDate = watch('payDate');
  const generateInvoice = watch('generateInvoice');
  const card_last_digits = watch('card_last_digits');
  const comment_length = watch('comment')?.length;

  const partialPayDisabled = usePayStore((state) => state.partialPayDisabled);
  const dateToInvoiceEnable = new Date(payDate).setHours(0, 0, 0, 0) >= new Date(threeDaysBefore).setHours(0, 0, 0, 0);

  const { data: bankAccount, isLoading: isLoadingBankAccount } = api.manualPayments.bankAccountList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );

  const mutation = useMutation({
    mutationKey: ['saveManualPay', selectedGuardian],
    mutationFn: async (parcial: boolean) => saveManualPay(parcial),
    onSuccess: async () => {
      sendTrackEventWithUserName('dashboard: ManualPay Create', { source: document.title.split(' | ')[0] });
      resetSelectedValues();
      setIsPaymentDone(true);
      clear();
      await utils.payments.payinsFulfillment.invalidate();
    },
    onError: async (error: any) => {
      const total = totalToPartialPay?.toFixed(2);
      const fulfillments = selectedItems
        .filter((fulfillment) => 'status' in fulfillment)
        .map((fulfillment) => fulfillment.id);

      Sentry.captureException(error, {
        contexts: {
          appState: {
            total,
            fulfillments,
            guardian: selectedGuardian?.id,
            school: selectedSchool?.id,
          },
        },
      });
      if (
        error.cause?.non_field_errors?.some(
          (error: string) => error === 'Invalid stock quantity, must be greater than 0'
        )
      ) {
        const { data: optionalOrders } = await ServiceClient.apiV1DashboardGuardiansOptionalOrdersList(
          selectedGuardian?.id || '',
          {
            school: selectedSchool?.id || '',
          },
          { headers: { Authorization: `Token ${session?.token}` } }
        );
        const orderWitooutStock = selectedItems.find((orderSelected) => {
          const orderForPay = optionalOrders?.results?.find((order) => order.id === orderSelected.id);

          return orderForPay?.stock && orderForPay?.stock?.is_limited && orderForPay?.stock?.quantity === 0;
        });
        setAlertState({
          severity: 'error',
          open: true,
          message: (
            <>
              El concepto <span className="font-semibold">“{orderWitooutStock?.name}“</span> se ha quedado sin stock. Si
              necesitas puedes modificarlo desde el detalle del concepto .
            </>
          ),
          action: canViewConceptPage
            ? {
                text: 'Ir al concepto',
                callback: () => {
                  router.push(`/concepts/${(orderWitooutStock as GuardianDependentOrder)?.concept?.id}`);
                },
              }
            : undefined,
        });
      } else {
        setAlertState({
          severity: 'error',
          open: true,
          message: 'Ocurrió un error inesperado, intenta nuevamente más tarde.',
        });
      }
    },
  });

  const resetSelectedValues = () => {
    reset(initialFormValues);
  };
  const handleBack = () => {
    router.back();
  };

  const getStudentsOnSchool = async (search: string) => {
    const studentsOnSchool = await ApiClient.getStudentsOnSchool(session?.token, selectedSchool?.id || '', search);
    return studentsOnSchool?.data?.results;
  };

  const getPayersOnSchool = async (search: string) => {
    const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(session?.token, selectedSchool?.id || '', search);
    return guardiansOnSchool?.data?.results;
  };
  const [query, setQuery] = useState('');
  const selectOptions = ['Estudiante', 'Pagador'] as const;
  const debouncedQuery = String(useDebounce(query, 300));
  const [searchBy, setSearchBy] = useState('Estudiante');

  const labelDynamicStyles = cn({
    '-top-2.5 bottom-auto transition-all ease-out text-xs ease-[cubic-bezier(4, 1, 8, 3)]': debouncedQuery,
  });

  const { data: ComboboxData, isLoading: isLoadingCombobox } = useQuery(
    ['ComboboxData', debouncedQuery, searchBy],
    async () => {
      if (searchBy === 'Estudiante') {
        return getStudentsOnSchool(debouncedQuery);
      } else {
        return getPayersOnSchool(debouncedQuery);
      }
    }
  );

  const ItemButton = ({ element }: { element: Record<string, string> }) => (
    <div className="flex flex-col items-start gap-1 font-normal">
      <span className="text-base">
        {element.first_name} {element.last_name}
      </span>
      <div className="flex flex-row gap-1 text-xs text-[#637381]">
        <span>
          {element.level} - {element.section}
        </span>
        <YDivider />
        <span>{element.enrollment_code || '-'}</span>
      </div>
    </div>
  );

  const targetScroll = document.getElementById('target-scroll') as HTMLElement;

  const menuData = (element: Record<string, any[]>) => element.guardians || [];

  const saveManualPay = async (parcial: boolean) => {
    // This line below is to eliminate bugs, before send the totalPartialPay, we need to parsed into two decimals
    const newTotal = totalToPartialPay?.toFixed(2);
    try {
      const fulfillments = selectedItems
        .filter((fulfillment) => 'status' in fulfillment)
        .map((fulfillment) => fulfillment.id);
      const optional_orders = selectedItems
        .filter((fulfillment) => !('status' in fulfillment))
        .map((orderForPay) => ({
          student: orderForPay.student.id,
          order: orderForPay.order_id,
        }));

      await ApiClient.saveManualPay(
        session?.token,
        selectedSchool?.id,
        selectedGuardian?.id,
        payDate.split('T')[0],
        selectedPayMethod,
        fulfillments,
        optional_orders,
        selectedBankAccount,
        generateInvoice,
        watch('comment'),
        watch('transaction_reference'),
        watch('sender_account_number'),
        watch('card_last_digits'),
        watch('bank_name'),
        parcial,
        newTotal || totalToPartialPay
      ).then((response: any) => {
        queryClient.invalidateQueries({ queryKey: ['schoolPayins'] });
        setTypeOfPayment('complete');
        if (response?.data) {
          setId(response?.data?.id);
          setPaymentAlertData({
            correlativeId: response?.data?.correlative_id,
            amount: response?.data?.total,
            paymentDate: response?.data?.paid_date,
            href: `/receipt?school_id=${selectedSchool?.id}&payin_id=${response?.data?.id}&payin_tab=complete`,
          });
        }
      });
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Stock is not available',
        cause: (e as any)?.response?.data,
      });
    }
  };

  const onSelectGuardian = (guardian: FormValues['selectedGuardian']) => {
    if (guardian) sendTrackEvent('dashboard: Manual Payment Guardian Selected', {});
    setValue('selectedGuardian', guardian);
    resetField('selectedStudent');
    resetField('selectedPayMethod');
    resetField('selectedBankAccount');
    clear();
  };

  const onSelectStudent = (student: FormValues['selectedStudent']) => {
    sendTrackEvent('dashboard: Manual Payment Student Selected', {});
    setValue('selectedStudent', student);
    clear();
  };

  const handleSeePayment = () => {
    router.push('/income');
  };

  const handleButton = () => {
    let errors = { ...paymentErrors };

    if (!selectedPayMethod) {
      targetScroll.scrollIntoView({ behavior: 'smooth' });
      errors = { ...errors, paymentMethod: true };
    }

    setPaymentErrors(errors);

    if (concepts_not_billable.length > 0 && generateInvoice) {
      setOpenConceptsBillables(true);
    } else {
      handleAcceptConceptsNoBilling();
    }
  };

  const handleAcceptConceptsNoBilling = () => {
    setOpenConceptsBillables(false);
    mutation.mutate(!partialPayDisabled || hasPartialPaymentSelected);
  };

  useSendPageViewedEvent('Registro de Pago', selectedSchool);

  const handlerOpenAssignment = (selectedStudent: BillingStudent) => {
    setStudentSelectedToAddConcept(selectedStudent);
    onOpenConceptAssignment();
    sendTrackEventWithUserName('dashboard: Concept | Clicked assignment');
  };

  useEffect(() => {
    user?.is_staff && !isOrinoco && schoolInvoice
      ? setValue('generateInvoice', true)
      : setValue('generateInvoice', Boolean(invoiceDefault));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceDefault, user, setValue]);

  mutation.isError ? setTimeout(() => mutation.reset(), 5000) : null;
  const paymentAmount = paymentAlertData?.amount === undefined ? 0 : paymentAlertData.amount;

  const { data: guardian } = api.guardian.getGuardianById.useQuery(
    { id: selectedGuardian?.id || '', schoolId: selectedSchool?.id || '' },
    {
      enabled: Boolean(selectedGuardian?.id),
    }
  );
  const { dependentsWithErrors, isFetchingVerifyRfc } = useVerifyGuardians(guardian);

  const haveErrorRfc = dependentsWithErrors.some((dependent) => dependent.errorRFC);

  const disableByErrorRfc = generateInvoice ? isFetchingVerifyRfc || haveErrorRfc : false;

  const disablePayButton = !!selectedPayMethod || !!selectedBankAccount;

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          selectedPayMethod,
          minDate,
          selectedGuardian,
          selectedStudent,
          selectedBankAccount,
          selectedSchool,
        });
      }}
    >
      <div>
        <ToastProvider>
          <ToastViewport>
            <Toast open={isPaymentDone} className="px-6 py-4 bg-white border-none rounded-lg shadow-lg">
              <div>
                <div className="flex items-center justify-between min-w-[280px] relative">
                  <div className="flex items-center gap-4 pt-2">
                    <SuccessIcon fill="#229A16" />
                    <span className="text-lg font-semibold">¡Pago registrado!</span>
                  </div>
                  <CloseIcon fill="#637381" className="cursor-pointer" onClick={() => setIsPaymentDone(false)} />
                </div>
                <span className="absolute top-0 right-0 left-0 bottom-0 mt-16 mr-4 border-b border-[#919EAB52] w-full h-2" />
                <ToastDescription>
                  <div className="flex flex-col items-start justify-center gap-2 pt-6">
                    <div className="flex flex-row items-center justify-center gap-2 pt-4 flex-start">
                      <span className="text-sm text-gray-600">ID de pago:</span>
                      <span className="font-semibold text-green text-md" data-testid="correlativeId">
                        {paymentAlertData?.correlativeId}
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-4 flex-start">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span>Monto:</span>
                        <span className="text-sm font-semibold">
                          {paymentAlertData && isPaymentDone ? formatPrice(paymentAmount) : '-'}
                        </span>
                      </div>
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span>Fecha de pago:</span>
                        <span className="text-sm font-semibold">
                          {paymentAlertData && isPaymentDone ? formatDateShort(paymentAlertData.paymentDate) : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-4 py-2">
                      <Button variant="primary" onClick={handleSeePayment} className="w-full h-[30px]">
                        <span className="text-sm">Ver</span>
                      </Button>
                      <Button variant="ghost" onClick={(e) => e.preventDefault} className="w-full h-[30px]">
                        <a
                          href={paymentAlertData?.href || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green"
                        >
                          Imprimir recibo
                        </a>
                      </Button>
                    </div>
                  </div>
                </ToastDescription>
              </div>
            </Toast>
          </ToastViewport>
        </ToastProvider>
        <div className="flex items-center mb-10">
          <div className="flex">
            <div
              className="hover:cursor-pointer hover:bg-gray-100 w-[50px] h-[50px] rounded-[50%] flex items-center justify-center shadow-md mr-[18px]"
              onClick={handleBack}
            >
              <IcArrowLeft />
            </div>
            <span className="flex items-center text-[32px] font-bold">Registrar pago</span>
          </div>
        </div>
        <RenderStep step={1} title="Identificar al pagador" />
        <form ref={formRef}>
          <Transition
            show={!!selectedGuardian}
            enter="transition opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition opacity duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="flex justify-between p-6 mb-12 ml-2 border rounded-lg align-center w-96 h-22 border-blue-secondary-200">
              <div className="flex flex-col space-y-2 align-center">
                <span className="text-sm font-semibold text-[#212B36]">
                  {selectedGuardian?.first_name} {selectedGuardian?.last_name}
                </span>
                <span className="text-xs text-[#212B36]">{selectedGuardian?.email}</span>
              </div>
              <CloseIcon onClick={() => onSelectGuardian(undefined)} className="cursor-pointer" />
            </div>
          </Transition>
          <Transition
            show={!selectedGuardian}
            enter="transition opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition opacity duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="flex w-[525px] relative mb-8 border border-solid rounded-lg border-primary hover:border-secondary group"
              id="guardian-search"
            >
              <span className="text-xs absolute text-[#919EAB] px-1 bg-white z-10 -top-2.5 left-3 cursor-pointer">
                Buscar por
              </span>
              <Select
                value={searchBy}
                onValueChange={(value) => setSearchBy(value)}
                className="bg-white p-4 border-0 min-w-[150px] focus:outline-none focus:border-0 ring-0"
              >
                <Select.Content className="min-w-[150px]">
                  {selectOptions.map((method, i) => (
                    <Select.Item value={method} key={`${method}-${i}`} className="p-3 mt-1 rounded-lg outline-none">
                      {method}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Combobox.Root
                classNames="relative flex flex-row items-center w-full outline-none rounded-lg border-l-[1px] border-primary border-r-0 rounded-l-none"
                icon={<SearchIcon />}
              >
                <>
                  <Combobox.Label
                    classNames={cn(
                      'block font-medium left-[46px] top-0 text-[#919EAB] bottom-0 m-auto h-fit group-focus-within:bottom-auto absolute text-base cursor-text group-focus-within:-top-2.5 px-1 bg-white group-focus-within:left-[32px] transition-[top,color] group-focus-within:ease-out group-focus-within:text-xs group-focus-within:ease-[cubic-bezier(4, 1, 8, 3)] z-[3]',
                      labelDynamicStyles
                    )}
                  >
                    {searchBy === 'Estudiante' ? (
                      <span>Nombre o nro. de matrícula</span>
                    ) : (
                      <span>Nombre o correo electrónico</span>
                    )}
                  </Combobox.Label>
                  <Combobox.Input
                    classNames="py-4 px-1 border-none text-base placeholder:text-[#919EAB] rounded-r-lg w-full active:outline-none focus:outline-none peer focus:ring-0"
                    placeholder={
                      searchBy === 'Estudiante' ? 'Nombre o nro. de matrícula' : 'Nombre o correo electrónico'
                    }
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Combobox.Options classNames="absolute z-10 flex flex-col w-full px-3 py-4 mt-1 text-base list-none bg-white rounded-md shadow-lg top-full max-h-60 focus:outline-none sm:text-sm">
                    <>
                      {!isLoadingCombobox && ComboboxData ? (
                        <>
                          {ComboboxData?.map((element: any) => (
                            <Combobox.Option key={`${element.id}`} value={element}>
                              {searchBy === 'Estudiante' ? (
                                // Menu for display the guardians of the student
                                <Menu>
                                  {({ open }) => (
                                    <>
                                      <Menu.Button
                                        className={`${
                                          open ? 'bg-[#F4F6F8]' : 'bg-white'
                                        } flex items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 focus:bg-[#919EAB29] disabled:hover:bg-transparent`}
                                        data-testid={`${element.first_name} ${element.last_name}-button`}
                                        disabled={menuData(element).length === 0}
                                      >
                                        <ItemButton element={element} />
                                        {menuData(element).length > 0 && <ArrowRight />}
                                      </Menu.Button>
                                      {/* Items menu, in this case is the list of guardians */}
                                      <Transition
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        as={Fragment}
                                      >
                                        <Menu.Items
                                          as="div"
                                          className="absolute top-0 left-[calc(100%+0.5rem)] w-screen max-w-[365px] shadow-md rounded-lg overflow-hidden cursor-pointer outline-none"
                                        >
                                          <span className="block w-full px-4 py-2 font-semibold bg-gray-200">
                                            Selecciona un pagador
                                          </span>
                                          {/* Items menu, in this case is each guardian */}
                                          <ul className="p-4 space-y-2 bg-white divide-y">
                                            {menuData(element).map((item: any) => (
                                              <Menu.Item
                                                as="li"
                                                key={item}
                                                className="flex items-center justify-between p-2 rounded-lg outline-none hover:bg-gray-200"
                                                onClick={() => onSelectGuardian(item)}
                                              >
                                                <GuardianItem item={item} />
                                              </Menu.Item>
                                            ))}
                                          </ul>
                                        </Menu.Items>
                                      </Transition>
                                    </>
                                  )}
                                </Menu>
                              ) : (
                                <li
                                  className={cn(
                                    'grid grid-cols-[80%_1fr] gap-2 items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]'
                                  )}
                                  onClick={() => onSelectGuardian(element)}
                                >
                                  <div className="flex flex-col items-start font-normal">
                                    <span className="text-base max-w-[220px]">
                                      {element.first_name} {element.last_name}
                                    </span>
                                    <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                      {element.email}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center bg-[#919EAB29] bg-opacity-[16%] max-w-[56px] rounded-full p-2">
                                    <Person />
                                    <span className="mr-1 text-sm">{element.dependents_count}</span>
                                  </div>
                                </li>
                              )}
                            </Combobox.Option>
                          ))}
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 align-center justify-center w-full text-gray-600 h-fit bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]">
                          <Skeleton />
                          <Skeleton />
                        </div>
                      )}
                      {ComboboxData?.length === 0 && (
                        <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                          <span className="text-base">No se encontraron resultados</span>
                        </div>
                      )}
                    </>
                  </Combobox.Options>
                </>
              </Combobox.Root>
            </div>
          </Transition>

          {guardian && (
            <>
              <RenderStep step={2} title="Seleccione las órdenes a pagar" />
              <div className="mt-10 mb-6">
                <h5 className="text-lg font-semibold">Estudiantes: </h5>
              </div>
              <div className="mb-8">
                <StudentSelectorCard
                  students={guardian.dependents}
                  selectedStudent={selectedStudent}
                  setSelectedStudent={onSelectStudent}
                  handlerOpenAssignment={handlerOpenAssignment}
                />
              </div>
              {session?.user?.is_staff && (
                <div className="mb-6">
                  <CAlert
                    type="warning"
                    title="Estás usando una cuenta STAFF "
                    message="Los pagos que registres deben ser pagos que se han efectuado hacia Cometa"
                  />
                </div>
              )}
              <OrderTableForManualPay
                totalToPartialPay={totalToPartialPay}
                setTotalToPartialPay={setTotalToPartialPay}
                selectedStudent={selectedStudent}
                selectedGuardian={guardian}
                handlePartialPaymentSelected={handlePartialPaymentSelected}
              />
              <div className="mb-6" id="target-scroll">
                <RenderStep step={3} title="Detalle de pago y facturación" />
                <Transition
                  as={Fragment}
                  show={mutation.isError && !paymentErrors}
                  enter="transition duration-[400ms]"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <CAlert
                    type="warning"
                    title="¡Ops, parece que algo no anda bien!"
                    message="Si estas intentando registrar un pago parcial, asegúrate de seleccionar solo una orden a la vez."
                  />
                </Transition>
              </div>
              <div className="mb-8">
                <div className="flex gap-4 mb-5">
                  <Controller
                    control={control}
                    name="payDate"
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label="Fecha de pago"
                        selectedDate={value}
                        setSelectedDate={onChange}
                        minDate={minDate}
                        sx={{ width: '10rem', maxHeight: '54px' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="selectedBankAccount"
                    render={({ field: { onChange, value } }) => (
                      <div className="flex flex-col">
                        <Select
                          placeholder="Cuenta de abono"
                          id="select-bank-account"
                          className="w-[300px] h-[54px] outline-none"
                          disabled={isLoadingBankAccount}
                          value={value}
                          onValueChange={onChange}
                        >
                          <Select.Content className="flex flex-col overflow-hidden rounded-lg min-w-[230px]">
                            {bankAccount?.results &&
                              bankAccount.results.map((ba) => (
                                <Select.Item value={ba.id} key={ba.id} className="outline-none">
                                  {ba?.public_summary || `${ba.bank_name} - ${ba.owner}`}
                                </Select.Item>
                              ))}
                          </Select.Content>
                        </Select>
                      </div>
                    )}
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={cn('font-bold text-md', {
                        'text-[#919EAB]': !checkboxEnable || !dateToInvoiceEnable || Boolean(user?.is_staff),
                      })}
                    >
                      Emitir Factura
                    </span>
                    <Controller
                      control={control}
                      name="generateInvoice"
                      render={({ field: { onChange, value } }) => (
                        <Tooltip
                          disableHover={(checkboxEnable && dateToInvoiceEnable) || Boolean(user?.is_staff)}
                          disableClick={false}
                          message={
                            dateToInvoiceEnable
                              ? `El colegio tiene configurado ${
                                  invoiceDefault ? 'siempre' : 'nunca'
                                } emitir facturas. Para modificar esto comunicarse con Cometa.`
                              : 'Si deseas emitir una factura, la fecha de pago debe ser dentro de los últimos 3 días.'
                          }
                        >
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 mt-1 text-[#00AB55] rounded-md disabled:text-[#919EAB] disabled:cursor-not-allowed"
                              checked={value}
                              disabled={!checkboxEnable || !dateToInvoiceEnable || Boolean(user?.is_staff)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                if (!checked) {
                                  setMinDate(null);
                                } else {
                                  setMinDate(threeDaysBefore);
                                }
                                onChange(e.target.checked);
                              }}
                            />
                          </label>
                        </Tooltip>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-9 gap-5 mb-8">
                  <div className="col-span-3 gap-2">
                    <Controller
                      control={control}
                      name="selectedPayMethod"
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <div className="flex flex-col">
                          <Select
                            placeholder="Medio de pago"
                            className={cn('w-[300px] h-[54px] outline-none', {
                              'border-red-500': paymentErrors.paymentMethod && !selectedPayMethod,
                            })}
                            id="payment-method"
                            value={value}
                            onValueChange={(e) => {
                              onChange(e);
                              setValue('bank_name', '');
                              setValue('card_last_digits', '');
                              setValue('sender_account_number', '');
                              setValue('transaction_reference', '');
                            }}
                          >
                            <Select.Content className="flex flex-col overflow-hidden rounded-lg min-w-[230px]">
                              {payMethods.map((method) => (
                                <Select.Item value={method.id} key={method.id} className="outline-none">
                                  {method.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          {paymentErrors.paymentMethod && !selectedPayMethod && (
                            <span className="mt-1 ml-2 text-xs text-red-500">Este campo es requerido</span>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  {selectedPayMethod === 'bank_transfer' && (
                    <div className="flex col-span-6 gap-5">
                      <TextField
                        error={errors.transaction_reference?.message}
                        label="Referencia de transacción"
                        value={watch('transaction_reference')}
                        className="h-[54px] rounded-lg col-span-3 w-full"
                      >
                        <CustomInput {...register('transaction_reference')} type="text" />
                      </TextField>
                      <TextField
                        error={errors.sender_account_number?.message}
                        label="N° de cuenta de procedencia (opcional)"
                        value={watch('sender_account_number')}
                        className="h-[54px] rounded-lg col-span-3 w-full"
                      >
                        <CustomInput {...register('sender_account_number')} type="text" />
                      </TextField>
                    </div>
                  )}
                  {(selectedPayMethod === 'credit_card' || selectedPayMethod === 'debit_card') && (
                    <div className="flex col-span-6 gap-5">
                      <TextField
                        error={
                          errors.card_last_digits?.message && card_last_digits && card_last_digits?.length > 0
                            ? errors.card_last_digits?.message
                            : undefined
                        }
                        label="Número de tarjeta"
                        value={watch('card_last_digits')}
                        className="h-[54px] rounded-lg w-[50%]"
                      >
                        <Controller
                          control={control}
                          name="card_last_digits"
                          render={({ field: { ...props } }) => (
                            <NumericFormat
                              type="tel"
                              placeholder="Últimos 4 dígitos"
                              format={formatLastDigits}
                              {...props}
                              className="w-full text-[#1D2939] focus:ring-0 disabled:text-[#919EAB] placeholder-transparent focus:placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent"
                            />
                          )}
                        />
                      </TextField>
                      <TextField
                        error={errors.transaction_reference?.message}
                        label="Banco (opcional)"
                        value={watch('bank_name')}
                        className="h-[54px] rounded-lg col-span-3 w-full"
                      >
                        <CustomInput {...register('bank_name')} type="text" />
                      </TextField>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-8">
                <TextField
                  label="Comentario"
                  value={watch('comment')}
                  className="h-[100px] p-4 items-center text-base text-[#212B36]"
                >
                  <textarea
                    className="w-full resize-none h-full text-[#1D2939] placeholder-transparent focus:placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent ring-0 focus:ring-0"
                    maxLength={150}
                    {...register('comment')}
                  />
                </TextField>
                <div className="flex justify-end ml-2 text-[#637381] text-xs">{`${comment_length}/150`}</div>
              </div>
              <RenderInvoiceConfig
                generateInvoice={generateInvoice}
                students={dependentsWithErrors}
                paymentErrors={paymentErrors}
                isFetchingVerifyRfc={isFetchingVerifyRfc}
              />
              <Transition
                show={Boolean(generateInvoice && invoiceTime)}
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                enter="transition-opacity duration-75"
                leave="transition-opacity duration-150"
              >
                <CAlert
                  message={`Las facturas para los pagos seleccionados, se emitirán automáticamente cada día a las ${invoiceTime}.`}
                  className="mb-5"
                />
              </Transition>

              <Transition
                show={Boolean(generateInvoice && !invoiceTime)}
                enter="transition-opacity duration-75"
                leave="transition-opacity duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <CAlert
                  message="Las facturas para los pagos seleccionados, se emitirán automáticamente al momento de registrar este pago."
                  className="mb-5"
                />
              </Transition>
            </>
          )}
          {permissions?.can_add_payment && selectedGuardian ? (
            <div className="flex justify-end">
              <Tooltip
                disableHover={disablePayButton && !disableByErrorRfc}
                message={
                  (!disablePayButton && !disableByErrorRfc) || totalToPartialPay === 0
                    ? 'Debes completar todos los campos para poder registrar el pago.'
                    : 'Debes corregir los errores de RFC o seleccionar otro RFC para poder registrar el pago.'
                }
              >
                <button
                  type="button"
                  className={`text-white disabled:cursor-not-allowed text-base font-bold px-10 py-3 rounded-lg ${
                    user?.is_staff ? 'bg-[#1939B7]' : 'bg-[#00AB55]'
                  }  hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap`}
                  disabled={
                    selectedItems.length === 0 || mutation.isLoading || disableByErrorRfc || totalToPartialPay === 0
                  }
                  onClick={handleButton}
                >
                  Registrar Pago
                  {hasPartialPaymentSelected && ' Parcial'}
                </button>
              </Tooltip>
            </div>
          ) : null}
        </form>
      </div>
      <Dialog.Root open={!!openConceptsBillables} position="center" classNames="right-16">
        <Dialog.Title>Haz seleccionado conceptos no facturables</Dialog.Title>
        <Dialog.Description>
          Los siguientes conceptos han sido configurados como no facturables y no se incluirán en las facturas a emitir.
          <br /> <b>¿Quieres continuar?</b>
        </Dialog.Description>
        <div className="flex rounded-lg bg-[#1890FF14] px-6 py-5 mx-4 flex-col items-start">
          <ul className="list-disc list-inside">
            {concepts_not_billable.map((concept) => (
              <li key={concept.id}>{concept.name}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center mt-8 gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenConceptsBillables(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" size="tooltip" onClick={handleAcceptConceptsNoBilling}>
            Continuar
          </Button>
        </div>
      </Dialog.Root>
      <Sheet
        open={openConceptAssignment}
        onOpenChange={(open) => {
          if (!open) onCloseConceptAssignment();
        }}
      >
        <Sheet.Content>
          <ConceptAssignment onClose={onCloseConceptAssignment} studentId={studentSelectedToAddConcept?.id || ''} />
        </Sheet.Content>
      </Sheet>
    </Sentry.ErrorBoundary>
  );
}

const GuardianItem = ({ item }: { item: any }) => (
  <>
    <div className="grid grid-cols-[80%_1fr] gap-2 font-normal">
      <div className="flex flex-col items-start font-normal">
        <span className="text-base max-w-[220px]">
          {item.first_name} {item.last_name}
        </span>
        <span className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
          {item.email}
        </span>
      </div>
    </div>
    <div className="flex justify-between items-center bg-[#919EAB29] bg-opacity-[16%] gap-[11px] rounded-full p-2">
      <Person />
      <span className="mr-2 text-sm">{item.dependents_count}</span>
    </div>
  </>
);

const formatLastDigits = (val: string) => {
  const zip = val.substring(0, 4);
  return `${zip}`;
};

ManualPay.auth = true;

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

export default ManualPay;
