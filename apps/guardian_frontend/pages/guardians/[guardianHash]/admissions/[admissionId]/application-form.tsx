import { Button, CheckBox, Drawer, Input, Label, PhoneInput, Select, TextField } from '@cometa/recreo';
import Head from 'next/head';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useEffect, useState } from 'react';
import { BackButton } from '~/components/BackButton';
import type { Country, State } from '@cometa/trpc/src/students/types';
import type { Guardian } from '@cometa/trpc';
import { useSelectedSchool } from '~/stores/globalStore';
import { useToggle } from '@cometa/hooks';
import {
  AdmissionStepEntity,
  AdmissionStepStatus,
  SchoolStepEntity,
  SchoolStepTags,
} from '@cometa/trpc/src/admissions/types';
import { UseMutationResult } from '@tanstack/react-query';
import { useAlert } from '~/hooks';

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const guardianRequiredFields = [
  'additional_guardian_email',
  'additional_guardian_phone',
  'additional_guardian_first_name',
  'additional_guardian_last_name',
] as const;
const guardianFields = [
  ...guardianRequiredFields,
  'additional_guardian_relationship',
  'additional_guardian_occupation',
  'additional_guardian_workplace',
  'additional_guardian_workphone',
] as const;

const schema = z
  .object({
    curp: z
      .string()
      .min(1, REQUIRED_MESSAGE)
      .regex(
        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
        'El formato del CURP no es válido'
      ),
    birthplace: z.string({ required_error: REQUIRED_MESSAGE }),
    is_outside_mx: z.boolean(),
    nationality: z.string({ required_error: REQUIRED_MESSAGE }),
    homephone: z.string({ required_error: REQUIRED_MESSAGE }),
    address: z.string().min(1, REQUIRED_MESSAGE),
    interior_number: z.string().optional(),
    neighborhood: z.string().min(1, REQUIRED_MESSAGE),
    municipality: z.string().min(1, REQUIRED_MESSAGE),
    state: z.string({ required_error: REQUIRED_MESSAGE }),
    zipcode: z.string().min(1, REQUIRED_MESSAGE),
    guardian_relationship: z.string({ required_error: REQUIRED_MESSAGE }),
    guardian_occupation: z.string().optional(),
    guardian_workplace: z.string().optional(),
    guardian_workphone: z.string().optional(),
    additional_guardian_id: z.string().optional(),
    additional_guardian_email: z.string().optional(),
    additional_guardian_phone: z.string().optional(),
    additional_guardian_first_name: z.string().optional(),
    additional_guardian_last_name: z.string().optional(),
    additional_guardian_relationship: z.string().optional(),
    additional_guardian_occupation: z.string().optional(),
    additional_guardian_workplace: z.string().optional(),
    additional_guardian_workphone: z.string().optional(),
    accept_truthfulness: z
      .boolean({ required_error: REQUIRED_MESSAGE })
      .refine((value) => value === true, { message: REQUIRED_MESSAGE }),
  })
  .superRefine((data, ctx) => {
    const isEmpty = (value: string | undefined | null) => ['', undefined, null].includes(value);

    const isAddingAdditionalGuardian = guardianFields.some((fieldName) => !isEmpty(data[fieldName]));
    if (isAddingAdditionalGuardian && isEmpty(data.additional_guardian_id)) {
      guardianRequiredFields.forEach((fieldName) => {
        if (isEmpty(data[fieldName])) {
          ctx.addIssue({
            path: [fieldName],
            code: z.ZodIssueCode.custom,
            message: REQUIRED_MESSAGE,
          });
        }
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function ApplicationFormPage() {
  const session = useSession();
  const guardian = session?.data?.user;

  const { setAlert } = useAlert();

  const router = useRouter();
  const { guardianHash, admissionId } = router.query;
  const [isLoading, setLoading] = useState(false);

  const { data: applicationForm } = api.admissions.getApplicationForm.useQuery(
    { studentLeadId: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );

  const { data: studendLead } = api.admissions.getAdmission.useQuery(
    { id: admissionId as string },
    {
      enabled: !!admissionId,
    }
  );

  const applicationFormStep = findStepByTag(
    studendLead?.admission_steps as AdmissionStepEntity[],
    SchoolStepTags.ApplicationForm
  );

  const countriesReponse = api.student.getCountries.useQuery();
  const countries = (countriesReponse.data as Country[]) || [];

  const statesReponse = api.student.getStates.useQuery();
  const states = (statesReponse.data as State[]) || [];

  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_outside_mx: false },
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  useEffect(() => {
    if (applicationForm) {
      reset({
        ...Object.fromEntries(Object.entries(applicationForm).map(([k, v]) => [k, v === null ? undefined : v])),
        guardian_occupation: applicationForm.guardian_occupation ?? '',
        guardian_workplace: applicationForm.guardian_workplace ?? '',
        guardian_workphone: applicationForm.guardian_workphone ?? '',
        accept_truthfulness: applicationForm.accept_truthfulness ?? false,
      });
    }
  }, [applicationForm]);

  const isOutsideMx = watch('is_outside_mx');

  const selectedSchool = useSelectedSchool();
  const schoolId = (selectedSchool?.id ?? guardian?.schools[0]?.id) as string;

  const additionalGuardianId = applicationForm?.guardian_id ?? '';

  const phone = watch('additional_guardian_phone');
  const email = watch('additional_guardian_email');
  const { data: guardianResponse, refetch } = api.guardian.existGuardian.useQuery(
    {
      schoolId,
      query: {
        id: additionalGuardianId,
        email: email,
        phone: phone,
      },
    },
    { refetchOnWindowFocus: false, enabled: false }
  );

  const { toggle: open, onClose, onOpen } = useToggle(false);

  const guardianFound = guardianResponse?.results?.[0];

  const [wasGuardianLinked, setWasGuardianLinked] = useState(false);

  useEffect(() => {
    setWasGuardianLinked(false);
  }, [email, phone]);

  useEffect(() => {
    if (additionalGuardianId) {
      refetch();
    }
  }, [additionalGuardianId]);

  function handleCloseLinkGuardian() {
    setValue('additional_guardian_id', '');
    setWasGuardianLinked(false);
    onClose();
  }

  function handleLinkGuardian() {
    setValue('additional_guardian_id', guardianFound?.id);
    setWasGuardianLinked(true);
    onClose();
  }

  const utils = api.useUtils();

  const upsertApplicationForm = api.admissions.upsertApplicationForm.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmission.invalidate({ id: admissionId as string });
      await utils.admissions.getApplicationForm.invalidate();
      await utils.guardian.existGuardian.invalidate();
    },
  });

  const handleUpsertApplicationForm = useHandleMutate(upsertApplicationForm.mutateAsync);

  const upsertAdmissionStep = api.admissions.upsertAdmissionStep.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmission.invalidate({ id: admissionId as string });
      await utils.admissions.getApplicationForm.invalidate();
      await utils.guardian.existGuardian.invalidate();
    },
  });

  const handleUpsertAdmissionStep = useHandleMutate(upsertAdmissionStep.mutateAsync);

  async function checkGuardianExists() {
    const { data: result } = await refetch();
    if (result?.count === 1 && !wasGuardianLinked) {
      onOpen();
    }
  }

  async function onSubmit(data: FormValues) {
    setLoading(true);

    const hasGuardianData = data.additional_guardian_email || data.additional_guardian_phone;

    if (hasGuardianData && !additionalGuardianId) {
      const { data: guardianCheckResult } = await refetch();

      if (guardianCheckResult?.count === 1 && !wasGuardianLinked) {
        onOpen();
        setLoading(false);
        return;
      }
    }

    let error = false;

    const { success: applicationFormSuccess } = await handleUpsertApplicationForm({
      ...data,
      additional_guardian_phone: data.additional_guardian_phone || guardianFound?.phone || undefined,
      additional_guardian_email: data.additional_guardian_email || guardianFound?.email,
      interior_number: data.interior_number ?? '',
      guardian_id: guardian?.id as string,
      additional_guardian_id: wasGuardianLinked ? guardianFound?.id : additionalGuardianId ?? '',
      student_lead_id: admissionId as string,
      school_id: schoolId,
      changed_by: guardian?.id as string,
    });

    error = !applicationFormSuccess;

    if (applicationFormSuccess) {
      const { success: admissionStepSuccess } = await handleUpsertAdmissionStep({
        student_lead_id: admissionId as string,
        school_step_id: applicationFormStep?.id as string,
        status: AdmissionStepStatus.Completed,
      });

      error = !admissionStepSuccess;
    }

    if (error) {
      setAlert('Ocurrió un error al actualizar el prospecto');
      return;
    }

    setAlert('Formulario actualizado exitosamente', 'success');
    router.push(`/guardians/${guardianHash}/admissions/${admissionId}`);
  }

  const showGuardianDrawer = wasGuardianLinked && guardianFound;
  const showGuardianCard = guardianFound && additionalGuardianId;

  return (
    <div className="font-lota antialiased">
      <header className="p-6 text-[#1c1c1d]">
        <Link href={`/guardians/${guardianHash}/admissions/${admissionId}`} className="flex gap-3 items-center">
          <BackButton arrowColor="#686F87" circleColor="#F3F6FB" />
          <span className="text-sm font-semibold">VOLVER</span>
        </Link>

        <h2 className="text-2xl font-bold my-4">Información adicional</h2>
        <p>En los siguientes documentos podrás encontrar información acerca del colegio y el proceso de admisión.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 pb-10">
        <div className="bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-[#1c1c1d] font-semibold">Información adicional del postulante</h3>
            <p className="text-[#637381] my-1 text-sm">Completa la información del prospecto.</p>
          </div>

          <div className="flex flex-col gap-4">
            <TextField label="CURP" error={errors.curp?.message} value={watch('curp')}>
              <Input {...register('curp')} type="text" />
            </TextField>
            <Controller
              control={control}
              name="birthplace"
              render={({ field }) => (
                <Select
                  placeholder="Lugar de nacimiento"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={field.onChange}
                  value={field.value}
                  error={errors.birthplace?.message}
                  disabled={isOutsideMx}
                >
                  <Select.Content className="w-full outline-none">
                    {states?.map((state) => (
                      <Select.Item
                        key={state.id}
                        value={state.id as string}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                      >
                        {state.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
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
                <Label htmlFor="is_outside_mx" className="font-normal hover:cursor-pointer">
                  El estudiante nació fuera de México
                </Label>
              </div>
            </CheckBox.Group>
            <Controller
              control={control}
              name="nationality"
              render={({ field }) => (
                <Select
                  placeholder="Nacionalidad"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={field.onChange}
                  value={field.value}
                  error={errors.nationality?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {countries?.map((country) => (
                      <Select.Item
                        key={country.id}
                        value={country.id as string}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                      >
                        {country.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="homephone"
              render={({ field }) => (
                <PhoneInput
                  key={watch('homephone')}
                  initialValue={watch('homephone')}
                  label="Teléfono de casa"
                  onChange={({ number }) => {
                    clearErrors('homephone');
                    field.onChange(number);
                  }}
                  error={errors.homephone?.message}
                />
              )}
            />
            <TextField label="Dirección" error={errors.address?.message} value={watch('address')}>
              <Input {...register('address')} type="text" />
            </TextField>
            <TextField label="No. Interior" error={errors.interior_number?.message} value={watch('interior_number')}>
              <Input {...register('interior_number')} type="text" />
            </TextField>
            <TextField label="Colonia" error={errors.neighborhood?.message} value={watch('neighborhood')}>
              <Input {...register('neighborhood')} type="text" />
            </TextField>
            <TextField label="Municipio" error={errors.municipality?.message} value={watch('municipality')}>
              <Input {...register('municipality')} type="text" />
            </TextField>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select
                  placeholder="Estado"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={field.onChange}
                  value={field.value}
                  error={errors.state?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {states?.map((state) => (
                      <Select.Item
                        key={state.id}
                        value={state.id as string}
                        className="w-full hover:bg-[#F5FAFF] outline-none"
                      >
                        {state.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <TextField label="Código postal" error={errors.zipcode?.message} value={watch('zipcode')}>
              <Input {...register('zipcode')} type="text" />
            </TextField>
          </div>
        </div>

        <div className="bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-[#1c1c1d] font-semibold">
              Tutor: {guardian?.first_name} {guardian?.last_name}
            </h3>
            <p className="text-[#637381] my-1 text-sm">Ingresa la información del tutor.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="guardian_relationship"
              render={({ field }) => (
                <Select
                  placeholder="Parentesco con el postulante"
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                  onValueChange={field.onChange}
                  value={field.value}
                  error={errors.guardian_relationship?.message}
                >
                  <Select.Content className="w-full outline-none">
                    {guardianRelationshipOptions?.map((option) => (
                      <Select.Item key={option.id} value={option.id} className="w-full hover:bg-[#F5FAFF] outline-none">
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
            <TextField
              label="Ocupación (opcional)"
              error={errors.guardian_occupation?.message}
              value={watch('guardian_occupation')}
            >
              <Input {...register('guardian_occupation')} type="text" />
            </TextField>
            <TextField
              label="Lugar de trabajo (opcional)"
              error={errors.guardian_workplace?.message}
              value={watch('guardian_workplace')}
            >
              <Input {...register('guardian_workplace')} type="text" />
            </TextField>
            <Controller
              control={control}
              name="guardian_workphone"
              render={({ field }) => (
                <PhoneInput
                  key={watch('guardian_workphone')}
                  initialValue={watch('guardian_workphone')}
                  label="Telf. de trabajo (opcional)"
                  onChange={({ number }) => {
                    clearErrors('guardian_workphone');
                    field.onChange(number);
                  }}
                  error={errors.guardian_workphone?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-[#1c1c1d] font-semibold">Tutor adicional (opcional)</h3>
            <p className="text-[#637381] my-1 text-sm">
              Ingresa la información de contacto de un tutor adicional del postulante.
            </p>
          </div>

          {showGuardianDrawer || showGuardianCard ? (
            <div className="flex flex-col gap-3 bg-white border border-[#e4ebf6] rounded-lg p-6 mb-6">
              <div className="flex justify-between">
                <p className="font-semibold">
                  {guardianFound?.first_name} {guardianFound?.last_name}
                </p>
                {!additionalGuardianId ? (
                  <span onClick={() => setWasGuardianLinked(false)} className="hover:cursor-pointer">
                    <CloseIcon />
                  </span>
                ) : null}
              </div>
              <p className="flex gap-2">
                <MailIcon className="w-4 mr-2 text-[#98A2B3]" />
                <span>{maskEmail(guardianFound?.email)}</span>
              </p>
              <p className="flex gap-2">
                <PhoneIcon className="w-4 mr-2 text-[#98A2B3]" />
                <span>{maskPhone(guardianFound?.phone)}</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <TextField label="Correo electrónico" error={errors.additional_guardian_email?.message} value={email}>
                <Input
                  {...register('additional_guardian_email')}
                  type="text"
                  onBlur={async () => {
                    if (email) {
                      await checkGuardianExists();
                    }
                  }}
                />
              </TextField>
              <Controller
                control={control}
                name="additional_guardian_phone"
                render={({ field }) => (
                  <PhoneInput
                    key={phone}
                    initialValue={phone}
                    onChange={({ number }) => {
                      clearErrors('additional_guardian_phone');
                      field.onChange(number);
                    }}
                    onBlur={async () => {
                      if (phone && phone.length > 7) {
                        await checkGuardianExists();
                      }
                    }}
                    error={errors.additional_guardian_phone?.message}
                  />
                )}
              />
              <TextField
                label="Nombre"
                error={errors.additional_guardian_first_name?.message}
                value={watch('additional_guardian_first_name')}
              >
                <Input {...register('additional_guardian_first_name')} type="text" />
              </TextField>
              <TextField
                label="Apellidos"
                error={errors.additional_guardian_last_name?.message}
                value={watch('additional_guardian_last_name')}
              >
                <Input {...register('additional_guardian_last_name')} type="text" />
              </TextField>
              <Controller
                control={control}
                name="additional_guardian_relationship"
                render={({ field }) => (
                  <Select
                    placeholder="Parentesco con el postulante"
                    className="w-full outline-none min-h-[56px] h-full mb-1"
                    onValueChange={field.onChange}
                    value={field.value}
                    error={errors.additional_guardian_relationship?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {guardianRelationshipOptions?.map((option) => (
                        <Select.Item
                          key={option.id}
                          value={option.id}
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                        >
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <TextField
                label="Ocupación (opcional)"
                error={errors.additional_guardian_occupation?.message}
                value={watch('additional_guardian_occupation')}
              >
                <Input {...register('additional_guardian_occupation')} type="text" />
              </TextField>
              <TextField
                label="Lugar de trabajo (opcional)"
                error={errors.additional_guardian_workplace?.message}
                value={watch('additional_guardian_workplace')}
              >
                <Input {...register('additional_guardian_workplace')} type="text" />
              </TextField>
              <Controller
                control={control}
                name="additional_guardian_workphone"
                render={({ field }) => (
                  <PhoneInput
                    key={watch('additional_guardian_workphone')}
                    initialValue={watch('additional_guardian_workphone')}
                    label="Telf. de trabajo (opcional)"
                    onChange={({ number }) => {
                      clearErrors('additional_guardian_workphone');
                      field.onChange(number);
                    }}
                    error={errors.additional_guardian_workphone?.message}
                  />
                )}
              />
            </div>
          )}

          <CheckBox.Group error={errors.accept_truthfulness?.message}>
            <div className="flex items-center gap-2">
              <CheckBox.Item
                id="accept_truthfulness"
                name="accept_truthfulness"
                checked={watch('accept_truthfulness')}
                onCheckedChange={(value) => setValue('accept_truthfulness', Boolean(value))}
                className="w-9 hover:cursor-pointer"
              />
              <Label htmlFor="accept_truthfulness" className="font-normal hover:cursor-pointer">
                Declaro que la información ingresada en este formulario es correcta y verdadera.
              </Label>
            </div>
          </CheckBox.Group>
        </div>

        <Button size="medium" color="black" variant="solid" className="w-full mt-2" type="submit" disabled={isLoading}>
          Guardar
        </Button>
      </form>

      <GuardianExists
        open={open}
        onClose={handleCloseLinkGuardian}
        guardian={guardianFound}
        onLink={handleLinkGuardian}
      />
    </div>
  );
}

const guardianRelationshipOptions = [
  { id: 'Padre', label: 'Padre' },
  { id: 'Madre', label: 'Madre' },
  { id: 'Tío/a', label: 'Tío/a' },
  { id: 'Abuelo/a', label: 'Abuelo/a' },
  { id: 'Hermano/a', label: 'Hermano/a' },
  { id: 'Otro', label: 'Otro' },
];

export function GuardianExists({
  open,
  onClose,
  onLink,
  guardian,
}: {
  open: boolean;
  onClose: () => void;
  onLink: () => void;
  guardian?: Guardian;
}) {
  if (!guardian) {
    return null;
  }

  return (
    <Drawer.Root open={open}>
      <Drawer.Title>¿Vincular un tutor existente?</Drawer.Title>

      <Drawer.Description className="text-base text-center">
        El tutor que estás intentanto registrar ya tiene una cuenta con Cometa. Revisa cuidadosamente la información
        antes de continuar.
      </Drawer.Description>

      <div className="flex flex-col gap-3 bg-[#fbfcfd] border border-[#e4ebf6] rounded-lg p-6 mb-6">
        <p className="font-semibold">
          {guardian.first_name} {guardian.last_name}
        </p>
        <p className="flex gap-2">
          <MailIcon className="w-4 mr-2 text-[#98A2B3]" />
          <span>{maskEmail(guardian.email)}</span>
        </p>
        <p className="flex gap-2">
          <PhoneIcon className="w-4 mr-2 text-[#98A2B3]" />
          <span>{maskPhone(guardian.phone)}</span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-3">
        <Button className="bg-[#1c1c1d] hover:bg-[#353540]" onClick={onLink}>
          Vincular tutor
        </Button>
        <Button variant="outline" onClick={onClose}>
          Volver
        </Button>
      </div>
    </Drawer.Root>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.9998 0.999818C12.8123 0.812347 12.558 0.707031 12.2928 0.707031C12.0277 0.707031 11.7733 0.812347 11.5858 0.999818L6.99982 5.58582L2.41382 0.999818C2.22629 0.812347 1.97198 0.707031 1.70682 0.707031C1.44165 0.707031 1.18735 0.812347 0.999818 0.999818C0.812347 1.18735 0.707031 1.44165 0.707031 1.70682C0.707031 1.97198 0.812347 2.22629 0.999818 2.41382L5.58582 6.99982L0.999818 11.5858C0.812347 11.7733 0.707031 12.0277 0.707031 12.2928C0.707031 12.558 0.812347 12.8123 0.999818 12.9998C1.18735 13.1873 1.44165 13.2926 1.70682 13.2926C1.97198 13.2926 2.22629 13.1873 2.41382 12.9998L6.99982 8.41382L11.5858 12.9998C11.7733 13.1873 12.0277 13.2926 12.2928 13.2926C12.558 13.2926 12.8123 13.1873 12.9998 12.9998C13.1873 12.8123 13.2926 12.558 13.2926 12.2928C13.2926 12.0277 13.1873 11.7733 12.9998 11.5858L8.41382 6.99982L12.9998 2.41382C13.1873 2.22629 13.2926 1.97198 13.2926 1.70682C13.2926 1.44165 13.1873 1.18735 12.9998 0.999818Z"
        fill="#374957"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" className={className}>
      <path
        fill="currentColor"
        d="M14.25.759766H3.75c-.9942.001191-1.94733.396664-2.65034 1.099664C.396661 2.56243.00119089 3.51557 0 4.50977v9.00003c.00119089.9942.396661 1.9473 1.09966 2.6503.70301.703 1.65614 1.0985 2.65034 1.0997h10.5c.9942-.0012 1.9473-.3967 2.6503-1.0997.703-.703 1.0985-1.6561 1.0997-2.6503V4.50977c-.0012-.9942-.3967-1.94734-1.0997-2.65034-.703-.703-1.6561-1.098473-2.6503-1.099664ZM3.75 2.25977h10.5c.4491.00088.8876.13613 1.2592.38835.3716.25222.6592.60986.8258 1.0269l-5.7435 5.74425c-.4227.42098-.99494.65733-1.5915.65733-.59656 0-1.16882-.23635-1.5915-.65733L1.665 3.67502c.16661-.41704.45421-.77468.82579-1.0269.37157-.25222.81012-.38747 1.25921-.38835Zm10.5 13.50003H3.75c-.59674 0-1.16903-.2371-1.59099-.659-.42196-.422-.65901-.9943-.65901-1.591V5.63477l4.848 4.84503c.70397.7022 1.65769 1.0965 2.652 1.0965s1.948-.3943 2.652-1.0965L16.5 5.63477v7.87503c0 .5967-.2371 1.169-.659 1.591-.422.4219-.9943.659-1.591.659Z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19" className={className}>
      <g fill="currentColor" clipPath="url(#a)">
        <path d="M11.25.00976562h-4.5C5.7558.0109565 4.80267.406427 4.09966 1.10943c-.703.703-1.09847 1.65614-1.09966 2.65034V14.2598c.00119.9942.39666 1.9473 1.09966 2.6503.70301.703 1.65614 1.0985 2.65034 1.0997h4.5c.9942-.0012 1.9473-.3967 2.6503-1.0997.703-.703 1.0985-1.6561 1.0997-2.6503V3.75977c-.0012-.9942-.3967-1.94734-1.0997-2.65034C13.1973.406427 12.2442.0109565 11.25.00976563v-1e-8ZM6.75 1.50977h4.5c.5967 0 1.169.23705 1.591.65901.4219.42195.659.99425.659 1.59099v8.25003h-9V3.75977c0-.59674.23705-1.16904.65901-1.59099.42196-.42196.99425-.65901 1.59099-.65901Zm4.5 15.00003h-4.5c-.59674 0-1.16903-.2371-1.59099-.659-.42196-.422-.65901-.9943-.65901-1.591v-.75h9v.75c0 .5967-.2371 1.169-.659 1.591-.422.4219-.9943.659-1.591.659Z" />
        <path d="M9 15.7598c.41422 0 .75001-.3358.75001-.75s-.33579-.75-.75001-.75c-.41421 0-.75.3358-.75.75s.33579.75.75.75Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 .00976562h18v18H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function maskEmail(email?: string) {
  if (!email) {
    return '';
  }
  const [userName, domainName] = email.split('@');
  return `${userName.substring(0, 3)}***@${domainName}`;
}

function maskPhone(phone?: string | null) {
  if (!phone) {
    return '';
  }
  return `${phone.substring(0, 5)}*******`;
}

function findStepByTag(steps: AdmissionStepEntity[], tag: string): SchoolStepEntity | undefined {
  const found = steps?.find((step) => step?.school_step?.tag === tag) || undefined;
  return found?.school_step ? found.school_step : undefined;
}

export type MutateResult<TData> = {
  success: boolean;
  error: string | null;
  data?: TData;
};

export function useHandleMutate<TData, T>(
  mutateFunction: UseMutationResult<TData, unknown, T, unknown>['mutateAsync']
) {
  return async (data: T): Promise<MutateResult<TData>> => {
    try {
      await mutateFunction(data);
      return { success: true, error: null };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return { success: false, error: errorMessage };
    }
  };
}

ApplicationFormPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Formulario de aplicación</title>
      </Head>

      <main className="max-w-md mx-auto">{page}</main>
    </>
  );
};

ApplicationFormPage.auth = true;

export default ApplicationFormPage;
