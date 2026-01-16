import { z } from 'zod';
import { useForm, UseFormRegister } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput, FormMultiSelect, FormTextarea } from '../FormFields';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@cometa/utils';
import { useConditionalSchema } from '~/hooks/useConditionalSchema';

type DataInfo = {
  family_history: string[];
  personal_history: string[];
  current_ailments: string[];
  other_history: string | null | undefined;
  recent_interventions: string | null | undefined;
};

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const formSchema = z.object({
  family_history: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  personal_history: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  current_ailments: z.array(z.string()).min(1, REQUIRED_MESSAGE),
  recent_interventions: z.string().optional().nullable(),
  other_history: z.string().optional().nullable(),
});

type BackgroundSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  hiddenFields: string[];
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
};

export function BackgroundSection({
  studentAdditionalInfo,
  hiddenFields,
  onIsValid,
  hasValidationErrors = false,
}: BackgroundSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  const medicalInfo = studentAdditionalInfo?.medical_info;

  const background: DataInfo = {
    family_history: medicalInfo?.family_history ? medicalInfo.family_history.split(', ') : [],
    personal_history: medicalInfo?.personal_history ? medicalInfo.personal_history.split(', ') : [],
    current_ailments: medicalInfo?.current_ailments ? medicalInfo.current_ailments?.split(', ') : [],
    other_history: medicalInfo?.other_history,
    recent_interventions: medicalInfo?.recent_interventions,
  };

  const defaultValues = {
    ...background,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Antecedentes familiares:', value: background?.family_history || '-', name: 'family_history' },
    { label: 'Antecedentes personales:', value: background?.personal_history || '-', name: 'personal_history' },
    { label: 'Padecimientos actuales:', value: background?.current_ailments || '-', name: 'current_ailments' },
    {
      label: 'Intervenciones quirúrgicas ó fracturas',
      value: background?.recent_interventions || '-',
      name: 'recent_interventions',
    },
    { label: 'Otros antecedentes', value: background?.other_history || '-', name: 'other_history' },
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
      onIsValid(isValid, 'background');
      setHasTriggeredValidation(false);
    });
  }, [JSON.stringify(defaultValues)]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.BackgroundForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.BackgroundForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.BackgroundForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.BackgroundForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updateMedicalValues({ ...formValues });
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
      title="Antecedentes"
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
        label="Antecedentes familiares"
        name="family_history"
        control={control}
        errors={displayErrors}
        options={familyHistoryOptions}
        className={cn({ hidden: isHidden('family_history', hiddenFields) })}
      />
      <FormMultiSelect
        label="Antecedentes personales"
        name="personal_history"
        control={control}
        errors={displayErrors}
        options={personalHistoryOptions}
        className={cn({ hidden: isHidden('personal_history', hiddenFields) })}
      />
      <FormMultiSelect
        label="Padecimientos actuales"
        name="current_ailments"
        control={control}
        errors={displayErrors}
        options={currentAilmentsOptions}
        className={cn({ hidden: isHidden('current_ailments', hiddenFields) })}
      />
      <FormInput
        label="Intervenciones quirúrgicas o fracturas (opcional)"
        name="recent_interventions"
        register={customRegister}
        errors={displayErrors}
      />
      <FormTextarea
        label="Otros padecimientos (opcional)"
        name="other_history"
        control={control}
        errors={displayErrors}
      />
    </EditableSection>
  );
}

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
