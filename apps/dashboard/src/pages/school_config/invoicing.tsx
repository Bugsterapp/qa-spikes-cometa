import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import CAlert from '../../components/atoms/CAlert';
import IcCloseXStroke from 'public/assets/icons/ic_close_x_stroke.svg';
import { ChevronRight, Search } from 'lucide-react';
import { FormRadioGroup, type RadioOption, FormActions, PageStateHandler } from '../../components/school_config';
import Layout from '../../components/layouts';
import { useSelectedSchool, useGetMembership } from '../../guards/AuthGuard';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import useAlert, { defaultAlertTime } from '../../hooks/useAlert';
import { api } from '../../utils/api';
import { useSendEvent } from '../../hooks/useSendEvent';
import useSendTrackEventWithUserName from '../../hooks/useSendTrackEventWithUserName';
import { TrackEvents } from '../../constants/events';
import { useOnboardingTaskPreLoad } from '../../hooks/onboarding/useOnboardingTaskPreLoad';
import { useOnboardingState } from '../../hooks/onboarding/useOnboardingState';
import { OnboardingTaskId, OnboardingTaskStatus } from '@cometa/trpc/src/bot/types';
import * as Sentry from '@sentry/nextjs';
import Sheet from '../../components/atoms/Sheet';
import {
  HistoryDrawerContent,
  type HistoryDrawerConfig,
  useHistoryDrawer,
  type HistoryDataResponse,
} from '@cometa/recreo';
import SidebarHeader from '../../components/molecules/dashboard/SidebarHeader';
import { DashboardSchool } from '@cometa/trpc/src/types';
import cfdiCategories from '../../utils/static_data/cfdiCategories';
import taxRegimeValues from '../../utils/static_data/taxRegimeValues';
import { CfdiDetailView } from '../../components/school_config/CfdiDetailView';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';

export enum InvoiceTime {
  IMMEDIATE = '',
  FIVE_PM = '17:00:00',
  NINE_PM = '21:00:00',
  ELEVEN_PM = '23:00:00',
}

const CFDI_ITEM_LABELS: Record<string, string> = {
  MONTHLY_FEE: 'Colegiaturas',
  INSCRIPTION: 'Inscripciones',
  REINSCRIPTION: 'Reinscripciones',
  BOOKS_AND_MATERIALS: 'Libros y materias',
  UNIFORMS_AND_MERCH: 'Uniformes y otras mercancias',
  EXAMS_AND_CERTIFICATES: 'Examenes y certificados',
  TRANSPORT: 'Transporte',
  SPORTS: 'Deportes',
  EXTRACURRICULAR: 'Extracurriculares',
  CAFETERIA: 'Cafeteria',
  PRE_DEBT: 'Deuda previa',
  OTHER: 'Otros',
};

const INVOICING_FIELD_MAP: Record<string, string> = {
  does_invoice: 'Emisión de facturas',
  can_invoice_to_general_public: 'Facturación a tutores sin datos',
  partial_payment_interest_freeze: 'Congelación de intereses en pagos parciales',
  'config_dashboard.emit_invoice_time': 'Momento de emisión en caja',
  'config_dashboard.enable_manual_pay_invoice': 'Registro en caja sin factura',
  invoice_discount_breakdown: 'Desglose de descuentos en facturas',
  // CFDI mappings: cfdi_use_config.{regimeCode}.{itemKey}
  ...taxRegimeValues.reduce<Record<string, string>>((acc, regime) => {
    Object.entries(CFDI_ITEM_LABELS).forEach(([itemKey, itemLabel]) => {
      acc[`cfdi_use_config.${regime.value}.${itemKey}`] = `${regime.value} - ${regime.name} - ${itemLabel}`;
    });
    return acc;
  }, {}),
};

const formatInvoicingValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'No especificado';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (field === 'emit_invoice_time' || field === 'config_dashboard.emit_invoice_time') {
    const timeMap: Record<string, string> = {
      '': 'En el mismo momento del pago',
      '17:00:00': '05:00 p.m. (CDMX)',
      '21:00:00': '09:00 p.m. (CDMX)',
      '23:00:00': '11:00 p.m. (CDMX)',
    };
    return timeMap[String(value)] || String(value);
  }

  // Handle individual CFDI item changes (e.g., cfdi_use_config.601.MONTHLY_FEE)
  if (field.startsWith('cfdi_use_config.') && field.split('.').length === 3) {
    const [, , itemKey] = field.split('.');
    const itemLabel = CFDI_ITEM_LABELS[itemKey] || itemKey;
    const code = String(value);
    const category = cfdiCategories.find((cat) => cat.value === code);
    const categoryName = category ? `${code} - ${category.name}` : code;
    return `${itemLabel}: ${categoryName}`;
  }

  return String(value);
};

type InvoiceConfigFormData = {
  doesInvoice?: 'true' | 'false';
  invoiceTime?: InvoiceTime;
  tutorWithoutInfo?: 'public_general' | 'do_not_invoice';
  paymentRegistration?: 'all_users' | 'some_users' | 'no_users';
  invoiceDiscountBreakdown?: 'true' | 'false';
};

const paymentRegistrationOptions: RadioOption[] = [
  { id: 'all_users', value: 'all_users', label: 'Todos los usuarios' },
  { id: 'some_users', value: 'some_users', label: 'Algunos usuarios' },
  { id: 'no_users', value: 'no_users', label: 'Ningún usuario' },
];

const invoiceDiscountBreakdownOptions: RadioOption[] = [
  { id: 'yes_breakdown', value: 'true', label: 'Sí' },
  { id: 'no_breakdown', value: 'false', label: 'No' },
];

const allowedMemberships = new Set(['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR']);

const getTutorWithoutInfoValue = (
  canInvoiceToGeneral: boolean | undefined
): InvoiceConfigFormData['tutorWithoutInfo'] => (canInvoiceToGeneral === true ? 'public_general' : 'do_not_invoice');

const getPaymentRegistrationValue = (
  enableManualPay: boolean | undefined
): InvoiceConfigFormData['paymentRegistration'] => (enableManualPay === true ? 'all_users' : 'no_users');

const getInvoiceDiscountBreakdownValue = (
  invoiceDiscountBreakdown: boolean | undefined
): InvoiceConfigFormData['invoiceDiscountBreakdown'] => (invoiceDiscountBreakdown === true ? 'true' : 'false');

const InvoiceTimeInfoBox = ({ selectedValue }: { selectedValue: string }) => {
  if (
    selectedValue === InvoiceTime.FIVE_PM ||
    selectedValue === InvoiceTime.NINE_PM ||
    selectedValue === InvoiceTime.ELEVEN_PM
  ) {
    return (
      <div className="w-full mt-2">
        <CAlert
          type="info"
          title="Importante:"
          message="Los cambios de horario no se aplicarán hasta el siguiente día a las 3am."
          className="items-start bg-[#E8F4FF]"
        />
      </div>
    );
  }

  return null;
};

const DoesInvoiceInfoBox = ({ selectedValue }: { selectedValue: 'true' | 'false' | undefined }) => {
  if (selectedValue === undefined || selectedValue === 'true') {
    return null;
  }

  return (
    <div className="w-full mt-2">
      <CAlert
        type="warning"
        title="No se emitirán facturas para pagos recibidos"
        message="Ningún pago registrado en el portal de Cometa ni por el colegio generará una factura."
        className="items-start"
      />
    </div>
  );
};

interface CfdiConfigItemProps {
  cfdiCode: string;
  cfdiName: string;
  onClick: () => void;
}

const CfdiConfigItem = ({ cfdiCode, cfdiName, onClick }: CfdiConfigItemProps) => (
  <button
    onClick={onClick}
    className="flex flex-row justify-between items-center px-4 py-3 gap-4 w-full h-16 border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-100 transition-colors"
  >
    <div className="flex-none w-10 h-10 rounded-full bg-neutral-25 flex items-center justify-center">
      <span className="text-neutral-800 font-semibold text-[14px]">{cfdiCode}</span>
    </div>

    <div className="flex-1 text-left">
      <span className="text-sm font-medium text-neutral-800">{cfdiName}</span>
    </div>

    <div className="flex-shrink-0">
      <ChevronRight className="w-5 h-5 text-neutral-500" />
    </div>
  </button>
);

const CfdiConfig = ({
  selectedSchool,
  cfdiUseNames,
  onSelectCfdi,
}: {
  selectedSchool: DashboardSchool | undefined;
  cfdiUseNames: Record<string, string>;
  onSelectCfdi: (cfdiCode: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  if (!selectedSchool) return null;

  const cfdiUseConfig = selectedSchool.cfdi_use_config || {};
  const DEFAULT_VISIBLE_CODES = ['601', '612', '625', '626'];
  const totalCfdiCount = Object.keys(cfdiUseConfig).length;
  const shouldApplyDefaultFilter = totalCfdiCount > 4;

  const filteredCfdiCodes = Object.keys(cfdiUseConfig).filter((cfdiCode) => {
    const cfdiName = cfdiUseNames[cfdiCode] || `Código ${cfdiCode}`;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = cfdiCode.toLowerCase().includes(searchLower) || cfdiName.toLowerCase().includes(searchLower);

    if (searchQuery) {
      return matchesSearch;
    }

    if (!showAll && shouldApplyDefaultFilter) {
      return DEFAULT_VISIBLE_CODES.includes(cfdiCode);
    }

    return true;
  });

  const hasMoreToShow =
    !searchQuery && !showAll && shouldApplyDefaultFilter && totalCfdiCount > filteredCfdiCodes.length;

  return (
    <div className="w-full mt-4 mb-8">
      <div className="mb-4">
        <h4 className="font-semibold text-base mb-2">Configuración de CFDI</h4>
        <p className="font-normal text-sm align-middle text-neutral-500 mb-3">
          Configura los usos de CFDI. Si no realizas cambios, se aplicarán los valores predeterminados
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por código o nombre del régimen fiscal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="space-y-3">
        {filteredCfdiCodes.map((cfdiCode) => {
          const cfdiName = cfdiUseNames[cfdiCode] || `Código ${cfdiCode}`;
          return (
            <CfdiConfigItem
              key={cfdiCode}
              cfdiCode={cfdiCode}
              cfdiName={cfdiName}
              onClick={() => onSelectCfdi(cfdiCode)}
            />
          );
        })}
        {filteredCfdiCodes.length === 0 && searchQuery && (
          <div className="text-left text-neutral-500 text-sm">
            No se encontraron resultados para "{searchQuery}". Por favor, verifica el término o intenta con otro.
          </div>
        )}
      </div>
      {hasMoreToShow && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 text-sm font-semibold leading-tight py-2 flex items-center justify-center gap-1 text-muted-foreground hover:text-neutral-700 transition-colors align-middle"
        >
          Ver todos los Regímenes Fiscales
          <ChevronRight className="w-4 h-4 rotate-90" />
        </button>
      )}
    </div>
  );
};

const InvoicingConfirmationDialog = ({
  isVisible,
  onConfirm,
  onCancel,
}: {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(34,40,58,0.8)] z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(34,40,58,0.1),0px_4px_6px_-4px_rgba(34,40,58,0.1)] border border-[#d0d8e9] w-[425px] max-w-[425px] p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
        >
          <IcCloseXStroke className="w-full h-full" />
        </button>

        <div className="flex flex-col gap-1.5 items-start justify-start text-center w-full mb-4">
          <h2 className="font-semibold text-[18px] leading-[28px] text-[#22283a] w-full">
            ¿Estás seguro de realizar estos cambios?
          </h2>
          <p className="font-normal text-[14px] leading-[20px] text-[#697086] w-full text-left">
            Los cambios realizados solo afectarán los pagos realizados después de esta modificación. Además, estos
            cambios no son retroactivos para pagos anteriores.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onConfirm}
            className="bg-[#873aff] text-white font-semibold text-[14px] leading-[20px] px-4 py-2 rounded-full h-9 w-full shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] hover:bg-[#7c35e6] transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="bg-white text-[#697086] font-semibold text-[14px] leading-[20px] px-4 py-2 rounded-full h-9 w-full border border-[#d0d8e9] shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] hover:bg-[#f8f9fb] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InvoicingPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const sendEvent = useSendEvent();
  const sendTrackEvent = useSendTrackEventWithUserName();

  const { isEnabled: enableCfdiConfig } = useFlagWithVariableMatching('enable_cfdi_self_service');

  const [selectedCfdi, setSelectedCfdi] = useState<string | null>(null);

  const CFDI_USE_NAMES = useMemo(
    () =>
      taxRegimeValues.reduce<Record<string, string>>((acc, regime) => {
        acc[regime.value] = regime.name;
        return acc;
      }, {}),
    []
  );

  const { data: defaultCfdiConfig } = api.schools.getDefaultCfdiConfig.useQuery(undefined, {
    enabled: !!selectedSchool?.id && enableCfdiConfig,
  });

  const { shouldPreLoadSettings, isFirstTimeOnboarding } = useOnboardingTaskPreLoad({
    taskId: OnboardingTaskId.Invoicing,
    selectedSchool,
  });
  const { updateTaskStatus } = useOnboardingState();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState,
    formState: { errors },
  } = useForm<InvoiceConfigFormData>({
    mode: 'onChange',
  });

  const invoiceTimeValue = watch('invoiceTime');
  const doesInvoiceValue = watch('doesInvoice');
  const doesInvoiceOptions: RadioOption[] = useMemo(
    () => [
      { id: 'yes_invoice', value: 'true', label: 'Sí', recommended: true },
      { id: 'no_invoice', value: 'false', label: 'No' },
    ],
    []
  );

  const invoiceTimeOptions: RadioOption[] = useMemo(() => {
    const shouldShowRecommended = doesInvoiceValue !== 'false';
    return [
      {
        id: 'same_time',
        value: InvoiceTime.IMMEDIATE,
        label: 'En el mismo momento del pago',
        recommended: shouldShowRecommended,
      },
      { id: 'five_pm', value: InvoiceTime.FIVE_PM, label: '05:00 p.m. (CDMX)' },
      { id: 'nine_pm', value: InvoiceTime.NINE_PM, label: '09:00 p.m. (CDMX)' },
      { id: 'eleven_pm', value: InvoiceTime.ELEVEN_PM, label: '11:00 p.m. (CDMX)' },
    ];
  }, [doesInvoiceValue]);

  const tutorWithoutInfoOptions: RadioOption[] = useMemo(() => {
    const shouldShowRecommended = doesInvoiceValue !== 'false';
    return [
      {
        id: 'general_public',
        value: 'public_general',
        label: 'Emitir factura a Público en General',
        recommended: shouldShowRecommended,
      },
      { id: 'do_not_invoice', value: 'do_not_invoice', label: 'No emitir factura' },
    ];
  }, [doesInvoiceValue]);

  const historyConfig: HistoryDrawerConfig = {
    fieldNameMap: INVOICING_FIELD_MAP,
    formatValue: formatInvoicingValue,
    jsonFieldsToExpand: ['config_dashboard', 'cfdi_use_config'],
    avatarColor: '#22283a',
    collapseThreshold: 2,
  };

  const utils = api.useUtils();

  const updateSchoolMutation = api.schools.partialUpdateSchool.useMutation({
    onSuccess: async () => {
      await utils.schools.schoolsList.invalidate();
      await utils.bookKeeper.getSchoolHistory.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Configuración de facturación actualizada correctamente',
        alertTime: defaultAlertTime,
      });
      sendEvent(TrackEvents.invoicing.configurationUpdated);

      if (isFirstTimeOnboarding) {
        try {
          await updateTaskStatus(OnboardingTaskId.Invoicing, OnboardingTaskStatus.Completed);
        } catch (error) {
          Sentry.captureException(error, {
            tags: { feature: 'update_onboarding_task_status' },
            extra: { schoolId: selectedSchool?.id },
          });
        }
      }
    },
    onError: (error) => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al actualizar la configuración',
        alertTime: defaultAlertTime,
      });
      sendEvent(TrackEvents.invoicing.configurationUpdateFailed, {
        error: error.message ?? 'Unknown error',
      });
    },
  });

  const canViewPage = allowedMemberships.has(membership ?? '');

  const { data: historyData, isFetching: isHistoryFetching } = api.bookKeeper.getSchoolHistory.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
      modelName: 'schools.School',
      includeFields:
        'does_invoice,can_invoice_to_general_public,partial_payment_interest_freeze,config_dashboard,cfdi_use_config,invoice_discount_breakdown',
      excludeStaff: true,
      historyTypes: 'changed',
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

  const hasMorePages = historyData?.next !== null;

  useSendPageViewedEvent('Configuración de facturación', selectedSchool);

  useEffect(() => {
    if (selectedSchool && shouldPreLoadSettings) {
      reset({
        doesInvoice: selectedSchool?.does_invoice ? 'true' : 'false',
        invoiceTime: selectedSchool?.config_dashboard?.emit_invoice_time ?? '',
        tutorWithoutInfo: getTutorWithoutInfoValue(selectedSchool?.can_invoice_to_general_public),
        paymentRegistration: getPaymentRegistrationValue(selectedSchool?.config_dashboard?.enable_manual_pay_invoice),
        invoiceDiscountBreakdown: getInvoiceDiscountBreakdownValue(selectedSchool?.invoice_discount_breakdown),
      });
    }
  }, [selectedSchool, reset, shouldPreLoadSettings]);

  const handleCloseHistoryDrawer = () => {
    setShowHistoryDrawer(false);
    setHistoryPage(1);
  };

  const onSubmit = (_formData: InvoiceConfigFormData) => {
    if (!selectedSchool?.id) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No se pudo identificar el colegio',
        alertTime: defaultAlertTime,
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    if (!selectedSchool?.id) return;

    const formData = watch();

    const invoiceConfigPayload = {
      does_invoice: formData.doesInvoice === 'true',
      emit_invoice_time: formData.invoiceTime,
      can_invoice_to_general_public: formData.tutorWithoutInfo === 'public_general',
      enable_manual_pay_invoice: formData.paymentRegistration === 'all_users',
      invoice_discount_breakdown: formData.invoiceDiscountBreakdown === 'true',
    };

    updateSchoolMutation.mutate({
      school_id: selectedSchool.id,
      data: invoiceConfigPayload,
    });

    setShowConfirmDialog(false);
  };

  if (selectedCfdi && enableCfdiConfig) {
    const cfdiName = CFDI_USE_NAMES[selectedCfdi] || `Código ${selectedCfdi}`;
    return (
      <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
        <CfdiDetailView
          cfdiCode={selectedCfdi}
          cfdiName={cfdiName}
          selectedSchool={selectedSchool}
          defaultCfdiConfig={defaultCfdiConfig}
          onBack={() => setSelectedCfdi(null)}
        />
      </PageStateHandler>
    );
  }

  return (
    <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="w-full top-0 sticky z-10 bg-white">
          <div className="w-full max-w-xl mx-auto pt-6 pb-2 px-8 sm:px-0">
            <div className="flex items-center justify-between h-18 gap-6">
              <h1 className="text-[#212B36] text-2xl font-bold font-lota">Configuración de facturación</h1>
              {!isFirstTimeOnboarding && (
                <Button
                  variant="light"
                  onClick={() => {
                    sendTrackEvent(TrackEvents.invoicing.historyClicked);
                    setShowHistoryDrawer(true);
                  }}
                >
                  Ver historial
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start px-8 sm:px-0 pt-0 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-xl mx-auto">
            <div className="flex flex-col items-start gap-10 w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col items-start gap-4 w-full">
                  <FormRadioGroup
                    title="Emisión de facturas"
                    description="Activa esta opción para generar facturas automáticamente por cada pago que la escuela reciba a través de la plataforma."
                    name="doesInvoice"
                    control={control}
                    options={doesInvoiceOptions}
                    errors={errors}
                  >
                    <DoesInvoiceInfoBox selectedValue={doesInvoiceValue} />
                  </FormRadioGroup>

                  <FormRadioGroup
                    title="Momento de emisión en caja"
                    description="Elige si las facturas por pagos registrados en la caja de la escuela se deben generar al instante o en una hora específica."
                    name="invoiceTime"
                    control={control}
                    options={invoiceTimeOptions}
                    errors={errors}
                    disabled={doesInvoiceValue === 'false'}
                    allowEmpty
                  >
                    {doesInvoiceValue !== 'false' && <InvoiceTimeInfoBox selectedValue={invoiceTimeValue ?? ''} />}
                  </FormRadioGroup>

                  <FormRadioGroup
                    title="Facturación a tutores sin datos"
                    description="Selecciona la acción a tomar cuando un tutor realice un pago pero no tenga su información fiscal cargada en Cometa."
                    name="tutorWithoutInfo"
                    control={control}
                    options={tutorWithoutInfoOptions}
                    errors={errors}
                    disabled={doesInvoiceValue === 'false'}
                  />

                  <FormRadioGroup
                    title="Registro en caja sin factura"
                    description="Define qué usuarios tienen permiso para registrar un pago en la caja de la escuela sin necesidad de emitir una factura."
                    name="paymentRegistration"
                    control={control}
                    options={paymentRegistrationOptions}
                    errors={errors}
                    disabled={doesInvoiceValue === 'false'}
                  />

                  <FormRadioGroup
                    title="Desglose de descuentos en facturas"
                    description="Activa esta opción para mostrar el desglose de descuentos aplicados en las facturas emitidas."
                    name="invoiceDiscountBreakdown"
                    control={control}
                    options={invoiceDiscountBreakdownOptions}
                    errors={errors}
                    disabled={doesInvoiceValue === 'false'}
                  />
                </div>

                {enableCfdiConfig && (
                  <CfdiConfig
                    selectedSchool={selectedSchool}
                    cfdiUseNames={CFDI_USE_NAMES}
                    onSelectCfdi={(cfdiCode) => {
                      setSelectedCfdi(cfdiCode);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                  />
                )}

                <FormActions
                  isLoading={updateSchoolMutation.isPending}
                  disabled={!formState.isDirty}
                  onCancel={() => reset()}
                  showCancel={!isFirstTimeOnboarding}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <InvoicingConfirmationDialog
        isVisible={showConfirmDialog}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <Sheet
        open={showHistoryDrawer}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseHistoryDrawer();
          } else {
            setShowHistoryDrawer(true);
          }
        }}
      >
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <SidebarHeader
            title="Historial de cambios"
            onClose={handleCloseHistoryDrawer}
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
    </PageStateHandler>
  );
}

InvoicingPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Configuración de facturación" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

InvoicingPage.auth = true;
