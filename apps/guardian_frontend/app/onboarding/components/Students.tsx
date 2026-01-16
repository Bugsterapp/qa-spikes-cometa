import React from 'react';
import { Button } from '~/components/ui/Button';
import { Controller, useForm } from 'react-hook-form';
import * as sentry from '@sentry/nextjs';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '~/utils/api';
import { Fieldset } from '~/components/FormField';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import CustomFormField, { HelperTextWithIcon } from '~/components/CustomFormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/PhoneInput/Select';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import { ConfirmationDrawer } from '~/components/Drawer.Variants';
import { GenderEnum, OnboardingStageEnum } from '@cometa/trpc';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import dayjs from 'dayjs';
import { WHAT_ONBOARDING_HELP } from '~/utils/linksWhatsapp';
import Pencil from '~/public/icons/pencil.svg';
import Dialog from '~/components/molecules/common/Dialog';
import { useOnboardingStore } from '../store/OnboardingStoreProvider';
import { useSendEvent } from '~/hooks/useSendEvent';
import { useSelectedSchool } from '~/stores/globalStore';

const StudentViewVariants: Variants = {
  enter: (direction: number) => ({
    x: direction < 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  visible: {
    x: '0%',
    opacity: 1,
    transition: {
      x: {
        bounce: 0.1,
      },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      opacity: {
        ease: 'easeInOut',
      },
    },
  }),
};

export const StudentResolver = z.object({
  id: z.string().optional(),
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  birthdate: z.object({
    day: z
      .number({
        invalid_type_error: 'Debes elegir un día entre 1 y 31',
        required_error: 'Debes elegir un día entre 1 y 31',
      })
      .min(1, 'Debes elegir un día entre 1 y 31')
      .max(31, 'Debes elegir un día entre 1 y 31'),
    month: z
      .number({
        invalid_type_error: 'Debes elegir un mes entre 1 y 12',
        required_error: 'Debes elegir un mes entre 1 y 12',
      })
      .min(1, 'Debes elegir un mes entre 1 y 12')
      .max(12, 'Debes elegir un mes entre 1 y 12'),
    year: z
      .number({
        invalid_type_error: 'Debes elegir un año mayor a 1900',
        required_error: 'Debes elegir un año mayor a 1900',
      })
      .min(1900, 'Debes elegir un año mayor a 1900'),
  }),
  identifier: z.string().optional(),
  gender: z.nativeEnum(GenderEnum).optional(),
});

type StudentValues = z.infer<typeof StudentResolver>;

export default function Student({ onSubmit }: { onSubmit: () => void }) {
  const sendEvent = useSendEvent();
  const selectedSchool = useSelectedSchool();
  const studentMutation = api.student.update.useMutation();
  const [setBackWithConfirmation, setConfirmationBackCallback, step] = useOnboardingStore((state) => [
    state.setBackWithConfirmation,
    state.setConfirmationBackCallback,
    state.step,
  ]);
  const [student, setStudent] = React.useState<string | null>(null);
  const [confirmation, setConfirmation] = React.useState(false);
  const {
    register,
    formState: { errors, isDirty },
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
  } = useForm<StudentValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(StudentResolver),
  });
  const isDirtyRef = React.useRef(false);

  const { data: students, isFetching: isLoading } = api.guardian.studentList.useQuery(undefined);
  const utils = api.useUtils();

  isDirtyRef.current = isDirty;

  const onBackIntempt = () => {
    if (!isDirtyRef.current) {
      setStudent(null);
      setBackWithConfirmation(false);
    } else {
      setConfirmation(true);
    }
  };

  const submitStudentForm = async (values: StudentValues) => {
    sendEvent('Onboarding — onboarding step 2.3 (student) complete');
    if (!student) {
      return sentry.captureException('[Onboarding Students Step]: No student selected');
    }

    const student_birthdate = values.birthdate;

    const birthdate = `${student_birthdate.year}-${student_birthdate.month
      .toString()
      .padStart(2, '0')}-${student_birthdate.day.toString().padStart(2, '0')}`;

    const response = await studentMutation.mutateAsync({
      id: student,
      data: {
        ...values,
        birthdate,
      },
    });

    if (response.error) {
      Object.keys(response.data).forEach((key) =>
        setError(`root.${key}`, { type: 'validate', message: response.data[key] })
      );
      return;
    }

    await utils.guardian.studentList.invalidate();

    setBackWithConfirmation(false);
    setStudent(null);
  };

  const canEditStudent = Boolean(selectedSchool?.config_dashboard?.edit_student_portal);

  return (
    <>
      <AnimatePresence initial={false} mode="wait" custom={student ? -1 : 1}>
        {Boolean(students?.length) && !student && (
          <motion.div
            custom={-1}
            key="student-list"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-auto h-full px-2 pt-8 mb-auto"
          >
            <article className="mb-6 text-[#1C1C1D] pr-6 px-2">
              <h3 className="mb-2.5 text-xl font-bold">Datos de los estudiantes</h3>
              <p className="text-[#57537A]">
                Puedes revisar y editar la información de los estudiantes de ser necesario.
              </p>
            </article>

            <div className="flex flex-col px-2 space-y-6 mb-9" data-testid="students-list">
              {isLoading && (
                <div
                  className="h-[76px] w-full bg-slate-50 px-5 py-[18px] rounded-[14px] flex flex-col gap-3 items-start hover:cursor-pointer animate-pulse"
                  data-testid="loading-students"
                >
                  <span className="w-2/3 h-2 bg-slate-300 rounded-xl" />
                  <span className="w-1/3 h-2 bg-slate-300 rounded-xl" />
                </div>
              )}
              {!isLoading &&
                students?.map((student) => (
                  <div
                    key={`${student.id}_${student.first_name}_${student.last_name}}`}
                    className="w-full bg-white px-5 py-[18px] rounded-[14px] flex flex-col shadow-[0px_2px_48px_0px_#6C6CCD26] gap-3.5"
                  >
                    <div className="inline-flex items-center justify-between border-b border-[#EBEBEB] pb-3.5 text-[#1C1C1D]">
                      <span className="text-lg font-semibold ">
                        {student.first_name} {student.last_name}
                      </span>
                      {canEditStudent ? (
                        <button
                          className="px-2 py-2 bg-transparent rounded-full hover:bg-slate-100"
                          onClick={() => {
                            sendEvent('Onboarding — step 2 edit students clicked');
                            setStudent(student.id);
                            setBackWithConfirmation(true);
                            setConfirmationBackCallback(() => onBackIntempt());
                            reset({
                              first_name: student.first_name,
                              last_name: student.last_name,
                              birthdate: {
                                day: dayjs(student.birthdate).date(),
                                month: dayjs(student.birthdate).month() + 1,
                                year: dayjs(student.birthdate).year(),
                              },
                              identifier: student.identifier ?? undefined,
                              gender: student.gender ? student.gender : undefined,
                            });
                          }}
                          data-testid="editPencil-button"
                        >
                          <Pencil className="w-6 h-6" />
                        </button>
                      ) : null}
                    </div>

                    <ul className="flex flex-col text-sm text-gray-300 gap-y-1">
                      <li>
                        <span className="mr-1 font-medium">CURP:</span>
                        <span className="font-semibold">{student.identifier}</span>
                      </li>
                      <li>
                        <span className="mr-1 font-medium">Fecha de nacimiento:</span>
                        <span className="font-semibold">
                          {student.birthdate && dayjs(student.birthdate).format('DD/MM/YYYY')}
                        </span>
                      </li>
                      <li>
                        <span className="mr-1 font-medium">Género:</span>
                        <span className="font-semibold">
                          {student.gender === GenderEnum.M ? 'Masculino' : 'Femenino'}
                        </span>
                      </li>
                    </ul>
                  </div>
                ))}
            </div>
            <div className="sticky bottom-0 px-2 pt-6 pb-4 bg-white rounded-xl">
              {/* eslint-disable-next-line */}
              <a
                target="_blank"
                href={WHAT_ONBOARDING_HELP}
                className="block mx-auto mt-auto text-sm font-normal text-blue-100 underline w-fit"
                onClick={() => {
                  sendEvent('Onboarding — needs help clicked');
                }}
              >
                ¿Necesitas ayuda?
              </a>
              <Button
                className="block w-full mt-6 lg:mt-12"
                disabled={isLoading}
                theme="recreo"
                onClick={() => {
                  onSubmit();
                }}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}
        {student && (
          <motion.div
            custom={1}
            key="student-form"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="px-4"
          >
            <div className="flex items-center justify-between text-gray-300 mb-9">
              <h3 className="text-xl font-bold text-[#1C1C1D]">Detalles del estudiante</h3>
            </div>

            <form onSubmit={handleSubmit(submitStudentForm)}>
              <Fieldset>
                <Fieldset.Legend className="font-semibold text-gray-300">Datos personales</Fieldset.Legend>
                <CustomFormField htmlFor="first_name" label="Nombre/s" error={errors.first_name?.message}>
                  <CustomInput
                    theme="recreo"
                    placeholder=""
                    className="p-5 rounded-[14px]"
                    data-testid="firstName-input"
                    {...register('first_name')}
                    onClick={() => sendEvent('Onboarding — student first name edited')}
                  />
                </CustomFormField>
                <CustomFormField htmlFor="last_name" label="Apellido/s" error={errors.last_name?.message}>
                  <CustomInput
                    theme="recreo"
                    placeholder=""
                    className="p-5 rounded-[14px]"
                    data-testid="lastName-input"
                    {...register('last_name')}
                    onClick={() => sendEvent('Onboarding — student last name edited')}
                  />
                </CustomFormField>
              </Fieldset>
              <Fieldset>
                <Fieldset.Legend>Fecha de nacimiento</Fieldset.Legend>
                <div className="flex justify-between gap-[5px]">
                  <CustomFormField
                    label="Día"
                    error={errors.birthdate?.day?.message}
                    hideHelperText
                    className="lg:max-w-[100px]"
                    htmlFor="birthdate.day"
                  >
                    <CustomInput
                      theme="recreo"
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="day-input"
                      {...register('birthdate.day', { valueAsNumber: true, min: 1, max: 31 })}
                      onClick={() => sendEvent('Onboarding — student birth day edited')}
                    />
                  </CustomFormField>
                  <CustomFormField
                    label="Mes"
                    error={errors.birthdate?.month?.message}
                    hideHelperText
                    className="lg:max-w-[100px]"
                    htmlFor="birthdate.month"
                  >
                    <CustomInput
                      theme="recreo"
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="month-input"
                      {...register('birthdate.month', { valueAsNumber: true, min: 1, max: 12 })}
                      onClick={() => sendEvent('Onboarding — student birth month edited')}
                    />
                  </CustomFormField>
                  <CustomFormField
                    label="Año"
                    error={errors.birthdate?.year?.message}
                    hideHelperText
                    className="lg:max-w-[100px]"
                    htmlFor="birthdate.year"
                  >
                    <CustomInput
                      theme="recreo"
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="year-input"
                      {...register('birthdate.year', { valueAsNumber: true })}
                      onClick={() => sendEvent('Onboarding — student birth year edited')}
                    />
                  </CustomFormField>
                </div>
                <div data-testid="birthdate-error">
                  {Object.keys(errors.birthdate ?? {}).map((error) => (
                    <HelperTextWithIcon key={error} isError>
                      {(errors.birthdate?.[error as keyof typeof errors.birthdate] as any)?.message}
                    </HelperTextWithIcon>
                  ))}
                </div>

                <CustomFormField label="CURP" htmlFor="identifier" error={errors.identifier?.message}>
                  <CustomInput
                    theme="recreo"
                    placeholder=""
                    className="p-5 rounded-[14px]"
                    data-testid="curp-input"
                    {...register('identifier')}
                    onClick={() => sendEvent('Onboarding — student CURP edited')}
                  />
                </CustomFormField>
              </Fieldset>
              <Fieldset>
                <Fieldset.Legend>Género</Fieldset.Legend>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      defaultValue={field.value ?? undefined}
                      onValueChange={field.onChange}
                      data-testid="gender-select"
                    >
                      <SelectTrigger
                        onClick={() => sendEvent('Onboarding — student gender edited')}
                        data-error={Boolean(errors.gender)}
                        className="pointer-events-auto shadow-[0px_2px_50px_0px_#6C6CCD26] group bg-white h-[67px] data-[error=true]:border-error data-[error=true]:border  data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1 w-full rounded-2xl"
                      >
                        <SelectValue placeholder="Género" />
                        <ExpandMore width="24" height="24" className="text-blue-100 group-disabled:text-[#A6A6A6]" />
                      </SelectTrigger>
                      <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="M" className="flex hover:cursor-pointer" textValue="Masculino">
                          Masculino
                        </SelectItem>
                        <SelectItem value="F" className="flex hover:cursor-pointer" textValue="Femenino">
                          Femenino
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {Boolean(errors.gender) && (
                  <HelperTextWithIcon isError data-testid="gender-error">
                    El género es requerido
                  </HelperTextWithIcon>
                )}
              </Fieldset>

              <Button
                className="block w-full mx-auto my-9 lg:mt-12"
                disabled={studentMutation.isPending || !isDirty}
                data-testid="confirm-button"
                theme="recreo"
              >
                Confirmar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={confirmation && isDirty}>
        <Dialog.Content className="w-screen px-5">
          <div className="flex flex-col space-y-6">
            <span className="text-sm text-center">
              ¿Quieres volver sin confirmar los datos ingresados para el estudiante?
            </span>
            <Button
              className="px-5 py-3 text-sm"
              onClick={() => {
                sendEvent('Onboarding — back button confirm', {
                  step_number: step,
                  step_name: OnboardingStageEnum.STUDENTS,
                });
                setStudent(null);
                setBackWithConfirmation(false);
                setConfirmation(false);
              }}
              data-testid="confirm-alertButton"
              theme="recreo"
            >
              Continuar de todos modos
            </Button>
            <Dialog.Close
              className="text-sm text-[#1C1C1D] bg-transparent"
              onClick={() => {
                sendEvent('Onboarding — back button cancel', {
                  step_number: step,
                  step_name: OnboardingStageEnum.STUDENTS,
                });
                setConfirmation(false);
              }}
              data-testid="cancel-alertButton"
            >
              Cancelar
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog>
      <ConfirmationDrawer
        open={Boolean(errors.root?.identifier)}
        title="Lo sentimos, ya existe un estudiante con estos datos."
        description="Comuníquese con soporte para obtener mas información"
        confirmLabel="Contactar a soporte"
        cancelLabel="Atrás"
        onClick={() => {
          sendEvent('Onboarding — error support button clicked', { lastStep: OnboardingStageEnum.STUDENTS });
          window.open(WHAT_ONBOARDING_HELP, '_blank');
        }}
        onCancel={() => {
          sendEvent('Onboarding — error back button clicked', { lastStep: OnboardingStageEnum.STUDENTS });
          clearErrors('root.identifier');
        }}
      />
    </>
  );
}
