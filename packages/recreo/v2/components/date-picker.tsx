import * as React from 'react';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';

import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  className,
  error,
  disabled = false,
  minDate,
}: DatePickerProps) {
  const parseDate = (dateValue: Date | string | undefined): Date | undefined => {
    if (!dateValue) return undefined;

    if (dateValue instanceof Date) {
      return startOfDay(dateValue);
    }

    if (typeof dateValue === 'string' && dateValue) {
      // Try parsing as yyyy-MM-dd format first (common format from forms)
      let parsed = parse(dateValue, 'yyyy-MM-dd', new Date());
      if (isValid(parsed)) {
        return startOfDay(parsed);
      }

      // Try parsing as dd/MM/yyyy format (display format)
      parsed = parse(dateValue, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) {
        return startOfDay(parsed);
      }

      // Fallback to Date constructor but adjust for timezone
      const date = new Date(dateValue + 'T12:00:00');
      if (isValid(date)) {
        return startOfDay(date);
      }
    }

    return undefined;
  };

  const [date, setDate] = React.useState<Date | undefined>(() => parseDate(value));

  React.useEffect(() => {
    setDate(parseDate(value));
  }, [value]);

  const handleSelect = (newDate: Date | undefined) => {
    const normalizedDate = newDate ? startOfDay(newDate) : undefined;
    setDate(normalizedDate);
    onChange?.(normalizedDate);
  };

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full h-14 justify-start text-left font-normal',
              'border border-gray-300 rounded-md',
              'hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-galaxy-500',
              !date && 'text-gray-400',
              error && 'border-red-500',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
            {date ? (
              <span className="text-gray-900">{format(date, 'dd/MM/yyyy', { locale: es })}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            className="rounded-lg"
            disabled={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
