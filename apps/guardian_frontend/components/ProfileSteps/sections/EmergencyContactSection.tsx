import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput, FormPhoneInput, FormSelect } from '../FormFields';
import { Guardian, GuardianStudent } from '@cometa/trpc';
import { api } from '~/utils/api';
import { Label, Radio } from '@cometa/recreo';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@cometa/utils';
import { useConditionalSchema } from '~/hooks/useConditionalSchema';

type DataInfo = {
  emergency_contact_id: string;
  emergency_contact_name: string | null | undefined;
  emergency_contact_phone: string | null | undefined;
  emergency_contact_relationship: string | null | undefined;
};

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const baseSchema = z.object({
  emergency_contact_id: z.string({ required_error: 'Debes seleccionar un contacto de emergencia.' }),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
});

type EmergencyContactSectionProps = {
  studentId: string;
  studentAdditionalInfo: StudentEntity | null | undefined;
  hiddenFields: string[];
};

export function EmergencyContactSection({
  studentId,
  studentAdditionalInfo,
  hiddenFields,
}: EmergencyContactSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { data: student } = api.student.get.useQuery({ id: studentId as string }, { enabled: !!studentId }) as {
    data: GuardianStudent;
  };
  const data = buildEmergencyContactInfo(studentAdditionalInfo, student?.guardians);

  const emergencyContact: DataInfo = {
    emergency_contact_id: data?.emergency_contact_id || 'Otro',
    emergency_contact_name: data?.emergency_contact_name || '',
    emergency_contact_phone: data?.emergency_contact_phone || '',
    emergency_contact_relationship: data?.emergency_contact_relationship || '',
  };

  const defaultValues = {
    ...emergencyContact,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Nombre:', value: emergencyContact.emergency_contact_name || '-', name: 'emergency_contact_name' },
    { label: 'Teléfono:', value: emergencyContact.emergency_contact_phone || '-', name: 'emergency_contact_phone' },
    {
      label: 'Parentesco con el estudiante',
      value: emergencyContact.emergency_contact_relationship || '-',
      name: 'emergency_contact_relationship',
    },
  ];

  const schema = useConditionalSchema(baseSchema, {
    shouldMakeOptional: (fieldName) => hiddenFields.includes(fieldName),
    shouldValidate: (fieldName) => !hiddenFields.includes(fieldName),
    refinement: (data, ctx, shouldValidate) => {
      if (data.emergency_contact_id === 'Otro') {
        if (shouldValidate('emergency_contact_name', data) && !data.emergency_contact_name?.trim()) {
          ctx.addIssue({
            path: ['emergency_contact_name'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
        if (shouldValidate('emergency_contact_phone', data) && !data.emergency_contact_phone?.trim()) {
          ctx.addIssue({
            path: ['emergency_contact_phone'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
        if (shouldValidate('emergency_contact_relationship', data) && !data.emergency_contact_relationship?.trim()) {
          ctx.addIssue({
            path: ['emergency_contact_relationship'],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      }
    },
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const {
    control,
    formState: { errors, isDirty },
    register,
    watch,
    setValue,
    clearErrors,
    reset,
  } = form;

  const formValues = watch();

  const hasOtherEmergencyContact = watch('emergency_contact_id') === 'Otro';

  useEffect(() => {
    if (studentAdditionalInfo) {
      reset(defaultValues);
    }
  }, [studentAdditionalInfo, reset]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.EmergencyContactForm, false);
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.EmergencyContactForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.EmergencyContactForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.EmergencyContactForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updateMedicalValues({ ...formValues });
      prevValuesRef.current = serializedValues;
    }
  }, [formValues, updateMedicalValues]);

  const filteredItems = items.filter((item) => !isHidden(item.name ?? '', hiddenFields));

  return (
    <EditableSection
      title="Contacto de emergencia"
      items={filteredItems}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      canEdit
      setIsEditing={setIsEditing}
    >
      <Controller
        control={control}
        name="emergency_contact_id"
        render={({ field }) => (
          <Radio.Group
            value={field.value || ''}
            onValueChange={field.onChange}
            error={errors.emergency_contact_id?.message as string}
            className={cn({ hidden: isHidden('emergency_contact_id', hiddenFields) })}
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
                <Radio.Item id="no" value="Otro" onClick={() => setValue('emergency_contact_id', 'Otro')} />
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
            options={guardianRelationshipOptions.map((option) => ({ id: option, value: option, option }))}
          />
        </>
      )}
    </EditableSection>
  );
}

function buildEmergencyContactInfo(
  data: StudentEntity | null | undefined,
  guardians: Guardian[] | undefined
): DataInfo {
  const medicalInfo = data?.medical_info;

  if (medicalInfo?.emergency_contact_id) {
    const guardianId = medicalInfo.emergency_contact_id;

    const guardian = guardians?.find((g) => g.id === guardianId);
    if (guardian) {
      return {
        emergency_contact_id: guardian.id,
        emergency_contact_name: `${guardian.first_name} ${guardian.last_name}`,
        emergency_contact_phone: guardian.phone,
        emergency_contact_relationship: guardian.relationship,
      };
    }
  }

  return {
    emergency_contact_id: medicalInfo?.emergency_contact_id || 'Otro',
    emergency_contact_name: medicalInfo?.emergency_contact_name ?? '',
    emergency_contact_phone: medicalInfo?.emergency_contact_phone ?? '',
    emergency_contact_relationship: medicalInfo?.emergency_contact_relationship ?? '',
  };
}

const guardianRelationshipOptions = ['Padre', 'Madre', 'Tío/a', 'Abuelo/a', 'Hermano/a', 'Otro'];
