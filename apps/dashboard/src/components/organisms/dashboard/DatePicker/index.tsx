import * as React from 'react';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@cometa/utils';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Calendar } from '@cometa/recreo/v2/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

interface Props {
  label?: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  reset?: boolean;
  minDate?: Date;
  className?: string;
}

export default function DatePicker({ label, selectedDate, setSelectedDate, reset, minDate, className }: Props) {
  const now = new Date();
  now.setHours(0, 0, 0);
  const today = now.toISOString();

  const parseDate = (dateValue: string): Date | undefined => {
    if (!dateValue) return undefined;

    let parsed = new Date(dateValue);
    if (isValid(parsed)) {
      return startOfDay(parsed);
    }

    parsed = parse(dateValue, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) {
      return startOfDay(parsed);
    }

    parsed = parse(dateValue, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      return startOfDay(parsed);
    }

    return undefined;
  };

  const [date, setDate] = React.useState<Date | undefined>(() => parseDate(selectedDate));

  React.useEffect(() => {
    setDate(parseDate(selectedDate));
  }, [selectedDate]);

  React.useEffect(() => {
    if (reset) {
      setSelectedDate(today);
    }
  }, [reset]);

  const handleSelect = (newDate: Date | undefined) => {
    const normalizedDate = newDate ? startOfDay(newDate) : undefined;
    setDate(normalizedDate);
    if (normalizedDate) {
      setSelectedDate(normalizedDate.toISOString());
    } else {
      setSelectedDate(today);
    }
  };

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full h-[52px] justify-start text-left font-normal',
              'border border-gray-300 rounded-md',
              'hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-galaxy-500',
              !date && 'text-gray-400',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
            {date ? (
              <span className="text-gray-900">{format(date, 'dd/MM/yy', { locale: es })}</span>
            ) : (
              <span>{label || 'Selecciona una fecha'}</span>
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
            disabled={(date) => {
              if (date > now) {
                return true;
              }

              if (minDate && date < new Date(minDate)) {
                return true;
              }

              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
