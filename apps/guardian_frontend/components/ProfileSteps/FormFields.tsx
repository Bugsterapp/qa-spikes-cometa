import {
  DatePicker,
  ContainerError,
  Input,
  Label,
  MultiSelect,
  PhoneInput,
  Radio,
  Select,
  TextArea,
} from '@cometa/recreo';
import { ReactNode } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  UseFormClearErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import SearchableComboBox from '../ui/SearchableComboBox';
import { cn } from '@cometa/utils';

export function FormLabel({ children, name }: { children: ReactNode; name: string }) {
  return (
    <Label htmlFor={name} className="text-[#535765] text-base font-normal">
      {children}
    </Label>
  );
}

export function FormInput<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  type = 'text',
  allowNegative = false,
  decimals = 2,
  className,
}: {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: 'number' | 'text';
  allowNegative?: boolean;
  decimals?: number;
  className?: string;
}) {
  const error = errors?.[name]?.message as string;

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const value = e.target.value;
      const decimalPart = decimals > 0 ? `\\.?\\d{0,${decimals}}` : '';
      const regexPattern = allowNegative ? new RegExp(`^-?\\d*${decimalPart}$`) : new RegExp(`^\\d*${decimalPart}$`);

      if (!regexPattern.test(value) && value !== '') {
        e.preventDefault();
        e.target.value = e.target.value.slice(0, -1);
      }
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <FormLabel name={name}>{label}</FormLabel>
      <Input
        {...register(name)}
        id={name}
        type={type === 'number' ? 'text' : type}
        inputMode={type === 'number' ? 'decimal' : 'text'}
        error={error}
        isLegacy={false}
        className="px-4 py-2 rounded-md text-[#1C1C1D] max-h-10"
        onInput={type === 'number' ? handleNumberInput : undefined}
      />
      <ContainerError error={error} />
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  className,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  className?: string;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn('flex flex-col gap-2', className)}>
          <FormLabel name={name}>{label}</FormLabel>
          <TextArea {...field} id={name} hasErrors={!!error} isLegacy={false} />
          <ContainerError error={error} />
        </div>
      )}
    />
  );
}

type Option = {
  id: string | null | undefined;
  value: string | null | undefined;
  option: string | null | undefined;
  mark?: ReactNode;
};
export function FormSelect<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  className,
  disabled = false,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: Option[];
  disabled?: boolean;
  className?: string;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            className="w-full rounded-md text-[#1C1C1D] max-h-10"
            onValueChange={field.onChange}
            value={field.value}
            error={error}
            disabled={disabled}
          >
            <Select.Content className="w-full outline-none">
              {options?.map(({ id, value, option }) => (
                <Select.Item
                  key={id as string}
                  value={value as string}
                  className="w-full hover:bg-[#F5FAFF] outline-none"
                >
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      />
    </div>
  );
}

export function FormMultiSelect<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  className,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: string[];
  className?: string;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <MultiSelect
            options={options.map((option) => ({ label: option, value: option }))}
            onValueChange={field.onChange}
            defaultValue={field.value}
            error={error}
            noPlaceholder
            className="rounded-md text-[#1C1C1D] max-h-10"
            variant="primary"
          />
        )}
      />
    </div>
  );
}

export function FormPhoneInput<T extends FieldValues>({
  label,
  name,
  control,
  watch,
  clearErrors,
  errors,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  watch: UseFormWatch<T>;
  clearErrors: UseFormClearErrors<T>;
  errors: FieldErrors<T>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <PhoneInput
            initialValue={watch(name)}
            label={label}
            onChange={({ number }) => {
              clearErrors(name);
              field.onChange(number || '');
            }}
            error={errors?.[name]?.message as string}
            isLegacy={false}
          />
        )}
      />
    </div>
  );
}

export function FormDateField<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  showCalendarIcon = true,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  showCalendarIcon?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <DatePicker {...field} error={error} showCalendarIcon={showCalendarIcon} />}
      />
    </div>
  );
}

export function FormRadioGroup<T extends FieldValues>({
  label,
  name,
  control,
  options,
  errors,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: Option[];
  errors: FieldErrors<T>;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Radio.Group
            value={field.value}
            onValueChange={field.onChange}
            key={name as string}
            error={error}
            className="mb-2"
          >
            <div className="flex gap-x-8 mt-2">
              {options.map(({ id, value, option }) => (
                <div key={id as string} className="flex items-center gap-2">
                  <Radio.Item key={id as string} id={id as string} value={value as string} />
                  <FormLabel name={id as string}>{option}</FormLabel>
                </div>
              ))}
            </div>
          </Radio.Group>
        )}
      />
    </div>
  );
}

export function FormSearchableCombobox<T extends FieldValues>({
  label,
  name,
  placeholder = 'Buscar...',
  control,
  errors,
  options,
  variant = 'static',
  disabled = false,
}: {
  label: string;
  name: Path<T>;
  placeholder?: string;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: Option[];
  variant?: 'floating' | 'static';
  disabled?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      {variant === 'static' ? <FormLabel name={name}>{label}</FormLabel> : null}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selectedOption = options.find((option) => option.value === value) || null;

          return (
            <SearchableComboBox<Option>
              items={options}
              label={variant === 'floating' ? label : undefined}
              placeholder={placeholder}
              onSelectedItemChange={(selectedItem) => {
                if (selectedItem) {
                  onChange(selectedItem.value);
                } else {
                  onChange('');
                }
              }}
              itemToString={(item) => item?.option || ''}
              filterItems={(item, inputValue) =>
                normalizeString(item.option || '').includes(normalizeString(inputValue))
              }
              selectedValue={selectedOption}
              error={error}
              id={name}
              variant={variant}
              disabled={disabled}
            />
          );
        }}
      />
    </div>
  );
}

function normalizeString(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
