'use client';

import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import { Label, Radio } from '@cometa/recreo';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { memo } from 'react';
import { z } from 'zod';
import { GuardianStudent } from '@cometa/trpc/src/types';
import {
  CommonSectionProps,
  EditableSection,
  FormInput,
  FormPhoneInput,
  FormSelect,
  InfoItem,
} from '~/components/MedicalInfo';

export type EmergencyContact = {
  id: string | null | undefined;
  name: string | null | undefined;
  phone: string | null | undefined;
  relationship: string | null | undefined;
};

export const emergencyContactSchema = z.object({
  emergency_contact_id: z
    .string({ required_error: 'Debes seleccionar un contacto de emergencia.' })
    .optional()
    .nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
});

export type FormEmergencyContactValues = z.infer<typeof emergencyContactSchema>;

export const EmergencyContactSection = memo(function EmergencyContactSection({
  emergencyContact,
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
  emergencyContact: EmergencyContact;
  form: UseFormReturn<FormEmergencyContactValues>;
  defaultValues: FormEmergencyContactValues;
} & CommonSectionProps) {
  const router = useRouter();
  const { studentId } = router.query;
  const { data: student } = api.student.get.useQuery({ id: studentId as string }, { enabled: !!studentId }) as {
    data: GuardianStudent;
  };

  const items: InfoItem[] = [
    { label: 'Nombre:', value: emergencyContact.name || '-' },
    { label: 'Teléfono:', value: emergencyContact.phone || '-' },
    { label: 'Parentesco con el estudiante', value: emergencyContact.relationship || '-' },
  ];

  const {
    control,
    formState: { errors },
    register,
    watch,
    setValue,
    clearErrors,
  } = form;

  const hasOtherEmergencyContact = watch('emergency_contact_id') === 'Otro';

  return (
    <EditableSection
      title="Contacto de emergencia"
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
      <Controller
        control={control}
        name="emergency_contact_id"
        render={({ field }) => (
          <Radio.Group
            value={field.value || ''}
            onValueChange={field.onChange}
            error={errors.emergency_contact_id?.message}
          >
            <div className="flex flex-col gap-4">
              {student?.guardians?.map((guardian) => {
                const id = guardian.id as string;
                const fullName = `${guardian.first_name} ${guardian.last_name}`;

                return (
                  <div key={id} className="flex items-center gap-2">
                    <Radio.Item
                      id={id}
                      value={id}
                      onClick={() => {
                        setValue('emergency_contact_name', '');
                        setValue('emergency_contact_phone', '');
                        setValue('emergency_contact_relationship', '');
                      }}
                    />
                    <Label htmlFor={id}>{fullName}</Label>
                  </div>
                );
              })}
              <div className="flex items-center gap-2">
                <Radio.Item id="no" value="Otro" onClick={() => setValue('emergency_contact_id', '')} />
                <Label htmlFor="no">Otro</Label>
              </div>
            </div>
          </Radio.Group>
        )}
      />
      {hasOtherEmergencyContact && (
        <>
          <FormInput label="Nombre" name="emergency_contact_name" register={register} errors={errors} />
          <FormPhoneInput
            label="Teléfono"
            name="emergency_contact_phone"
            control={control}
            watch={watch}
            clearErrors={clearErrors}
            errors={errors}
          />
          <FormSelect
            label="Parentesco con el estudiante"
            name="emergency_contact_relationship"
            control={control}
            errors={errors}
            options={guardianRelationshipOptions}
          />
        </>
      )}
    </EditableSection>
  );
});

const guardianRelationshipOptions = ['Padre', 'Madre', 'Tío/a', 'Abuelo/a', 'Hermano/a', 'Otro'];
