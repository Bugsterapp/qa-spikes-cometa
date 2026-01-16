'use client';

import { type UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import {
  CommonSectionProps,
  EditableSection,
  FormInput,
  FormMultiSelect,
  FormTextarea,
  InfoItem,
} from '~/components/MedicalInfo';

export type Background = {
  family_history: string[] | null | undefined;
  personal_history: string[] | null | undefined;
  current_ailments: string[] | null | undefined;
  other_history: string | null | undefined;
  recent_interventions: string | null | undefined;
};

export const backgroundSchema = z.object({
  family_history: z.array(z.string()).optional(),
  personal_history: z.array(z.string()).optional(),
  current_ailments: z.array(z.string()).optional(),
  recent_interventions: z.string().optional(),
  other_history: z.string().optional(),
});

export type FormBackgroundValues = z.infer<typeof backgroundSchema>;

export const BackgroundSection = memo(function BackgroundSection({
  background,
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
  background: Background;
  form: UseFormReturn<FormBackgroundValues>;
  defaultValues: FormBackgroundValues;
} & CommonSectionProps) {
  const items: InfoItem[] = [
    { label: 'Antecedentes familiares:', value: background?.family_history || '-' },
    { label: 'Antecedentes personales:', value: background?.personal_history || '-' },
    { label: 'Padecimientos actuales:', value: background?.current_ailments || '-' },
    { label: 'Intervenciones quirúrgicas ó fracturas', value: background?.recent_interventions || '-' },
    { label: 'Otros antecedentes', value: background?.other_history || '-' },
  ];

  const {
    control,
    formState: { errors },
    register,
  } = form;

  return (
    <EditableSection
      title="Antecedentes"
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
      <FormMultiSelect
        label="Antecedentes familiares"
        name="family_history"
        control={control}
        errors={errors}
        options={familyHistoryOptions}
      />
      <FormMultiSelect
        label="Antecedentes personales"
        name="personal_history"
        control={control}
        errors={errors}
        options={personalHistoryOptions}
      />
      <FormMultiSelect
        label="Padecimientos actuales"
        name="current_ailments"
        control={control}
        errors={errors}
        options={currentAilmentsOptions}
      />
      <FormInput
        label="Intervenciones quirúrgicas o fracturas"
        name="recent_interventions"
        register={register}
        errors={errors}
      />
      <FormTextarea label="Otros padecimientos" name="other_history" control={control} errors={errors} />
    </EditableSection>
  );
});

const familyHistoryOptions = [
  'Ninguno',
  'Cáncer',
  'Diabetes',
  'Tumoraciones',
  'Hipertensión',
  'Anemia',
  'Epilepsia',
  'Obesidad',
  'Migraña',
  'Problemas visuales',
  'Problemas auditivos',
  'Fiebre reumática',
];

const personalHistoryOptions = [
  'Ninguno',
  'Hepatitis',
  'Varicela',
  'Sarampión',
  'Tosferina',
  'Tifoidea',
  'Paratosis',
  'Poliomielitis',
  'Paperas',
  'Artritis',
  'Paludismo',
  'Crisis convulsiva',
  'Otitis',
  'Neumonía',
];

const currentAilmentsOptions = [
  'Ninguno',
  'Asma',
  'Problemas visuales',
  'Problemas del corazón',
  'Enfermedades contagiosas',
  'Problemas auditivos',
  'Diabetes',
  'Migraña',
  'Problemas respiratorios',
];
