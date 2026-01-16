import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput } from '../FormFields';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@cometa/utils';

type DataInfo = {
  drug_allergies: string | null | undefined;
  food_allergies: string | null | undefined;
  plant_allergies: string | null | undefined;
  other_allergies: string | null | undefined;
};

const formSchema = z.object({
  drug_allergies: z.string().optional().nullable(),
  food_allergies: z.string().optional().nullable(),
  plant_allergies: z.string().optional().nullable(),
  other_allergies: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type AllergiesSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  hiddenFields: string[];
};

export function AllergiesSection({ studentAdditionalInfo, hiddenFields }: AllergiesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const medicalInfo = studentAdditionalInfo?.medical_info;

  const allergies: DataInfo = {
    drug_allergies: medicalInfo?.drug_allergies,
    food_allergies: medicalInfo?.food_allergies,
    plant_allergies: medicalInfo?.plant_allergies,
    other_allergies: medicalInfo?.other_allergies,
  };

  const defaultValues = {
    ...allergies,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Alergias a medicamentos:', value: allergies?.drug_allergies || '-', name: 'drug_allergies' },
    { label: 'Alergias a alimentos:', value: allergies?.food_allergies || '-', name: 'food_allergies' },
    { label: 'Alergias a plantas ó animales', value: allergies?.plant_allergies || '-', name: 'plant_allergies' },
    { label: 'Otras alergias', value: allergies?.other_allergies || '-', name: 'other_allergies' },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const {
    formState: { errors, isDirty },
    reset,
    register,
    watch,
  } = form;

  const formValues = watch();

  useEffect(() => {
    if (studentAdditionalInfo) {
      reset(defaultValues);
    }
  }, [studentAdditionalInfo, reset]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.AllergiesForm, false);
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.AllergiesForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.AllergiesForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.AllergiesForm, isEditing);
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
      title="Alergias"
      items={filteredItems}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      canEdit
      setIsEditing={setIsEditing}
    >
      <FormInput
        label="Alergia a medicamentos (opcional)"
        name="drug_allergies"
        register={register}
        errors={errors}
        className={cn({ hidden: isHidden('drug_allergies', hiddenFields) })}
      />
      <FormInput
        label="Alergias a alimentos (opcional)"
        name="food_allergies"
        register={register}
        errors={errors}
        className={cn({ hidden: isHidden('food_allergies', hiddenFields) })}
      />
      <FormInput
        label="Alergias a plantas o animales (opcional)"
        name="plant_allergies"
        register={register}
        errors={errors}
        className={cn({ hidden: isHidden('plant_allergies', hiddenFields) })}
      />
      <FormInput
        label="Otras alergias (opcional)"
        name="other_allergies"
        register={register}
        errors={errors}
        className={cn({ hidden: isHidden('other_allergies', hiddenFields) })}
      />
    </EditableSection>
  );
}
