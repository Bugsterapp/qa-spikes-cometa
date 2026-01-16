import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormLabel, FormMultiSelect } from '../FormFields';
import { Radio } from '@cometa/recreo';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { formatBooleanField } from '../utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@cometa/utils';
import { useConditionalSchema } from '~/hooks/useConditionalSchema';

type DataInfo = {
  drugs: string[] | null | undefined;
  authorize_emergency_transfer: string | null | undefined;
  authorize_physical_activity: string | null | undefined;
};

const REQUIRED_RADIO_MESSAGE = 'Debes completar esta pregunta para continuar.';

const formSchema = z.object({
  drugs: z.array(z.string()).optional().nullable(),
  authorize_emergency_transfer: z.string().min(2, REQUIRED_RADIO_MESSAGE),
  authorize_physical_activity: z.string().min(2, REQUIRED_RADIO_MESSAGE),
});

type MedicalAuthorizationSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
  hiddenFields: string[];
};

export function MedicalAuthorizationSection({
  studentAdditionalInfo,
  hiddenFields,
  onIsValid,
  hasValidationErrors = false,
}: MedicalAuthorizationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);
  const medicalInfo = studentAdditionalInfo?.medical_info;

  const medicalAuthorization: DataInfo = {
    drugs: medicalInfo?.drugs ? medicalInfo.drugs?.split(', ') : [],
    authorize_emergency_transfer: formatBooleanField(medicalInfo?.authorize_emergency_transfer),
    authorize_physical_activity: formatBooleanField(medicalInfo?.authorize_physical_activity),
  };

  const defaultValues = {
    drugs: medicalAuthorization?.drugs || undefined,
    authorize_emergency_transfer: medicalAuthorization?.authorize_emergency_transfer || '',
    authorize_physical_activity: medicalAuthorization?.authorize_physical_activity || '',
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Medicamentos autorizados a suministrar:', value: medicalAuthorization?.drugs || '-', name: 'drugs' },
    {
      label: 'Autorización de traslado a sala de urgencias:',
      value: medicalAuthorization?.authorize_emergency_transfer,
      name: 'authorize_emergency_transfer',
    },
    {
      label: 'Autorización a realizar actividad física:',
      value: medicalAuthorization?.authorize_physical_activity,
      name: 'authorize_physical_activity',
    },
  ];

  const schema = useConditionalSchema(formSchema, {
    shouldMakeOptional: (fieldName) => isHidden(fieldName, hiddenFields),
    shouldValidate: (fieldName) => !isHidden(fieldName, hiddenFields),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const {
    control,
    formState: { errors, isDirty },
    reset,
    watch,
    trigger,
  } = form;

  const formValues = watch();

  useEffect(() => {
    reset(defaultValues);
    trigger().then((isValid) => {
      setCanEdit(isValid);
      setIsEditing(!isValid);
      onIsValid(isValid, 'medicalAuthorization');
      setHasTriggeredValidation(false);
    });
  }, [studentAdditionalInfo, reset]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.MedicalAuthorizationForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.MedicalAuthorizationForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.MedicalAuthorizationForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.MedicalAuthorizationForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updateMedicalValues({ ...formValues });
      prevValuesRef.current = serializedValues;
    }
  }, [formValues, updateMedicalValues]);

  const displayErrors = hasTriggeredValidation ? errors : {};

  useEffect(() => {
    if (hasValidationErrors) {
      setIsEditing(true);
      setCanEdit(false);
    }
  }, [hasValidationErrors]);

  const filteredItems = items.filter((item) => !isHidden(item.name ?? '', hiddenFields));

  return (
    <EditableSection
      title="Autorizaciones médicas"
      items={filteredItems}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      canEdit={canEdit}
      setIsEditing={(editing) => {
        setIsEditing(editing);
        if (editing) {
          setHasTriggeredValidation(true);
        }
      }}
    >
      <FormMultiSelect
        label="Medicamentos autorizados a suministrar (opcional)"
        name="drugs"
        control={control}
        errors={displayErrors}
        options={drugOptions}
        className={cn({ hidden: isHidden('drugs', hiddenFields) })}
      />
      <Controller
        control={control}
        name="authorize_emergency_transfer"
        render={({ field }) => (
          <Radio.Group
            value={field.value as string}
            onValueChange={field.onChange}
            error={displayErrors.authorize_emergency_transfer?.message as string}
            className={cn({ hidden: isHidden('authorize_emergency_transfer', hiddenFields) })}
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
            value={field.value as string}
            onValueChange={field.onChange}
            error={displayErrors.authorize_physical_activity?.message as string}
            className={cn({ hidden: isHidden('authorize_physical_activity', hiddenFields) })}
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
}

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
