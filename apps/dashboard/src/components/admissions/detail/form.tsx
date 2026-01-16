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
import {
  Input,
  Label,
  PhoneInput,
  Select,
  TextArea,
  TextField,
  ContainerError,
  DatePicker,
  Radio,
} from '@cometa/recreo';
import { ReactNode } from 'react';

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
  type = 'text',
  register,
  errors,
}: {
  label: string;
  name: Path<T>;
  type?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Input
        {...register(name)}
        id={name}
        type={type}
        error={error}
        placeholder={label}
        isLegacy={false}
        className="px-4 py-2 rounded-md text-[#1C1C1D]"
      />
      <ContainerError error={error} />
    </div>
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
  disabled = false,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: Option[];
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Select
            className="w-full rounded-md text-[#1C1C1D]"
            disabled={disabled}
            onValueChange={onChange}
            value={value}
            error={error}
          >
            <Select.Content className="w-full outline-none">
              {options?.map(({ id, value, option, mark }) => (
                <Select.Item
                  className="w-full hover:bg-[#F5FAFF] outline-none"
                  value={value as string}
                  key={id as string}
                >
                  <div className="flex gap-2">
                    {option}
                    {mark && <>{mark}</>}
                  </div>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
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
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <FormLabel name={name}>{label}</FormLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <PhoneInput
            label=""
            initialValue={watch(name)}
            onChange={({ number }) => {
              clearErrors(name);
              field.onChange(number || '');
            }}
            error={error}
          />
        )}
      />
    </div>
  );
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  control,
  watch,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  watch: UseFormWatch<T>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField label={label} textareaGrow value={watch(name)} className="mb-2">
          <TextArea
            {...field}
            id={name}
            className="border-none max-h-[200px] min-h-[140px] transition-all resize-none"
          />
        </TextField>
      )}
    />
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
  showCalendarIcon?: boolean;
  control: Control<T>;
  errors: FieldErrors<T>;
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
