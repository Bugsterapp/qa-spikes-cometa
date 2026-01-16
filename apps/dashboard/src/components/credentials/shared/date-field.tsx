import { DatePicker } from '@cometa/recreo/components/DatePicker';
import { ExpandableFieldItem } from './expandable-field-item';

type DateFieldProps = {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  date: string;
  onDateChange: (date: string | undefined) => void;
  disabled?: boolean;
  className?: string;
  dateLabel?: string;
};

export function DateField({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  date,
  onDateChange,
  disabled,
  className,
  dateLabel = 'Fecha',
}: DateFieldProps) {
  return (
    <ExpandableFieldItem
      id={id}
      label={label}
      description={description}
      isEnabled={isEnabled}
      onToggle={onToggle}
      disabled={disabled}
      className={className}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-neutral-700">
          {dateLabel}
        </label>
        <DatePicker name="date" value={date} onChange={onDateChange} disabled={disabled} showCalendarIcon />
      </div>
    </ExpandableFieldItem>
  );
}
