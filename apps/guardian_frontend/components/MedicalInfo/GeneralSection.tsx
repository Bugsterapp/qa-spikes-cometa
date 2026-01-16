'use client';

import { type UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, FormInput, FormSelect, InfoItem } from '~/components/MedicalInfo';

export type GeneralInfo = {
  blood_type_code: string | null | undefined;
  weight: number | null | undefined;
  height: number | null | undefined;
  laterality: string | null | undefined;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

export const generalInfoSchema = z.object({
  blood_type_code: z.string({ required_error: REQUIRED_MESSAGE }).optional(),
  weight: z.coerce
    .number({ invalid_type_error: 'Debes ingresar un número válido.' })
    .min(1, REQUIRED_MESSAGE)
    .optional(),
  height: z.coerce
    .number({ invalid_type_error: 'Debes ingresar un número válido.' })
    .min(1, REQUIRED_MESSAGE)
    .optional(),
  laterality: z.string({ required_error: REQUIRED_MESSAGE }).optional(),
});

export type FormGeneralInfoValues = z.infer<typeof generalInfoSchema>;

export const GeneralSection = memo(function GeneralSection({
  generalInfo,
  form,
  defaultValues,
  isEditing,
  isLoading,
  isOpen,
  onClose,
  onDiscard,
  setIsEditing,
  setIsLoading,
  className,
}: {
  generalInfo: GeneralInfo;
  form: UseFormReturn<FormGeneralInfoValues>;
  defaultValues: FormGeneralInfoValues;
} & CommonSectionProps) {
  const items: InfoItem[] = [
    { label: 'Tipo de sangre', value: generalInfo?.blood_type_code || '-' },
    { label: 'Talla (cm)', value: generalInfo?.height || '-' },
    { label: 'Peso (kg)', value: generalInfo?.weight || '-' },
    { label: 'Lateralidad', value: generalInfo?.laterality || '-' },
  ];

  const {
    control,
    formState: { errors },
    register,
  } = form;

  return (
    <EditableSection
      title="Información general"
      items={items}
      form={form}
      defaultValues={defaultValues}
      isOpen={isOpen}
      isEditing={isEditing}
      isLoading={isLoading}
      onClose={onClose}
      onDiscard={onDiscard}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
      className={className}
    >
      <FormSelect
        label="Tipo de sangre"
        name="blood_type_code"
        control={control}
        errors={errors}
        options={bloodTypeOptions}
      />
      <FormInput label="Talla (cm)" name="height" register={register} errors={errors} />
      <FormInput label="Peso (kg)" name="weight" register={register} errors={errors} />
      <FormSelect label="Lateralidad" name="laterality" control={control} errors={errors} options={lateralityOptions} />
    </EditableSection>
  );
});

const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const lateralityOptions = ['Zurdo', 'Diestro', 'Ambos'];
