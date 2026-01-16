'use client';

import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { api } from '~/utils/api';
import { Card, CardContent, CardItem } from '~/components/Card';
import { useRouter } from 'next/router';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, DatePicker, Drawer, ContainerError, Input, Label, Radio, Select } from '@cometa/recreo';
import { InfoIcon } from 'lucide-react';
import { Banner } from '~/components/Banner';
import { PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { TrackEvents } from '~/constants/events';
import { useSendEvent } from '~/hooks/useSendEvent';
import { GenderEnum } from '@cometa/trpc';
import { useToggle } from '@cometa/hooks';
import { useSelectedSchool } from '~/stores/globalStore';
import type { Country, MainStudentEntity, State } from '@cometa/trpc/src/students/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIntegrationsBlockedFields } from '~/hooks/useIntegrationsBlockedFields';
import { validateZodStringDate } from '~/utils/zod';

const GENDER_MALE = { id: 'M', value: 'M' };
const GENDER_FEMALE = { id: 'F', value: 'F' };

type PersonalInfoItem = {
  label: string;
  value: string | null | undefined;
};

const formSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  identifier: z.string().nullable(),
  birthdate: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida')
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
  gender: z.nativeEnum(GenderEnum, { errorMap: () => ({ message: 'Debe seleccionar un género' }) }),
  nationality_code: z.string().optional(),
  birth_place_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function PersonalPage() {
  const sendEvent = useSendEvent();

  const router = useRouter();
  const { guardianHash } = router.query;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const studentId = router.query.studentId as string;
  const { data: student } = api.students.getStudent.useQuery({ studentId });
  const { data: studentAdditionalInfo } = api.student.getStudentAdditionalInfo.useQuery({ studentId });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form;

  function restoreForm() {
    let formattedBirthdate = '';
    if (student?.birthdate && student.birthdate.trim() !== '') {
      const dateOnly = student.birthdate.includes('T')
        ? student.birthdate.substring(0, student.birthdate.indexOf('T'))
        : student.birthdate;
      formattedBirthdate = format(parse(dateOnly, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
    }

    reset({
      first_name: student?.first_name,
      last_name: student?.last_name,
      identifier: student?.identifier as string,
      birthdate: formattedBirthdate,
      gender: student?.gender as GenderEnum,
      birth_place_id: studentAdditionalInfo?.birth_place?.id || undefined,
      nationality_code: studentAdditionalInfo?.nationality_code || undefined,
    });
  }

  useEffect(() => restoreForm(), [student]);

  const { toggle: isOpen, onOpen, onClose } = useToggle();

  const utils = api.useUtils();
  const updateStudent = api.students.updateStudent.useMutation({
    onSuccess() {
      utils.students.getStudent.invalidate({ studentId });
    },
  });
  const updateStudentAdditionalInfo = api.student.updateStudentAdditionalInfo.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
    },
  });
  const createStudentAdditionalInfo = api.student.createStudentAdditionalInfo.useMutation({
    onSuccess() {
      utils.student.getStudentAdditionalInfo.invalidate({ studentId });
    },
  });

  const mutate = async (data: FormValues) => {
    const formattedBirthdate = format(parse(data.birthdate, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');

    const additionalInfoPayload = {
      nationality_code: data.nationality_code || null,
      birth_place_id: data.birth_place_id || null,
    };

    const updateStudentPromise = updateStudent.mutateAsync({
      studentId,
      data: { ...data, birthdate: formattedBirthdate },
    });

    const updateAdditionalInfoPromise = studentAdditionalInfo
      ? updateStudentAdditionalInfo.mutateAsync({ studentId, data: additionalInfoPayload })
      : createStudentAdditionalInfo.mutateAsync({ data: { ...additionalInfoPayload, student_id: studentId } });

    await Promise.all([updateStudentPromise, updateAdditionalInfoPromise]);

    setIsEditing(false);
    setIsLoading(false);
  };

  function onSubmit(data: FormValues) {
    setIsLoading(true);

    sendEvent(TrackEvents.students.editConfirm);

    if (!isDirty) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    void mutate(data);
  }

  function handleDiscardOnClickBack() {
    if (isEditing && isDirty) {
      onOpen();
      return;
    }

    router.push(`/guardians/${guardianHash}/students/${studentId}`);
  }

  function handleDiscard() {
    restoreForm();
    onClose();
    setIsEditing(false);
  }

  function handleCancel() {
    restoreForm();
    setIsEditing(false);
  }

  function handleEdit() {
    sendEvent(TrackEvents.students.editClicked);
    setIsEditing(true);
  }

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <div onClick={handleDiscardOnClickBack} className="flex items-center gap-3 hover:cursor-pointer">
          <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
          <span className="text-sm font-semibold uppercase">Volver</span>
        </div>

        <EditButton isEditing={isEditing} onCancel={handleCancel} onEdit={handleEdit} />
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-bold text-[#22222A]">Datos del estudiante</h1>
        <p className="text-sm text-[#535765]">Información médica del estudiante disponible para uso del colegio.</p>
      </header>

      <section className="flex flex-col gap-4">
        {isEditing ? (
          <>
            <PersonalForm form={form} isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} />
            <DiscardDialog isOpen={isOpen} isLoading={isLoading} onClose={onClose} onDiscard={handleDiscard} />
          </>
        ) : (
          <PersonalInfo student={student} />
        )}
      </section>
    </main>
  );
}

function EditButton({ isEditing, onCancel, onEdit }: { isEditing: boolean; onCancel: () => void; onEdit: () => void }) {
  const selectedSchool = useSelectedSchool();
  const canEdit = Boolean(selectedSchool?.config_dashboard?.edit_student_portal);

  if (!canEdit) return null;

  if (isEditing) {
    return (
      <Button
        onClick={onCancel}
        className="px-4 py-1.5 flex gap-2 items-center"
        size="small"
        variant="solid-light"
        color="black"
      >
        Cancelar
      </Button>
    );
  }

  return (
    <Button
      onClick={onEdit}
      className="px-4 py-1.5 flex gap-2 items-center"
      size="small"
      variant="solid-light"
      color="black"
    >
      <PencilIcon className="w-4 h-4" />
      Editar
    </Button>
  );
}

function PersonalInfo({ student }: { student?: MainStudentEntity | null }) {
  const studentId = student?.id as string;

  const { data: studentAdditionalInfo } = api.student.getStudentAdditionalInfo.useQuery({ studentId });
  const { data: countries } = api.student.getCountries.useQuery();

  let birthdate = '';
  if (student?.birthdate && student.birthdate.trim() !== '') {
    const dateOnly = student.birthdate.includes('T')
      ? student.birthdate.substring(0, student.birthdate.indexOf('T'))
      : student.birthdate;
    birthdate = format(parse(dateOnly, 'yyyy-MM-dd', new Date()), "dd 'de' MMMM 'de' yyyy", { locale: es });
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

  const items: PersonalInfoItem[] = [
    { label: 'Nombre', value: student?.first_name },
    { label: 'Apellidos', value: student?.last_name },
    { label: 'CURP', value: student?.identifier },
    { label: 'Fecha de nacimiento', value: birthdate },
    { label: 'Género', value: gender },
    { label: 'Nacionalidad', value: country?.name },
    { label: 'Lugar de nacimiento', value: studentAdditionalInfo?.birth_place?.name },
  ];

  return (
    <Card>
      <CardContent>
        {items.map(({ label, value }) => (
          <CardItem key={label} label={label} value={value} />
        ))}
      </CardContent>
    </Card>
  );
}

export function PersonalFormSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col space-y-4 animate-pulse">
          <div className="flex flex-col space-y-1">
            <div className="w-20 h-5 rounded-full bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="w-24 h-5 rounded-full bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="w-12 h-5 rounded-full bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="w-40 h-5 rounded-full bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="w-16 h-5 rounded-full bg-slate-200" />
            <div className="flex flex-col p-2 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                <div className="w-20 h-5 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                <div className="w-20 h-5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="h-5 rounded-full w-28 bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="h-5 rounded-full w-36 bg-slate-200" />
            <div className="w-full h-10 rounded-md bg-slate-200" />
          </div>

          <div className="w-full h-10 mt-2 rounded-md bg-slate-200" />
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalForm({
  form,
  isLoading,
  onSubmit,
}: {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  const sendEvent = useSendEvent();
  const { isFieldBlocked, hasAnyBlockedFields, getIntegrationName } = useIntegrationsBlockedFields();

  const personalFields = ['student.first_name', 'student.last_name', 'student.gender', 'student.birthdate'];

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const firstNameError = errors.first_name?.message as string;
  const lastNameError = errors.last_name?.message as string;
  const identifierError = errors.identifier?.message as string;
  const birthdateError = errors.birthdate?.message as string;
  const genderError = errors.gender?.message as string;
  const nationalityCodeError = errors.nationality_code?.message as string;

  const { data: countries, isLoading: isLoadingCountriesQuery } = api.student.getCountries.useQuery();
  const { data: states, isLoading: isLoadingStatesQuery } = api.student.getStates.useQuery();

  if (isLoadingCountriesQuery || isLoadingStatesQuery) {
    return <PersonalFormSkeleton />;
  }

  return (
    <Card>
      <CardContent>
        {hasAnyBlockedFields(personalFields) && (
          <Banner intent="warning" className="mb-4">
            <div className="flex items-center gap-2.5">
              <InfoIcon className="w-4 h-4 text-[#57537A]" />
              <span>
                Algunos campos están bloqueados por el uso de {getIntegrationName() || 'la integración activa'}
              </span>
            </div>
          </Banner>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              {...register('first_name')}
              type="text"
              error={firstNameError}
              isLegacy={false}
              className="text-base text-[#1C1C1D]"
              onClick={() => sendEvent(TrackEvents.students.editNameClicked)}
              disabled={isFieldBlocked('student.first_name')}
            />
            <ContainerError error={firstNameError} />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="last_name">Apellidos</Label>
            <Input
              {...register('last_name')}
              type="text"
              error={lastNameError}
              isLegacy={false}
              className="text-base text-[#1C1C1D]"
              onClick={() => sendEvent(TrackEvents.students.editLastnameClicked)}
              disabled={isFieldBlocked('student.last_name')}
            />
            <ContainerError error={lastNameError} />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="email">CURP</Label>
            <Input
              {...register('identifier')}
              type="text"
              error={identifierError}
              isLegacy={false}
              className="text-base text-[#1C1C1D]"
              onClick={() => sendEvent(TrackEvents.students.editCURPClicked)}
            />
            <ContainerError error={identifierError} />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="birthdate">Fecha de nacimiento</Label>
            <Controller
              control={control}
              name="birthdate"
              render={({ field }) => {
                const isBirthdateBlocked = isFieldBlocked('student.birthdate');

                return (
                  <div className={isBirthdateBlocked ? 'pointer-events-none opacity-50' : ''}>
                    <DatePicker
                      {...field}
                      showCalendarIcon={false}
                      error={birthdateError}
                      onClick={() => {
                        if (!isBirthdateBlocked) {
                          sendEvent(TrackEvents.students.editBirthdayClicked);
                        }
                      }}
                    />
                  </div>
                );
              }}
            />
          </div>

          <Controller
            control={control}
            name="gender"
            render={({ field }) => {
              const isGenderBlocked = isFieldBlocked('student.gender');

              return (
                <Radio.Group
                  onValueChange={(value: string) => {
                    if (!isGenderBlocked) {
                      sendEvent(TrackEvents.students.editGenderClicked);
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                  error={genderError}
                  className="flex flex-col gap-1"
                  disabled={isGenderBlocked}
                >
                  <Label htmlFor="gender">Género</Label>
                  <div className="flex flex-col gap-2 p-2">
                    <div className="flex items-center gap-2">
                      <Radio.Item
                        className={isGenderBlocked ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
                        disabled={isGenderBlocked}
                        {...GENDER_MALE}
                      />
                      <Label
                        htmlFor={GENDER_MALE.id}
                        className={isGenderBlocked ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
                      >
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio.Item
                        className={isGenderBlocked ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
                        disabled={isGenderBlocked}
                        {...GENDER_FEMALE}
                      />
                      <Label
                        htmlFor={GENDER_FEMALE.id}
                        className={isGenderBlocked ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
                      >
                        Femenino
                      </Label>
                    </div>
                  </div>
                </Radio.Group>
              );
            }}
          />

          <Controller
            control={control}
            name="nationality_code"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Nacionalidad"
                className="w-full"
                labelClassNames="text-[#1C1C1D]"
                onValueChange={onChange}
                value={value}
                error={nationalityCodeError}
              >
                <Select.Content className="w-full outline-none">
                  {((countries || []) as Country[]).map((country) => (
                    <Select.Item
                      className="w-full hover:bg-[#F5FAFF] outline-none"
                      value={country.code as string}
                      key={country.code as string}
                    >
                      <div className="flex gap-2">{country.name}</div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="birth_place_id"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Lugar de nacimiento"
                className="w-full"
                labelClassNames="text-[#1C1C1D]"
                onValueChange={onChange}
                value={value}
                error={nationalityCodeError}
              >
                <Select.Content className="w-full outline-none">
                  {((states || []) as State[]).map((state) => (
                    <Select.Item
                      className="w-full hover:bg-[#F5FAFF] outline-none"
                      value={state.id as string}
                      key={state.id as string}
                    >
                      <div className="flex gap-2">{state.name}</div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            size="medium"
            variant="solid"
            color="black"
            className="mt-2 px-5 py-2.5"
          >
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DiscardDialog({
  isOpen,
  isLoading,
  onClose,
  onDiscard,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Drawer.Root open={isOpen} className="max-w-sm gap-3 text-center" minHeight="30%">
      <div className="flex flex-col items-center gap-3">
        <DiscardIcon />
        <Drawer.Title>Descartar cambios</Drawer.Title>
      </div>

      <Drawer.Description>
        <p>Los cambios realizados no se guardarán.</p>
        <p>¿Estás seguro que quieres continuar?</p>
      </Drawer.Description>

      <div className="flex flex-col gap-3">
        <Button
          className="bg-[#FD6262] hover:bg-[#FD6262]/90 text-white text-sm font-semibold px-5 py-2.5 w-full"
          onClick={onDiscard}
          disabled={isLoading}
        >
          Descartar
        </Button>
        <Drawer.Close
          onClick={onClose}
          className="bg-transparent text-[#1C1C1D] hover:bg-[#F3F6FB] text-sm font-semibold px-5 py-2.5 w-full rounded-full"
          disabled={isLoading}
        >
          Volver
        </Drawer.Close>
      </div>
    </Drawer.Root>
  );
}

function DiscardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Discard Icon</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16C32 11.7565 30.3143 7.68687 27.3137 4.68629C24.3131 1.68571 20.2435 0 16 0ZM17.6 22.4C17.6 23.2837 16.8837 24 16 24C15.1163 24 14.4 23.2837 14.4 22.4V14.4C14.4 13.5163 15.1163 12.8 16 12.8C16.8837 12.8 17.6 13.5163 17.6 14.4V22.4ZM14.4 9.6C14.4 10.4837 15.1163 11.2 16 11.2C16.8837 11.2 17.6 10.4837 17.6 9.6C17.6 8.71634 16.8837 8 16 8C15.1163 8 14.4 8.71634 14.4 9.6Z"
        fill="#FD6262"
      />
    </svg>
  );
}

PersonalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Datos del estudiante</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

PersonalPage.auth = true;

export default PersonalPage;
