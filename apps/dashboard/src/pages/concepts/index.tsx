import { type BaseConcept, OfferingEnum } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { createColumnHelper } from '@tanstack/react-table';
import { differenceInCalendarDays, format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import IcVideoTutorial from 'public/assets/icons/ic_video_tutorial.svg';
import Dialog from '/src/components/atoms/Dialog';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Sheet from '/src/components/atoms/Sheet';
import StepAttributesCreate from '/src/components/Attributes';
import Layout from '/src/components/layouts';
import Header from '/src/components/molecules/dashboard/Header';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import MultipleFilters, {
  MultipleFiltersChips,
  TooltipIcon,
  formFilterDataToParams,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import StepOrdersCreation from '/src/components/OrderPrices';
import Button from '/src/components/organisms/dashboard/Button';
import { Button as ButtonV2 } from '@cometa/recreo/v2';
import type { FormDiscount, FormValues } from '/src/components/organisms/dashboard/CreationConcepts';
import { Step1Form } from '/src/components/organisms/dashboard/Step1Form';
import { type Order, Step2Form } from '/src/components/organisms/dashboard/Step2Form';
import { Step3Form } from '/src/components/organisms/dashboard/Step3Form';
import { Step4Form } from '/src/components/organisms/dashboard/Step4Form';
import { Step5Form } from '/src/components/organisms/dashboard/Step5Form';
import { StepSingleOrder } from '/src/components/organisms/dashboard/StepSingleOrder';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { convertToOrdering } from '/src/components/Table';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import useGetActiveSchoolCycleElement from '/src/hooks/useActiveSchoolCycle';
import useAlert from '/src/hooks/useAlert';
import useDebounce from '/src/hooks/useDebounce';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import useToggle from '/src/hooks/useToggle';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { renderMoney } from '/src/utils/datagridHeaders';
import { extractPageFromURL } from '/src/utils/object-util';
import { ConceptsOnboardingVideo } from '../../components/concepts/ConceptsOnboardingVideo';
import { ConceptsEmptyState } from '../../components/concepts/ConceptsEmptyState';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import { useOnboardingVideosStore, ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';
import { Status2B3Enum } from '@cometa/trpc';

Concepts.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout dashboardVariant="stretch" title="Conceptos">
      {page}
    </Layout>
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

  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedConceptsVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.CONCEPTS);

  const shouldShowVideoOnLoad = showVideoFeature && !hasWatchedConceptsVideo;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowVideoOnLoad);

  const {
    toggle: openConceptCreationEdit,
    onClose: onCloseConceptCreationEdit,
    onOpen: onOpenConceptCreationEdit,
  } = useToggle();

  const utils = api.useUtils();
  const handleOpenConceptsCreation = () => {
    onOpenConceptCreationEdit();
    if (selectedSchool?.id) {
      utils.series.invoiceSeriesList.prefetch({
        schoolId: selectedSchool?.id as string,
      });
    }
    sendTrackEventWithUserName(Events.concept_new_started);
  };

  const handleData = (data: ConcepForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  function getCommonParsePayload(payload: ConcepForm) {
    const isBillable = payload.is_billable === 'true';
    const notInvoicingBankAccount = payload.not_invoicing_bank_account || payload.bank_account;
    const onlyInDashboard = payload.payment_only_in_dashboard === 'true';
    const doesInvoiceAsGeneralPublic = payload.does_invoice_as_general_public === 'true';

    const getOfferingValue = (availableOnline?: string) => {
      if (availableOnline === 'true') return OfferingEnum.OPEN_LOOP;
      if (availableOnline === 'false') return OfferingEnum.SCHOLAR;
      return undefined;
    };

    return {
      entity: payload.entity,
      is_billable: isBillable, // as provided in the payload
      does_invoice_as_general_public: doesInvoiceAsGeneralPublic,
      name: payload.name,
      payment_only_in_dashboard: onlyInDashboard,
      type: payload.type,
      school_cycle: payload.school_cycle,
      series: payload.series?.id,
      ...(payload.available_in_online_store ? { offering: getOfferingValue(payload.available_in_online_store) } : {}),
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
      // we should convert a date object to a YYYY-MM-DD. using date-fns
      const date = format(order.due, 'yyyy-MM-dd');
      return {
        ...order,
        due: date,
      };
    });
    const months = payload.orders?.map((order: { months_to_pay: number }) => order.months_to_pay);
    const commonPayload = getCommonParsePayload(payload);
    return {
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
      ...(payload.product_key ? { tax_code: payload.product_key } : {}),
      ...(payload.unit_type ? { tax_unit: payload.unit_type } : {}),
      ...(payload.has_rvoe === 'true'
        ? { institutional_id: payload.rvoe, use_education_complement: true }
        : { use_education_complement: false }),
      orders: orders,
      ...commonPayload,
    };
  }
  const { setAlertState } = useAlert();

  const createConceptMutation = api.schools.schoolsConceptsCreate.useMutation();
  const createConceptsWithAttributesMutation = api.schools.schoolsConceptsWithAttributesCreate.useMutation();
  const createConceptWithSingleOrder = api.schools.schoolsConceptWithSingleOrderCreate.useMutation();

  const handleCreate = async (data?: ConcepForm) => {
    setIsCreatingConcepts(true);

    if (createConceptMutation.isPending || isCreatingConcepts) return;

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
              sendTrackEventWithUserName(Events.concept_created);
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
              sendTrackEventWithUserName(Events.concept_failed);
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
              sendTrackEventWithUserName(Events.concept_with_attributes_created);
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
              sendTrackEventWithUserName(Events.concept_single_order_created);
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

  useEffect(() => {
    setShowOnboarding(shouldShowVideoOnLoad);
  }, [shouldShowVideoOnLoad]);

  if (showOnboarding) {
    return (
      <Sentry.ErrorBoundary
        beforeCapture={(scope) => {
          scope.setContext('state', {
            session,
            selectedSchool,
          });
        }}
      >
        <ConceptsOnboardingVideo onComplete={() => setShowOnboarding(false)} />
      </Sentry.ErrorBoundary>
    );
  }

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          session,
          selectedSchool,
        });
      }}
    >
      <div className="flex flex-col justify-center pb-4 w-full">
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
        <ConceptsTable
          handleOpenConceptsCreation={handleOpenConceptsCreation}
          showOnlyAFewElements={openConceptCreationEdit}
        />
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
  const [conceptsSorting, setConceptsSorting] = useState<string>();
  type FormFilterData = Record<string, { checked: boolean; name: string }>;
  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;
  const paramsFromForm = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);

  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showOnboardingEmptyState = isOnboardingSchool && welcomePageFlag;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const [showVideoFromEmptyState, setShowVideoFromEmptyState] = useState(false);

  const params = {
    multiple_search: searchDebounced,
    ordering: conceptsSorting ? [conceptsSorting] : undefined,
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
    {
      header: 'Tienda en línea',
      watchKey: 'offering',
      contents: [
        {
          id: OfferingEnum.OPEN_LOOP,
          name: 'Sí',
        },
        {
          id: OfferingEnum.SCHOLAR,
          name: 'No',
        },
      ],
    },
  ];
  const handleFilter = (data: FormFilterData, methods: UseFormReturn<FormFilterData>) => {
    formRef.current = methods;
    setFormFilterData(data);
  };

  const handleChangeChipFilter = (data: FormFilterData) => {
    setFormFilterData(data);
    formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  };
  const handleOpen = (row: Record<string, any>) => {
    router.push(`/concepts/${row.id}`);
  };

  const {
    data: conceptsTable,
    isPending: isLoading,
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
      getPreviousPageParam: (firstPage) => extractPageFromURL((firstPage as any)?.previous as string) ?? undefined,
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
      enableSorting: true,
    }),
    // @ts-ignore
    columnHelper.accessor('school_cycle.name', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue() as string}</div>,
      header: () => <span className="whitespace-nowrap">Ciclo escolar</span>,
      enableSorting: true,
    }),
    columnHelper.accessor('type', {
      cell: (info) => (
        <div className="text-sm font-normal">
          {categories?.type.find((category) => category.id === info.getValue())?.name}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Tipo de concepto</span>,
      size: 220,
      enableSorting: true,
    }),
    columnHelper.accessor('last_order_price', {
      cell: (info) => (
        <div className={cn('text-sm', { 'font-semibold': info.row.original.unique_price })}>
          {info.row.original.unique_price ? renderMoney(info.getValue()) : 'Múltiples precios'}
        </div>
      ),
      header: () => <span className="whitespace-nowrap">Precio</span>,
      meta: {
        numeric: true,
      },
      enableSorting: true,
    }),
    columnHelper.accessor('students_assigned_count', {
      cell: (info) => <div className="text-sm font-normal">{info.getValue()}</div>,
      header: () => <span className="whitespace-nowrap">Estudiantes asignados</span>,
      enableSorting: true,
    }),
  ];

  const schoolCycleChip = useGetActiveSchoolCycleElement;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isEmpty = !isLoading && totalCount === 0;
  const shouldShowOnboardingEmptyState =
    showOnboardingEmptyState && isEmpty && !search && Object.keys(formFilterData).length === 0;

  const handleViewTutorial = () => {
    setShowVideoFromEmptyState(true);
  };

  if (showVideoFromEmptyState) {
    return (
      <Sentry.ErrorBoundary>
        <ConceptsOnboardingVideo onComplete={() => setShowVideoFromEmptyState(false)} />
      </Sentry.ErrorBoundary>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pb-5">
        <div className="px-10">
          <div className="flex flex-row justify-between items-center [&>div>div]:!py-0 [&>div>div]:!pt-[23px] [&>div>div]:!pb-4">
            <Header title="Conceptos" />
            {permissions?.can_add_concept && !shouldShowOnboardingEmptyState && (
              <div className="flex gap-2 items-center">
                {showVideoFeature && (
                  <ButtonV2 variant="ghost" onClick={handleViewTutorial}>
                    <IcVideoTutorial className="w-4 h-4" />
                    Ver tutorial
                  </ButtonV2>
                )}
                <ButtonV2 variant="default" onClick={handleOpenConceptsCreation} data-testid="createConcept-button">
                  Nuevo concepto
                </ButtonV2>
              </div>
            )}
          </div>
          {!shouldShowOnboardingEmptyState && (
            <div className="flex gap-5 items-center">
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
              <GlobalSearch search={search} setSearch={setSearch} placeholder="Buscar conceptos" typeButton="button" />
            </div>
          )}
        </div>
        {!shouldShowOnboardingEmptyState && (
          <div className="px-10">
            <MultipleFiltersChips
              onChange={handleChangeChipFilter}
              formFilterData={formFilterData}
              itemsCount={itemsCount}
              setItemsCount={setItemsCount}
            />
          </div>
        )}
      </div>
      <div
        ref={wrapperRef}
        className={cn(
          'h-[calc(100vh-190px)]',
          { 'cursor-wait ': isLoading || isFetching },
          'transition-opacity duration-300'
        )}
      >
        {shouldShowOnboardingEmptyState ? (
          <div className="flex items-center justify-center h-full">
            <ConceptsEmptyState onCreateConcept={handleOpenConceptsCreation} onViewTutorial={handleViewTutorial} />
          </div>
        ) : (
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
            onSortingChange={(sorting) => {
              const text = convertToOrdering(sorting);
              setConceptsSorting(text);
            }}
          />
        )}
      </div>
    </div>
  );
}
