'use client';

import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, InfoItem } from './editable-section';
import { FormPhoneInput, FormInput } from './form';
import { useHandleMutate } from './api';
import { api } from '/src/utils/api';
import { ApplicationFormEntity, UpsertApplicationFormDto } from '@cometa/trpc/src/admissions/types';
import { buildApplicationFormPayload } from './utils';

export type ContactInfo = {
  homephone: string;
  address: string;
  interior_number: string;
  neighborhood: string;
  municipality: string;
  zipcode: string;
};

export const contactInfoSchema = z.object({
  homephone: z.string(),
  address: z.string(),
  interior_number: z.string(),
  neighborhood: z.string(),
  municipality: z.string(),
  zipcode: z.string(),
});

export type FormContactInfoValues = z.infer<typeof contactInfoSchema>;

export function ContactEditableSection({
  userId,
  applicationForm,
  studentLeadId,
  schoolId,
  guardianId,
  contactInfo,
  form,
  defaultValues,
  isEditing,
  isLoading,
  setIsEditing,
  setIsLoading,
}: {
  userId: string;
  applicationForm?: ApplicationFormEntity;
  studentLeadId: string;
  schoolId: string;
  guardianId: string;
  contactInfo: ContactInfo;
  form: UseFormReturn<FormContactInfoValues>;
  defaultValues: FormContactInfoValues;
} & CommonSectionProps) {
  const utils = api.useUtils();
  const upsertApplicationForm = api.admissions.upsertApplicationForm.useMutation({
    onSuccess: async () => {
      await utils.admissions.getApplicationForm.invalidate();
    },
  });

  const handleUpsertApplication = useHandleMutate(upsertApplicationForm.mutateAsync);

  const fulllAddress = [
    contactInfo?.address,
    contactInfo?.interior_number,
    contactInfo?.neighborhood,
    contactInfo?.municipality,
    contactInfo?.zipcode,
  ]
    .filter(Boolean)
    .join('. ');

  const items: InfoItem[] = [
    { label: 'Teléfono de casa:', value: contactInfo?.homephone || '-' },
    { label: 'Dirección:', value: fulllAddress || '-' },
  ];

  const {
    formState: { errors },
    control,
    register,
    watch,
    clearErrors,
  } = form;

  async function handleSave(data: FormContactInfoValues): Promise<boolean> {
    const payload = buildApplicationFormPayload(data, studentLeadId, schoolId, guardianId, applicationForm);

    const { success } = await handleUpsertApplication({ ...payload, changed_by: userId } as UpsertApplicationFormDto);
    return success;
  }
  return (
    <EditableSection
      title="Datos de contacto"
      items={items}
      form={form}
      onSave={handleSave}
      defaultValues={defaultValues}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    >
      <FormPhoneInput
        label="Teléfono de casa"
        name="homephone"
        control={control}
        watch={watch}
        clearErrors={clearErrors}
        errors={errors}
      />
      <FormInput label="Direccion" name="address" register={register} errors={errors} />
      <FormInput label="Número interior" name="interior_number" register={register} errors={errors} />
      <FormInput label="Colonia" name="neighborhood" register={register} errors={errors} />
      <FormInput label="Municipio" name="municipality" register={register} errors={errors} />
      <FormInput label="Código postal" name="zipcode" register={register} errors={errors} />
    </EditableSection>
  );
}
