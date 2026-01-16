import { useState, useMemo } from 'react';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2';
import { ArrowLeft, GraduationCap, BookOpen, Dribbble, MoreHorizontal } from 'lucide-react';
import { DashboardSchool } from '@cometa/trpc/src/types';
import { api } from '../../utils/api';
import useAlert, { defaultAlertTime } from '../../hooks/useAlert';
import cfdiCategories from '../../utils/static_data/cfdiCategories';
import CAlert from '../atoms/CAlert';

const CFDI_SECTIONS = [
  {
    title: 'Escolares',
    icon: GraduationCap,
    items: [
      { key: 'MONTHLY_FEE', label: 'Colegiaturas' },
      { key: 'INSCRIPTION', label: 'Inscripciones' },
      { key: 'REINSCRIPTION', label: 'Reinscripciones' },
    ],
  },
  {
    title: 'Productos',
    icon: BookOpen,
    items: [
      { key: 'BOOKS_AND_MATERIALS', label: 'Libros y materias' },
      { key: 'UNIFORMS_AND_MERCH', label: 'Uniformes y otras mercancias' },
      { key: 'EXAMS_AND_CERTIFICATES', label: 'Examenes y certificados' },
    ],
  },
  {
    title: 'Servicios y actividades',
    icon: Dribbble,
    items: [
      { key: 'TRANSPORT', label: 'Transporte' },
      { key: 'SPORTS', label: 'Deportes' },
      { key: 'EXTRACURRICULAR', label: 'Extracurriculares (no deportes)' },
      { key: 'CAFETERIA', label: 'Cafeteria' },
    ],
  },
  {
    title: 'Otros',
    icon: MoreHorizontal,
    items: [
      { key: 'PRE_DEBT', label: 'Deuda previa' },
      { key: 'OTHER', label: 'Otros' },
    ],
  },
];

type CfdiDetailViewProps = {
  cfdiCode: string;
  cfdiName: string;
  selectedSchool: DashboardSchool | undefined;
  defaultCfdiConfig?: Record<string, Record<string, string | null>>;
  onBack: () => void;
};

export const CfdiDetailView = ({
  cfdiCode,
  cfdiName,
  selectedSchool,
  defaultCfdiConfig,
  onBack,
}: CfdiDetailViewProps) => {
  const { setAlertState } = useAlert();
  const utils = api.useUtils();

  const cfdiUseConfig = selectedSchool?.cfdi_use_config || {};
  const cfdiData = cfdiUseConfig[cfdiCode];
  const defaultCfdiData = defaultCfdiConfig?.[cfdiCode];

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingSectionToRestore, setPendingSectionToRestore] = useState<{ key: string; label: string }[] | null>(null);
  const [shouldNavigateBack, setShouldNavigateBack] = useState(true);

  const availableCategories = cfdiCategories.filter((category) => category.taxRegimes.includes(cfdiCode));

  const initialSelectValues = useMemo(() => {
    const values: Record<string, string> = {};
    CFDI_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        values[item.key] = cfdiData?.[item.key] ?? '';
      });
    });
    return values;
  }, [cfdiData]);

  const [selectValues, setSelectValues] = useState<Record<string, string>>(initialSelectValues);

  // Track changes to enable or disable save button
  const hasChanges = useMemo(
    () => Object.keys(selectValues).some((key) => selectValues[key] !== initialSelectValues[key]),
    [selectValues, initialSelectValues]
  );

  const updateCfdiConfigMutation = api.schools.partialUpdateSchool.useMutation({
    onSuccess: async () => {
      await utils.schools.schoolsList.invalidate();
      await utils.bookKeeper.getSchoolHistory.invalidate();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Configuración de CFDI actualizada correctamente',
        alertTime: defaultAlertTime,
      });
      if (shouldNavigateBack) {
        onBack();
      }
      setShouldNavigateBack(true);
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al actualizar la configuración de CFDI',
        alertTime: defaultAlertTime,
      });
    },
  });

  const handleSelectChange = (key: string, value: string) => {
    setSelectValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isSectionModified = (sectionItems: { key: string; label: string }[]) => {
    if (!defaultCfdiData) return false;

    return sectionItems.some((item) => {
      const currentValue = selectValues[item.key] ?? '';
      const defaultValue = defaultCfdiData[item.key] ?? '';
      return currentValue !== defaultValue;
    });
  };

  const handleApplyDefaults = (sectionItems: { key: string; label: string }[]) => {
    setPendingSectionToRestore(sectionItems);
    setShowRestoreModal(true);
  };

  const confirmRestoreDefaults = () => {
    if (!defaultCfdiData || !pendingSectionToRestore || !selectedSchool?.id) return;

    const updates: Record<string, string> = {};
    pendingSectionToRestore.forEach((item) => {
      const defaultValue = defaultCfdiData[item.key];
      updates[item.key] = defaultValue ?? '';
    });

    const updatedCfdiConfig = {
      ...cfdiUseConfig,
      [cfdiCode]: {
        ...cfdiData,
        ...selectValues,
        ...updates,
      },
    };

    setShouldNavigateBack(false);

    updateCfdiConfigMutation.mutate({
      school_id: selectedSchool.id,
      data: {
        cfdi_use_config: updatedCfdiConfig,
      },
    });

    // Update local state
    setSelectValues((prev) => ({
      ...prev,
      ...updates,
    }));

    setShowRestoreModal(false);
    setPendingSectionToRestore(null);
  };

  const handleSave = () => {
    if (!selectedSchool?.id) return;

    // Merge updated values
    const updatedCfdiConfig = {
      ...cfdiUseConfig,
      [cfdiCode]: {
        ...cfdiData,
        ...selectValues,
      },
    };

    updateCfdiConfigMutation.mutate({
      school_id: selectedSchool.id,
      data: {
        cfdi_use_config: updatedCfdiConfig,
      },
    });
  };

  if (!selectedSchool) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-white flex items-center justify-center pt-6 pb-2">
        <div className="w-full max-w-xl mx-auto px-8 sm:px-0">
          <button className="flex items-center gap-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <span className="font-lota font-semibold text-xs leading-none uppercase text-neutral-400">Volver</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 bg-white">
        <div className="w-full max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-2 text-neutral-800">
            {cfdiCode} - {cfdiName}
          </h1>
          <p className="text-base text-neutral-500 mb-4">
            Configura los usos de CFDI. Si no realizas cambios, se aplicarán los valores predeterminados sugeridos.
          </p>

          <CAlert
            type="info"
            title="Importante:"
            message="Los cambios que realices solo afectarán a las facturas que se realicen a partir de este momento. La plataforma no aplica estos cambios de forma retroactiva."
            className="items-start bg-[#E8F4FF] mb-6"
          />

          {CFDI_SECTIONS.map((section) => {
            const isModified = isSectionModified(section.items);
            const Icon = section.icon;
            return (
              <div key={section.title} className="mb-6 border border-neutral-200 rounded-lg">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-neutral-800" />
                    <h2 className="text-lg font-semibold text-neutral-800">{section.title}</h2>
                    {isModified && defaultCfdiData && (
                      <div className="px-2 py-1 bg-neutral-50 text-neutral-600 text-xs font-bold rounded border border-neutral-200">
                        Modificado
                      </div>
                    )}
                  </div>
                  {defaultCfdiData && isModified && (
                    <button
                      onClick={() => handleApplyDefaults(section.items)}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Restablecer valores predeterminados
                    </button>
                  )}
                </div>
                <div className="flex flex-col divide-y divide-neutral-200 mx-4 mb-4 rounded-lg border border-neutral-200">
                  {section.items.map((item) => {
                    const selectedValue = selectValues[item.key] ?? '';
                    return (
                      <div key={item.key} className="p-4 flex items-center justify-between gap-4">
                        <span className="text-sm text-neutral-800">{item.label}</span>
                        <div className="w-80 flex-shrink-0">
                          <Select
                            value={selectedValue || undefined}
                            onValueChange={(value) => handleSelectChange(item.key, value)}
                          >
                            <SelectTrigger className="w-full rounded-lg max-h-9 py-2">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.value} - {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={onBack} disabled={!hasChanges || updateCfdiConfigMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updateCfdiConfigMutation.isPending}>
              {updateCfdiConfigMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Restore Defaults Modal */}
      {showRestoreModal && pendingSectionToRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Restablecer valores predeterminados</h2>
            <p className="text-base text-neutral-600 mb-6">
              Esta acción revertirá todos los cambios de este grupo y aplicará los siguientes valores predeterminados:
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                {CFDI_SECTIONS.find((s) => s.items === pendingSectionToRestore)?.title}
              </h3>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                {pendingSectionToRestore.map((item, index) => (
                  <div
                    key={item.key}
                    className={`flex justify-between items-center px-4 py-3 ${
                      index !== pendingSectionToRestore.length - 1 ? 'border-b border-neutral-200' : ''
                    }`}
                  >
                    <span className="text-sm text-neutral-900">{item.label}</span>
                    <span className="text-sm text-neutral-700">
                      {defaultCfdiData?.[item.key]
                        ? `${defaultCfdiData[item.key]} - ${
                            availableCategories.find((cat) => cat.value === defaultCfdiData[item.key])?.name || ''
                          }`
                        : 'Sin valor'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRestoreModal(false);
                  setPendingSectionToRestore(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={confirmRestoreDefaults}>Confirmar restablecimiento</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
