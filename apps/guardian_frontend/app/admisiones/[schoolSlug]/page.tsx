'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
  CheckBox,
  Chip,
  DatePicker,
  Input,
  Label,
  PhoneInput,
  Radio,
  Select,
  TextArea,
  TextField,
} from '@cometa/recreo';
import { api } from '~/utils/api';
import { validateZodStringDate } from '~/utils/zod';
import { CardLayout } from '../CardLayout';
import { changeReasons, meetReasons } from '~/constants/admissions';
import { GuardianExists } from './GuardianExists';
import { useToggle } from '@cometa/hooks';
import { GenderEnum } from '@cometa/trpc/src/admissions/types';
import { useUTMAppRouter } from '~/app/hooks/useUTMAppRouter';
import Link from 'next/link';
import { capitalize } from '~/utils/strings';
import { notFound } from 'next/navigation';
import { SectionFilter } from '@cometa/trpc';

const REQUIRED_MESSAGE = 'Debes completar este campo para continuar.';

const schema = z.object({
  first_name: z.string().min(1, REQUIRED_MESSAGE),
  last_name: z.string().min(1, REQUIRED_MESSAGE),
  section_id: z.string().min(1, REQUIRED_MESSAGE),
  school_cycle_id: z.string().min(1, REQUIRED_MESSAGE),
  origin_school: z.string(),
  change_reason: z.string({ required_error: REQUIRED_MESSAGE }),
  meet_reason: z.string({ required_error: REQUIRED_MESSAGE }),
  comment: z.string().optional(),
  birthdate: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
  gender: z.nativeEnum(GenderEnum, { required_error: REQUIRED_MESSAGE }),
  guardian_lead: z.object({
    first_name: z.string().min(1, REQUIRED_MESSAGE).transform(capitalize),
    last_name: z.string().min(1, REQUIRED_MESSAGE).transform(capitalize),
    email: z.string().min(1, REQUIRED_MESSAGE).email('Ingresa una dirección de correo válida.'),
    phone: z.string({ required_error: REQUIRED_MESSAGE }),
    accept_terms: z.boolean({ required_error: 'Debes aceptar los términos y condiciones.' }),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function AdmissionFormPage({ params: { schoolSlug } }: { params: { schoolSlug: string } }) {
  const { toggle: open, onClose, onOpen } = useToggle(false);
  const [isLoading, setLoading] = useState(false);

  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: { school_cycle_id: '', section_id: '' },
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const { data: school, isFetched } = api.schools.getBySlugName.useQuery({ slug: schoolSlug });
  const schoolId = school?.id as string;

  if (!school && isFetched) {
    notFound();
  }

  const { data: schoolCycles } = api.schools.getSchoolsCyclesByToken.useQuery(
    { school_id: schoolId },
    { enabled: !!schoolId }
  );
  const { data: sections } = api.schools.getSectionsByToken.useQuery({ school_id: schoolId }, { enabled: !!schoolId });

  const phone = watch('guardian_lead.phone');
  const { data: guardianResponse, refetch } = api.guardian.existGuardian.useQuery(
    {
      schoolId,
      query: {
        email: watch('guardian_lead.email'),
        phone: phone,
      },
    },
    { refetchOnWindowFocus: false, enabled: false }
  );

  const createAdmission = api.admissions.createPublicAdmission.useMutation({
    onSuccess: () => router.push('/admisiones/success'),
  });

  const router = useUTMAppRouter();

  const existGuardian = guardianResponse?.count === 1;
  const guardian = guardianResponse?.results?.[0];

  useEffect(() => onOpen(), [existGuardian]);

  async function onSubmit(data: FormValues) {
    await refetch();

    if (existGuardian) {
      onOpen();
      return;
    }

    setLoading(true);

    const { birthdate, ...rest } = data;
    const [day, month, year] = birthdate.split('/');
    const formattedBirthdate = `${year}-${month}-${day}`;

    const payload = {
      ...rest,
      birthdate: formattedBirthdate,
      created_by: `${data.guardian_lead.first_name} ${data.guardian_lead.last_name}`,
      school_id: school?.id as string,
    };

    createAdmission.mutate(payload);
  }

  return (
    <CardLayout>
      <div className="px-8 py-2 flex flex-col gap-3 -mt-8 md:mt-0 bg-white rounded-t-2xl">
        <header>
          <div className="flex justify-between flex-col-reverse md:flex-row pt-2 md:pt-0 gap-4">
            <div>
              <p className="text-sm">Admisiones</p>
              <h1 className="text-2xl font-bold text-[#1C1C1D]">{school?.name}</h1>
            </div>
            <img src={school?.logo as string} alt={school?.name} className="h-14 object-contain" />
          </div>
          <p className="text-[#637381] mt-4">
            ¡Gracias por tu interés en nuestro colegio! Por favor, registra tu información y nos pondremos en contacto.
          </p>
        </header>

        <div className="border-b border-gray-50 my-6" />

        <form className="flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold leading-5 text-[#1C1C1D]">Información del tutor</span>
                <span className="text-base font-normal text-[#637381] leading-6">
                  Ingresa la información del tutor responsable del postulante.
                </span>
              </div>
              <TextField
                label="Nombre"
                error={errors.guardian_lead?.first_name?.message}
                value={watch('guardian_lead.first_name')}
              >
                <Input {...register('guardian_lead.first_name')} type="text" />
              </TextField>
              <TextField
                label="Apellidos"
                error={errors.guardian_lead?.last_name?.message}
                value={watch('guardian_lead.last_name')}
              >
                <Input {...register('guardian_lead.last_name')} type="text" />
              </TextField>
              <TextField
                label="Correo electrónico"
                error={errors.guardian_lead?.email?.message}
                value={watch('guardian_lead.email')}
              >
                <Input
                  {...register('guardian_lead.email')}
                  onBlur={() => {
                    if (watch('guardian_lead.email')) {
                      refetch();
                    }
                  }}
                  type="text"
                />
              </TextField>
              <Controller
                control={control}
                name="guardian_lead"
                render={({ field }) => (
                  <PhoneInput
                    onChange={({ number }) => {
                      clearErrors('guardian_lead.phone');
                      field.onChange({
                        ...watch('guardian_lead'),
                        phone: number,
                      });
                    }}
                    onBlur={() => {
                      if (phone && phone.length > 7) {
                        refetch();
                      }
                    }}
                    error={errors.guardian_lead?.phone?.message}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold leading-5 text-[#1C1C1D]">Información del estudiante</span>
                <span className="text-base font-normal text-[#637381] leading-6">
                  Ingresa la información del estudiante a postular.
                </span>
              </div>
              <TextField label="Nombre" error={errors.first_name?.message} value={watch('first_name')}>
                <Input {...register('first_name')} type="text" />
              </TextField>
              <TextField label="Apellidos" error={errors.last_name?.message} value={watch('last_name')}>
                <Input {...register('last_name')} type="text" />
              </TextField>
              <div className="flex flex-col gap-1">
                <h5 className="text-xs font-bold mb-2">FECHA DE NACIMIENTO:</h5>
                <Controller
                  control={control}
                  name="birthdate"
                  render={({ field }) => (
                    <DatePicker {...field} error={errors.birthdate?.message} showCalendarIcon={false} />
                  )}
                />
              </div>
              <div className="flex flex-col">
                <h5 className="text-xs font-bold">SEXO:</h5>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Radio.Group
                      value={field.value}
                      onValueChange={field.onChange}
                      error={errors.gender?.message}
                      className="mb-2"
                    >
                      <div className="flex gap-x-8 mt-2">
                        <div className="flex items-center gap-2">
                          <Radio.Item id="male" value="male" />
                          <Label htmlFor="male">Masculino</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Radio.Item id="female" value="female" />
                          <Label htmlFor="female">Femenino</Label>
                        </div>
                      </div>
                    </Radio.Group>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="school_cycle_id"
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="Ciclo escolar de ingreso"
                    className="w-full outline-none min-h-[56px] h-full mb-1"
                    onValueChange={onChange}
                    value={value}
                    error={errors.school_cycle_id?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {schoolCycles?.map((cycle) => (
                        <Select.Item
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                          value={cycle.id as string}
                          key={cycle.id as string}
                        >
                          <div className="flex gap-2">
                            {cycle.name}
                            {cycle.is_active && <Chip variant="blue">Ciclo actual</Chip>}
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="section_id"
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="Grado al que postula"
                    className="w-full outline-none min-h-[56px] h-full mb-1"
                    onValueChange={onChange}
                    value={value}
                    error={errors.section_id?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {sections?.map((section: SectionFilter) => (
                        <Select.Item
                          key={section.id}
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                          value={section.id}
                        >
                          <div className="flex gap-2">
                            {section.grade} - {section.level}
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <TextField
                label="Escuela de procedencia (opcional)"
                error={errors.origin_school?.message}
                value={watch('origin_school')}
              >
                <Input {...register('origin_school')} type="text" />
              </TextField>
              <Controller
                control={control}
                name="change_reason"
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="Motivo de cambio o postulación"
                    className="w-full outline-none min-h-[56px] h-full mb-1"
                    onValueChange={onChange}
                    value={value}
                    error={errors.change_reason?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {changeReasons.map((changeReason) => (
                        <Select.Item
                          key={changeReason}
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                          value={changeReason}
                        >
                          <div className="flex gap-2">{changeReason}</div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="meet_reason"
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="¿Cómo conociste el colegio?"
                    className="w-full outline-none min-h-[56px] h-full mb-1"
                    onValueChange={onChange}
                    value={value}
                    error={errors.meet_reason?.message}
                  >
                    <Select.Content className="w-full outline-none">
                      {meetReasons.map((meetReason) => (
                        <Select.Item
                          key={meetReason}
                          className="w-full hover:bg-[#F5FAFF] outline-none"
                          value={meetReason}
                        >
                          <div className="flex gap-2">{meetReason}</div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="comment"
                render={({ field }) => (
                  <TextField label="Comentarios (opcional)" textareaGrow value={watch('comment')} className="mb-2">
                    <TextArea
                      {...field}
                      id="comment"
                      className="border-none max-h-[200px] min-h-[140px] transition-all resize-none"
                    />
                  </TextField>
                )}
              />
              <CheckBox.Group error={errors.guardian_lead?.accept_terms?.message} className="mx-2">
                <div className="flex items-center gap-2">
                  <CheckBox.Item
                    id="accept_terms"
                    name="accept_terms"
                    checked={watch('guardian_lead.accept_terms')}
                    onCheckedChange={(value) => setValue('guardian_lead.accept_terms', !!value)}
                    className="hover:cursor-pointer"
                  />
                  <Label htmlFor="accept_terms" className="text-base font-normal">
                    Acepto los{' '}
                    <Link
                      href="https://portal.getcometa.com/terms"
                      target="_blank"
                      className="text-[#2850FF] underline hover:cursor-pointer"
                    >
                      Términos & condiciones y políticas de privacidad.
                    </Link>
                  </Label>
                </div>
              </CheckBox.Group>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={isLoading} size="medium" color="black" variant="solid">
              Enviar información
            </Button>
          </div>
        </form>
      </div>

      <GuardianExists open={open} onClose={onClose} guardian={guardian} />
    </CardLayout>
  );
}
