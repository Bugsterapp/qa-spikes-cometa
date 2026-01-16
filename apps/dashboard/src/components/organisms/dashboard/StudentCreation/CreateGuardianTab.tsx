import { Button, PhoneInput, Select } from '@cometa/recreo';
import { GuardianResponse } from '@cometa/trpc/src/types';
import { useSendTrackEvent } from '@cometa/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import * as Sentry from '@sentry/nextjs';

import Mail from '/public/assets/icons/studentDetail/mail.svg';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import Dialog from '/src/components/atoms/Dialog';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useAlert, { defaultAlertTime } from '/src/hooks/useAlert';
import { api, ServiceClient } from '/src/utils/api';

import { DrawerStateType, initialDrawerState } from './StudentGuardianTab';
import { guardianRelationshipOptions } from '/src/constants/guardianRelationship';
import { PhoneNumber } from 'libphonenumber-js';

const schema = z.object({
  firstName: z.string().min(1, 'Falta completar este campo'),
  lastName: z.string().min(1, 'Falta completar este campo'),
  email: z.string({ required_error: 'Falta completar este campo' }).email('Ingresa una direccion de correo válida'),
  phone: z
    .string({ required_error: 'Falta completar este campo o es un valor invalido' })
    .min(8, 'Falta completar este campo'),
  gender: z.enum(['m', 'f']).optional(),
  studentId: z.string(),
  relationship: z.string({ required_error: 'Falta completar este campo' }),
});
export type GuardianCreationFormValues = z.infer<typeof schema>;

type CreateGuardianTabProps = {
  setGuardian: (_: GuardianResponse | undefined) => void;
  onGuardianExists: () => void;
  studentId: string;
  onClose?: (exit?: boolean) => void;
};

export const CreateGuardianTab: FC<CreateGuardianTabProps> = ({
  setGuardian,
  onGuardianExists,
  studentId,
  onClose,
}) => {
  const selectedSchoolId = useSelectedSchoolId();
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const [guardianExists, setGuardianExists] = useState<GuardianResponse | undefined>();
  const [loading, setLoading] = useState(false);
  const sendTrackEvent = useSendTrackEvent();
  const [drawerState, setDrawerState] = useState<DrawerStateType>(initialDrawerState);
  const router = useRouter();
  const utils = api.useUtils();

  const {
    register,
    control,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    setError,
  } = useForm<GuardianCreationFormValues>({
    defaultValues: { studentId: studentId },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const fetchGuardians = async (email: string, phone: string): Promise<GuardianResponse[]> => {
    const formattedPhone = phone.replace('+', '');

    const withEmailGuardians = await ServiceClient.apiV1DashboardGuardiansList(
      { email: email },
      {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      }
    );

    if (withEmailGuardians.data.length > 0) {
      return withEmailGuardians.data;
    }

    const withPhoneGuardians = await ServiceClient.apiV1DashboardGuardiansList(
      { phone: formattedPhone },
      {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      }
    );

    return withPhoneGuardians.data;
  };

  const handleSetGuardian = async (formValues: GuardianCreationFormValues) => {
    const payload = {
      phone: formValues.phone,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      email: formValues.email,
      gender: formValues.gender,
      student_id: studentId,
      relationship: formValues.relationship,
    };

    const guardians = await fetchGuardians(formValues.email, formValues.phone);

    if (guardians && guardians.length > 0) {
      setGuardianExists(guardians[0]);
      return;
    }

    setLoading(true);

    try {
      await ServiceClient.apiV1DashboardSchoolsGuardiansCreate(selectedSchoolId || '', payload, {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      });
    } catch (error) {
      Sentry.captureException(new Error('failed to create guardian'), (scope) => {
        scope.setContext('state', {
          session,
          error,
        });
        return scope;
      });

      setLoading(false);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Hubo un error al crear el tutor.',
      });
    }

    await utils.guardian.getDetails.invalidate();
    await utils.students.dashboardSchoolDueOrdersStudentDetail.invalidate();
    sendTrackEvent('dashboard: New Student Parent Assigned', session);
    setDrawerState({ ...drawerState, isOpen: false, guardian: null });
    setLoading(false);
    setAlertState({
      open: true,
      severity: 'success',
      message: 'Tutor asignado correctamente',
      alertTime: defaultAlertTime,
    });
    onClose?.(true);
    router.push(`/students/${studentId}`);
  };

  function handlePhoneExtraValidation(phoneValue: PhoneNumber) {
    if (phoneValue.isValid()) return;

    setTimeout(() => {
      setError('phone', {
        type: 'manual',
        message: 'Ingresa un número de teléfono válido',
      });
    }, 0);
  }

  const GUARDIAN_EXISTS_MESSAGES = {
    sameSchool: {
      title: '¡Parece que ya existe un tutor con esos datos!',
      description: 'No se pueden registrar 2 tutores con el mismo correo o número de teléfono.',
      actionButton: 'Ver tutor',
    },
    differentSchool: {
      title: 'Este tutor ya está registrado en Cometa. ¿Quieres agregarlo a tu colegio?',
      description:
        'Hemos encontrado un tutor con los mismos datos en Cometa. Puedes sumarlo directamente a tu colegio para evitar duplicados.',
      actionButton: 'Sí, agregar tutor',
    },
  };

  const isSameSchool = guardianExists?.school_id === selectedSchoolId;
  const messages = isSameSchool ? GUARDIAN_EXISTS_MESSAGES.sameSchool : GUARDIAN_EXISTS_MESSAGES.differentSchool;

  return (
    <>
      <Dialog.Root open={Boolean(guardianExists)} position="right">
        <Dialog.Title>{messages.title}</Dialog.Title>
        <Dialog.Description>{messages.description}</Dialog.Description>
        <div className="rounded-lg border bg-[#1890FF14] py-5 px-5 items-start flex mb-6 flex-col">
          <h4 className="col-start-1 mb-4 font-bold text-left">
            {guardianExists?.first_name} {guardianExists?.last_name}
          </h4>
          <div className="flex flex-col items-start gap-4">
            <a className="flex items-center text-sm">
              <Mail className="w-4 mr-2 text-[#98A2B3]" />{' '}
              <span className="truncate max-w-[220px]">{guardianExists?.email}</span>
            </a>
            <a className="flex items-center text-sm">
              <Phone className="w-4 mr-2 text-[#98A2B3]" />
              {guardianExists?.phone}
            </a>
          </div>
        </div>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close
            onClick={() => {
              setGuardianExists(undefined);
            }}
            className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
          >
            Atrás
          </Dialog.Close>
          <Button
            className="text-white  font-bold	py-2 px-8 rounded-lg	text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D]"
            onClick={() => {
              setGuardian(guardianExists);
              onGuardianExists();
            }}
          >
            {messages.actionButton}
          </Button>
        </div>
      </Dialog.Root>

      <form className="col-span-2 space-y-8" onSubmit={handleSubmit(handleSetGuardian)}>
        <TextField label="Nombre" error={errors.firstName?.message} value={watch('firstName')}>
          <CustomInput {...register('firstName')} type="text" />
        </TextField>
        <TextField label="Apellidos" error={errors.lastName?.message} value={watch('lastName')}>
          <CustomInput {...register('lastName')} type="text" />
        </TextField>
        <TextField label="Correo electrónico" error={errors.email?.message} value={watch('email')}>
          <CustomInput {...register('email')} type="text" />
        </TextField>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <PhoneInput
              ignoreValidation
              label="Teléfono"
              onChange={(phoneValue) => {
                onChange(phoneValue.number);
                if (!errors.phone) {
                  handlePhoneExtraValidation(phoneValue);
                }
              }}
              error={errors.phone?.message}
              initialValue={value}
            />
          )}
        />
        <div className="flex flex-col space-y-5">
          <h5 className="text-sm font-bold">Sexo:</h5>
          <label className="flex items-center text-sm">
            <input
              {...register('gender')}
              type="radio"
              value="m"
              className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
            />
            Masculino
          </label>
          <label className="flex items-center text-sm">
            <input
              {...register('gender')}
              type="radio"
              value="f"
              className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
            />
            Femenino
          </label>
        </div>

        <Controller
          control={control}
          name="relationship"
          render={({ field }) => (
            <Select
              placeholder="Parentesco con el estudiante"
              className="w-full outline-none min-h-[56px] h-full mb-1"
              onValueChange={field.onChange}
              value={field.value}
              error={errors.relationship?.message}
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

        <div className="p-6 border-t-[#919EAB3D] border grid grid-cols-2 gap-5 flex-shrink-0">
          <Dialog.Close className="p-3 font-bold bg-transparent rounded-lg text-green">Atrás</Dialog.Close>
          <Button
            disabled={loading || !isValid}
            type="submit"
            className="bg-green hover:bg-[#007B55] p-3 text-white rounded-lg disabled:text-[#919EABCC] disabled:bg-[#919EAB3D]"
          >
            Asignar
          </Button>
        </div>
      </form>
    </>
  );
};
