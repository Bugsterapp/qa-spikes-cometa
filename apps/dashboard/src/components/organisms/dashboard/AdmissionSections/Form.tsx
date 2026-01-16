import { ContainerError, Input, Label, MultiSelect, Select, TextArea } from '@cometa/recreo';
import { cn } from '@cometa/utils';
import { ReactNode } from 'react';
import { Control, Controller, FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

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
  isHidden,
}: {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  isHidden?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className={cn('flex flex-col gap-1', { hidden: isHidden })}>
      <FormLabel name={name}>{label}</FormLabel>
      <Input
        {...register(name)}
        id={name}
        type="text"
        error={error}
        isLegacy={false}
        className="px-4 py-2 rounded-md text-[#1C1C1D] max-h-10"
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
  isHidden,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  isHidden?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn('flex flex-col gap-2', { hidden: isHidden })}>
          <FormLabel name={name}>{label}</FormLabel>
          <TextArea {...field} id={name} hasErrors={!!error} isLegacy={false} />
          <ContainerError error={error} />
        </div>
      )}
    />
  );
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  control,
  errors,
  options,
  isHidden,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: string[];
  isHidden?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className={cn('flex flex-col gap-1', { hidden: isHidden })}>
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
          >
            <Select.Content className="w-full outline-none">
              {options?.map((option) => (
                <Select.Item key={option} value={option} className="w-full hover:bg-[#F5FAFF] outline-none">
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
  isHidden,
}: {
  label: string;
  name: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  options: string[];
  isHidden?: boolean;
}) {
  const error = errors?.[name]?.message as string;

  return (
    <div className={cn('flex flex-col gap-1', { hidden: isHidden })}>
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
