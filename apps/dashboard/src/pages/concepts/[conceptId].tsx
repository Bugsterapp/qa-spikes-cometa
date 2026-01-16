import { type DetailConcept, FulfillmentStatusesEnum, Status2B3Enum } from '@cometa/trpc/src/types';
import * as Sentry from '@sentry/nextjs';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import IcStudents from '/public/assets/icons/ic_students.svg';
import CAlert from '/src/components/atoms/CAlert';
import Dialog from '/src/components/atoms/Dialog';
import Sheet from '/src/components/atoms/Sheet';
import ThreeDotsDropdown from '/src/components/atoms/ThreeDotsDropdown';
import { useBackgroundConceptAssignStore } from '/src/components/BackgroundDownload/BackgroundAssignConcepts';
import Layout from '/src/components/layouts';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Button from '/src/components/organisms/dashboard/Button';
import { Step3AssignDetail } from '/src/components/organisms/dashboard/ConceptAssigment/AssignDetail';
import { Step1OrderSelection } from '/src/components/organisms/dashboard/ConceptAssigment/OrdersSelected';
import { Step2StudentSelection } from '/src/components/organisms/dashboard/ConceptAssigment/StudentSelected';
import { ConceptOrdersTable } from '/src/components/organisms/dashboard/ConceptOrdersTable';
import { StudentAssignedTable } from '/src/components/organisms/dashboard/StudentAssignedTable';
import { StudentConceptsVariantsTable } from '/src/components/organisms/dashboard/StudentConceptsVariantsTable';
import Status from '/src/components/Status';
import { TabsWrapper as Tabs, useTab } from '/src/components/ui/Tabs';
import { useGetPermissions, useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events, TrackEvents } from '/src/constants/events';
import useToggle from '/src/hooks/useToggle';
import { PATH_PORTAL } from '/src/routes/paths';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import Info from 'public/assets/icons/ic_info.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import CreateAutoAssignmentSidePanel, {
  CardsAutoAssignWithChips,
} from '../../components/concepts/CreateAutoAssignmentSidePanel';
import EditAutoAssignmentSidePanel from '/src/components/concepts/EditAutoAssignmentSidePanel';
import { Tooltip } from '/src/components/atoms/Tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import ConceptEditForm, { type ConceptEditChanges } from '../../components/concepts/ConceptEditForm';
import EarlyBirdDiscountSidePanel from '/src/components/organisms/dashboard/ConceptSections/EditEarlyBirdDiscountsSidePanel';
import { CreateConcept } from '/src/components/concepts/create-concepts/CreateConcept';
import { EarlyBirdDiscounts } from '/src/components/concepts/EarlyBirdDiscounts';
import { InterestSchemas } from '/src/components/concepts/InterestScheme';
import { OrdersSection } from '/src/components/concepts/OrdersSection';
import { BillingInformationSection } from '/src/components/concepts/BillingInformationSection';
import { SectionLayout } from '/src/components/concepts/SectionLayout';
import { TooltipButton } from '/src/components/TooltipButton';
import { ConceptDetailSkeleton } from '/src/components/skeletons/ConceptDetailSkeleton';
import InterestSidePanel from '/src/components/organisms/dashboard/ConceptSections/InterestSidePanel';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import { SCHOOL_CYCLE_CONSTANTS } from '/src/constants/schoolCycle';
import IcCheck from '/public/assets/icons/ic_check_outline.svg';
import IcClose from '/public/assets/icons/ic_circle_error.svg';
import { ConceptAssignmentOnboardingVideo } from '../../components/concepts/ConceptAssignmentOnboardingVideo';
import { useOnboardingVideosStore, ONBOARDING_VIDEO_IDS } from '../../stores/onboardingVideosStore';

ConceptDetail.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Detalle de Concepto">{page}</Layout>;
};

enum Steps {
  Step1 = 'STEP_1_ORDERS',
  Step2 = 'STEP_2_STUDENTS',
  Step3 = 'STEP_3_DETAIL',
}

export const SelectedOrdersSchema = z.object({
  orders: z.array(z.any()).nonempty(),
});

export const SelectedStudentsSchema = z.object({
  students: z.array(z.any()).nonempty(),
});

export const AssignDetailSchema = SelectedOrdersSchema.merge(SelectedStudentsSchema);

export type FormValuesOrders = z.infer<typeof SelectedOrdersSchema>;
export type FormValuesStudents = z.infer<typeof SelectedStudentsSchema>;
export type FormValuesAssignDetail = z.infer<typeof AssignDetailSchema>;
export type FormValues = FormValuesOrders & FormValuesStudents & FormValuesAssignDetail;

export type StepAssingProps<T> = {
  setData?: (data: T) => void;
  onNext: () => void;
  onBack: () => void;
  formData?: Partial<FormValues>;
  concept?: DetailConcept;
  saving?: boolean;
};

function ConceptDetail() {
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FormValues>>({});

  const router = useRouter();
  const conceptId = router.query.conceptId as string;
  const selectedSchoolId = useSelectedSchoolId();
  const selectedSchool = useSelectedSchool();
  const { isEnabled: addAutoAssignConceptEnabled } = useFlagWithVariableMatching('hk_add_auto_assign_concept');
  const { isEnabled: isOnlineStoreEnabled } = useFlagWithVariableMatching('enable_online_store_in_concepts');
  const { isEnabled: welcomePageFlag } = useFlagWithVariableMatching('enable_welcome_page');
  const [openDialog, setOpenDialog] = useState(false);

  const isOnboardingSchool = selectedSchool?.status === Status2B3Enum.Onboarding;
  const showVideoFeature = isOnboardingSchool && welcomePageFlag;

  const { hasWatchedVideo } = useOnboardingVideosStore();
  const hasWatchedConceptAssignmentVideo = hasWatchedVideo(ONBOARDING_VIDEO_IDS.CONCEPT_ASSIGNMENT);

  const shouldShowVideoOnLoad = showVideoFeature && !hasWatchedConceptAssignmentVideo;
  const [showOnboarding, setShowOnboarding] = useState(shouldShowVideoOnLoad);
  const [openDeleteEarlyBirdDialog, setOpenDeleteEarlyBirdDialog] = useState(false);
  const [openEditEarlyBirdDiscountSidePanel, setOpenEditEarlyBirdDiscountSidePanel] = useState(false);
  const [currentEarlyBirdDiscount, setCurrentEarlyBirdDiscount] = useState<number | undefined>(undefined);
  const [currentEarlyBirdDiscountIndexToDelete, setCurrentEarlyBirdDiscountIndexToDelete] = useState(0);
  const [openDeleteInterestDialog, setOpenDeleteInterestDialog] = useState(false);
  const [openEditInterestSidePanel, setOpenEditInterestSidePanel] = useState(false);
  const [currentInterestSchema, setCurrentInterestSchema] = useState<number | undefined>(undefined);
  const [currentInterestSchemaIndexToDelete, setCurrentInterestSchemaIndexToDelete] = useState(0);
  const [currentStep, setCurrentStep] = useState(Steps.Step1);
  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);
  const { toggle: openAssignOrders, onClose: onCloseAssignOrders, onOpen: onOpenAssingOrders } = useToggle();
  const {
    toggle: openAutoAssignmentCreate,
    onClose: onCloseAutoAssignmentCreate,
    onOpen: onOpenAutoAssignmentCreate,
  } = useToggle();
  const {
    toggle: openAutoAssignmentEdit,
    onClose: onCloseAutoAssignmentEdit,
    onOpen: onOpenAutoAssignmentEdit,
  } = useToggle();

  const utils = api.useUtils();
  const permissions = useGetPermissions();
  const { setIsWorking, addToQueue } = useBackgroundConceptAssignStore((state) => state);

  const [studentsAssignedCount, setStudentsAssignedCount] = useState(0);

  const { data: concept, isPending: isLoadingConceptDetail } = api.schools.schoolsConceptDetail.useQuery(
    {
      school_id: selectedSchoolId as string,
      concept_id: conceptId,
    },
    {
      enabled: !!conceptId && !!selectedSchoolId,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000 * 60,
    }
  );

  const editEarlyBirdDiscountMutation = api.concepts.updateConcept.useMutation();
  const [isEditingBillingInfo, setIsEditingBillingInfo] = useState(false);
  const isSingleOrder = concept?.orders?.length === 1 && concept?.months_to_pay?.length === 0;

  const { data: conceptTypesList } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool,
      staleTime: 60 * 1000 * 60,
    }
  );

  const createAssignMutation = api.schools.schoolsAssignmentsCreate.useMutation();
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);

  const { data: ordersWithVariantsAndStock } = api.concepts.optionalConceptsOrdersList.useQuery(
    {
      conceptId: conceptId as string,
      schoolId: selectedSchoolId ?? '',
    },
    {
      enabled: !!conceptId && !!concept?.optional,
    }
  );
  const ordersWithZeroStock = ordersWithVariantsAndStock?.filter(
    (order) => order.stock !== null && order?.stock?.quantity === 0 && order?.stock.is_limited
  );
  const parsePayload = () => {
    const orders = formData?.orders?.map((order: { id: string }) => order?.id) || [];
    const payload = {
      students: formData?.students?.map((student: { id: string }) => student?.id) || [],
      orders: orders,
      concept: conceptId,
    };
    return payload;
  };

  const handleCreate = async () => {
    try {
      const payload = parsePayload();
      await createAssignMutation.mutate(
        {
          school_id: selectedSchoolId || '',
          data: payload,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: async (data: any) => {
            // this is the correct type: MassiveConceptAssignmentHistory
            addToQueue(data.id);
            setIsWorking();
            onCloseAssignOrders();
            sendTrackEventWithUserName(Events.bulk_concept_assignment_success);
            setFormData({});
            setCurrentStep(Steps.Step1);
            setAlertToCloseSheet(false);
          },
          onError: () => {
            onCloseAssignOrders();
            setFormData({});
            setCurrentStep(Steps.Step1);
            setAlertToCloseSheet(false);
            sendTrackEventWithUserName(Events.bulk_concept_assignment_failure);
            setAlertState({
              open: true,
              severity: 'error',
              message: <>No se pudo crear la asignación masiva de conceptos. </>,
            });
            Sentry.captureException(new Error('No se pudo crear la asignación masiva de conceptos'));
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const handleData = (data: Partial<FormValues>) => {
    setFormData((prev: Partial<FormValues>) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const eventsNames = {
      STEP_1_ORDERS: 'Bulk Concept Assignment P1 (Orders Selected)',
      STEP_2_STUDENTS: 'Bulk Concept Assignment P2 (Students Selected)',
      STEP_3_DETAIL: 'Bulk Concept Assignment P3 (Confirmation)',
    };
    sendTrackEventWithUserName(eventsNames[currentStep]);
    switch (currentStep) {
      case Steps.Step1:
        setCurrentStep(Steps.Step2);
        break;
      case Steps.Step2:
        setCurrentStep(Steps.Step3);
        break;
      default:
        break;
    }
  };

  const handleBackToList = () => {
    router.push(PATH_PORTAL.concepts.root);
  };

  const handleBack = () => {
    switch (currentStep) {
      case Steps.Step1:
        return onCloseAssignOrders();
      case Steps.Step2:
        setCurrentStep(Steps.Step1);
        break;
      case Steps.Step3:
        setCurrentStep(Steps.Step2);
        break;
      default:
        break;
    }
  };

  const checkIfHasMonthsToPay = () => {
    if (
      (concept?.months_to_pay && concept?.months_to_pay.length > 0) ||
      (concept?.orders?.length === 1 && concept?.orders[0]?.due)
    ) {
      return true;
    } else {
      return false;
    }
  };

  type Order = {
    attributes: { id: string; name: string; type: string }[];
  };

  type InputData = {
    orders: Order[];
  };

  type Result = { type: string; names: string[] }[];

  function extractAttributes(data: InputData): Result {
    const attributesMap: Map<string, Set<string>> = new Map();

    for (const order of data.orders) {
      for (const attr of order.attributes) {
        if (!attributesMap.has(attr.type)) {
          attributesMap.set(attr.type, new Set());
        }
        attributesMap.get(attr.type)?.add(attr.name);
      }
    }

    const result: Result = [];

    attributesMap.forEach((namesSet, type) => {
      result.push({ type: type, names: Array.from(namesSet) });
    });

    return result;
  }

  const formatName = (input: string) =>
    input
      .split(' - ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' / ');
  const deleteConceptMutation = api.concepts.deleteConcept.useMutation({
    onSuccess: async () => {
      await utils.schools.invalidate();
    },
  });
  const handleOpenDeleteConceptModal = async () => {
    setOpenDialog(true);
  };
  const handleDeleteConcept = async () => {
    setOpenDialog(false);
    await deleteConceptMutation.mutate({ schoolId: selectedSchoolId as string, conceptId: conceptId });
    setAlertState({
      open: true,
      severity: 'success',
      message: (
        <>
          Se ha eliminado el concepto <strong>{concept?.name || ''}</strong>
        </>
      ),
    });

    setOpenDialog(false);
    router.push('/concepts');
  };
  const formIsDirty = !!formData?.orders || !!formData?.students;

  const { tab, handleChangeTab } = useTab('information');
  const tabsConceptsData = [
    {
      value: 'information',
      label: 'Información general',
    },
    ...(concept?.optional
      ? [
          {
            value: 'variants',
            label: `Variantes${ordersWithVariantsAndStock?.length ? ` (${ordersWithVariantsAndStock.length})` : ''}`,
          },
        ]
      : [
          {
            value: 'orders',
            label: `Órdenes${concept?.orders ? ` (${concept.orders.length})` : ''}`,
          },
        ]),
    {
      value: 'student-assigned',
      label: `Estudiantes asignados${studentsAssignedCount ? ` (${studentsAssignedCount})` : ''}`,
      onClick: async () => {
        await utils.schools.schoolsConceptsStudentsAssignedList.invalidate({
          schoolId: selectedSchoolId as string,
          conceptId: concept?.id,
        });
        await utils.schools.schoolsConceptsStudentsAssignedIdsList.invalidate({
          schoolId: selectedSchoolId as string,
          conceptId: concept?.id,
        });
      },
    },
  ];

  const hasFallbackBankAccount = Boolean(concept?.payout_config?.not_invoicing_bank_account);
  const hasSomeAutoAssignedConcept =
    concept?.optional &&
    concept?.auto_assigned_concepts.some(
      (level) =>
        level.is_all_assigned ||
        level.grades.some(
          (grade) => grade.is_all_assigned || grade.sections.some((section) => section.is_already_assigned)
        )
    );

  const allowAction = concept?.can_be_deleted;
  const label = 'Eliminar concepto';

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async (data: ConceptEditChanges) => {
    await updateConceptMutation.mutate({ id: conceptId, updateFields: data });
  };

  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const { data: bankAccounts } = api.schools.bankAccountList.useQuery(
    { school_id: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );
  const updateConceptMutation = api.concepts.updateConcept.useMutation({
    onSuccess: async () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Concepto actualizado exitosamente',
      });
      await utils.schools.schoolsConceptDetail.invalidate();
      setIsEditing(false);
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Hubo un error al actualizar el concepto',
      });
    },
  });

  const invalidateConcept = async () => {
    await utils.schools.schoolsConceptDetail.invalidate({
      school_id: selectedSchoolId as string,
      concept_id: conceptId,
    });
  };

  const handleOpenEditEarlyBirdDiscountSidePanel = (index?: number) => {
    setOpenEditEarlyBirdDiscountSidePanel(true);
    setCurrentEarlyBirdDiscount(index);
  };

  const handleCloseEditEarlyBirdDiscountSidePanel = async () => {
    setOpenEditEarlyBirdDiscountSidePanel(false);
    await invalidateConcept();
  };

  const handleDeleteEarlyBirdDiscount = async (index: number) => {
    const earlyBirdDiscounts = concept?.early_bird_discounts;
    earlyBirdDiscounts?.splice(index, 1);
    await editEarlyBirdDiscountMutation.mutate(
      {
        id: conceptId,
        updateFields: {
          early_bird_discounts: earlyBirdDiscounts,
        },
      },
      {
        onSuccess: async () => {
          await invalidateConcept();
          setKey(Math.random().toString(36).substring(7));
        },
      }
    );
  };
  const [key, setKey] = useState('random');
  const {
    toggle: openConceptCreationEdit,
    onClose: onCloseConceptCreationEdit,
    onOpen: onOpenConceptCreationEdit,
  } = useToggle();

  const transformConceptToFormData = useMemo(() => {
    if (!concept) return {};

    const startMonth =
      concept.type === 'INSCRIPTION' || concept.type === 'REINSCRIPTION'
        ? SCHOOL_CYCLE_CONSTANTS.INSCRIPTION_START_MONTH
        : SCHOOL_CYCLE_CONSTANTS.REGULAR_START_MONTH;

    const generateAvailableMonths = (schoolYear: number, conceptType: string, startMonth: number) => {
      const isInscriptionType = conceptType === 'INSCRIPTION' || conceptType === 'REINSCRIPTION';
      const totalMonths = isInscriptionType
        ? SCHOOL_CYCLE_CONSTANTS.INSCRIPTION_TOTAL_MONTHS
        : SCHOOL_CYCLE_CONSTANTS.REGULAR_CONCEPT_TOTAL_MONTHS_WITH_END;

      return Array.from({ length: totalMonths }).map((_, index) => {
        const monthNumber = (startMonth + index) % 12;
        const cyclesPassed = Math.floor((startMonth + index) / 12);
        const adjustedYear = schoolYear + (monthNumber < startMonth ? 1 : 0) + cyclesPassed;
        const date = new Date(adjustedYear, monthNumber);

        return {
          value: {
            id: Math.random().toString(36).substring(7),
            name: format(date, 'MMMM yyyy', { locale: es }),
            monthNumber,
            date: date.toISOString(),
          },
          label: format(date, 'MMMM yyyy', { locale: es }),
        };
      });
    };

    const availableMonths = generateAvailableMonths(
      concept.school_cycle.year_start || SCHOOL_CYCLE_CONSTANTS.DEFAULT_SCHOOL_YEAR,
      concept.type,
      startMonth
    );

    const extractMonthYearFromOrderName = (orderName: string) => {
      const match = orderName.match(/- ([a-zA-Z]+), (\d{4})$/);
      if (match) {
        const monthName = match[1].toLowerCase();
        const year = parseInt(match[2]);

        const monthMap: { [key: string]: number } = {
          enero: 0,
          febrero: 1,
          marzo: 2,
          abril: 3,
          mayo: 4,
          junio: 5,
          julio: 6,
          agosto: 7,
          septiembre: 8,
          octubre: 9,
          noviembre: 10,
          diciembre: 11,
        };

        if (monthName in monthMap) {
          return { month: monthMap[monthName], year };
        }
      }
      return null;
    };

    const selectedMonths = concept.months_to_pay
      ?.map((_, index) => {
        const originalOrder = concept.orders?.[index];
        if (!originalOrder?.due || !concept.school_cycle?.year_start) return null;

        const cycleStartYear = concept.school_cycle.year_start;
        const originalDate = parseISO(originalOrder.due);
        const orderNameInfo = extractMonthYearFromOrderName(originalOrder.name);
        const orderNameYear = orderNameInfo?.year || SCHOOL_CYCLE_CONSTANTS.DEFAULT_SCHOOL_YEAR;
        const dueMonth = originalDate.getMonth();
        const dueYear = originalDate.getFullYear();
        const dueDay = originalDate.getDate();

        const isSecondYear = orderNameYear > concept.school_cycle.year_start;
        const isAnomalousDate = dueMonth !== orderNameInfo?.month || dueYear !== orderNameYear;
        const dueDateInfo = {
          isAnomalous: isAnomalousDate,
          nominalMonth: orderNameInfo?.month,
          nominalYear: orderNameYear,
          dueMonth: dueMonth,
          dueYear: dueYear,
          dueDay: dueDay,
          cycleStartYear: cycleStartYear,
        };

        const nominalMonthOption = availableMonths.find((m) => {
          const monthDate = parseISO(m.value.date);
          return monthDate.getMonth() === orderNameInfo?.month;
        });

        if (!nominalMonthOption) return null;

        const monthDate = new Date(orderNameYear, orderNameInfo?.month || 0);
        const formattedName = format(monthDate, 'MMMM yyyy', { locale: es });

        return {
          value: {
            ...nominalMonthOption.value,
            name: formattedName,
            date: monthDate.toISOString(),
            wasSecondYear: isSecondYear,
            dueDateInfo: dueDateInfo,
          },
          label: formattedName,
        };
      })
      .filter(Boolean);

    const interestSchema =
      concept.interest_schema && concept.interest_schema.length > 0 ? [...concept.interest_schema] : [];

    return {
      id: Math.random().toString(36).substring(7),
      type: concept.type,
      school_cycle: '',
      is_billable: concept.is_billable ? 'true' : 'false',
      does_invoice_as_general_public: concept.does_invoice_as_general_public ? 'true' : 'false',
      payment_only_in_dashboard: String(concept.payment_only_in_dashboard),
      bank_account: concept.bank_account.id,
      has_months_to_pay: concept.orders.length > 1 ? 'true' : 'false',
      entity: concept.entity.id,
      root_concept: concept.optional ? 'optional' : 'required',
      has_surcharge: interestSchema.length > 0 ? 'true' : 'false',
      interest_type: interestSchema[0]?.type || '',
      interest_value: interestSchema[0]?.value ? String(interestSchema[0].value) : '',
      month_offset: interestSchema[0]?.day_offset || '',
      has_rvoe: concept.institutional_id ? 'true' : 'false',
      rvoe: concept.institutional_id || '',
      compounding: interestSchema[0]?.compounding || '',
      has_sales_tax: concept.has_sales_tax ? 'true' : 'false',
      series_selector: concept.series ? 'true' : 'false',
      series: concept.series || '',
      early_bird_discounts: [...(concept.early_bird_discounts || [])],
      months_to_pay: selectedMonths,
      unit_type: concept.tax_unit,
      product_key: concept.tax_code,
      payday: String(concept.payday),
      orders: [],
      year_start: '',
      price: Number(concept.price),
      not_invoicing_bank_account: concept.payout_config?.not_invoicing_bank_account?.id,
      concept_start_month: startMonth,
      available_months: availableMonths,
      available_in_online_store: concept.offering === 'OPEN_LOOP' || concept.offering === 'MIX' ? 'true' : 'false',
    } as const;
  }, [concept, key]);

  const { data: fulfillments } = api.concepts.conceptFulfillments.useQuery(
    {
      conceptId: conceptId,
      schoolId: selectedSchoolId as string,
      statuses: [FulfillmentStatusesEnum.WAITING_PAID],
    },
    { enabled: !!conceptId && !!selectedSchoolId }
  );

  const handleOpenEditInterestSidePanel = (index?: number) => {
    setOpenEditInterestSidePanel(true);
    setCurrentInterestSchema(index);
  };

  const handleCloseEditInterestSidePanel = async () => {
    setOpenEditInterestSidePanel(false);
    await invalidateConcept();
  };

  const handleDeleteInterestSchema = async (index: number) => {
    const interestSchema = concept?.interest_schema;
    interestSchema?.splice(index, 1);
    await editEarlyBirdDiscountMutation.mutate(
      {
        id: conceptId,
        updateFields: {
          interest_schema: interestSchema,
        },
      },
      {
        onSuccess: async () => {
          await invalidateConcept();
          setKey(Math.random().toString(36).substring(7));
        },
      }
    );
  };

  const hasWaitingPayments = Boolean(fulfillments?.count);

  const addInterestButtonWithTooltip = (
    <TooltipButton
      onClick={() => handleOpenEditInterestSidePanel()}
      tooltipMessage="No disponible porque hay pagos en proceso."
      disabled={hasWaitingPayments}
      buttonText="Añadir interés"
      leftIcon={<IcPlus fill="currentColor" />}
      className="flex gap-2 justify-content"
      size="small"
      variant="outline"
      color="legacy"
    />
  );

  const addEarlyBirdDiscountButtonWithTooltip = (
    <TooltipButton
      onClick={() => handleOpenEditEarlyBirdDiscountSidePanel()}
      tooltipMessage="No disponible porque hay pagos en proceso."
      disabled={hasWaitingPayments}
      buttonText="Añadir descuento"
      leftIcon={<IcPlus fill="currentColor" />}
      className="flex gap-2 justify-content"
      size="small"
      variant="outline"
      color="legacy"
    />
  );

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
        <ConceptAssignmentOnboardingVideo onComplete={() => setShowOnboarding(false)} />
      </Sentry.ErrorBoundary>
    );
  }

  if (isLoadingConceptDetail) {
    return <ConceptDetailSkeleton />;
  }

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) =>
        scope.setContext('state', {
          session,
          conceptId,
        })
      }
    >
      <div className="min-h-screen font-lota">
        <div className="h-[60px] bg-white flex items-center justify-start">
          <button className="flex pl-10" onClick={handleBackToList}>
            <span className="flex">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.8333 9.16732H7.5L10.2417 6.42566C10.3198 6.34819 10.3818 6.25602 10.4241 6.15447C10.4664 6.05292 10.4882 5.944 10.4882 5.83399C10.4882 5.72398 10.4664 5.61506 10.4241 5.51351C10.3818 5.41196 10.3198 5.3198 10.2417 5.24233C10.0855 5.08712 9.87432 5 9.65417 5C9.43401 5 9.2228 5.08712 9.06667 5.24233L5.49167 8.82566C5.17868 9.13678 5.00186 9.55934 5 10.0007C5.00406 10.4391 5.1807 10.8582 5.49167 11.1673L9.06667 14.7506C9.14437 14.8278 9.2365 14.8889 9.33781 14.9304C9.43912 14.972 9.54762 14.9932 9.65711 14.9928C9.76661 14.9924 9.87496 14.9704 9.97597 14.9282C10.077 14.8859 10.1687 14.8242 10.2458 14.7465C10.323 14.6688 10.3841 14.5766 10.4256 14.4753C10.4672 14.374 10.4883 14.2655 10.488 14.156C10.4876 14.0465 10.4656 13.9382 10.4234 13.8372C10.3811 13.7362 10.3194 13.6445 10.2417 13.5673L7.5 10.834H15.8333C16.0543 10.834 16.2663 10.7462 16.4226 10.5899C16.5789 10.4336 16.6667 10.2217 16.6667 10.0007C16.6667 9.77964 16.5789 9.56768 16.4226 9.4114C16.2663 9.25512 16.0543 9.16732 15.8333 9.16732Z"
                  fill="#A2ABB9"
                />
              </svg>
              <span className="font-lota font-semibold text-[12px] leading-[18px] uppercase text-[#A2ABB9] flex-none order-1 flex-grow-0">
                Volver
              </span>
            </span>
          </button>
        </div>
        <div className="flex sticky z-20 flex-col bg-white">
          <div className="flex justify-between max-h-[72px]">
            <p
              className="py-5 pl-10 text-2xl font-bold truncate max-w-[550px] xl:max-w-[850px] 2xl:max-w-[900px]"
              title={concept?.name}
            >
              {concept?.name}
            </p>
            {concept && !concept?.optional && (
              <CreateConcept
                key={transformConceptToFormData?.id + key}
                formDataDefault={transformConceptToFormData as Partial<FormValues>}
                onCloseConceptCreationEdit={onCloseConceptCreationEdit}
                openConceptCreationEdit={openConceptCreationEdit}
                onOpenConceptCreationEdit={onOpenConceptCreationEdit}
                currentSchoolCycleId={concept.school_cycle.id}
              />
            )}
            <div className="flex gap-3 px-3 py-4">
              {permissions?.can_add_concept_assignment ? (
                <div className="flex gap-3">
                  <Button onClick={onOpenAssingOrders} className="flex gap-2 h-10" data-testid="assignStudent-btn">
                    <IcStudents />
                    Asignar estudiantes
                  </Button>
                  <ThreeDotsDropdown>
                    <DropdownMenu.Item
                      className="text-gray-900 rounded-md flex items-center justify-center outline-none data-[disabled]:text-[#919EAB] data-[disabled]:pointer-events-none data-[highlighted]:bg-white data-[highlighted]:text-gray-700"
                      disabled={concept?.optional}
                    >
                      <button
                        className="flex gap-1 px-6 py-3 w-full"
                        data-testid="duplicate-concept-button"
                        onClick={() => {
                          sendTrackEventWithUserName(TrackEvents.concepts.duplicateStarted, {
                            concept_id: concept?.id,
                            concept_name: concept?.name,
                          });
                          onOpenConceptCreationEdit();
                        }}
                        disabled={concept?.optional}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_755_8136)">
                            <path
                              d="M10.8337 16.6668C11.9383 16.6655 12.9974 16.2261 13.7785 15.445C14.5596 14.6638 14.999 13.6048 15.0003 12.5001V5.20264C15.0016 4.7646 14.916 4.33067 14.7483 3.92599C14.5807 3.5213 14.3343 3.15392 14.0237 2.84514L12.1553 0.976803C11.8465 0.666115 11.4792 0.419806 11.0745 0.252153C10.6698 0.0845011 10.2359 -0.00115956 9.79783 0.000136562H5.83366C4.729 0.00145978 3.66996 0.440872 2.88884 1.22199C2.10773 2.0031 1.66832 3.06214 1.66699 4.1668V12.5001C1.66832 13.6048 2.10773 14.6638 2.88884 15.445C3.66996 16.2261 4.729 16.6655 5.83366 16.6668H10.8337ZM3.33366 12.5001V4.1668C3.33366 3.50376 3.59705 2.86788 4.06589 2.39904C4.53473 1.9302 5.17062 1.6668 5.83366 1.6668C5.83366 1.6668 9.93283 1.67847 10.0003 1.6868V3.33347C10.0003 3.7755 10.1759 4.19942 10.4885 4.51198C10.801 4.82454 11.225 5.00014 11.667 5.00014H13.3137C13.322 5.06764 13.3337 12.5001 13.3337 12.5001C13.3337 13.1632 13.0703 13.7991 12.6014 14.2679C12.1326 14.7367 11.4967 15.0001 10.8337 15.0001H5.83366C5.17062 15.0001 4.53473 14.7367 4.06589 14.2679C3.59705 13.7991 3.33366 13.1632 3.33366 12.5001ZM18.3337 6.6668V15.8335C18.3323 16.9381 17.8929 17.9972 17.1118 18.7783C16.3307 19.5594 15.2717 19.9988 14.167 20.0001H6.66699C6.44598 20.0001 6.23402 19.9123 6.07774 19.7561C5.92146 19.5998 5.83366 19.3878 5.83366 19.1668C5.83366 18.9458 5.92146 18.7338 6.07774 18.5775C6.23402 18.4213 6.44598 18.3335 6.66699 18.3335H14.167C14.83 18.3335 15.4659 18.0701 15.9348 17.6012C16.4036 17.1324 16.667 16.4965 16.667 15.8335V6.6668C16.667 6.44579 16.7548 6.23383 16.9111 6.07755C17.0674 5.92127 17.2793 5.83347 17.5003 5.83347C17.7213 5.83347 17.9333 5.92127 18.0896 6.07755C18.2459 6.23383 18.3337 6.44579 18.3337 6.6668Z"
                              fill="#1C1C1D"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_755_8136">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        Duplicar concepto
                      </button>
                    </DropdownMenu.Item>
                    <div className={`${!allowAction ? 'cursor-not-allowed' : ''}`}>
                      <Tooltip
                        message="Este concepto no puede ser eliminado debido a que tiene estudiantes asignados y/o pagos registrados anteriormente. Si necesitas ayuda con este concepto, escríbenos a nuestro chat."
                        disableHover={allowAction}
                      >
                        <DropdownMenu.Item
                          disabled={!allowAction}
                          className="text-red-500 rounded-md flex items-center justify-center outline-none data-[disabled]:text-[#919EAB] data-[disabled]:pointer-events-none data-[highlighted]:bg-white data-[highlighted]:text-red-600"
                        >
                          <button
                            className="flex gap-1 px-6 py-3 w-full"
                            data-testid={`${label}-button`}
                            onClick={handleOpenDeleteConceptModal}
                            disabled={!allowAction}
                          >
                            <IcTrash className={`${!allowAction ? 'text-[#919EAB]' : 'text-error'}`} />
                            {label}
                          </button>
                        </DropdownMenu.Item>
                      </Tooltip>
                    </div>
                  </ThreeDotsDropdown>
                </div>
              ) : null}
            </div>
          </div>
          <Tabs
            tabs={tabsConceptsData}
            tab={tab}
            handleChangeTab={handleChangeTab}
            defaultValue="information"
            tabsListClassName="px-10"
          />
        </div>
        {tab === 'information' && (
          <div className="grid grid-cols-5 gap-6">
            {concept?.optional === true &&
              concept?.orders?.length > 1 &&
              ordersWithZeroStock &&
              ordersWithZeroStock.length > 0 && (
                <div className="col-span-5 px-10 pt-8">
                  <CAlert
                    message="Algunas de las variantes de este concepto se encuentran sin stock. Revisa la pestaña de variantes para modificar las variantes."
                    type="warning"
                  />
                </div>
              )}
            {concept?.optional === true &&
              concept?.orders?.length === 1 &&
              ordersWithZeroStock &&
              ordersWithZeroStock.length > 0 && (
                <div className="col-span-5 px-10 pt-8">
                  <CAlert
                    message="Este concepto se encuentra sin stock. Si deseas puedes modificar el stock para continuar recibiendo pagos."
                    type="warning"
                  />
                </div>
              )}
            <div
              className={cn('col-span-3 pb-8 pl-10 pt-8 space-y-8', {
                'pt-0': concept?.optional === true && ordersWithZeroStock && ordersWithZeroStock.length > 0,
              })}
            >
              <div>
                {isEditing ? (
                  <ConceptEditForm
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    handleSaveEdit={handleSaveEdit}
                    updateConceptMutation={updateConceptMutation}
                    conceptTypesList={conceptTypesList}
                    schoolCycles={schoolCycles}
                    bankAccounts={bankAccounts}
                    concept={concept as DetailConcept}
                  />
                ) : (
                  <SectionLayout
                    title="Datos generales"
                    edit={
                      !isEditing && concept ? (
                        <Button
                          onClick={handleEditClick}
                          variant="outline"
                          className="gap-2 h-7 border-none text-green"
                        >
                          <IcEdit className="w-5 h-5" />
                          Editar
                        </Button>
                      ) : null
                    }
                  >
                    <div className="flex items-center">
                      <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de concepto</p>
                      <p className="text-sm font-semibold">
                        {conceptTypesList?.find((category) => category.id === concept?.type)?.name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Ciclo</p>
                      <p className="text-sm font-semibold">{concept?.school_cycle?.name}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">
                        Opcional / <br />
                        Obligatorio
                      </p>
                      <p className="text-sm font-semibold">{concept?.optional ? 'Opcional' : 'Obligatorio'}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de concepto</p>
                      <div>
                        {concept?.payment_only_in_dashboard ? (
                          <Status variant="success">Directo al colegio</Status>
                        ) : (
                          <div className="flex gap-1">
                            <Status variant="info">Portal de Cometa</Status>
                            <Status variant="success">Directo al colegio</Status>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isLoadingConceptDetail && (
                      <>
                        <div className="flex items-start">
                          <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">
                            Cuenta de abono
                            {hasFallbackBankAccount ? (
                              <>
                                {' '}
                                para pagos <strong>facturados</strong> desde Cometa a un RFC
                              </>
                            ) : null}
                          </p>
                          {concept?.payment_only_in_dashboard ? (
                            <p>-</p>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold">{concept?.bank_account?.public_summary}</p>
                              <p className="text-xs font-normal">{concept?.bank_account?.account_number}</p>
                            </div>
                          )}
                        </div>
                        {hasFallbackBankAccount ? (
                          <div className="flex items-start">
                            <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">
                              Cuenta de abono para pagos <strong>no facturados</strong> desde Cometa a un RFC
                            </p>
                            <div>
                              <p className="text-sm font-semibold">
                                {concept?.payout_config?.not_invoicing_bank_account.public_summary}
                              </p>
                              <p className="text-xs font-normal">
                                {concept?.payout_config?.not_invoicing_bank_account?.account_number}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                    {isOnlineStoreEnabled && (
                      <div className="flex items-center">
                        <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">
                          Disponible en la tienda en línea
                        </p>
                        <p className="text-sm font-semibold">
                          {concept?.offering === 'OPEN_LOOP' || concept?.offering === 'MIX' ? (
                            <div className="flex gap-1 items-center">
                              Si <IcCheck />
                            </div>
                          ) : (
                            <div className="flex gap-1 items-center">
                              No <IcClose />
                            </div>
                          )}
                        </p>
                      </div>
                    )}
                  </SectionLayout>
                )}
              </div>
              {concept?.optional && addAutoAssignConceptEnabled && (
                <SectionLayout title="Auto asignación">
                  {hasSomeAutoAssignedConcept &&
                    (permissions.can_add_concept_assignment || permissions.can_delete_concept_assignment) && (
                      <button
                        className="inline-flex items-center p-1 pr-2 text-sm font-bold transition-colors bg-transparent text-green hover:text-green-400 disabled:text-[#919EABCC] disabled:cursor-not-allowed disabled:hover:text-[#919EABCC]"
                        onClick={onOpenAutoAssignmentEdit}
                        disabled={isLoadingConceptDetail}
                      >
                        <IcEdit className="mr-2" /> Editar
                      </button>
                    )}
                  <div className=" w-full pl-4 pr-3 py-[13px] bg-[#d0f2ff] rounded-lg justify-start items-center gap-x-3 inline-flex">
                    <div className="relative w-6 h-6">
                      <Info className="text-[#1890FF]" />
                    </div>
                    <p className="text-[#04297a] text-sm">
                      Aquí podrás configurar la asignación automática para todos los estudiantes que estén en los
                      niveles y secciones que desees.
                    </p>
                  </div>
                  {!isLoadingConceptDetail && (
                    <>
                      {hasSomeAutoAssignedConcept ? (
                        <div>
                          <CardsAutoAssignWithChips autoAssignLevels={concept.auto_assigned_concepts} />
                        </div>
                      ) : (
                        <>
                          {permissions?.can_add_concept_assignment && (
                            <button
                              className="flex flex-row items-center p-1 pr-2 text-sm font-bold transition-colors bg-transparent text-green hover:text-green-400 disabled:text-[#919EABCC] disabled:cursor-not-allowed disabled:hover:text-[#919EABCC]"
                              onClick={onOpenAutoAssignmentCreate}
                            >
                              <Plus className="mr-2 w-3" /> Agregar
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </SectionLayout>
              )}
              <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
                <Dialog.Title>¿Deseas descartar los cambios?</Dialog.Title>
                <Dialog.Description>Los cambios que realizaste se perderán si continúas.</Dialog.Description>
                <div className="flex gap-3 justify-end">
                  <Dialog.Close asChild>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Volver
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsEditing(false);
                        setOpenDialog(false);
                      }}
                    >
                      Descartar
                    </Button>
                  </Dialog.Close>
                </div>
              </Dialog.Root>

              {concept && (
                <BillingInformationSection
                  concept={concept}
                  isEditing={isEditingBillingInfo}
                  onEdit={() => setIsEditingBillingInfo(true)}
                  onSaveSuccess={() => setIsEditingBillingInfo(false)}
                />
              )}

              {concept?.optional !== true && concept?.interest_schema && concept?.interest_schema?.length > 0 ? (
                <InterestSchemas
                  interestSchemes={concept.interest_schema}
                  fulfillmentCount={fulfillments?.count || 0}
                  onEditInterest={(index) => {
                    handleOpenEditInterestSidePanel(index);
                  }}
                  onDeleteInterest={(index) => {
                    setCurrentInterestSchemaIndexToDelete(index);
                    setOpenDeleteInterestDialog(true);
                  }}
                  actionButton={addInterestButtonWithTooltip}
                />
              ) : concept?.optional !== true ? (
                <SectionLayout title="Esquema de intereses">
                  <div className="mr-20">
                    <p className="mb-4 text-sm text-gray-600">No tienes ningún interés creado.</p>
                    {addInterestButtonWithTooltip}
                  </div>
                </SectionLayout>
              ) : null}

              {concept?.optional !== true &&
              concept?.early_bird_discounts &&
              concept?.early_bird_discounts.length > 0 ? (
                <EarlyBirdDiscounts
                  discounts={concept.early_bird_discounts}
                  isSingleOrder={isSingleOrder}
                  orderDueDate={concept?.orders?.[0]?.due || ''}
                  onEditDiscount={(index) => {
                    handleOpenEditEarlyBirdDiscountSidePanel(index);
                  }}
                  onDeleteDiscount={(index) => {
                    setCurrentEarlyBirdDiscountIndexToDelete(index);
                    setOpenDeleteEarlyBirdDialog(true);
                  }}
                  fulfillmentCount={fulfillments?.count || 0}
                  actionButton={addEarlyBirdDiscountButtonWithTooltip}
                />
              ) : concept?.optional !== true ? (
                <SectionLayout title="Descuento pronto pago">
                  <div className="mr-20">
                    <p className="mb-4 text-sm text-gray-600">No tienes ningún descuento pronto pago creado.</p>
                    {addEarlyBirdDiscountButtonWithTooltip}
                  </div>
                </SectionLayout>
              ) : null}

              {Array.isArray(concept?.orders?.[0]?.attributes) && concept?.orders[0]?.attributes?.length !== 0 && (
                <SectionLayout title="Atributos">
                  <div className="col-span-2 w-full">
                    {concept?.orders &&
                      extractAttributes({ orders: concept?.orders }).map((attribute, index) => (
                        <div key={index} className="p-4 rounded-lg border-2">
                          <span className="text-base font-semibold">{attribute.type}</span>
                          <div className="flex flex-row flex-wrap gap-1 mt-2">
                            {attribute.names.map((name, index) => (
                              <span key={index} className="bg-[#919EAB29] rounded-[50px] py-[5px] px-[12px]">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </SectionLayout>
              )}
            </div>
            <div
              className={cn('col-span-2 pb-8 pr-10 pt-8', {
                'pt-0': concept?.optional === true && ordersWithZeroStock && ordersWithZeroStock.length > 0,
              })}
            >
              {concept && (
                <OrdersSection
                  concept={concept}
                  checkIfHasMonthsToPay={checkIfHasMonthsToPay}
                  formatName={formatName}
                />
              )}
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div>
            <ConceptOrdersTable />
          </div>
        )}
        {tab === 'student-assigned' && (
          <div>
            <StudentAssignedTable
              setStudentsAssignedCount={setStudentsAssignedCount}
              hasAttributes={concept && concept.optional}
            />
          </div>
        )}
        {tab === 'variants' && <StudentConceptsVariantsTable />}
        {openAutoAssignmentCreate && !openAutoAssignmentEdit && concept && (
          <CreateAutoAssignmentSidePanel
            concept={concept}
            open={openAutoAssignmentCreate}
            onClose={onCloseAutoAssignmentCreate}
          />
        )}
        {openAutoAssignmentEdit && !openAutoAssignmentCreate && concept && (
          <EditAutoAssignmentSidePanel
            open={openAutoAssignmentEdit}
            onClose={onCloseAutoAssignmentEdit}
            concept={concept}
          />
        )}
        {openAssignOrders && (
          <Sheet
            open={openAssignOrders}
            onOpenChange={(open) => {
              if (!open && !formIsDirty) {
                onCloseAssignOrders();
              } else {
                setAlertToCloseSheet(true);
              }
            }}
          >
            <Sheet.Content large>
              <div className="px-8">
                <SidebarHeader
                  title="Asignación masiva de conceptos"
                  onClose={() => {
                    if (!formIsDirty) {
                      onCloseAssignOrders();
                    } else {
                      setAlertToCloseSheet(true);
                    }
                  }}
                />
              </div>
              {currentStep === Steps.Step1 && (
                <Step1OrderSelection
                  setData={handleData}
                  onNext={handleNext}
                  onBack={handleBack}
                  setAlertToCloseSheet={setAlertToCloseSheet}
                  formData={formData}
                />
              )}
              {currentStep === Steps.Step2 && (
                <Step2StudentSelection
                  setData={handleData}
                  onNext={handleNext}
                  onBack={handleBack}
                  formData={formData}
                />
              )}
              {currentStep === Steps.Step3 && (
                <Step3AssignDetail
                  onNext={handleCreate}
                  onBack={handleBack}
                  formData={formData}
                  concept={concept}
                  saving={createAssignMutation.isPending}
                />
              )}
            </Sheet.Content>
          </Sheet>
        )}
        <Dialog.Root open={alertToCloseSheet} position="center" classNames="right-12">
          <Dialog.Title>¿Estás seguro que deseas cancelar la asignación masiva de estudiantes?</Dialog.Title>
          <Dialog.Description>
            Se cancelará el proceso y no se asignará el concepto <span className="font-semibold">{concept?.name}</span>{' '}
            a los{' '}
            <span className="font-semibold">
              {formData?.students &&
                formData?.students?.filter(
                  (student) => !student.total_student_by_section && !student.total_student_by_level
                ).length}
            </span>{' '}
            estudiantes seleccionados.
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
                onCloseAssignOrders();
                setFormData({});
                setCurrentStep(Steps.Step1);
                setAlertToCloseSheet(false);
              }}
            >
              Si, cancelar
            </Button>
          </div>
        </Dialog.Root>
        <Dialog.Root open={openDialog} position="center" onOpenChange={(state) => setOpenDialog(state)}>
          <Dialog.Title>¿Estás seguro que deseas eliminar este concepto?</Dialog.Title>
          <Dialog.Description>
            Al eliminar un concepto se borra todo registro del mismo. Ya no podrá asignarse a ningún estudiante ni se
            mostrará en la lista de conceptos del colegio.
          </Dialog.Description>
          <div className="flex gap-x-10 justify-center">
            <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
              Cancelar
            </Dialog.Close>
            <button
              className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-red-500 shadow-[0_8px_16px_#FF48423D]"
              onClick={handleDeleteConcept}
            >
              Sí, eliminar
            </button>
          </div>
        </Dialog.Root>
        <Dialog.Root open={openDialog} position="center" onOpenChange={(state) => setOpenDialog(state)}>
          <Dialog.Title>¿Estás seguro que deseas eliminar este concepto?</Dialog.Title>
          <Dialog.Description>
            Al eliminar un concepto se borra todo registro del mismo. Ya no podrá asignarse a ningún estudiante ni se
            mostrará en la lista de conceptos del colegio.
          </Dialog.Description>
          <div className="flex gap-x-10 justify-center">
            <Dialog.Close
              className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
              data-testid="cancel-Dialogbutton"
            >
              Cancelar
            </Dialog.Close>
            <button
              className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-red-500 shadow-[0_8px_16px_#FF48423D]"
              onClick={handleDeleteConcept}
              data-testid="yesDelete-Dialogbutton"
            >
              Sí, eliminar
            </button>
          </div>
        </Dialog.Root>
        {openEditEarlyBirdDiscountSidePanel ? (
          <EarlyBirdDiscountSidePanel
            conceptId={conceptId}
            index={currentEarlyBirdDiscount}
            earlyBirdDiscounts={concept?.early_bird_discounts || []}
            onClose={handleCloseEditEarlyBirdDiscountSidePanel}
            open={openEditEarlyBirdDiscountSidePanel}
          />
        ) : null}
        <Dialog.Root
          open={openDeleteEarlyBirdDialog}
          position="center"
          onOpenChange={(state) => setOpenDeleteEarlyBirdDialog(state)}
        >
          <div className="space-y-4">
            <Dialog.Title>Eliminar descuento pronto pago</Dialog.Title>
            <Dialog.Description>¿Estás seguro que deseas eliminar este descuento pronto pago?</Dialog.Description>
            <CAlert
              type="warning"
              message="Los cambios solo afectarán a los pagos que se realicen de ahora en adelante."
            />
            <div className="flex gap-x-10 justify-center">
              <Dialog.Close
                className="text-[#1C1C1D] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
                data-testid="cancel-Dialogbutton"
              >
                Volver
              </Dialog.Close>
              <button
                className="px-8 py-2 text-sm font-bold text-white bg-[#FD6262] rounded-full hover:opacity-90 whitespace-nowrap"
                onClick={() => {
                  handleDeleteEarlyBirdDiscount(currentEarlyBirdDiscountIndexToDelete);
                  setOpenDeleteEarlyBirdDialog(false);
                }}
                data-testid="yesDelete-Dialogbutton"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog.Root>
        {openEditInterestSidePanel ? (
          <InterestSidePanel
            conceptId={conceptId}
            index={currentInterestSchema}
            interestSchemas={concept?.interest_schema || []}
            onClose={handleCloseEditInterestSidePanel}
            open={openEditInterestSidePanel}
          />
        ) : null}

        <Dialog.Root
          open={openDeleteInterestDialog}
          position="center"
          onOpenChange={(state) => setOpenDeleteInterestDialog(state)}
        >
          <div className="space-y-4">
            <Dialog.Title>Eliminar interés</Dialog.Title>
            <Dialog.Description>¿Estás seguro que deseas eliminar el interés seleccionado?</Dialog.Description>
            <CAlert
              type="warning"
              message="Los cambios solo afectarán a los pagos que se realicen de ahora en adelante."
            />
            <div className="flex gap-x-10 justify-center">
              <Dialog.Close
                className="text-[#1C1C1D] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
                data-testid="cancel-Dialogbutton"
              >
                Volver
              </Dialog.Close>
              <button
                className="px-8 py-2 text-sm font-bold text-white bg-[#FD6262] rounded-full hover:opacity-90 whitespace-nowrap"
                onClick={() => {
                  handleDeleteInterestSchema(currentInterestSchemaIndexToDelete);
                  setOpenDeleteInterestDialog(false);
                }}
                data-testid="yesDelete-Dialogbutton"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog.Root>
      </div>
    </Sentry.ErrorBoundary>
  );
}

ConceptDetail.auth = true;

export default ConceptDetail;
