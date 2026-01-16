import { useEffect, useState, useMemo, useRef } from 'react';
import Layout from '/src/components/layouts';
import { SchoolCycleSelector, useSchoolCycleSelector } from '/src/components/organisms/dashboard/SchoolCycleSelector';
import { Button, Input } from '@cometa/recreo';
import { useRouter } from 'next/router';
import { DiscardChangesDialog } from '/src/components/organisms/dashboard/AdmissionSections/DiscardChanagesDialog';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@cometa/utils/src/cn';
import React from 'react';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { useForm } from 'react-hook-form';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import type { SrcStudentsEntitiesGradeEntity as GradeEntity } from '@cometa/trpc/src/students/types';
import useAlert from '/src/hooks/useAlert';

type QuotaFormValues = Record<string, number | null | undefined>;

export default function QuotaPage() {
  const router = useRouter();
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingCycleChange, setPendingCycleChange] = useState<SchoolCycleEntity | null>(null);
  const [originalFormValues, setOriginalFormValues] = useState<QuotaFormValues>({});
  const previousCycleRef = useRef<string | null | undefined>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { setAlertState } = useAlert();

  const selectedSchool = useSelectedSchool();
  const { data: levels } = api.students.getLevels.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const { activeCycle, schoolCycles, selectedSchoolCycle, setSelectedSchoolCycle } = useSchoolCycleSelector();
  const schoolCycle =
    selectedSchoolCycle ||
    (activeCycle?.next_id ? schoolCycles?.find((cycle) => cycle.id === activeCycle.next_id) : activeCycle);

  const {
    data: schoolCycleGrades,
    refetch: refetchQuotas,
    isLoading: isLoadingGrades,
  } = api.students.getSchoolCycleGrades.useQuery(
    { schoolCycleId: schoolCycle?.id as string },
    { enabled: !!schoolCycle?.id }
  );

  const upsertSchoolCycleGrades = api.students.upsertSchoolCycleGrades.useMutation({
    onSuccess: () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Cambios guardados exitosamente',
      });
      refetchQuotas();
    },
    onError: (error) => {
      setAlertState({
        open: true,
        severity: 'error',
        message: error.message,
      });
    },
  });

  const {
    watch,
    handleSubmit,
    formState: { isDirty },
    reset,
    setValue,
  } = useForm<QuotaFormValues>({
    defaultValues: {},
  });

  const quotaValues = watch();

  useEffect(() => {
    if (schoolCycle?.id && !previousCycleRef.current) {
      previousCycleRef.current = schoolCycle.id;
    }
  }, [schoolCycle?.id]);

  useEffect(() => {
    if (schoolCycle?.id && previousCycleRef.current && schoolCycle.id !== previousCycleRef.current) {
      if (isDirty) {
        setPendingCycleChange(schoolCycle);
        setShowDiscardModal(true);
      } else {
        previousCycleRef.current = schoolCycle.id;
        refetchQuotas();
      }
    }
  }, [schoolCycle?.id, isDirty, refetchQuotas]);

  useEffect(() => {
    if (isLoadingGrades) return;

    const formValues: QuotaFormValues = {};
    let hasValues = false;

    if (schoolCycleGrades && schoolCycleGrades.length > 0) {
      schoolCycleGrades.forEach((grade) => {
        if (grade.grade_id && grade.inscriptions_quota !== null && grade.inscriptions_quota !== undefined) {
          formValues[grade.grade_id] = grade.inscriptions_quota;
          hasValues = true;
        }
      });
    }

    reset({}, { keepDirty: false, keepErrors: false });

    setOriginalFormValues(formValues);

    const hasActiveGrades = schoolCycleGrades?.some((grade) => grade.is_active);
    setIsEnabled(hasValues && hasActiveGrades);

    if (hasValues) {
      reset(formValues, {
        keepDirty: false,
        keepErrors: false,
      });
    }

    setHasSubmitAttempted(false);
  }, [schoolCycleGrades, reset, isLoadingGrades]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    function handleRouteChangeStart(url: string) {
      if (isDirty) {
        router.events.emit('routeChangeError');
        setPendingNavigation(url);
        setShowDiscardModal(true);
        throw { cancelled: true, message: 'Navigation aborted due to unsaved changes' };
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [isDirty, router]);

  const gradesCount = levels?.reduce((acc, level) => acc + (level.grades?.length || 0), 0);

  function onSubmit(formValues: QuotaFormValues) {
    setHasSubmitAttempted(true);

    const hasEmptyValues = Object.entries(formValues).some(([_, value]) => {
      if (!value && value !== 0) return true;
      return Number(value) < 0;
    });
    const areAllFieldsFilled = Object.keys(formValues).length === gradesCount;

    if (hasEmptyValues || !areAllFieldsFilled) return;

    handleUpsert(formValues);
  }

  function handleQuotaChange(gradeId: string, value: number) {
    setValue(gradeId, value, { shouldDirty: true });
  }

  function handleBack() {
    if (isDirty) {
      setShowDiscardModal(true);
    }
  }

  function handleDiscard() {
    setShowDiscardModal(false);

    if (pendingCycleChange) {
      const newCycle = pendingCycleChange;
      previousCycleRef.current = newCycle.id;
      setSelectedSchoolCycle(newCycle);
      refetchQuotas();
      setPendingCycleChange(null);
      return;
    }

    if (pendingNavigation) {
      const currentUrl = pendingNavigation;
      setPendingNavigation(null);

      setTimeout(() => {
        window.location.href = currentUrl;
      }, 0);
      return;
    }

    const hadInitialValues = Object.keys(originalFormValues).length > 0;
    if (hadInitialValues) {
      reset(originalFormValues, {
        keepDirty: false,
        keepErrors: false,
      });
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
      reset(
        {},
        {
          keepDirty: false,
          keepErrors: false,
        }
      );
    }

    setHasSubmitAttempted(false);
  }

  function handleCloseDiscardModal() {
    setPendingNavigation(null);
    setPendingCycleChange(null);

    setShowDiscardModal(false);
  }

  function handleSchoolCycleChange(cycle: SchoolCycleEntity | null) {
    if (!cycle) return;

    if (isDirty) {
      setPendingCycleChange(cycle);
      setShowDiscardModal(true);
    } else {
      previousCycleRef.current = cycle.id;
      setSelectedSchoolCycle(cycle);
    }
  }

  function handleQuotaToggleChange(checked: boolean) {
    setIsEnabled(checked);

    const hasInitialValues = Object.keys(originalFormValues).length > 0;
    const hasActiveGrades = schoolCycleGrades?.some((grade) => grade.is_active);

    if (checked && !hasInitialValues) {
      reset({}, { keepDirty: false, keepErrors: false });
    }

    if (checked && hasInitialValues && !hasActiveGrades) {
      handleUpsert(originalFormValues, true);
      reset(originalFormValues, { keepDirty: false, keepErrors: false });
    }

    if (!checked && hasInitialValues) {
      handleUpsert(originalFormValues, false);
    }
  }

  function handleUpsert(formValues: QuotaFormValues, isActive = true) {
    const data = Object.entries(formValues).map(([grade_id, inscriptions_quota]) => ({
      school_cycle_id: schoolCycle?.id as string,
      grade_id,
      inscriptions_quota: Number(inscriptions_quota),
      is_active: isActive,
    }));

    upsertSchoolCycleGrades.mutate({ data });
  }

  function handleSaveClick() {
    setHasSubmitAttempted(true);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  return (
    <div className="h-full relative w-full font-lota">
      <PageHeader
        title="Cupos de inscripción"
        schoolCycle={schoolCycle}
        schoolCycles={schoolCycles}
        setSelectedSchoolCycle={handleSchoolCycleChange}
        showButtons={isEnabled}
        onBack={handleBack}
        onSubmit={handleSaveClick}
      />

      <div className="p-8">
        <InfoBanner />

        <QuotaToggle isEnabled={isEnabled} onChange={handleQuotaToggleChange} cycleName={schoolCycle?.name} />

        {isEnabled ? (
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="text-sm text-neutral-600 mb-4">Ingresa los cupos totales que tendrá disponible cada grado:</p>

            <div className="space-y-4">
              {levels?.map((level) => (
                <QuotaSection
                  key={level.id}
                  title={level.name}
                  grades={level.grades || []}
                  quotaValues={quotaValues}
                  onChange={handleQuotaChange}
                  hasSubmitAttempted={hasSubmitAttempted}
                />
              ))}
            </div>
          </form>
        ) : (
          <EmptyState onEnable={() => handleQuotaToggleChange(true)} />
        )}
      </div>

      <DiscardChangesDialog
        open={showDiscardModal}
        onSubmit={handleDiscard}
        isLoading={false}
        onClose={handleCloseDiscardModal}
      />
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  schoolCycle: SchoolCycleEntity | null | undefined;
  schoolCycles: SchoolCycleEntity[] | undefined;
  setSelectedSchoolCycle: (cycle: SchoolCycleEntity | null) => void;
  showButtons: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

function PageHeader({
  title,
  schoolCycle,
  schoolCycles,
  setSelectedSchoolCycle,
  showButtons,
  onBack,
  onSubmit,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 pt-6 pb-2">
      <div className="flex items-center gap-4">
        <h1 className="text-[#212B36] text-2xl font-bold">{title}</h1>
        {schoolCycles?.length ? (
          <SchoolCycleSelector
            cycles={schoolCycles}
            selected={schoolCycle as SchoolCycleEntity}
            setFn={setSelectedSchoolCycle}
            hideTodos
          />
        ) : null}
      </div>

      {showButtons ? (
        <div className="flex gap-2">
          <Button variant="solid-light" size="medium" color="black" onClick={onBack} type="button">
            Descartar
          </Button>
          <Button variant="solid" size="medium" color="black" onClick={onSubmit} type="submit">
            Guardar cambios
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="bg-blue-50 px-4 py-3 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <InfoIcon />
        <p className="text-base text-blue-800">
          Designar cupos para un grado no genera ningún tipo de restricción en la plataforma. Únicamente cumple el
          propósito de ayudarte a llevar un control de la cantidad de estudiantes que se inscriben en un grado en
          particular.
        </p>
      </div>
    </div>
  );
}

type QuotaToggleProps = {
  isEnabled: boolean;
  onChange: (checked: boolean) => void;
  cycleName?: string;
};

function QuotaToggle({ isEnabled, onChange, cycleName }: QuotaToggleProps) {
  return (
    <div
      className={cn('bg-white p-6 rounded-lg border border-neutral-200 mb-8', {
        'border-2 border-purple-400': isEnabled,
      })}
    >
      <div className="flex items-center justify-between">
        <p className="font-bold">
          Activar funcionalidad de cupos para este ciclo escolar{' '}
          <span className="font-normal text-sm text-neutral-600">({cycleName})</span>
        </p>
        <Switch checked={isEnabled} onChange={onChange} />
      </div>
      <p className="text-sm text-neutral-600 mt-2">
        Estos cupos servirán para llevar un control de la cantidad de estudiantes inscritos en la sección de control de
        inscripciones y reinscripciones de la plataforma
      </p>
    </div>
  );
}

type QuotaSectionProps = {
  title: string;
  grades: GradeEntity[];
  quotaValues: QuotaFormValues;
  onChange: (gradeId: string, value: number) => void;
  hasSubmitAttempted: boolean;
};

function QuotaSection({ title, grades, quotaValues, onChange, hasSubmitAttempted }: QuotaSectionProps) {
  const total = useMemo(
    () =>
      grades.reduce((acc, grade) => {
        const quota = quotaValues[grade.id];
        return acc + (quota || 0);
      }, 0),
    [grades, quotaValues]
  );

  return (
    <div className="bg-white rounded-lg border border-neutral-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
        <h3 className="text-neutral-950 font-bold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-base text-neutral-600 font-bold">{total} cupos totales</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {grades.map((grade) => {
          const inputValue =
            quotaValues[grade.id] !== null && quotaValues[grade.id] !== undefined ? String(quotaValues[grade.id]) : '';

          const isEmpty = [null, undefined, ''].includes(inputValue);
          const shouldShowError = hasSubmitAttempted && isEmpty;
          const errorMessage = shouldShowError ? 'Ingresa una cantidad para continuar' : undefined;

          return (
            <div
              key={grade.id}
              className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0"
            >
              <span className="text-base text-neutral-800">
                {grade.name} - {title}
              </span>
              <div className="flex flex-col items-end gap-1">
                <Input
                  type="number"
                  min={0}
                  value={inputValue}
                  className={cn(
                    'w-24 h-10 px-4 py-3 text-base text-right',
                    'bg-white border border-neutral-300 rounded-md',
                    'placeholder:text-neutral-400 placeholder:text-right',
                    { 'border-red-500': shouldShowError }
                  )}
                  onChange={(e) => onChange(grade.id, parseInt(e.target.value) || 0)}
                  placeholder="Cupos"
                  error={errorMessage}
                  isLegacy={false}
                />
                {errorMessage && (
                  <div className="text-sm text-red-500">
                    <span className="text-elipsis">{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

QuotaPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Cupos de inscripción" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

QuotaPage.auth = true;

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11V16ZM11 8C11 8.55228 11.4477 9 12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8Z"
        fill="#1890FF"
      />
    </svg>
  );
}

function EmptyState({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)]">
      <div className="w-96">
        <h2 className="text-lg font-bold text-neutral-800 mb-2">No hay cupos registrados para este ciclo</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Activa los cupos y registra las cantidades para grado correspondiente.
        </p>
        <Button
          variant="solid-light"
          size="medium"
          color="galaxy"
          onClick={onEnable}
          className="flex items-center justify-center gap-1"
        >
          <PlusIcon />
          Activar cupos
        </Button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
      <path
        d="M9.91667 6.91667H7.58333V4.58333C7.58333 4.42862 7.52188 4.28025 7.41248 4.17085C7.30308 4.06146 7.15471 4 7 4C6.84529 4 6.69692 4.06146 6.58752 4.17085C6.47812 4.28025 6.41667 4.42862 6.41667 4.58333V6.91667H4.08333C3.92862 6.91667 3.78025 6.97812 3.67085 7.08752C3.56146 7.19692 3.5 7.34529 3.5 7.5C3.5 7.65471 3.56146 7.80308 3.67085 7.91248C3.78025 8.02188 3.92862 8.08333 4.08333 8.08333H6.41667V10.4167C6.41667 10.5714 6.47812 10.7197 6.58752 10.8291C6.69692 10.9385 6.84529 11 7 11C7.15471 11 7.30308 10.9385 7.41248 10.8291C7.52188 10.7197 7.58333 10.5714 7.58333 10.4167V8.08333H9.91667C10.0714 8.08333 10.2197 8.02188 10.3291 7.91248C10.4385 7.80308 10.5 7.65471 10.5 7.5C10.5 7.34529 10.4385 7.19692 10.3291 7.08752C10.2197 6.97812 10.0714 6.91667 9.91667 6.91667Z"
        fill="#873AFF"
      />
    </svg>
  );
}

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ checked, onChange, disabled, className, ...props }, ref) => (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={(checked: boolean) => onChange?.(checked)}
      disabled={disabled}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-purple-200 data-[state=unchecked]:bg-neutral-200',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-neutral-600 data-[state=checked]:bg-purple-500 shadow-lg ring-0',
          'transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  )
);

Switch.displayName = 'Switch';
