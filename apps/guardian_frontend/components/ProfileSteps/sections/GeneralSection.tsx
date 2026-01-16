import { z } from 'zod';
import { useForm, UseFormRegister } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput, FormSelect } from '../FormFields';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@cometa/utils';
import { useConditionalSchema } from '~/hooks/useConditionalSchema';

type DataInfo = {
  blood_type_code: string | null | undefined;
  weight: number | null | undefined;
  height: number | null | undefined;
  laterality: string | null | undefined;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const formSchema = z.object({
  blood_type_code: z.string({ required_error: REQUIRED_MESSAGE }),
  weight: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).min(1, REQUIRED_MESSAGE),
  height: z.coerce.number({ invalid_type_error: 'Debes ingresar un número válido.' }).min(1, REQUIRED_MESSAGE),
  laterality: z.string({ required_error: REQUIRED_MESSAGE }),
});

type GeneralSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
  hiddenFields: string[];
};

export function GeneralSection({
  studentAdditionalInfo,
  onIsValid,
  hasValidationErrors = false,
  hiddenFields,
}: GeneralSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  const medicalInfo = studentAdditionalInfo?.medical_info;

  const generalInfo: DataInfo = {
    blood_type_code: medicalInfo?.blood_type_code || undefined,
    weight: medicalInfo?.weight || undefined,
    height: medicalInfo?.height || undefined,
    laterality: medicalInfo?.laterality || undefined,
  };

  const defaultValues = {
    ...generalInfo,
    blood_type_code: generalInfo.blood_type_code as string,
    weight: generalInfo?.weight as number,
    height: generalInfo?.height as number,
    laterality: generalInfo.laterality as string,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Tipo de sangre', value: generalInfo?.blood_type_code || '-', name: 'blood_type' },
    { label: 'Talla (cm)', value: generalInfo?.height || '-', name: 'height' },
    { label: 'Peso (kg)', value: generalInfo?.weight || '-', name: 'weight' },
    { label: 'Lateralidad', value: generalInfo?.laterality || '-', name: 'laterality' },
  ];

  const schema = useConditionalSchema(formSchema, {
    shouldMakeOptional: (fieldName) => isHidden(fieldName, hiddenFields),
    shouldValidate: (fieldName) => !isHidden(fieldName, hiddenFields),
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
    reset,
    register,
    watch,
    trigger,
  } = form;

  const formValues = watch();

  useEffect(() => {
    reset(defaultValues);
    trigger().then((isValid) => {
      setCanEdit(isValid);
      setIsEditing(!isValid);
      onIsValid(isValid, 'general');
      setHasTriggeredValidation(false);
    });
  }, [JSON.stringify(defaultValues)]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.GeneralForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.GeneralForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.GeneralForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.GeneralForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updateMedicalValues({
        ...formValues,
        weight: Number.isNaN(Number(formValues.weight)) ? null : Number(formValues.weight),
        height: Number.isNaN(Number(formValues.height)) ? null : Number(formValues.height),
      });
      prevValuesRef.current = serializedValues;
    }
  }, [formValues, updateMedicalValues]);

  const customRegister: UseFormRegister<FormValues> = (name) => {
    const registration = register(name);
    return {
      ...registration,
      onChange: async (e) => {
        await registration.onChange(e);
        setHasTriggeredValidation(true);
      },
    };
  };

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
      title="Información general"
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
      <FormSelect
        label="Tipo de sangre"
        name="blood_type_code"
        control={control}
        errors={displayErrors}
        options={bloodTypeOptions.map((option) => ({ id: option, value: option, option }))}
        className={cn({ hidden: isHidden('blood_type', hiddenFields) })}
      />
      <FormInput
        label="Talla (cm)"
        name="height"
        type="number"
        register={customRegister}
        errors={displayErrors}
        className={cn({ hidden: isHidden('height', hiddenFields) })}
      />
      <FormInput
        label="Peso (kg)"
        name="weight"
        type="number"
        register={customRegister}
        errors={displayErrors}
        className={cn({ hidden: isHidden('weight', hiddenFields) })}
      />
      <FormSelect
        label="Lateralidad"
        name="laterality"
        control={control}
        errors={displayErrors}
        options={lateralityOptions.map((option) => ({ id: option, value: option, option }))}
        className={cn({ hidden: isHidden('laterality', hiddenFields) })}
      />
    </EditableSection>
  );
}

const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const lateralityOptions = ['Zurdo', 'Diestro', 'Ambos'];
