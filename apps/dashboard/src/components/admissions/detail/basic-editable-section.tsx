'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useMemo } from 'react';
import { z } from 'zod';
import { api } from '/src/utils/api';
import { format, isValid, parse } from 'date-fns';
import { CommonSectionProps, EditableSection, InfoItem } from './editable-section';
import { FormDateField, FormInput, FormLabel, FormRadioGroup, FormSelect } from './form';
import { CheckBox } from '@cometa/recreo';
import { useHandleMutate } from './api';
import { buildApplicationFormPayload } from './utils';
import { ApplicationFormEntity, UpsertApplicationFormDto } from '@cometa/trpc/src/admissions/types';
import { validateZodStringDate } from '/src/utils/zod';

export type BasicInfo = {
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  curp: string;
  nationality: string;
  birthplace: string;
  is_outside_mx: boolean;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

export const basicInfoSchema = z.object({
  first_name: z.string().min(1, REQUIRED_MESSAGE),
  last_name: z.string().min(1, REQUIRED_MESSAGE),
  birthdate: z
    .string()
    .optional()
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
  gender: z.string().min(1, REQUIRED_MESSAGE),
  curp: z
    .string()
    .optional()
    .refine(
      (curp) =>
        !curp ||
        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/.test(
          curp
        ),
      { message: 'El formato del CURP no es válido' }
    ),
  nationality: z.string().optional(),
  birthplace: z.string({ required_error: REQUIRED_MESSAGE }),
  is_outside_mx: z.boolean(),
});

export type FormBasicInfoValues = z.infer<typeof basicInfoSchema>;

export function BasicEditableSection({
  userId,
  applicationForm,
  studentLeadId,
  schoolId,
  guardianId,
  basicInfo,
  form,
  defaultValues,
  isEditing,
  isLoading,
  setIsEditing,
  setIsLoading,
}: {
  userId: string;
  applicationForm?: ApplicationFormEntity;
  studentLeadId: string;
  schoolId: string;
  guardianId: string;
  basicInfo: BasicInfo;
  form: UseFormReturn<FormBasicInfoValues>;
  defaultValues: FormBasicInfoValues;
} & CommonSectionProps) {
  const utils = api.useUtils();
  const upsertApplicationForm = api.admissions.upsertApplicationForm.useMutation({
    onSuccess: async () => {
      await utils.admissions.getApplicationForm.invalidate();
    },
  });
  const updateStudentLead = api.admissions.updateStudenLead.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmissionDetail.invalidate({ admissionId: studentLeadId });
    },
  });

  const handleUpsertApplication = useHandleMutate(upsertApplicationForm.mutateAsync);
  const handleUpdateStudentLead = useHandleMutate(updateStudentLead.mutateAsync);

  const { data: countries, isPending: isLoadingCountriesQuery } = api.location.retrieveCountries.useQuery();
  const { data: states, isPending: isLoadingStatesQuery } = api.location.retrieveStates.useQuery();

  const memoizedCountries = useMemo(() => countries, [countries]);
  const memoizedStates = useMemo(() => states, [states]);

  const genderOptions = [
    { id: 'male', value: 'male', option: 'Masculino' },
    { id: 'female', value: 'female', option: 'Femenino' },
  ];

  const items: InfoItem[] = [
    { label: 'Nombre:', value: basicInfo?.first_name || '-' },
    { label: 'Apellido:', value: basicInfo?.last_name || '-' },
    { label: 'Fecha de nacimiento:', value: basicInfo?.birthdate || '-' },
    { label: 'Sexo:', value: basicInfo?.gender || '-' },
    { label: 'CURP:', value: basicInfo?.curp || '-' },
    { label: 'Nacionalidad:', value: basicInfo?.nationality || '-' },
    { label: 'Lugar de nacimiento:', value: basicInfo?.birthplace || '-' },
  ];

  const {
    formState: { errors },
    control,
    register,
    watch,
    setValue,
  } = form;

  const isOutsideMx = watch('is_outside_mx');

  async function handleSave(data: FormBasicInfoValues): Promise<boolean> {
    // Only format birthdate if it exists and is valid
    let formattedBirthdate: string | undefined = undefined;
    if (data.birthdate) {
      const parsedDate = parse(data.birthdate, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        formattedBirthdate = format(parsedDate, 'yyyy-MM-dd');
      }
    }

    const applicationFormPayload = buildApplicationFormPayload(
      data,
      studentLeadId,
      schoolId,
      guardianId,
      applicationForm
    );

    const [resultApplication, resultLead] = await Promise.all([
      handleUpsertApplication({ ...applicationFormPayload, changed_by: userId } as UpsertApplicationFormDto),
      handleUpdateStudentLead({ ...data, birthdate: formattedBirthdate, student_lead_id: studentLeadId }),
    ]);

    return resultApplication.success && resultLead.success;
  }

  return (
    <EditableSection
      title="Información general"
      items={items}
      form={form}
      onSave={handleSave}
      defaultValues={defaultValues}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    >
      <FormInput label="Nombre" name="first_name" register={register} errors={errors} />
      <FormInput label="Apellidos" name="last_name" register={register} errors={errors} />
      <FormInput label="CURP" name="curp" register={register} errors={errors} />
      <FormDateField
        label="Fecha de nacimiento"
        name="birthdate"
        control={control}
        errors={errors}
        showCalendarIcon={false}
      />
      <FormRadioGroup label="Sexo" name="gender" control={control} errors={errors} options={genderOptions} />
      <FormSelect
        label="Nacionalidad"
        name="nationality"
        control={control}
        errors={errors}
        options={
          memoizedCountries?.map((country) => ({ id: country.id, value: country.id, option: country.name })) || []
        }
        isLoading={isLoadingCountriesQuery}
      />
      <FormSelect
        label="Lugar de nacimiento"
        name="birthplace"
        control={control}
        errors={errors}
        options={memoizedStates?.map((state) => ({ id: state.id, value: state.id, option: state.name })) || []}
        disabled={isOutsideMx}
        isLoading={isLoadingStatesQuery}
      />
      <CheckBox.Group error={errors.is_outside_mx?.message}>
        <div className="flex items-center gap-2">
          <CheckBox.Item
            id="is_outside_mx"
            name="is_outside_mx"
            checked={isOutsideMx}
            onCheckedChange={() => {
              setValue('is_outside_mx', !isOutsideMx);
              setValue('birthplace', '');
            }}
            className="hover:cursor-pointer"
          />
          <FormLabel name="is_outside_mx">El estudiante nació fuera de México</FormLabel>
        </div>
      </CheckBox.Group>
    </EditableSection>
  );
}
