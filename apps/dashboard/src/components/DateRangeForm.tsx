import { useMemo, useState } from 'react';
import { DayPicker, DateRange, useDayPicker, useNavigation } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import type { CaptionProps } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import CustomInput from './CustomInput';
import TrashOutline from '/public/assets/icons/trash_outline.svg';
import CalendarOutline from '/public/assets/icons/calendar_outline.svg';
import Chevron from '/public/assets/icons/chevron.svg';
import { cn } from '../utils/cn';
import { parseISODateLocal } from '../utils/date-utils';
import 'react-day-picker/dist/style.css';

type AllowedDateRange = {
  start_date: string;
  end_date: string;
};

type DateRangeFormProps = {
  selectedDates: Date[];
  onDatesChange(dates: Date[]): void;
  allowedRanges?: AllowedDateRange[];
};

const esMxSundayStart: Locale = {
  ...es,
  options: {
    ...(es.options ?? {}),
    weekStartsOn: 0,
  },
};

function DayPickerCaption({ displayMonth, displayIndex = 0 }: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  const { formatters, locale, numberOfMonths = 1 } = useDayPicker();

  const captionLabel = formatters.formatCaption(displayMonth, { locale });
  const isFirstMonth = displayIndex === 0;
  const isLastMonth = displayIndex === numberOfMonths - 1;

  return (
    <div className="grid items-center grid-cols-3 mt-3 mb-2">
      {isFirstMonth && previousMonth ? (
        <button
          type="button"
          className="bg-transparent text-[#637381] rotate-90 justify-self-start p-1 h-7 w-7 rounded-full hover:backdrop-brightness-95"
          onClick={() => goToMonth(previousMonth)}
        >
          <Chevron className="w-5 h-4 m-auto" />
        </button>
      ) : (
        <span />
      )}
      <p className="col-start-2 text-base font-semibold text-center text-black whitespace-nowrap capitalize">
        {captionLabel}
      </p>
      {isLastMonth && nextMonth ? (
        <button
          type="button"
          className="-rotate-90 bg-transparent text-[#637381] justify-self-end p-1 h-7 w-7 rounded-full hover:backdrop-brightness-95"
          onClick={() => goToMonth(nextMonth)}
        >
          <Chevron className="w-5 h-4 m-auto" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

function isDateInAllowedRanges(date: Date, allowedRanges: AllowedDateRange[]): boolean {
  const checkTime = new Date(date).setHours(0, 0, 0, 0);

  return allowedRanges.some((range) => {
    const start = parseISODateLocal(range.start_date);
    const end = parseISODateLocal(range.end_date);
    return checkTime >= start.getTime() && checkTime <= end.getTime();
  });
}

function isRangeInSingleAllowedPeriod(from: Date, to: Date, allowedRanges: AllowedDateRange[]): boolean {
  const fromTime = new Date(from).setHours(0, 0, 0, 0);
  const toTime = new Date(to).setHours(0, 0, 0, 0);

  return allowedRanges.some((range) => {
    const rangeStart = parseISODateLocal(range.start_date).getTime();
    const rangeEnd = parseISODateLocal(range.end_date).getTime();

    return fromTime >= rangeStart && toTime <= rangeEnd;
  });
}

export default function DateRangeForm({ selectedDates, onDatesChange, allowedRanges }: DateRangeFormProps) {
  const [open, setOpen] = useState(false);

  const selectedRange: DateRange | undefined = useMemo(() => {
    if (selectedDates.length === 0) return undefined;
    if (selectedDates.length === 1) return { from: selectedDates[0], to: undefined };
    return { from: selectedDates[0], to: selectedDates[1] };
  }, [selectedDates]);

  const { minDate, maxDate } = useMemo((): { minDate: Date | undefined; maxDate: Date | undefined } => {
    if (!allowedRanges || allowedRanges.length === 0) {
      return { minDate: undefined, maxDate: undefined };
    }

    let earliest: Date | undefined = undefined;
    let latest: Date | undefined = undefined;

    allowedRanges.forEach((range) => {
      const start = parseISODateLocal(range.start_date);
      const end = parseISODateLocal(range.end_date);

      if (!earliest || start < earliest) earliest = start;
      if (!latest || end > latest) latest = end;
    });

    return { minDate: earliest, maxDate: latest };
  }, [allowedRanges]);

  const disabledMatcher = useMemo(() => {
    if (!allowedRanges || allowedRanges.length === 0) {
      return () => true;
    }

    const minTime = minDate?.getTime();
    const maxTime = maxDate?.getTime();

    return (date: Date) => {
      const dateTime = date.getTime();

      if (minTime && dateTime < minTime) return true;
      if (maxTime && dateTime > maxTime) return true;

      return !isDateInAllowedRanges(date, allowedRanges);
    };
  }, [allowedRanges, minDate, maxDate]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      onDatesChange([]);
      return;
    }

    const { from, to } = range;

    if (from && to) {
      if (allowedRanges && allowedRanges.length > 0) {
        const isValidRange = isRangeInSingleAllowedPeriod(from, to, allowedRanges);

        if (isValidRange) {
          onDatesChange([from, to]);
          setOpen(false);
        }
      } else {
        onDatesChange([from, to]);
        setOpen(false);
      }
    } else if (from) {
      if (allowedRanges && allowedRanges.length > 0) {
        const fromInRange = isDateInAllowedRanges(from, allowedRanges);
        if (fromInRange) {
          onDatesChange([from]);
        }
      } else {
        onDatesChange([from]);
      }
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy');
  };

  const numberOfMonths = 2;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="flex gap-4 items-between w-fit">
        <Popover.Trigger asChild>
          <div className="group">
            <div className="border-[#919EAB52] border-radius-lg rounded-md border-solid border relative hover:border-black max-w-[200px]">
              <CustomInput
                className="px-2 py-4 peer min-h-[56px]"
                placeholder=" "
                value={formatDate(selectedRange?.from)}
                readOnly
              />
              <CalendarOutline className="w-5 h-5 text-[#374957] absolute right-4 inset-y-0 m-auto" />
              <label className='origin-left peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 left-2 group-[[data-state="open"]]:group-focus-within:-translate-y-7 peer-[:not(:placeholder-shown)]:left-2 group-[[data-state="open"]]:group-focus-within:left-2 bg-white text-[rgba(145,158,171,1)] group-[[data-state="open"]]:group-focus-within:scale-75 inset-y-0 my-auto h-fit absolute transition-transform'>
                Fecha de inicio
              </label>
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Trigger asChild>
          <div className="group">
            <div className="border-[#919EAB52] border-radius-lg rounded-md border-solid border relative hover:border-black max-w-[200px]">
              <CustomInput
                className="px-2 py-4 peer min-h-[56px]"
                placeholder=" "
                value={formatDate(selectedRange?.to)}
                readOnly
              />
              <CalendarOutline className="w-5 h-5 text-[#374957] absolute right-4 inset-y-0 m-auto" />
              <label className='origin-left peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 left-2 group-[[data-state="open"]]:group-focus-within:-translate-y-7 peer-[:not(:placeholder-shown)]:left-2 group-[[data-state="open"]]:group-focus-within:left-2 bg-white text-[rgba(145,158,171,1)] group-[[data-state="open"]]:group-focus-within:scale-75 inset-y-0 my-auto h-fit absolute transition-transform'>
                Fecha de fin
              </label>
            </div>
          </div>
        </Popover.Trigger>
      </div>

      <Popover.Portal>
        <Popover.Content
          align="center"
          className="relative z-40 flex flex-col overflow-hidden bg-white rounded-lg shadow-md"
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          onInteractOutside={() => setOpen(false)}
        >
          <div className="p-4">
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              locale={esMxSundayStart}
              weekStartsOn={0}
              disabled={disabledMatcher}
              defaultMonth={new Date()}
              today={new Date()}
              components={{
                Caption: DayPickerCaption,
              }}
              modifiersClassNames={{
                today:
                  '!bg-[#E8F4FF] !text-[#0066CC] !font-bold !border-2 !border-solid !border-[#0066CC] !rounded-full',
              }}
              classNames={{
                months: 'flex gap-0',
                month:
                  'space-y-4 mx-4 w-[264px] [&:not(:first-child)]:pl-4 [&:not(:first-child)]:ml-0 [&:not(:first-child)]:w-[calc(264px_+_1rem)]',
                caption: '',
                caption_label:
                  'col-start-2 text-base font-semibold text-center text-black whitespace-nowrap capitalize',
                table: 'w-full border-collapse',
                head_row: 'mb-2 text-[#919EAB]',
                head_cell: 'text-[#919EAB] w-6 font-normal text-xs text-center uppercase',
                row: 'mt-2 text-center',
                cell: 'p-0 text-center text-sm align-middle',
                day: cn(
                  'rounded-full w-9 h-9 bg-transparent hover:bg-slate-200 transition-colors',
                  'aria-selected:bg-green aria-selected:text-white aria-selected:hover:bg-green-700'
                ),
                day_selected: 'bg-green text-white hover:bg-green-700',
                day_disabled: 'opacity-25 cursor-not-allowed',
                day_outside: 'opacity-0',
                day_range_start: 'rounded-r-none',
                day_range_end: 'rounded-l-none',
                day_range_middle: 'bg-green-200 rounded-none aria-selected:bg-green-200',
              }}
              formatters={{
                formatWeekdayName: (day) => day.toLocaleString('es-MX', { weekday: 'narrow' }).toUpperCase(),
              }}
            />
          </div>
          <div className="rounded-b-lg bg-[#F9F9F9] px-4 py-2 w-full border-t border-gray-100">
            <button
              className="flex items-center gap-2 p-2 text-sm font-bold text-black transition-all bg-transparent rounded-md hover:backdrop-brightness-95"
              onClick={() => {
                onDatesChange([]);
                setOpen(false);
              }}
            >
              <TrashOutline className="w-5 h-5" /> Limpiar selección
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
