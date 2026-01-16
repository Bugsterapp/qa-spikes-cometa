import { cn } from '@cometa/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { format, isValid, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { Button, Calendar, ContainerError, Input } from './ui';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value: string;
  label?: string;
  error?: string;
  className?: string;
  onChange: (value: string | undefined) => void;
  onClick?: () => void;
  disabled?: boolean;
  showCalendarIcon?: boolean;
  name?: string;
}

function DatePicker({
  value,
  label,
  error,
  className,
  onClick,
  onChange,
  disabled: initialDisabled = false,
  showCalendarIcon = true,
  name,
}: DatePickerProps) {
  const [stringDate, setStringDate] = useState<string>(value);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [inputError, setInputError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(error);
  const [disabled, setDisabled] = useState<boolean>(initialDisabled);

  useEffect(() => {
    if (value) {
      setStringDate(value);
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    }
  }, [value]);

  useEffect(() => {
    setDisabled(initialDisabled);
  }, [initialDisabled]);

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');

    value = value.slice(0, 8);

    const day = value.slice(0, 2);
    const month = value.slice(2, 4);
    const year = value.slice(4);

    let formattedValue = day;
    if (value.length > 2) formattedValue += '/' + month;
    if (value.length > 4) formattedValue += '/' + year;

    setStringDate(formattedValue);

    const newPosition = formattedValue.length;
    setTimeout(() => {
      input.setSelectionRange(newPosition, newPosition);
    }, 0);

    if (formattedValue.length === 10) {
      const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        setErrorMessage('');
        setDate(parsedDate);
      } else {
        setErrorMessage('Fecha inválida');
        setDate(undefined);
      }
    } else {
      setErrorMessage('');
      setDate(undefined);
    }
  }

  function handleOnChange(date: Date | undefined) {
    if (disabled) return;

    if (date) {
      onChange(format(date, 'dd/MM/yyyy'));
    } else if (stringDate) {
      onChange(stringDate);
    }
  }

  return (
    <Popover>
      <div className="relative">
        <Input
          name={name}
          id={name}
          type="text"
          value={stringDate}
          onChange={handleDateInput}
          onBlur={() => handleOnChange(date)}
          placeholder={label || 'DD/MM/YYYY'}
          maxLength={10}
          className={cn('text-base text-[#1C1C1D]', className, {
            'text-muted-foreground cursor-not-allowed': disabled,
          })}
          isLegacy={false}
          onClick={onClick}
          inputMode="numeric"
          disabled={disabled}
        />
        {/* Priority: external error > internal inputError (future use) > validation error */}
        <ContainerError error={error || inputError || errorMessage} />
        {showCalendarIcon && (
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('font-normal absolute right-2 translate-y-[-50%] top-[50%] p-2', {
                'text-muted-foreground': !date || disabled,
              })}
              disabled={disabled}
            >
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        )}
      </div>
      <PopoverContent className="z-50 w-auto p-0 bg-white dark:bg-boxdark border rounded-lg">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (!selectedDate) return;
            setDate(selectedDate);
            setStringDate(format(selectedDate, 'dd/MM/yyyy'));
            handleOnChange(selectedDate);
            setInputError('');
          }}
          defaultMonth={date}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
