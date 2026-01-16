import { Calendar } from './CalendarMultiple';
import CustomInput from './CustomInput';
import TrashOutline from '/public/assets/icons/trash_outline.svg';
import CalendarOutline from '/public/assets/icons/calendar_outline.svg';
import { useEffect, useMemo } from 'react';
import { useTableConfig } from '/src/hooks/useTableConfig';

type DateRangeProps = {
  selectedDates: Date[];
  onDatesChange(dates: Date[]): void;
  tableName?: string;
};

interface FiltersConfig {
  dates?: string[];
}

export const transformDates = (dates: Date[]) => dates.map((date) => new Date(date).toISOString().split('T')[0]);

export default function DateRange({ selectedDates, onDatesChange, tableName }: DateRangeProps) {
  const {
    shouldUseApi,
    tableConfig,
    isLoading,
    initializedRef,
    previousSchoolIdRef,
    schoolId,
    upsertConfig,
    processTableConfig,
  } = useTableConfig<FiltersConfig>({ tableName });

  const processedTableConfig = useMemo(
    () =>
      processTableConfig<Date[]>((filtersConfig: FiltersConfig) => {
        if (filtersConfig?.dates && Array.isArray(filtersConfig.dates) && filtersConfig.dates.length > 0) {
          return filtersConfig.dates.map((dateStr: string) => new Date(dateStr));
        }
        return null;
      }),
    [processTableConfig, tableConfig]
  );

  useEffect(() => {
    if (previousSchoolIdRef.current && previousSchoolIdRef.current !== schoolId) {
      initializedRef.current = false;
      onDatesChange([]);
    }
  }, [schoolId, onDatesChange, previousSchoolIdRef, initializedRef]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    if (shouldUseApi && isLoading) {
      return;
    }

    if (processedTableConfig) {
      onDatesChange(processedTableConfig);
      initializedRef.current = true;
      return;
    }

    if (selectedDates.length > 0) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
  }, [processedTableConfig, isLoading, selectedDates, onDatesChange, shouldUseApi, initializedRef]);

  const handleDatesChange = (dates: Date[]) => {
    onDatesChange(dates);

    if (shouldUseApi) {
      const dateStrings = dates.map((date) => date.toISOString());

      upsertConfig({
        dates: dateStrings,
      });
    }
  };

  return (
    <Calendar
      config={{
        selectedDates,
        onDatesChange: handleDatesChange,
        dates: {
          mode: 'range',
          selectSameDate: true,
        },
        calendar: {
          offsets: [1],
          mode: 'fluid',
          startDay: 0,
        },
        locale: {
          locale: 'es-MX',
          weekday: 'narrow',
        },
      }}
    >
      <Calendar.Triggers>
        {[
          { date: 'start' as const, label: 'Desde', testId: 'startDate-datePicker' },
          { date: 'end' as const, label: 'Hasta', testId: 'endDate-datePicker' },
        ].map(({ date, label, testId }) => (
          <Calendar.Trigger key={date} date={date}>
            {(value) => (
              <div className="border-[#919EAB52] border-radius-lg rounded-md border-solid border relative hover:border-black max-w-[200px]">
                <CustomInput
                  className="px-2 py-4 peer min-h-[56px]"
                  data-testid={testId}
                  placeholder=" "
                  value={value || ''}
                />
                <CalendarOutline className="w-5 h-5 text-[#374957] absolute right-4 inset-y-0 m-auto" />
                <label className='origin-left peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 left-2 group-[[data-state="open"]]:group-focus-within:-translate-y-7 peer-[:not(:placeholder-shown)]:left-2 group-[[data-state="open"]]:group-focus-within:left-2 bg-white text-[rgba(145,158,171,1)] group-[[data-state="open"]]:group-focus-within:scale-75 inset-y-0 my-auto h-fit absolute transition-transform'>
                  {label}
                </label>
              </div>
            )}
          </Calendar.Trigger>
        ))}
      </Calendar.Triggers>
      <Calendar.Content>
        {(calendars) => (
          <>
            {calendars.map((calendar, index) => (
              <Calendar.Item
                key={calendar.month}
                calendar={calendar}
                showControls={calendars.length === index + 1 ? 'next' : 'prev'}
              />
            ))}{' '}
            <Calendar.Footer>
              <button
                className="flex items-center gap-2 p-2 text-sm font-bold text-black transition-all bg-transparent rounded-md hover:backdrop-brightness-95"
                onClick={() => handleDatesChange([])}
              >
                <TrashOutline className="w-5 h-5" /> Limpiar filtros
              </button>
            </Calendar.Footer>{' '}
          </>
        )}
      </Calendar.Content>
    </Calendar>
  );
}
