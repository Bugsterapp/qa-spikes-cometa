'use client';

import { UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, FormInput, InfoItem } from '~/components/MedicalInfo';

export type Allergies = {
  drug_allergies: string | null | undefined;
  food_allergies: string | null | undefined;
  plant_allergies: string | null | undefined;
  other_allergies: string | null | undefined;
};

export const allergiesSchema = z.object({
  drug_allergies: z.string().optional(),
  food_allergies: z.string().optional(),
  plant_allergies: z.string().optional(),
  other_allergies: z.string().optional(),
});

export type FormAllergiesValues = z.infer<typeof allergiesSchema>;

export const AllergiesSection = memo(function AllergiesSection({
  allergies,
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
  allergies: Allergies;
  form: UseFormReturn<FormAllergiesValues>;
  defaultValues: FormAllergiesValues;
} & CommonSectionProps) {
  const items: InfoItem[] = [
    { label: 'Alergias a medicamentos:', value: allergies?.drug_allergies || '-' },
    { label: 'Alergias a alimentos:', value: allergies?.food_allergies || '-' },
    { label: 'Alergias a plantas ó animales', value: allergies?.plant_allergies || '-' },
    { label: 'Otras alergias', value: allergies?.other_allergies || '-' },
  ];

  const {
    formState: { errors },
    register,
  } = form;

  return (
    <EditableSection
      title="Alergias"
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
      <FormInput label="Alergia a medicamentos" name="drug_allergies" register={register} errors={errors} />
      <FormInput label="Alergias a alimentos" name="food_allergies" register={register} errors={errors} />
      <FormInput label="Alergias a plantas o animales" name="plant_allergies" register={register} errors={errors} />
      <FormInput label="Otras alergias" name="other_allergies" register={register} errors={errors} />
    </EditableSection>
  );
});
