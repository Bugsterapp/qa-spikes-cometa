import Sheet from '../../components/atoms/Sheet';
import Layout from '../../components/layouts';
import SidebarHeader from '../../components/molecules/dashboard/SidebarHeader';
import Button from '../../components/organisms/dashboard/Button';
import useToggle from '../../hooks/useToggle';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import { useMemo, useRef, useState } from 'react';
import { api } from '../../utils/api';
import { useSelectedSchool } from '../../guards/AuthGuard';
import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { createColumnHelper } from '@tanstack/react-table';
import { BaseConcept } from '@cometa/trpc/src/types';
import { renderMoney } from '/src/utils/datagridHeaders';
import Header from '/src/components/molecules/dashboard/Header';
import { FormDiscount, FormValues } from '/src/components/organisms/dashboard/CreationConcepts';
import { Step5Form } from '/src/components/organisms/dashboard/Step5Form';
import { Step4Form } from '/src/components/organisms/dashboard/Step4Form';
import { Step3Form } from '/src/components/organisms/dashboard/Step3Form';
import { Order, Step2Form } from '/src/components/organisms/dashboard/Step2Form';
import { Step1Form } from '/src/components/organisms/dashboard/Step1Form';
import Dialog from '/src/components/atoms/Dialog';

import MultipleFilters, {
  MultipleFiltersChips,
  TooltipIcon,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { differenceInCalendarDays, format } from 'date-fns';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import useDebounce from '/src/hooks/useDebounce';
import StepAttributesCreate from '/src/components/Attributes';
import StepOrdersCreation from '/src/components/OrderPrices';
import useAlert from '/src/hooks/useAlert';
import { cn } from '/src/utils/cn';
import { StepSingleOrder } from '/src/components/organisms/dashboard/StepSingleOrder';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import useGetActiveSchoolCycleElement from '/src/hooks/useActiveSchoolCycle';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { extractPageFromURL } from '/src/utils/object-util';

Concepts.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Conceptos">
      {page}
    </Layout>
  );
};

export const CreateConceptTypeEnum = z.union([
  z.literal('MONTHLY_FEE'),
  z.literal('INSCRIPTION'),
  z.literal('TRANSPORT'),
  z.literal('PRE_DEBT'),
  z.literal('OTHER'),
  z.literal('REINSCRIPTION'),
  z.literal('EXTRACURRICULAR'),
  z.literal('SPORTS'),
  z.literal('CAFETERIA'),
  z.literal('BOOKS_AND_MATERIALS'),
  z.literal('EXAMS_AND_CERTIFICATES'),
  z.literal('UNIFORMS_AND_MERCH'),
]);

export const MonthsToPayEnum = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);

export const CompoundingEnum = z.union([
  z.literal('SINGLE'),
  z.literal('DAILY'),
  z.literal('WEEKLY'),
  z.literal('MONTHLY'),
]);

export const TypeF30Enum = z.union([
  z.literal('PERCENT'),
  z.literal('AMOUNT'),
  z.literal('FIXED'),
  z.literal('BRILLAMONT'),
]);

export const DiscountTypeEnum = z.union([
  z.literal('PERCENT'),
  z.literal('AMOUNT'),
  z.literal('FIXED'),
  z.literal('BRILLAMONT'),
]);

export const InterestSchema = z.object({
  compounding: CompoundingEnum,
  type: TypeF30Enum,
  value: z.number().min(0),
  day_offset: z.number().min(-3),
  month_offset: z.number().min(0),
});

export const EarlyBirdDiscount = z.object({
  name: z.string(),
  discount_type: DiscountTypeEnum,
  up_to_days: z.number().min(1),
  value: z.number().min(0),
});

export const OrderCreate = z.object({
  name: z.string(),
  price: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
  due: z.string().optional().nullable(),
});

export const CreateConcept = z.object({
  id: z.string().uuid(),
  entity: z.string().nullable(),
  type: CreateConceptTypeEnum,
  school_cycle: z.string().nullable(),
  name: z.string().max(512),
  subscription: z.boolean().optional(),
  optional: z.boolean().optional(),
  bank_account: z.string().nullable().optional(),
  not_invoicing_bank_account: z.string().nullable().optional(),
  payment_only_in_dashboard: z.boolean().optional(),
  months_to_pay: z.array(MonthsToPayEnum).optional(),
  payday: z.number().min(-32768).max(32767).optional(),
  price: z.string().regex(/^-?\d{0,12}(?:\.\d{0,2})?$/),
  interest_schema: z.array(InterestSchema).optional(),
  early_bird_discounts: z.array(EarlyBirdDiscount).optional(),
  has_sales_tax: z.boolean().optional(),
  tax_code: z.string().max(30).nullable().optional(),
  tax_unit: z.string().max(30).nullable().optional(),
  institutional_id: z.string().max(32).nullable().optional(),
  is_billable: z.boolean().optional(),
  orders: z.array(OrderCreate).optional(),
  setup_periodic_restrictions: z.boolean().optional(),
});

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

Concepts.auth = true;

function Concepts() {
  const [currentStep, setCurrentStep] = useState(Steps.Step1);
  const [formData, setFormData] = useState<ConcepForm>({});
  const { data: session } = useSession();
  const selectedSchool = useSelectedSchool();
  const [hasRecurringRevenue, setHasRecurringRevenue] = useState(null);
  const [attributeSinglePrice, setAttributeSinglePrice] = useState(0);
  const [isCreatingConcepts, setIsCreatingConcepts] = useState(false);
  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [hasDueDate, setHasDueDate] = useState<string | undefined>('');
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);
  const [hasScrolled, setHasScrolled] = useState(false);
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const {
    toggle: openConceptCreationEdit,
    onClose: onCloseConceptCreationEdit,
    onOpen: onOpenConceptCreationEdit,
  } = useToggle();

  const handleOpenConceptsCreation = () => {
    onOpenConceptCreationEdit();
    sendTrackEventWithUserName('Dashboard - New concept Started');
  };

  const handleData = (data: ConcepForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  function parsePayload(payload: ConcepForm) {
    const price = payload.price;
    const orders = payload.orders?.map((order: Order) => {
      // we should convert a date object to a YYYY-MM-DD. using date-fns
      const date = format(order.due, 'yyyy-MM-dd');
      return {
        ...order,
        due: date,
      };
    });
    const months = payload.orders?.map((order: { months_to_pay: number }) => order.months_to_pay);
    return {
      entity: payload.entity,
      type: payload.type,
      school_cycle: payload.school_cycle,
      name: payload.name,
      subscription: true,
      optional: payload.root_concept === 'optional',
      ...(payload.payment_only_in_dashboard === 'false'
        ? { bank_account: payload.bank_account, not_invoicing_bank_account: payload.not_invoicing_bank_account }
        : {}),
      payment_only_in_dashboard: payload.payment_only_in_dashboard === 'true',
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
      ...(payload.product_key ? { tax_code: payload.product_key } : {}),
      ...(payload.unit_type ? { tax_unit: payload.unit_type } : {}),
      ...(payload.has_rvoe === 'true'
        ? { institutional_id: payload.rvoe, use_education_complement: true }
        : { use_education_complement: false }),
      is_billable: payload.is_billable === 'true',
      orders: orders,
    };
  }
  const { setAlertState } = useAlert();

  const createConceptMutation = api.schools.schoolsConceptsCreate.useMutation();
  const createConceptsWithAttributesMutation = api.schools.schoolsConceptsWithAttributesCreate.useMutation();
  const createConceptWithSingleOrder = api.schools.schoolsConceptWithSingleOrderCreate.useMutation();
  const utils = api.useUtils();

  const handleCreate = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptMutation.isLoading || isCreatingConcepts) return;

    try {
      const payload = parsePayload({ ...data, ...formData });

      try {
        await createConceptMutation.mutate(
          { school_id: selectedSchool?.id as string, data: { ...payload, subscription: true } },
          {
            onSuccess: async () => {
              await utils.schools.invalidate();
              onCloseConceptCreationEdit();
              setCurrentStep(Steps.Step1);
              setFormData({});
              setAlertState({
                open: true,
                severity: 'success',
                message: 'El concepto ha sido creado satisfactoriamente',
              });
              sendTrackEventWithUserName('Back: Concept Created');
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
              sendTrackEventWithUserName('Back: Concept Failed');
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

    if (createConceptsWithAttributesMutation.isLoading || isCreatingConcepts) return;

    try {
      const payload = parsePayloadWithAttributes({ ...data, ...formData });

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
              sendTrackEventWithUserName('Back: Concept With Attributes Created');
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

  const parsePayloadWithAttributes = (payload: ConcepForm) => ({
    entity: payload.entity,
    root_concept: payload.root_concept,
    type: payload.type,
    school_cycle: payload.school_cycle,
    name: payload.name,
    bank_account: payload.payment_only_in_dashboard === 'false' ? payload.bank_account : undefined,
    not_invoicing_bank_account: payload.payment_only_in_dashboard ? payload.not_invoicing_bank_account : undefined,
    payment_only_in_dashboard: payload.payment_only_in_dashboard === 'false' ? false : true,
    subscription: false,
    has_sales_tax: payload.has_sales_tax === 'true',
    optional: payload.root_concept === 'optional' || payload.has_due_date === 'false',
    ...(payload.product_key ? { tax_code: payload.product_key } : {}),
    ...(payload.unit_type ? { tax_unit: payload.unit_type } : {}),
    ...(payload.has_rvoe === 'true'
      ? { institutional_id: payload.rvoe, use_education_complement: true }
      : { use_education_complement: false }),
    is_billable: payload.is_billable === 'true',
    price: payload.price || 0,
    orders_attributes: parseOrdersAttributes(payload.orders_attributes || {}),
    setup_periodic_restrictions: payload.setup_periodic_restrictions === 'true',
  });

  const parsePayloadSingleOrder = (payload: ConcepForm) => {
    const order = {
      price: payload.price,
      due: payload.due ? format(new Date(payload.due), 'yyyy-MM-dd') : '',
    };

    return {
      entity: payload.entity,
      type: payload.type,
      school_cycle: payload.school_cycle,
      name: payload.name,
      bank_account: payload.payment_only_in_dashboard === 'false' ? payload.bank_account : undefined,
      not_invoicing_bank_account: payload.payment_only_in_dashboard ? payload.not_invoicing_bank_account : undefined,
      payment_only_dashboard: payload.payment_only_in_dashboard === 'true',
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
      is_billable: payload.is_billable === 'true', // as provided in the payload
      tax_code: payload.product_key,
      tax_unit: payload.unit_type,
      institutional_id: payload.has_rvoe === 'true' ? payload.rvoe : undefined,
      orders: [order], // contains only the provided order
    };
  };

  const handleCreateSingleOrder = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptWithSingleOrder.isLoading || isCreatingConcepts) return;

    try {
      const payload = parsePayloadSingleOrder({ ...data, ...formData });

      try {
        await createConceptWithSingleOrder.mutate(
          { school_id: selectedSchool?.id as string, data: { ...payload, subscription: true } },
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
              sendTrackEventWithUserName('Back: Concept Single Order Created');
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

  const handleCancel = () => {
    onCloseConceptCreationEdit();
    setFormData({});
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setHasScrolled(scrollTop > 0);
  };

  const handleNext = () => {
    const eventsNames = {
      STEP_1_INFORMATION: 'dashboard: Concept | New Concept P1 - Complete',
      STEP_2_MONTHS: 'dashboard: Concept | New Concept P2A.1.1 Meses - Complete',
      STEP_3_INTEREST: 'dashboard: Concept | New Concept P2A.2 Recargos - Complete',
      STEP_4_DISCOUNT: 'dashboard: Concept | New Concept P2A.3 Descuentos - Complete',
      STEP_5_INVOCE: 'dashboard: Concept | New Concept P3 Facturacion - Complete',
      STEP_6_ATTRIBUTES_CREATION: 'dashboard: Concept | New Concept P2B.1 Atributos - Complete',
      STEP_7_ORDERS_CREATION: 'dashboard: Concept | New Concept P2B.2 Ordenes - Complete',
      STEP_8_SINGLE_ORDER: 'dashboard: Concept | New Concept P2A.1.2 Single Order - Complete',
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
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <div className="flex flex-col justify-center w-full py-4">
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
                  onNext={
                    hasDueDate === 'false' || formData?.orders_attributes
                      ? handleCreateWithAttributes
                      : formData?.due
                      ? handleCreateSingleOrder
                      : handleCreate
                  }
                  onBack={handleBack}
                  formData={formData}
                  isSubmitting={createConceptMutation.isLoading || isCreatingConcepts}
                />
              )}
              {currentStep === Steps.StepAttributesCreate && (
                <StepAttributesCreate
                  setData={handleData}
                  onNext={handleNext}
                  onBack={handleBack}
                  formData={formData}
                  setAttributeSinglePrice={setAttributeSinglePrice}
                  isSubmitting={createConceptsWithAttributesMutation.isLoading || isCreatingConcepts}
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
        <ConceptsTable
          handleOpenConceptsCreation={handleOpenConceptsCreation}
          showOnlyAFewElements={openConceptCreationEdit}
        />
        <Dialog.Root open={alertToCloseSheet} position="right" classNames="right-12">
          <Dialog.Title>¿Estás seguro que deseas cancelar la creación del concepto?</Dialog.Title>
          <Dialog.Description>
            Los datos no se guardarán y deberás iniciar el proceso nuevamente en caso que desees continuarlo
          </Dialog.Description>
          <div className="flex justify-center gap-x-10">
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
                setFormData({});
                setCurrentStep(Steps.Step1);
                setAlertToCloseSheet(false);
                setFormIsDirty(false);
              }}
            >
              Si, cancelar
            </Button>
          </div>
        </Dialog.Root>
      </div>
    </Sentry.ErrorBoundary>
  );
}
export default Concepts;
export function ConceptsTable({
  handleOpenConceptsCreation,
}: {
  handleOpenConceptsCreation: () => void;
  showOnlyAFewElements?: boolean;
}) {
  const selectedSchool = useSelectedSchool();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 1200);
  const permissions = useGetPermissions();
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const params = {
    multiple_search: searchDebounced,
    ...paramsFromForm,
  };
  const { data: filters } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });
  const schoolsConceptFilter = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: (
        <TooltipIcon message="Filtra los conceptos que pertenezcan al ciclo escolar de tu elección">
          Ciclo escolar
        </TooltipIcon>
      ),
      watchKey: 'school_cycles',
      contents: schoolsConceptFilter?.school_cycles.sort((a, b) => b.name.localeCompare(a.name)),
    },
    {
      header: 'Tipo de concepto',
      watchKey: 'type',
      contents: schoolsConceptFilter?.type,
    },
  ];

  const handleOpen = (row: Record<string, any>) => {
    router.push(`/concepts/${row.id}`);
  };

  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };

  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };

  const {
    data: conceptsTable,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.schools.schoolsConceptsList.useInfiniteQuery(
    {
      school_id: selectedSchool?.id as string,
      page_size: 50,
      ...params,
    },
    {
      enabled: !!selectedSchool?.id,
      refetchOnWindowFocus: false,
      getNextPageParam: (currentPage) => extractPageFromURL((currentPage as any)?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => firstPage ?? undefined,
    }
  );
  const flatData = useMemo(() => conceptsTable?.pages.flatMap((page: any) => page?.results ?? []), [conceptsTable]);
  const totalCount = useMemo(() => (conceptsTable as any)?.pages[0]?.count || 0, [conceptsTable]);
  const columnHelper = createColumnHelper<BaseConcept>();
  const { data: categories } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate whitespace-break-spaces">{info.getValue()}</span>
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Nombre</span>,
      size: 250,
    }),
    // @ts-ignore
    columnHelper.accessor('school_cycle.name', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue() as string}</div>,
      header: () => <span className="whitespace-nowrap">Ciclo escolar</span>,
    }),
    columnHelper.accessor('type', {
      cell: (info) => (
        <div className="text-sm font-normal">
          {categories?.type.find((category) => category.id === info.getValue())?.name}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Tipo de concepto</span>,
    }),
    columnHelper.accessor('price', {
      cell: (info) => <div className="text-sm font-semibold">{renderMoney(info.getValue())}</div>,
      header: () => <span className="whitespace-nowrap">Precio</span>,
      meta: {
        numeric: true,
      },
    }),
    columnHelper.accessor('students_assigned_count', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue()}</div>,
      header: () => <span className="whitespace-nowrap">Alumnos asignados</span>,
    }),
  ];

  const schoolCycleChip = useGetActiveSchoolCycleElement;
  const wrapperRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col h-full">
      <div>
        <div className="flex flex-row items-center justify-between pb-3">
          <div>
            <div className="ml-10">
              <Header title="Conceptos" />
              <div className="flex items-center gap-2">
                <MultipleFilters
                  filterItems={filterItems}
                  handleFilter={handleFilter}
                  onClearFilter={() => {
                    setFormFilterData({});
                  }}
                  itemsCount={itemsCount}
                  setItemsCount={setItemsCount}
                  postFixElement={schoolCycleChip}
                />
                <GlobalSearch
                  search={search}
                  setSearch={setSearch}
                  placeholder="Buscar conceptos"
                  typeButton="button"
                />
              </div>
            </div>
            <div className="px-4">
              <MultipleFiltersChips
                onChange={handleChangeChipFilter}
                formFilterData={formFilterData}
                itemsCount={itemsCount}
                setItemsCount={setItemsCount}
              />
            </div>
          </div>
          {permissions?.can_add_concept && (
            <div className="mr-20">
              <Button onClick={handleOpenConceptsCreation} className="max-w-[300px]" data-testid="createConcept-button">
                <IcPlus fill="currentColor" />
                Nuevo concepto
              </Button>
            </div>
          )}
        </div>
      </div>
      <div
        ref={wrapperRef}
        className={cn(
          'h-[calc(100vh-245px)]',
          { 'cursor-wait ': isLoading || isFetching },
          'transition-opacity duration-300'
        )}
      >
        <TableVirtualized
          data={flatData || []}
          columns={columns as any[]}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage || false}
          fetchNextPage={fetchNextPage}
          onRowClick={handleOpen}
          maxHeight={wrapperRef?.current?.offsetHeight || 500}
          totalCount={totalCount || 0}
          totalFetched={flatData?.length || 0}
          isLoading={isLoading}
          isFetching={isFetching}
          hideSum
          addMorePaddingFirstRow
          showEmptyStateImage
          emptyEndText="No hay más conceptos para mostrar"
          emptyStateText="No hay conceptos para mostrar"
        />
      </div>
    </div>
  );
}
