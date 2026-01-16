import React from 'react';
import { Controller, Control, FieldErrors, Path } from 'react-hook-form';

import { Label, Radio, Chip } from '@cometa/recreo';
import { cn } from '@cometa/utils';

import { Tooltip } from '../atoms/Tooltip';

type RadioOption = {
  id: string;
  value: string;
  label: string;
  recommended?: boolean;
};

function FormRadioGroup<T extends Record<string, unknown>>({
  title,
  description,
  name,
  control,
  options,
  errors,
  disabled = false,
  readOnly = false,
  allowEmpty = false,
  children,
}: Readonly<{
  title: string;
  description?: string;
  name: Path<T>;
  control: Control<T>;
  options: RadioOption[];
  errors: FieldErrors<T>;
  disabled?: boolean;
  readOnly?: boolean;
  allowEmpty?: boolean;
  children?: React.ReactNode;
}>) {
  const error = errors?.[name]?.message as string;

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <div className="flex flex-col items-start gap-1 w-full">
        <h4 className={cn('text-base font-semibold font-lota', disabled ? 'text-[#919EAB]' : 'text-[#212B36]')}>
          {title}
        </h4>
        {description && <p className="text-sm text-[#697086] font-lota">{description}</p>}
      </div>
      <Controller
        control={control}
        name={name}
        rules={{
          required: !disabled && !readOnly && !allowEmpty ? 'Este campo es requerido' : false,
          validate: allowEmpty ? undefined : (value) => value !== '' && value !== undefined && value !== null,
        }}
        render={({ field }) => (
          <Radio.Group
            value={field.value as string}
            onValueChange={field.onChange}
            error={error}
            className="w-full"
            disabled={disabled || readOnly}
          >
            {options.map((option) => (
              <div key={option.id} className="flex items-center gap-3 p-2">
                <Radio.Item
                  id={option.id}
                  value={option.value}
                  error={!!error}
                  disabled={disabled || readOnly}
                  className="w-5 h-5"
                />
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      'text-sm font-lota',
                      disabled ? 'text-[#919EAB] cursor-default' : 'text-[#212B36] cursor-pointer',
                      readOnly && !disabled ? 'cursor-default' : ''
                    )}
                  >
                    {option.label}
                  </Label>
                  {option.recommended && (
                    <Tooltip message="Opción recomendada por Cometa" side="top">
                      <div>
                        <Chip variant="success">Recomendado</Chip>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </Radio.Group>
        )}
      />
      {children}
    </div>
  );
}

export { FormRadioGroup, type RadioOption };
