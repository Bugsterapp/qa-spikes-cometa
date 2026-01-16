import { z } from 'zod';
import { GenderEnum } from '@cometa/trpc';
import { useForm, UseFormRegister } from 'react-hook-form';
import { EditableSection, InfoItem } from '~/components/ProfileSteps/sections/EditableSection';
import { api } from '~/utils/api';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { Country, MainStudentEntity, State } from '@cometa/trpc/src/students/types';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { FormDateField, FormInput, FormRadioGroup, FormSearchableCombobox } from '../FormFields';
import { useEffect, useRef, useState } from 'react';
import { FormAction, FormActionKeys, useFormActions } from '../context/FormActionsContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckBox, Label } from '@cometa/recreo';
import { validateZodStringDate } from '~/utils/zod';

type DataInfo = {
  birthdate: string;
  gender: string;
  identifier: string;
  nationality_code: string;
  birth_place_id: string;
  is_outside_mx: boolean;
};

const formSchema = z
  .object({
    identifier: z
      .string()
      .optional()
      .refine(
        (identifier) =>
          !identifier ||
          /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/.test(
            identifier
          ),
        { message: 'El formato del CURP no es válido' }
      ),
    birthdate: z
      .string()
      .min(1, 'La fecha de nacimiento es requerida')
      .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
    gender: z.nativeEnum(GenderEnum, { errorMap: () => ({ message: 'Debe seleccionar un género' }) }),
    nationality_code: z.string().min(1, 'La nacionalidad es requerida'),
    birth_place_id: z.string().optional(),
    is_outside_mx: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_outside_mx) {
      if (!data.birth_place_id) {
        ctx.addIssue({
          path: ['birth_place_id'],
          code: z.ZodIssueCode.custom,
          message: 'El lugar de nacimiento es requerido',
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

type PersonalSectionProps = {
  student: MainStudentEntity | null | undefined;
  studentAdditionalInfo: StudentEntity | null | undefined;
  onIsValid: (isValid: boolean, sectionName: string) => void;
  hasValidationErrors?: boolean;
};

export function PersonalSection({
  student,
  studentAdditionalInfo,
  onIsValid,
  hasValidationErrors = false,
}: PersonalSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  const { data: countries } = api.student.getCountries.useQuery();
  const { data: states } = api.student.getStates.useQuery();

  let birthdate = '';
  if (student?.birthdate && student.birthdate.trim() !== '') {
    const dateOnly = student.birthdate.includes('T')
      ? student.birthdate.substring(0, student.birthdate.indexOf('T'))
      : student.birthdate;

    const parsedDate = parse(dateOnly, 'yyyy-MM-dd', new Date());
    if (isValidDate(parsedDate)) {
      birthdate = format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
    }
  }

  let gender = 'No especificado';
  if (student?.gender === 'M') {
    gender = 'Masculino';
  } else if (student?.gender === 'F') {
    gender = 'Femenino';
  }

  const country = (countries as Country[])?.find(
    (country: Country) => country.code === studentAdditionalInfo?.nationality_code
  );

  const personalInfo: DataInfo = {
    identifier: student?.identifier || '',
    birthdate: birthdate,
    gender,
    nationality_code: country?.name || '',
    birth_place_id: studentAdditionalInfo?.birth_place?.name || '',
    is_outside_mx: false,
  };

  let formattedBirthdate = '';
  if (student?.birthdate && student.birthdate.trim() !== '') {
    const dateOnly = student.birthdate.includes('T')
      ? student.birthdate.substring(0, student.birthdate.indexOf('T'))
      : student.birthdate;

    const parsedDate = parse(dateOnly, 'yyyy-MM-dd', new Date());
    if (isValidDate(parsedDate)) {
      formattedBirthdate = format(parsedDate, 'dd/MM/yyyy');
    }
  }

  const defaultValues = {
    ...personalInfo,
    birthdate: formattedBirthdate,
    gender: student?.gender as GenderEnum,
    birth_place_id: studentAdditionalInfo?.birth_place?.id || undefined,
    nationality_code: studentAdditionalInfo?.nationality_code || '',
  };

  const { register: registerAction, updateIsDirty, updateIsEditing, updatePersonalValues } = useFormActions();

  const items: InfoItem[] = [
    { label: 'CURP:', value: personalInfo?.identifier || '-' },
    { label: 'Fecha de nacimiento:', value: personalInfo?.birthdate || '-' },
    { label: 'Género:', value: personalInfo?.gender },
    { label: 'Nacionalidad:', value: personalInfo?.nationality_code || '-' },
    { label: 'Lugar de nacimiento:', value: personalInfo?.birth_place_id || '-' },
    { label: 'El estudiante nació fuera de México', value: personalInfo?.is_outside_mx ? 'Sí' : 'No' },
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
    setValue,
  } = form;

  const isOutsideMx = watch('is_outside_mx');

  const formValues = watch();

  useEffect(() => {
    reset(defaultValues);
    trigger().then((isValid) => {
      setCanEdit(isValid);
      setIsEditing(!isValid);
      onIsValid(isValid, 'phone');
      setHasTriggeredValidation(false);
    });
  }, [student, studentAdditionalInfo, reset]);

  useEffect(() => {
    const action: FormAction = {
      restoreForm: () => {
        reset(defaultValues);
        updateIsDirty(FormActionKeys.PersonalForm, false);
      },
      validate: async () => {
        setHasTriggeredValidation(true);
        return await trigger();
      },
      setIsEditing,
      isEditing,
      isDirty,
    };
    registerAction(FormActionKeys.PersonalForm, action);
  }, [setIsEditing, isEditing, isDirty]);

  useEffect(() => {
    updateIsDirty(FormActionKeys.PersonalForm, isDirty);
  }, [isDirty, updateIsDirty]);

  useEffect(() => {
    updateIsEditing(FormActionKeys.PersonalForm, isEditing);
  }, [isEditing, updateIsEditing]);

  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const serializedValues = JSON.stringify(formValues);
    if (prevValuesRef.current !== serializedValues) {
      updatePersonalValues({ ...formValues });
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
      title="Datos personales"
      items={items}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      canEdit={canEdit}
      setIsEditing={setIsEditing}
    >
      <FormInput label="CURP (opcional)" name="identifier" register={customRegister} errors={displayErrors} />
      <FormDateField
        label="Fecha de nacimiento"
        name="birthdate"
        control={control}
        errors={displayErrors}
        showCalendarIcon={false}
      />
      <FormRadioGroup label="Género" name="gender" control={control} errors={displayErrors} options={genderOptions} />
      <FormSearchableCombobox
        label="Nacionalidad"
        name="nationality_code"
        control={control}
        errors={displayErrors}
        options={
          ((countries || []) as Country[]).map((country) => ({
            id: country.code,
            value: country.code,
            option: country.name,
          })) || []
        }
      />
      <FormSearchableCombobox
        label="Lugar de nacimiento"
        name="birth_place_id"
        control={control}
        errors={displayErrors}
        options={
          ((states || []) as State[]).map((state) => ({ id: state.id, value: state.id, option: state.name })) || []
        }
        disabled={isOutsideMx}
      />
      <CheckBox.Group error={displayErrors.is_outside_mx?.message}>
        <div className="flex items-center gap-2">
          <CheckBox.Item
            id="is_outside_mx"
            name="is_outside_mx"
            checked={isOutsideMx}
            onCheckedChange={() => {
              setValue('is_outside_mx', !isOutsideMx, { shouldDirty: true });
              setValue('birth_place_id', '', { shouldDirty: true });
            }}
            className="hover:cursor-pointer"
          />
          <Label htmlFor="is_outside_mx" className="font-normal hover:cursor-pointer">
            El estudiante nació fuera de México
          </Label>
        </div>
      </CheckBox.Group>
    </EditableSection>
  );
}

const genderOptions = [
  { id: 'M', value: 'M', option: 'Masculino' },
  { id: 'F', value: 'F', option: 'Femenino' },
];
