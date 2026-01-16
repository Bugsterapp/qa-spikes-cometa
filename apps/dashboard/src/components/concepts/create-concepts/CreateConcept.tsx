import { Controller, useForm } from 'react-hook-form';
import Button from '../../organisms/dashboard/Button';
import { z } from 'zod';
import { OfferingType } from '/src/constants/offering';

import { useEffect, useState } from 'react';

import MoneyInput from '/src/components/ui/MoneyInput';
import { parseCurrency } from '@cometa/utils';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { CalendarIcon } from 'lucide-react';
import { differenceInCalendarDays, endOfMonth, format, isDate, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import { Order, Step2Form } from './steps/Step2Form';
import { cn } from '/src/utils/cn';
import { Calendar } from '@cometa/recreo';

import { Step1Form } from './steps/Step1Form';
import { Step3Form } from './steps/Step3Form';
import { Step4Form } from './steps/Step4Form';
import { Step5Form } from './steps/Step5Form';
import Sheet from '/src/components/atoms/Sheet';

import { StepSingleOrder } from './steps/StepSingleOrder';
import { api } from '/src/utils/api';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events, TrackEvents } from '/src/constants/events';
import useAlert from '/src/hooks/useAlert';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import StepAttributesCreate from './Attributes';
import StepOrdersCreation from './OrderPrices';
import Dialog from '../../atoms/Dialog';
import { useRouter } from 'next/router';

export const schema = z
  .object({
    type: z.string().min(1, 'Falta completar este campo'),
    school_cycle: z.string().min(1, 'Falta completar este campo'),
    name: z.string().min(1, 'Falta completar este campo'),
    bank_account: z.string().min(1, 'Falta completar este campo').optional(),
    not_invoicing_bank_account: z.string().min(1, 'Falta completar este campo').optional(),
    entity: z.string().min(1, 'Falta completar este campo'),
    root_concept: z.enum(['optional', 'required']).optional(),
    payment_only_in_dashboard: z.enum(['true', 'false']).optional(),
    recurrent_payment: z.enum(['true', 'false']).optional(),
    has_due_date: z.enum(['true', 'false']).optional(),
    inscription: z.boolean().optional(),
    has_months_to_pay: z.enum(['true', 'false']).optional(),
    same_school_cycle: z.boolean().optional(),
    current_school_cycle_id: z.string().optional(),
    available_in_online_store: z.enum(['true', 'false']).optional(),
  })
  .refine(
    (data) => !(data.payment_only_in_dashboard === 'false' && (!data.bank_account || data.bank_account.length <= 1)),
    { message: 'Falta completar este campo', path: ['bank_account'] }
  );

export const schemaStep2 = z.object({
  months_to_pay: z.array(z.any()).min(1, 'Falta completar este campo'),
  price: z.number().positive('El precio debe ser mayor a 0').min(1, 'Falta completar este campo'),
  payday: z.string().min(1, 'Falta completar este campo'),
  orders: z.array(z.any()).default([]),
  year_start: z.string().min(1, 'Falta completar este campo'),
  setup_periodic_restrictions: z.enum(['true', 'false']),
  concept_start_month: z.number().optional(),
  available_months: z.array(z.any()).optional(),
});

const SurchargeInfo = z
  .object({
    month_offset: z.number().min(1, 'Este campo es requerido'),
    interest_type: z.enum(['PERCENT', 'AMOUNT']),
    compounding: z.enum(['SINGLE', 'DAILY', 'WEEKLY', 'MONTHLY', 'FORTNIGHTLY']),
    interest_value: z
      .string()
      .min(1, 'Este campo es requerido')
      .refine((data) => Number(data) > 0),
  })
  .refine((data) => data.month_offset !== 0, {
    message: 'Month offset must be 0',
    path: ['month_offset'],
  })
  .refine((data) => data.interest_value !== '0', {
    message: 'Interest value must be greater than 0',
  });

export const schemaStep3 = z
  .object({
    has_surcharge: z.string().min(1, 'Este campo es requerido'),
    month_offset: z.number().optional(),
    interest_type: z.enum(['PERCENT', 'AMOUNT']).optional(),
    compounding: z.enum(['SINGLE', 'DAILY', 'WEEKLY', 'MONTHLY', 'FORTNIGHTLY']).optional(),
    interest_value: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data?.has_surcharge === 'true') {
        return SurchargeInfo.parse(data);
      }
      return true;
    },
    {
      message: 'Surcharge fields are required when has_surcharge is true',
      path: [],
    }
  )
  .refine(
    (data) => {
      if (data.interest_type === 'PERCENT') {
        return Number(data.interest_value) <= 100;
      }
      return true;
    },
    {
      message: 'El descuento no puede ser mayor al 100%',
      path: ['interest_value'],
    }
  );

export const schemaStepSingleOrder = z.object({
  due: z.number().min(1, 'Este campo es requerido'),
  price: z.number().min(1, 'Este campo es requerido'),
});

const discountSchema = z
  .object({
    up_to_days: z.string(),
    need_up_to_days: z.boolean(),
    discount_type: z.enum(['PERCENT', 'AMOUNT']),
    discount_value: z.string().min(1, 'Este campo es requerido'),
    name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.need_up_to_days) {
        return data.up_to_days && (Number(data.up_to_days) > 0 || data.up_to_days.length > 0);
      } else {
        data.up_to_days = '';
      }
      return true;
    },
    {
      message: 'Este campo es requerido.',
      path: ['up_to_days'],
    }
  )
  .refine(
    (data) => {
      if (data.discount_type === 'PERCENT') {
        return Number(data.discount_value) <= 100;
      }
      return true;
    },
    {
      message: 'El descuento no puede ser mayor al 100%',
      path: ['discount_value'],
    }
  );

export type FormDiscount = z.infer<typeof discountSchema>;

export const schemaStep4 = discountSchema;

export const schemaStep5 = z
  .object({
    has_sales_tax: z.enum(['true', 'false']).optional(),
    product_key: z.string().min(1, 'Falta completar este campo').optional(),
    unit_type: z.string().min(1, 'Falta completar este campo').optional(),
    has_rvoe: z.enum(['true', 'false']).optional(),
    rvoe: z.string().min(1, 'Falta completar este campo').optional(),
    is_billable: z.enum(['true', 'false']),
    series: z.union([z.string().optional(), z.object({ code: z.string(), id: z.string() }).optional()]),
    series_selector: z.enum(['true', 'false']),
    does_invoice_as_general_public: z.enum(['true', 'false']).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.is_billable === 'false') {
      return true;
    }
    if (!val.product_key) {
      ctx.addIssue({
        path: ['product_key'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!val.unit_type) {
      ctx.addIssue({
        path: ['unit_type'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (val.has_rvoe === 'true' && !val.rvoe) {
      ctx.addIssue({
        path: ['rvoe'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
  });

const schemaStepAttributes = z.object({
  attributes: z.array(z.any()).default([]),
  price: z.number().positive().default(0),
});

export const schemaStepOrders = z.object({
  orders_attributes: z.record(
    z
      .object({
        order_price: z.number(),
        enabled: z.number().min(0),
        attributes: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
          })
        ),
      })
      .refine(
        (data) => {
          if (data.enabled === 0) {
            return data.order_price === 0;
          }
          return !(data.enabled === 1 && data.order_price === 0);
        },
        { message: 'El precio no debe ser 0 si una orden esta activa', path: ['order_price'] }
      )
  ),
});

export type FormValues1 = z.infer<typeof schema>;
export type FormValues2 = z.infer<typeof schemaStep2>;
export type FormValues3 = z.infer<typeof schemaStep3>;
export type FormValues4 = { early_bird_discounts: z.infer<typeof schemaStep4>[] };
export type FormValues5 = z.infer<typeof schemaStep5>;
export type FormValues6 = z.infer<typeof schemaStepAttributes>;
export type FormValues7 = z.infer<typeof schemaStepOrders>;
export type FormValues8 = z.infer<typeof schemaStepSingleOrder>;
export type FormValues = FormValues1 &
  FormValues2 &
  FormValues3 &
  FormValues4 &
  FormValues5 &
  FormValues6 &
  FormValues7 &
  FormValues8;
export type StepProps<T> = {
  setData: (data: T) => void;
  onNext: (data?: T) => void;
  onBack: () => void;
  formData?: Partial<FormValues>;
};

type ChipProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
const Chip: React.FC<ChipProps> = ({ label, value, onChange, disabled }) => (
  <button
    className="bg-white text-green text-xs px-3 py-1.5 border border-green rounded-full hover:bg-green hover:text-white transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-400 cursor:disabled"
    disabled={disabled}
    type="button"
    onClick={() => onChange(value)}
  >
    {label}
  </button>
);
export const MostUsedChips = ({ onChange, disabled }: Pick<ChipProps, 'onChange' | 'disabled'>) => (
  <div className="flex gap-2 items-center w-full">
    <p className="text-xs text-[#637381]">Recomendado</p>
    <div className="flex flex-wrap justify-between w-full">
      <Chip label="Día 5" value="5" onChange={onChange} disabled={disabled} />
      <Chip label="Día 10" value="10" onChange={onChange} disabled={disabled} />
      <Chip label="Día 15" value="15" onChange={onChange} disabled={disabled} />
      <Chip label="Día 28" value="28" onChange={onChange} disabled={disabled} />
      <Chip label="Último día del mes" value="-1" onChange={onChange} disabled={disabled} />
    </div>
  </div>
);

type OrdersToPayProps = {
  editOrder: (id: string, data: any) => void;
  orders: Order[];
  globalPrice: number;
};

export const OrdersToPay: React.FC<OrdersToPayProps> = ({ orders, editOrder, globalPrice }) => (
  <div>
    <div className="overflow-scroll p-4 rounded-lg border-2">
      {orders?.map((order, index) => {
        if (order) {
          return (
            <OrderCard
              order={order}
              key={order.id}
              editByOrderId={editOrder}
              isLast={index === orders.length - 1}
              globalPrice={globalPrice}
            />
          );
        } else {
          return null;
        }
      })}
    </div>
  </div>
);
const OrderCard = ({
  order,
  editByOrderId,
  isLast,
  globalPrice,
}: {
  order: Order;
  editByOrderId: (id: string, data: any) => void;
  isLast: boolean;
  globalPrice: number;
}) => {
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: {
      id: order.id,
      due: order.due,
      price: order.price,
      modified: {
        price: false,
        date: false,
      },
    },
  });

  useEffect(() => {
    if (!order.modified.price) {
      reset((formValues) => ({
        ...formValues,
        price: globalPrice,
      }));
    }
  }, [globalPrice, order.modified.price, reset]);

  const { isDirty } = formState;
  const [isEditing, setIsEditing] = useState(false);
  const onSubmit = (data: any) => {
    const modifications = {
      price: data.price !== order.price,
      date: data.due !== order.due,
    };

    editByOrderId(order.id, {
      ...data,
      modified: {
        ...order.modified,
        ...modifications,
      },
    });
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* remove the border if is last */}
      <div className={cn('py-4 flex flex-col gap-3', !isLast && 'border-b-2')}>
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[#717993] text-xs">Mes a pagar</h3>
            <p className="text-black">{order.monthName}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setIsEditing(!isEditing)} type="button">
              {isEditing ? (
                <span className="text-sm font-bold text-green">Cancelar</span>
              ) : (
                <div className="flex gap-2 items-center">
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.4952 0.449895L12.5502 2.5049C13.1247 3.05222 13.1482 3.96114 12.6027 4.5374L5.85273 11.2874C5.60825 11.5298 5.28782 11.6808 4.94523 11.7149L1.81773 11.9999H1.75023C1.55087 12.001 1.35927 11.9228 1.21773 11.7824C1.0595 11.6248 0.979771 11.4048 1.00023 11.1824L1.32273 8.0549C1.35685 7.7123 1.5078 7.39187 1.75023 7.1474L8.50023 0.397395C9.08209 -0.0941911 9.94002 -0.0716141 10.4952 0.449895ZM7.99023 2.9999L10.0002 5.00989L11.5002 3.5474L9.45273 1.4999L7.99023 2.9999Z"
                      fill="#00AB55"
                    />
                  </svg>
                  <p className="text-sm font-bold text-green">Editar</p>
                </div>
              )}
            </button>
            {isEditing ? (
              <button
                type="submit"
                disabled={!isDirty}
                className={`text-white bg-green rounded-lg text-xs font-bold p-1 px-2 h-7 ${
                  !isDirty ? 'disabled:text-gray-500 disabled:bg-gray-200' : ''
                }`}
              >
                Guardar
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          <div className="flex flex-col w-1/2">
            {isEditing ? (
              <Controller
                control={control}
                name="due"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger type="button" asChild>
                      <Button
                        variant="outline"
                        className={`w-full relative justify-start text-left font-normal rounded-md border-gray-300 mt-2 border h-14 ${
                          !field.value && 'text-muted-foreground'
                        }`}
                      >
                        <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de vencimiento</p>
                        <CalendarIcon className="mr-2 w-4 h-4" />
                        <span className="text-sm">
                          {field.value ? (
                            format(
                              isDate(field.value) ? field.value : parseISO(String(field.value)),
                              'dd / MM / yyyy',
                              {
                                locale: es,
                              }
                            )
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-auto bg-white">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disableNavigation
                        defaultMonth={startOfMonth(new Date(order.due))}
                        toMonth={endOfMonth(new Date(order.due))}
                        showOutsideDays
                        fixedWeeks={false}
                        disabled={(date) => {
                          const month = new Date(order.due).getMonth();
                          return date.getMonth() !== month;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ) : (
              <div>
                <p className="text-[#717993] text-xs">Vencimiento</p>
                <p className="text-sm text-black">
                  {format(order.due, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }).replace(/^\w/, (c) =>
                    c.toUpperCase()
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {isEditing ? (
              <div className="mt-2">
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => <MoneyInput prefix="MXN" min="0" {...field} />}
                />
              </div>
            ) : (
              <div className="flex flex-col justify-end">
                <p className="text-[#717993] text-xs">Precio (Inc. IVA) </p>
                <p className="text-sm text-black">{parseCurrency(order.price)} MXN</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

enum Steps {
  Step1 = 'STEP_1_INFORMATION',
  Step2 = 'STEP_2_MONTHS',
  Step3 = 'STEP_3_INTEREST',
  Step4 = 'STEP_4_DISCOUNT',
  Step5 = 'STEP_5_INVOCE',
  StepAttributesCreate = 'STEP_6_ATTRIBUTES_CREATION',
  StepOrdersCreation = 'STEP_7_ORDERS_CREATION',
  StepSingleOrder = 'STEP_8_SINGLE_ORDER',
}

type ConcepForm = Partial<FormValues>;

export const CreateConcept = ({
  formDataDefault,
  onCloseConceptCreationEdit,
  currentSchoolCycleId,
  openConceptCreationEdit,
}: {
  formDataDefault: ConcepForm;
  onCloseConceptCreationEdit: () => void;
  currentSchoolCycleId: string;
  openConceptCreationEdit: boolean;
  onOpenConceptCreationEdit: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(Steps.Step1);
  const [formData, setFormData] = useState<ConcepForm>(formDataDefault || {});
  const selectedSchool = useSelectedSchool();
  // When duplicating, formDataDefault contains an 'id' property from the original concept
  const originalConceptId = (formDataDefault as ConcepForm & { id?: string })?.id;
  const isDuplicating = Boolean(originalConceptId);
  const [hasRecurringRevenue, setHasRecurringRevenue] = useState(null);
  const [attributeSinglePrice, setAttributeSinglePrice] = useState(0);
  const [isCreatingConcepts, setIsCreatingConcepts] = useState(false);
  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [hasDueDate, setHasDueDate] = useState<string | undefined>('');
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);
  const [hasScrolled, setHasScrolled] = useState(false);
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  useEffect(() => {
    if (openConceptCreationEdit && selectedSchool?.id) {
      utils.series.invoiceSeriesList.prefetch({
        schoolId: selectedSchool?.id as string,
      });
    }
  }, [openConceptCreationEdit, selectedSchool?.id]);
  const utils = api.useUtils();

  const handleData = (data: ConcepForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  function getCommonParsePayload(payload: ConcepForm) {
    const isBillable = payload.is_billable === 'true';
    const notInvoicingBankAccount = payload.not_invoicing_bank_account || payload.bank_account;
    const onlyInDashboard = payload.payment_only_in_dashboard === 'true';
    const isOptional = payload.root_concept === 'optional';
    const isAvailableInOnlineStore = payload.available_in_online_store === 'true';
    const doesInvoiceAsGeneralPublic = payload.does_invoice_as_general_public === 'true';

    let offering = OfferingType.SCHOLAR;
    if (isOptional && isAvailableInOnlineStore) {
      offering = OfferingType.OPEN_LOOP;
    }

    return {
      entity: payload.entity,
      is_billable: isBillable,
      does_invoice_as_general_public: doesInvoiceAsGeneralPublic,
      name: payload.name,
      payment_only_in_dashboard: onlyInDashboard,
      type: payload.type,
      school_cycle: payload.school_cycle,
      series: payload.series && typeof payload.series === 'object' ? payload.series.id : undefined,
      offering: offering,
      ...(!onlyInDashboard
        ? {
            bank_account: payload.bank_account,
            not_invoicing_bank_account: notInvoicingBankAccount,
          }
        : {}),
    };
  }

  function parsePayload(payload: ConcepForm) {
    const price = payload.price;
    const orders = payload.orders?.map((order: Order) => {
      const date = format(order.due, 'yyyy-MM-dd');
      return {
        ...order,
        due: date,
      };
    });
    const months = payload.orders?.map((order: { months_to_pay: number }) => order.months_to_pay).sort((a, b) => a - b);
    const commonPayload = getCommonParsePayload(payload);
    return {
      ...commonPayload,
      subscription: true,
      optional: payload.root_concept === 'optional',
      setup_periodic_restrictions: payload.setup_periodic_restrictions === 'true',
      months_to_pay: months,
      payday: payload.payday ? parseInt(payload.payday) : '',
      price,
      interest_schema:
        payload.has_surcharge === 'true'
          ? [
              {
                compounding: payload.compounding,
                type: payload.interest_type,
                value: payload.interest_value ? parseFloat(payload.interest_value) : '',
                day_offset: payload.month_offset,
                month_offset: 0,
              },
            ]
          : [],
      early_bird_discounts: payload.early_bird_discounts?.map((discount: FormDiscount) => ({
        name: `${payload.name} - ${discount.discount_type}`,
        discount_type: discount.discount_type.toUpperCase(),
        up_to_days: parseInt(discount.up_to_days) || 0,
        discount_value: parseFloat(discount.discount_value),
      })),
      has_sales_tax: payload.has_sales_tax === 'true',
      tax_code: payload.product_key,
      tax_unit: payload.unit_type,
      use_education_complement: payload.has_rvoe === 'true',
      institutional_id: payload.has_rvoe === 'true' ? payload.rvoe : null,
      orders,
    };
  }

  const { setAlertState } = useAlert();

  const createConceptMutation = api.schools.schoolsConceptsCreate.useMutation();
  const createConceptsWithAttributesMutation = api.schools.schoolsConceptsWithAttributesCreate.useMutation();
  const createConceptWithSingleOrder = api.schools.schoolsConceptWithSingleOrderCreate.useMutation();

  const getConceptCreationHandler = (formData: ConcepForm, hasDueDate: string | undefined) => {
    if (hasDueDate === 'false' || formData?.orders_attributes) {
      return handleCreateWithAttributes;
    }

    if (formData?.orders && formData.orders.length > 1) {
      return handleCreate;
    }

    if (formData?.due) {
      return handleCreateSingleOrder;
    }

    return handleCreate;
  };

  const handleCreate = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptMutation.isPending || isCreatingConcepts) return;

    try {
      const currentFormData = { ...formData, ...data };
      const payload = parsePayload(currentFormData);
      try {
        await createConceptMutation.mutate(
          { school_id: selectedSchool?.id as string, data: { ...payload, subscription: true } },
          {
            onSuccess: async (data) => {
              await utils.schools.invalidate();
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
              setAlertState({
                open: true,
                severity: 'success',
                message: 'El concepto ha sido creado satisfactoriamente',
              });
              if (data?.id) {
                router.push(`/concepts/${data?.id}`);
              }
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateSuccess, {
                  original_concept_id: originalConceptId,
                  new_concept_id: data?.id,
                });
              } else {
                sendTrackEventWithUserName(Events.concept_created);
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'error', message: '' });
                setIsCreatingConcepts(false);
              }, 3000);
            },
            onError: (error) => {
              // eslint-disable-next-line no-console
              console.log(error);
              setAlertState({
                open: true,
                severity: 'error',
                message: 'Hemos tenido problemas al crear el concepto, por favor intenta de nuevo.',
              });
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateFailed, {
                  original_concept_id: originalConceptId,
                  error_message: error?.message,
                });
              } else {
                sendTrackEventWithUserName(Events.concept_failed);
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'error', message: '' });
              }, 3000);
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
              setIsCreatingConcepts(false);
            },
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const handleCreateWithAttributes = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptsWithAttributesMutation.isPending || isCreatingConcepts) return;

    try {
      const currentFormData = { ...formData, ...data };
      const payload = parsePayloadWithAttributes(currentFormData);
      try {
        await createConceptsWithAttributesMutation.mutate(
          { school_id: selectedSchool?.id as string, data: { ...payload } },
          {
            onSuccess: async () => {
              await utils.schools.schoolsConceptsList.invalidate();
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
              setAlertState({
                open: true,
                severity: 'success',
                message: 'El concepto ha sido creado satisfactoriamente',
              });
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateSuccess, {
                  original_concept_id: originalConceptId,
                });
              } else {
                sendTrackEventWithUserName(Events.concept_with_attributes_created);
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'success', message: '' });
                setIsCreatingConcepts(false);
              }, 3000);
            },
            onError: (error) => {
              // eslint-disable-next-line no-console
              console.log(error);
              setAlertState({
                open: true,
                severity: 'error',
                message: 'Hemos tenido problemas al crear el concepto, por favor intenta de nuevo.',
              });
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateFailed, {
                  original_concept_id: originalConceptId,
                  error_message: error?.message,
                });
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'error', message: '' });
                setIsCreatingConcepts(false);
              }, 3000);
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
            },
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const parseOrdersAttributes = (orders: {
    [key: string]: {
      order_price: number;
      attributes: {
        name: string;
        type: string;
      }[];
    };
  }) =>
    Object.values(orders).map((order) => ({
      order_price: order.order_price,
      attributes: order.attributes.map((attribute) => ({
        name: attribute.name,
        type: attribute.type,
      })),
    }));

  const parsePayloadWithAttributes = (payload: ConcepForm) => {
    const commonPayload = getCommonParsePayload(payload);
    return {
      root_concept: payload.root_concept,
      subscription: false,
      has_sales_tax: payload.has_sales_tax === 'true',
      optional: payload.root_concept === 'optional' || payload.has_due_date === 'false',
      ...(payload.product_key ? { tax_code: payload.product_key } : {}),
      ...(payload.unit_type ? { tax_unit: payload.unit_type } : {}),
      ...(payload.has_rvoe === 'true'
        ? { institutional_id: payload.rvoe, use_education_complement: true }
        : { use_education_complement: false }),
      price: payload.price || 0,
      orders_attributes: parseOrdersAttributes(payload.orders_attributes || {}),
      setup_periodic_restrictions: payload.setup_periodic_restrictions === 'true',
      ...commonPayload,
    };
  };

  const parsePayloadSingleOrder = (payload: ConcepForm) => {
    const order = {
      price: payload.price,
      due: payload.due ? format(new Date(payload.due), 'yyyy-MM-dd') : '',
    };
    const commonPayload = getCommonParsePayload(payload);
    return {
      months_to_pay: [], // as per your requirement, it's an empty array
      payday: 1,
      price: payload.price,
      interest_schema:
        payload.has_surcharge === 'true'
          ? [
              {
                compounding: payload.compounding,
                type: payload.interest_type,
                value: payload.interest_value ? parseFloat(payload.interest_value) : '',
                day_offset: payload.month_offset,
                month_offset: 0,
              },
            ]
          : [],
      early_bird_discounts: payload.early_bird_discounts?.map((discount: FormDiscount) => ({
        name: `${payload.name} - ${discount.discount_type}`,
        discount_type: discount.discount_type.toUpperCase(),
        up_to_days:
          discount?.up_to_days === ''
            ? 0
            : differenceInCalendarDays(new Date(payload?.due || ''), new Date(discount?.up_to_days || '')),
        discount_value: parseFloat(discount.discount_value),
      })),
      has_sales_tax: payload.has_sales_tax === 'true',
      ...(payload.product_key ? { tax_code: payload.product_key } : {}),
      ...(payload.unit_type ? { tax_unit: payload.unit_type } : {}),
      ...(payload.has_rvoe === 'true'
        ? { institutional_id: payload.rvoe, use_education_complement: true }
        : { use_education_complement: false }),
      tax_code: payload.product_key,
      tax_unit: payload.unit_type,
      institutional_id: payload.has_rvoe === 'true' ? payload.rvoe : undefined,
      orders: [order], // contains only the provided order
      ...commonPayload,
    };
  };

  const handleCreateSingleOrder = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptWithSingleOrder.isPending || isCreatingConcepts) return;

    try {
      const currentFormData = { ...formData, ...data };
      const payload = parsePayloadSingleOrder(currentFormData);
      try {
        await createConceptWithSingleOrder.mutate(
          { school_id: selectedSchool?.id as string, data: { ...payload, subscription: true } },
          {
            onSuccess: async (data) => {
              await utils.schools.schoolsConceptsList.invalidate();
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
              setAlertState({
                open: true,
                severity: 'success',
                message: 'El concepto ha sido creado satisfactoriamente',
              });
              if (data?.id) {
                router.push(`/concepts/${data?.id}`);
              }
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateSuccess, {
                  original_concept_id: originalConceptId,
                  new_concept_id: data?.id,
                });
              } else {
                sendTrackEventWithUserName(Events.concept_single_order_created);
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'success', message: '' });
                setIsCreatingConcepts(false);
              }, 3000);
            },
            onError: (error) => {
              // eslint-disable-next-line no-console
              console.log(error);
              setAlertState({
                open: true,
                severity: 'error',
                message: 'Hemos tenido problemas al crear el concepto, por favor intenta de nuevo.',
              });
              if (isDuplicating) {
                sendTrackEventWithUserName(TrackEvents.concepts.duplicateFailed, {
                  original_concept_id: originalConceptId,
                  error_message: error?.message,
                });
              }
              setTimeout(() => {
                setAlertState({ open: false, severity: 'error', message: '' });
                setIsCreatingConcepts(false);
              }, 3000);
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
            },
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };
  const router = useRouter();
  const handleCancel = () => {
    onCloseConceptCreationEdit();
    if (router.pathname.includes('/concepts/[conceptId]')) return;
    setFormData({});
  };
  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setHasScrolled(scrollTop > 0);
  };

  const handleNext = () => {
    const eventsNames = {
      STEP_1_INFORMATION: Events.concept_creation_step_1_information,
      STEP_2_MONTHS: Events.concept_creation_step_2_months,
      STEP_3_INTEREST: Events.concept_creation_step_3_interest,
      STEP_4_DISCOUNT: Events.concept_creation_step_4_discount,
      STEP_5_INVOCE: Events.concept_creation_step_5_invoce,
      STEP_6_ATTRIBUTES_CREATION: Events.concept_creation_step_6_attributes_creation,
      STEP_7_ORDERS_CREATION: Events.concept_creation_step_7_orders_creation,
      STEP_8_SINGLE_ORDER: Events.concept_creation_step_8_single_order,
    };
    sendTrackEventWithUserName(eventsNames[currentStep]);
    switch (currentStep) {
      case Steps.Step1:
        if (hasDueDate === 'false') {
          setCurrentStep(Steps.StepAttributesCreate);
        } else if (hasDueDate === 'true' && hasRecurringRevenue) {
          setCurrentStep(Steps.Step2);
        } else if (hasDueDate === 'true' && !hasRecurringRevenue) {
          setCurrentStep(Steps.StepSingleOrder);
        } else {
          setCurrentStep(Steps.Step2);
        }
        break;
      case Steps.Step2:
        setCurrentStep(Steps.Step3);
        break;
      case Steps.Step3:
        setCurrentStep(Steps.Step4);
        break;
      case Steps.Step4:
        setCurrentStep(Steps.Step5);
        break;
      case Steps.StepAttributesCreate:
        if (attributeSinglePrice > 0) {
          setCurrentStep(Steps.Step5);
        } else {
          setCurrentStep(Steps.StepOrdersCreation);
        }
        break;
      case Steps.StepOrdersCreation:
        setCurrentStep(Steps.Step5);
        break;
      case Steps.StepSingleOrder:
        setCurrentStep(Steps.Step3);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case Steps.Step1:
        return handleCancel();
      case Steps.Step2:
        setCurrentStep(Steps.Step1);
        break;
      case Steps.Step3:
        if (formData?.due && formData?.price && formData.price > 0) {
          setCurrentStep(Steps.StepSingleOrder);
        } else {
          setCurrentStep(Steps.Step2);
        }
        break;
      case Steps.Step4:
        setCurrentStep(Steps.Step3);
        break;
      case Steps.Step5:
        if (hasDueDate === 'false' && formData?.price === 0) {
          setCurrentStep(Steps.StepOrdersCreation);
        } else if (hasDueDate === 'false' && formData?.price && formData.price > 0) {
          setCurrentStep(Steps.StepAttributesCreate);
        } else {
          setCurrentStep(Steps.Step4);
        }
        break;
      case Steps.StepAttributesCreate:
        setCurrentStep(Steps.Step1);
        break;
      case Steps.StepOrdersCreation:
        setCurrentStep(Steps.StepAttributesCreate);
        break;
      case Steps.StepSingleOrder:
        setCurrentStep(Steps.Step1);
        break;
      default:
        break;
    }
  };
  return (
    <>
      <Dialog.Root open={alertToCloseSheet} position="right" classNames="right-12">
        <Dialog.Title>¿Estás seguro que deseas cancelar la creación del concepto?</Dialog.Title>
        <Dialog.Description>
          Los datos no se guardarán y deberás iniciar el proceso nuevamente en caso que desees continuarlo
        </Dialog.Description>
        <div className="flex gap-x-10 justify-center">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setAlertToCloseSheet(false)}
          >
            Atrás
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setAlertToCloseSheet(false);
              setFormIsDirty(false);
              if (router.pathname.includes('/concepts/[conceptId]')) return;
              setFormData({});
            }}
          >
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>
      <Sheet
        open={openConceptCreationEdit}
        onOpenChange={(open) => {
          if (!open && !formIsDirty && Object.keys(formData).length === 0) {
            onCloseConceptCreationEdit();
          } else {
            setAlertToCloseSheet(true);
          }
        }}
      >
        <Sheet.Content disableAutoFocus>
          <SidebarHeader
            title="Nuevo concepto"
            boxClassName={hasScrolled ? 'shadow-md px-8' : 'px-8'}
            onClose={() => {
              if (!formIsDirty && Object.keys(formData).length === 0) {
                onCloseConceptCreationEdit();
              } else {
                setAlertToCloseSheet(true);
              }
            }}
          />
          <div className="overflow-y-auto px-9" onScroll={handleScroll}>
            {currentStep === Steps.Step1 && (
              <Step1Form
                setData={handleData}
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setAlertToCloseSheet={setAlertToCloseSheet}
                setHasRecurringRevenue={setHasRecurringRevenue}
                setFormIsDirty={setFormIsDirty}
                currentSchoolCycleId={currentSchoolCycleId}
                setHasDueDate={setHasDueDate}
              />
            )}
            {currentStep === Steps.Step2 && (
              <Step2Form setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
            )}
            {currentStep === Steps.Step3 && (
              <Step3Form setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
            )}
            {currentStep === Steps.Step4 && (
              <Step4Form setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
            )}
            {currentStep === Steps.Step5 && (
              <Step5Form
                setData={handleData}
                onNext={getConceptCreationHandler(formData, hasDueDate)}
                onBack={handleBack}
                formData={formData as Partial<FormValues>}
                isSubmitting={createConceptMutation.isPending || isCreatingConcepts}
              />
            )}
            {currentStep === Steps.StepAttributesCreate && (
              <StepAttributesCreate
                setData={handleData}
                onNext={handleNext}
                onBack={handleBack}
                formData={formData}
                setAttributeSinglePrice={setAttributeSinglePrice}
                isSubmitting={createConceptsWithAttributesMutation.isPending || isCreatingConcepts}
              />
            )}
            {currentStep === Steps.StepOrdersCreation && (
              <StepOrdersCreation setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
            )}
            {currentStep === Steps.StepSingleOrder && (
              <StepSingleOrder setData={handleData} onNext={handleNext} onBack={handleBack} formData={formData} />
            )}
          </div>
        </Sheet.Content>
      </Sheet>
    </>
  );
};
