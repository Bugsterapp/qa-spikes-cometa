import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { EditableSection, InfoItem, isHidden } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput, FormTextarea } from '../FormFields';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@cometa/utils';

type DataInfo = {
  pending_vaccines: string | null | undefined;
  comments: string | null | undefined;
};

const formSchema = z.object({
  pending_vaccines: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type AdditionalCommentsSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  hiddenFields: string[];
};

export function AdditionalCommentsSection({ studentAdditionalInfo, hiddenFields }: AdditionalCommentsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const medicalInfo = studentAdditionalInfo?.medical_info;

  const additionalComments: DataInfo = {
    pending_vaccines: medicalInfo?.pending_vaccines,
    comments: medicalInfo?.comments,
  };

  const defaultValues = {
    ...additionalComments,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updateMedicalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Vacunas pendientes:', value: additionalComments?.pending_vaccines || '-', name: 'pending_vaccines' },
    { label: 'Comentarios adicionales:', value: additionalComments?.comments || '-', name: 'comments' },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
        updateIsDirty(FormActionKeys.AdditionalCommentsForm, false);
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.AdditionalCommentsForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.AdditionalCommentsForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.AdditionalCommentsForm, isEditing);
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
      title="Observaciones adicionales"
      items={filteredItems}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      canEdit
      setIsEditing={setIsEditing}
    >
      <FormInput
        className={cn({ hidden: isHidden('pending_vaccines', hiddenFields) })}
        label="Vacunas (opcional)"
        name="pending_vaccines"
        register={register}
        errors={errors}
      />
      <FormTextarea
        className={cn({ hidden: isHidden('comments', hiddenFields) })}
        label="Comentarios adicionales (opcional)"
        name="comments"
        control={control}
        errors={errors}
      />
    </EditableSection>
  );
}
