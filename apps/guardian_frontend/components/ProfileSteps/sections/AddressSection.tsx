import { z } from 'zod';
import { useForm, UseFormRegister } from 'react-hook-form';
import { EditableSection, InfoItem } from '~/components/ProfileSteps/sections/EditableSection';
import { FormInput, FormSearchableCombobox } from '../FormFields';
import { State } from '@cometa/trpc/src/students/types';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { api } from '~/utils/api';
import { useEffect, useRef, useState } from 'react';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { zodResolver } from '@hookform/resolvers/zod';

type DataInfo = {
  street: string;
  interior_number?: string;
  neighborhood: string;
  municipality: string;
  state_id: string;
  zip_code: string;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const formSchema = z.object({
  street: z.string().min(1, REQUIRED_MESSAGE),
  interior_number: z.string().optional(),
  neighborhood: z.string().min(1, REQUIRED_MESSAGE),
  municipality: z.string().min(1, REQUIRED_MESSAGE),
  state_id: z.string().min(1, REQUIRED_MESSAGE),
  zip_code: z.string().min(1, REQUIRED_MESSAGE),
});

type FormValues = z.infer<typeof formSchema>;

type AddressSectionProps = {
  studentAdditionalInfo: StudentEntity | null | undefined;
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
};

export function AddressSection({ studentAdditionalInfo, onIsValid, hasValidationErrors = false }: AddressSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  const addressInfo: DataInfo = {
    street: studentAdditionalInfo?.address?.street || '',
    interior_number: studentAdditionalInfo?.address?.interior_number || '',
    neighborhood: studentAdditionalInfo?.address?.neighborhood || '',
    municipality: studentAdditionalInfo?.address?.municipality || '',
    state_id: studentAdditionalInfo?.address?.state?.name || '',
    zip_code: studentAdditionalInfo?.address?.zip_code || '',
  };

  const defaultValues = {
    ...addressInfo,
    state_id: studentAdditionalInfo?.address?.state?.id || '',
  };

  const { data: states } = api.student.getStates.useQuery();

  const { register: registerAction, updateIsDirty, updateIsEditing, updatePersonalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'Dirección', value: addressInfo?.street },
    { label: 'Número interior', value: addressInfo?.interior_number },
    { label: 'Colonia', value: addressInfo?.neighborhood },
    { label: 'Municipio / Delegación', value: addressInfo?.municipality },
    { label: 'Estado', value: addressInfo?.state_id },
    { label: 'Código postal', value: addressInfo?.zip_code },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const {
    formState: { errors, isDirty },
    control,
    register,
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
      onIsValid(isValid, 'address');
      setHasTriggeredValidation(false);
    });
  }, [JSON.stringify(defaultValues)]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.AddressForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.AddressForm, { ...action });
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.AddressForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.AddressForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updatePersonalValues({ ...formValues, interior_number: formValues.interior_number ?? '' });
      prevValuesRef.current = serializedValues;
    }
  }, [formValues, updatePersonalValues]);

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

  return (
    <EditableSection
      title="Dirección"
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
      <FormInput label="Direccion" name="street" register={customRegister} errors={displayErrors} />
      <FormInput
        label="Número interior (opcional)"
        name="interior_number"
        register={customRegister}
        errors={displayErrors}
      />
      <FormInput label="Colonia" name="neighborhood" register={customRegister} errors={displayErrors} />
      <FormInput label="Municipio" name="municipality" register={customRegister} errors={displayErrors} />
      <FormSearchableCombobox
        label="Estado"
        name="state_id"
        control={control}
        errors={displayErrors}
        options={
          ((states || []) as State[]).map((state) => ({ id: state.id, value: state.id, option: state.name })) || []
        }
      />
      <FormInput label="Código postal" name="zip_code" register={customRegister} errors={displayErrors} />
    </EditableSection>
  );
}
