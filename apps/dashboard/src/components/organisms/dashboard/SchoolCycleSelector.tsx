import type { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { cn } from '@cometa/utils';
import { debounce } from 'lodash';
import Trash from 'public/assets/icons/ic_trash.svg';
import { useCallback, useEffect, useState } from 'react';
import SelectChip from '/src/components/atoms/SelectChip';
import Select from '/src/components/Select';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useTableConfig } from '/src/hooks/useTableConfig';
import { api } from '/src/utils/api';

type SchoolCycleWithDisabled = SchoolCycleEntity & {
  disabled?: boolean;
};

interface SchoolCycleSelectorProps {
  selected: SchoolCycleEntity | null;
  setFn: (value: SchoolCycleEntity | null) => void;
  cycles: SchoolCycleWithDisabled[] | [];
  hideTodos?: boolean;
  className?: string;
  allowReset?: boolean;
  tableName?: string;
  labelClassNames?: string;
}

export const SchoolCycleSelector = ({
  selected,
  setFn,
  cycles,
  hideTodos = false,
  className,
  allowReset = false,
  tableName,
  labelClassNames,
}: SchoolCycleSelectorProps) => {
  const hookResult = useSchoolCycleSelector(tableName);

  const effectiveSelected = tableName ? hookResult.selectedSchoolCycle ?? selected : selected;
  const effectiveSetFn = tableName ? hookResult.setSelectedSchoolCycle ?? setFn : setFn;

  useEffect(() => {
    if (tableName && hookResult?.selectedSchoolCycle !== undefined && hookResult.selectedSchoolCycle !== selected) {
      setFn(hookResult.selectedSchoolCycle);
    }
  }, [hookResult?.selectedSchoolCycle, selected, setFn, tableName]);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    effectiveSetFn(null);
  };

  const isSelectionLocked = allowReset && !!effectiveSelected;

  const activeCycle = cycles?.find((cycle) => cycle.is_active);
  const isActiveCycle = activeCycle?.id === effectiveSelected?.id;
  const nextCycle = activeCycle?.next_id;
  const isNextCycle = nextCycle === effectiveSelected?.id;

  if (isSelectionLocked) {
    return (
      <div className="relative">
        <div
          className={cn(
            'flex justify-between items-center rounded-lg border border-gray-300 w-[274px] h-[68px] pt-[9px] pb-[7px] px-[14px]',
            className
          )}
        >
          <div className="flex gap-2 justify-between items-center font-bold whitespace-nowrap">
            {effectiveSelected.name}
            {isActiveCycle ? <SelectChip theme="green">Ciclo actual</SelectChip> : null}
            {isNextCycle ? <SelectChip theme="yellow">Prox. ciclo</SelectChip> : null}
          </div>
          <button
            onClick={handleReset}
            className="flex justify-center items-center rounded-full hover:bg-gray-100"
            aria-label="Reset selection"
            type="button"
          >
            <div className="p-1">
              <Trash className="w-6 h-6 text-red-500" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Select
      placeholder="Ciclo Escolar"
      className={cn('min-w-max h-10 outline-none w-[274px]', className)}
      labelClassNames={cn(
        'group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-y-[-18px] group-[:has(button[data-state="open"])]:translate-y-[-18px]',
        labelClassNames
      )}
      onValueChange={(val) => {
        effectiveSetFn(cycles?.find((cycle) => cycle.id === val) || null);
      }}
      data-testid="schoolCycle-combobox"
      value={effectiveSelected?.id || (hideTodos ? undefined : 'all')}
    >
      <Select.Content className="min-w-max outline-none">
        {!hideTodos && (
          <Select.Item
            value="all"
            className={cn('w-full outline-none', {
              'bg-gray-200': !hideTodos && effectiveSelected === null,
            })}
          >
            <span>Todos</span>
          </Select.Item>
        )}
        {cycles
          ?.sort((a, b) => Number(b.year_start) - Number(a.year_start) || Number(b.year_end) - Number(a.year_end))
          .map((cycle) => (
            <Select.Item
              className={cn('w-full outline-none', {
                'bg-gray-200': effectiveSelected?.id === cycle.id,
                'opacity-50 cursor-not-allowed': cycle.disabled,
              })}
              disabled={cycle.disabled}
              value={cycle.id as string}
              key={cycle.id}
            >
              <span className="flex gap-2 justify-between items-center">
                {cycle.name}
                {cycle.is_active ? <SelectChip theme={allowReset ? 'green' : 'blue'}>Ciclo actual</SelectChip> : null}
                {nextCycle === cycle.id ? <SelectChip theme="yellow">Prox. ciclo</SelectChip> : null}
              </span>
            </Select.Item>
          ))}
      </Select.Content>
    </Select>
  );
};

interface SchoolCycleFilter {
  id: string;
  name: string;
}

interface SchoolCycleFiltersConfig {
  school_cycles: SchoolCycleFilter | null;
}

export const useSchoolCycleSelector = (tableName?: string) => {
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [selectedSchoolCycle, setSelectedSchoolCycleState] = useState<SchoolCycleEntity | null | undefined>(undefined);

  const {
    shouldUseApi,
    tableConfig,
    initializedRef: initialLoadDone,
    previousSchoolIdRef,
    upsertConfig,
    processTableConfig,
  } = useTableConfig<SchoolCycleFiltersConfig>({ tableName });

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery({
    school_id: selectedSchool?.id as string,
  });

  const activeCycle = schoolCycles?.find((cycle) => cycle.is_active) ?? null;

  useEffect(() => {
    if (!initialLoadDone.current && !shouldUseApi) {
      setSelectedSchoolCycleState(activeCycle);
      initialLoadDone.current = true;
    }
  }, [initialLoadDone, activeCycle, shouldUseApi]);

  useEffect(() => {
    if (previousSchoolIdRef.current && previousSchoolIdRef.current !== schoolId) {
      initialLoadDone.current = false;
      setSelectedSchoolCycleState(shouldUseApi ? undefined : activeCycle);
    }
  }, [schoolId, previousSchoolIdRef, initialLoadDone, shouldUseApi, activeCycle]);

  const hasExplicitConfig = useCallback(
    () =>
      processTableConfig<boolean>((filtersConfig) => filtersConfig !== null && 'school_cycles' in filtersConfig) ??
      false,
    [processTableConfig]
  );

  const processedTableConfig = useCallback(
    () =>
      processTableConfig<SchoolCycleEntity | null>((filtersConfig) => {
        if (!schoolCycles) return activeCycle;

        if (filtersConfig && 'school_cycles' in filtersConfig) {
          const schoolCycleFilter = filtersConfig.school_cycles;

          if (schoolCycleFilter === null) {
            return null;
          } else if (schoolCycleFilter?.id) {
            const foundCycle = schoolCycles.find((cycle) => cycle.id === schoolCycleFilter.id);
            return foundCycle || activeCycle;
          }
        }

        return activeCycle;
      }),
    [processTableConfig, schoolCycles, activeCycle]
  );

  useEffect(() => {
    if (!shouldUseApi || !schoolCycles || initialLoadDone.current) {
      return;
    }

    if (hasExplicitConfig()) {
      const savedCycle = processedTableConfig();
      setSelectedSchoolCycleState(savedCycle);
    } else {
      setSelectedSchoolCycleState(activeCycle);
    }
    initialLoadDone.current = true;
  }, [tableConfig, schoolCycles, shouldUseApi, activeCycle, processedTableConfig, initialLoadDone, hasExplicitConfig]);

  const saveSchoolCycle = useCallback(
    (cycle: SchoolCycleEntity | null) => {
      if (!shouldUseApi) return;

      const debouncedSave = debounce(() => {
        upsertConfig({
          school_cycles: cycle
            ? {
                id: cycle.id as string,
                name: cycle.name,
              }
            : null,
        });
      }, 300);

      debouncedSave();
    },
    [shouldUseApi, upsertConfig]
  );

  const setSelectedSchoolCycle = useCallback(
    (cycle: SchoolCycleEntity | null) => {
      setSelectedSchoolCycleState(cycle);
      saveSchoolCycle(cycle);
    },
    [saveSchoolCycle]
  );

  return { schoolCycles, activeCycle, selectedSchoolCycle, setSelectedSchoolCycle };
};
