import React from 'react';
import { Button } from '~/components/ui/Button';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Session } from 'next-auth';
import useTelephone, { allowedCountries, countries, CountryCode, FlagEmoji } from '~/hooks/useTelephone';
import { api } from '~/utils/api';
import { WHAT_ONBOARDING_HELP } from '~/utils/linksWhatsapp';
import { Fieldset } from '~/components/FormField';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import CustomFormField from '~/components/CustomFormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '~/components/PhoneInput/Select';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import { ConfirmationDrawer } from '~/components/Drawer.Variants';
import { useSendEvent } from '~/hooks/useSendEvent';
import { OnboardingStageEnum } from '@cometa/trpc';

const GuardianInformationResolver = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(6),
});

type GuardianInformationValues = z.infer<typeof GuardianInformationResolver>;

export default function GuardianInformation({
  onSubmit,
  session,
  disabled,
}: {
  onSubmit: (data: GuardianInformationValues) => void;
  session: Session;
  disabled: boolean;
}) {
  const sendEvent = useSendEvent();
  const updateGuardianMutation = api.guardian.update.useMutation();
  const {
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
    register,
    clearErrors,
  } = useForm<GuardianInformationValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(GuardianInformationResolver),
    defaultValues: {
      first_name: session.user.first_name,
      last_name: session.user.last_name,
      email: session.user.email,
      phone: session.user.phone ?? undefined,
    },
  });

  const allowStudentEdit = Boolean(session.user.schools[0].config_dashboard?.student_edit_onboarding);

  const telephone = useTelephone({
    initialValue: session.user?.phone ?? undefined,
    onNumberChange: (phone) => {
      setValue('phone', phone?.number?.toString(), { shouldValidate: true });
    },
  });

  const countriesWithoutPreferredCountries = countries.filter(
    (country) => country.value !== 'MX' && country.value !== 'US'
  );

  const submitHandler: SubmitHandler<GuardianInformationValues> = async (values) => {
    if (!telephone.valid) {
      setError('phone', { type: 'validate', message: 'El número de teléfono es inválido' });
      return;
    }
    const result = await updateGuardianMutation.mutateAsync({
      id: session.user.id,
      data: { ...values, onboarding_stage: allowStudentEdit ? 'STUDENTS' : 'BILLING' },
    });

    if (result?.error) {
      Object.keys(result.data).forEach((key) =>
        setError(`root.${key}`, { type: 'validate', message: result.data[key] })
      );
    } else {
      onSubmit(values);
    }
  };

  return (
    <form className="flex flex-col flex-1 px-4" onSubmit={handleSubmit(submitHandler)}>
      <h2 className="text-[#1C1C1D] font-bold mt-4 text-xl mb-8">Complete datos del tutor</h2>
      <Fieldset>
        <Fieldset.Legend>Datos personales</Fieldset.Legend>
        <CustomFormField label="Nombre/s" htmlFor="first_name" key="first_name" error={errors.first_name?.message}>
          <CustomInput
            theme="recreo"
            placeholder=""
            className="p-5 rounded-[14px]"
            {...register('first_name', { disabled })}
            onClick={() => sendEvent('Onboarding — first name edited')}
          />
        </CustomFormField>
        <CustomFormField label="Apellido/s" htmlFor="last_name" key="last_name" error={errors.last_name?.message}>
          <CustomInput
            theme="recreo"
            placeholder=""
            className="p-5 rounded-[14px]"
            {...register('last_name', { disabled })}
            onClick={() => sendEvent('Onboarding — last name edited')}
          />
        </CustomFormField>
      </Fieldset>
      <Fieldset>
        <Fieldset.Legend className="font-semibold text-gray-300">Datos de contacto</Fieldset.Legend>
        <Controller
          control={control}
          name="phone"
          render={() => (
            <CustomFormField
              label="Celular"
              error={errors.phone?.message}
              labelClassName="left-[90px] font-normal z-[2]"
            >
              <Select value={telephone.country} onValueChange={(e) => telephone.onChangeCountry(e as CountryCode)}>
                <SelectTrigger className="bg-[#f3f5f9] h-[67px] group-data-[error=true]:border-error group-data-[error=true]:border  group-data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1">
                  <SelectValue placeholder="MX">
                    <div className="relative flex items-center justify-between gap-1">
                      <div className="flex flex-row items-center w-[26px] h-[26px]">
                        <FlagEmoji flag={telephone.country} emoji={telephone.emoji} />
                      </div>
                      <ExpandMore width="24" height="24" className="text-blue-100" />
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-w-xs">
                  {allowedCountries(['US', 'MX']).map((country) => (
                    <SelectItem
                      key={country.value}
                      value={country.value}
                      className="flex hover:cursor-pointer"
                      textValue={country.name}
                    >
                      <div className="flex items-center gap-2">
                        <FlagEmoji flag={country.value} emoji={country.emoji} /> {country.name} (+
                        {country.countryCallingCode})
                      </div>
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  {countriesWithoutPreferredCountries.map((country) => (
                    <SelectItem
                      key={country.value}
                      value={country.value}
                      className="flex hover:cursor-pointer"
                      textValue={country.name}
                    >
                      <div className="flex items-center gap-2">
                        <FlagEmoji flag={country.value} emoji={country.emoji} /> {country.name} (+
                        {country.countryCallingCode})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pl-4 pr-1 flex items-center justify-center relative z-[1] bg-white group-data-[error=true]:border group-data-[error=true]:border-x-0 group-data-[error=true]:border-error pt-3 pb-1 text-transparent group-[:not(:has(input:placeholder-shown))]:text-current group-focus-within:text-current">
                <span>+{telephone.countryCallingCode}</span>
              </div>
              <CustomInput
                theme="recreo"
                placeholder={telephone.placeholder}
                value={telephone.value}
                onChange={(e) => {
                  if (errors?.phone) {
                    clearErrors('phone');
                  }
                  telephone.onChange(e.target.value);
                }}
                className="rounded-l-none rounded-r-[14px] group-data-[error=true]:border-solid group-data-[error=true]:outline-0 group-data-[error=true]:border group-data-[error=true]:border-error group-data-[error=true]:border-l-0 h-[67px] placeholder-transparent focus:placeholder-gray-500"
                onClick={() => sendEvent('Onboarding — phone number edited')}
              />
            </CustomFormField>
          )}
        />
        <CustomFormField label="Email" htmlFor="email" key="email" error={errors.email?.message}>
          <CustomInput
            theme="recreo"
            placeholder=""
            className="p-5 rounded-[14px]"
            {...register('email', { disabled })}
            onClick={() => sendEvent('Onboarding — email edited')}
          />
        </CustomFormField>
      </Fieldset>

      {/* eslint-disable-next-line */}
      <a
        target="_blank"
        href={WHAT_ONBOARDING_HELP}
        className="block mx-auto text-sm font-normal text-blue-100 underline w-fit pointer-events-auto"
        onClick={() => {
          sendEvent('Onboarding — needs help clicked');
        }}
      >
        ¿Necesitas ayuda?
      </a>

      <Button theme="recreo" className="w-full mt-9" disabled={updateGuardianMutation.isPending}>
        Continuar
      </Button>
      <ConfirmationDrawer
        open={Boolean(errors.root?.email) || Boolean(errors.root?.phone)}
        title="Lo sentimos, ya existe un tutor con estos datos."
        description="Comuníquese con soporte para obtener mas información"
        confirmLabel="Contactar a soporte"
        cancelLabel="Atrás"
        onClick={() => {
          sendEvent('Onboarding — error support button clicked', { lastStep: OnboardingStageEnum.PROFILE });
          window.open(WHAT_ONBOARDING_HELP, '_blank');
        }}
        onCancel={() => {
          sendEvent('Onboarding — error back button clicked', { lastStep: OnboardingStageEnum.PROFILE });
          clearErrors();
        }}
      />
    </form>
  );
}
