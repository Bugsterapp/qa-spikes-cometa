import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { EditableSection, InfoItem } from '~/components/ProfileSteps/sections/EditableSection';
import { FormPhoneInput } from '../FormFields';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { useEffect, useRef, useState } from 'react';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { zodResolver } from '@hookform/resolvers/zod';

type DataInfo = {
  home_phone: string;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const formSchema = z.object({
  home_phone: z.string().min(1, REQUIRED_MESSAGE),
});

type FormValues = z.infer<typeof formSchema>;

type PhoneSection = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
};

export function PhoneSection({ studentAdditionalInfo, onIsValid, hasValidationErrors = false }: PhoneSection) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  const phoneInfo: DataInfo = {
    home_phone: studentAdditionalInfo?.address?.home_phone || '',
  };

  const items: InfoItem[] = [{ label: 'Teléfono de casa', value: phoneInfo?.home_phone || '' }];

  const defaultValues = {
    ...phoneInfo,
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updatePersonalValues } = useFormActions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const {
    formState: { errors, isDirty },
    control,
    watch,
    clearErrors,
    reset,
    trigger,
  } = form;

  const formValues = watch();

  useEffect(() => {
    reset(defaultValues);
    trigger().then((isValid) => {
      setCanEdit(isValid);
      setIsEditing(!isValid);
      onIsValid(isValid, 'phone');
      setHasTriggeredValidation(false);
    });
  }, [JSON.stringify(defaultValues)]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.PhoneForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.PhoneForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.PhoneForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.PhoneForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updatePersonalValues({ ...formValues });
      prevValuesRef.current = serializedValues;
    }
  }, [formValues, updatePersonalValues]);

  const displayErrors = hasTriggeredValidation ? errors : {};

  useEffect(() => {
    if (hasValidationErrors) {
      setIsEditing(true);
      setCanEdit(false);
    }
  }, [hasValidationErrors]);

  return (
    <EditableSection
      title="Teléfono"
      items={items}
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
      <FormPhoneInput
        label="Teléfono de casa"
        name="home_phone"
        control={control}
        watch={watch}
        clearErrors={clearErrors}
        errors={displayErrors}
      />
    </EditableSection>
  );
}
