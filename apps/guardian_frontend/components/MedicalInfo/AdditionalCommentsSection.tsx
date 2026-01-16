'use client';

import { type UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, FormInput, FormTextarea, InfoItem } from '~/components/MedicalInfo';

export type AdditionalComments = {
  pending_vaccines: string | null | undefined;
  comments: string | null | undefined;
};

export const additionalCommentsSchema = z.object({
  pending_vaccines: z.string().optional(),
  comments: z.string().optional(),
});

export type FormAdditionalCommentsValues = z.infer<typeof additionalCommentsSchema>;

export const AdditionalCommentsSection = memo(function AdditionalCommentsSection({
  additionalComments,
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
  additionalComments: AdditionalComments;
  form: UseFormReturn<FormAdditionalCommentsValues>;
  defaultValues: FormAdditionalCommentsValues;
} & CommonSectionProps) {
  const items: InfoItem[] = [
    { label: 'Vacunas pendientes:', value: additionalComments?.pending_vaccines || '-' },
    { label: 'Comentarios adicionales:', value: additionalComments?.comments || '-' },
  ];

  const {
    control,
    formState: { errors },
    register,
  } = form;

  return (
    <EditableSection
      title="Observaciones adicionales"
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
      <FormInput label="Vacunas" name="pending_vaccines" register={register} errors={errors} />
      <FormTextarea label="Comentarios adicionales" name="comments" control={control} errors={errors} />
    </EditableSection>
  );
});
