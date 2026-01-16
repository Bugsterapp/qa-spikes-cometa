'use client';

import { Radio } from '@cometa/recreo';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, FormLabel, FormMultiSelect, InfoItem } from '~/components/MedicalInfo';

export type MedicalAuthorization = {
  drugs: string[] | null | undefined;
  authorize_emergency_transfer: string | null | undefined;
  authorize_physical_activity: string | null | undefined;
};

export const medicalAuthorizationSchema = z.object({
  drugs: z.array(z.string()).optional(),
  authorize_emergency_transfer: z.string().optional(),
  authorize_physical_activity: z.string().optional(),
});

export type FormMedicalAuthorizationValues = z.infer<typeof medicalAuthorizationSchema>;

export const MedicalAuthorizationSection = memo(function MedicalAuthorizationSection({
  medicalAuthorization,
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
  medicalAuthorization: MedicalAuthorization;
  form: UseFormReturn<FormMedicalAuthorizationValues>;
  defaultValues: FormMedicalAuthorizationValues;
} & CommonSectionProps) {
  const items: InfoItem[] = [
    { label: 'Medicamentos autorizados a suministrar:', value: medicalAuthorization?.drugs || '-' },
    {
      label: 'Autorización de traslado a sala de urgencias:',
      value: medicalAuthorization?.authorize_emergency_transfer,
    },
    { label: 'Autorización a realizar actividad física:', value: medicalAuthorization?.authorize_physical_activity },
  ];

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <EditableSection
      title="Autorizaciones médicas"
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
        label="Medicamentos autorizados a suministrar"
        name="drugs"
        control={control}
        errors={errors}
        options={drugOptions}
      />
      <Controller
        control={control}
        name="authorize_emergency_transfer"
        render={({ field }) => (
          <Radio.Group
            value={field.value}
            onValueChange={field.onChange}
            error={errors.authorize_emergency_transfer?.message}
          >
            <p>Autorización de traslado a la sala de urgencias:</p>
            <div className="flex gap-x-8 mt-2">
              <div className="flex items-center gap-2">
                <Radio.Item id="yes" value="Sí" />
                <FormLabel name="yes">Sí</FormLabel>
              </div>
              <div className="flex items-center gap-2">
                <Radio.Item id="no" value="No" />
                <FormLabel name="no">No</FormLabel>
              </div>
            </div>
          </Radio.Group>
        )}
      />
      <Controller
        control={control}
        name="authorize_physical_activity"
        render={({ field }) => (
          <Radio.Group
            value={field.value}
            onValueChange={field.onChange}
            error={errors.authorize_physical_activity?.message}
          >
            <p>Autorización a realizar actividad física:</p>
            <div className="flex gap-x-8 mt-2">
              <div className="flex items-center gap-2">
                <Radio.Item id="yes" value="Sí" />
                <FormLabel name="yes">Sí</FormLabel>
              </div>
              <div className="flex items-center gap-2">
                <Radio.Item id="no" value="No" />
                <FormLabel name="no">No</FormLabel>
              </div>
            </div>
          </Radio.Group>
        )}
      />
    </EditableSection>
  );
});

const drugOptions = [
  'Paracetamol',
  'Ibuprofeno',
  'Loratadina',
  'Betametasona',
  'Pepto bismol',
  'Syncol',
  'Diclofenaco',
  'Tums',
  'Naproxeno',
  'Ketorolaco',
  'Metoclopramida',
  'Clorfenamina',
  'Clorhidrato pargeverina',
  'Butilescopolamina',
];
