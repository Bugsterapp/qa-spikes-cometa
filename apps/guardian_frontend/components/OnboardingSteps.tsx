import * as React from 'react';
import useTelephone, { CountryCode, allowedCountries, countries } from '~/hooks/useTelephone';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import Link from 'next/link';
import { Checkbox } from '~/components/Checkbox';
import { Controller, SubmitHandler, UseFormClearErrors, useForm } from 'react-hook-form';
import { WHAT_ONBOARDING_HELP } from '~/utils/linksWhatsapp';
import { Fieldset } from '~/components/FormField';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import CustomFormField, { HelperTextWithIcon } from '~/components/CustomFormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '~/components/PhoneInput/Select';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './atoms/Button';

import { AnimatePresence, Variants, motion, useSpring, useTransform } from 'framer-motion';
import Dialog from './molecules/common/Dialog';
import { cn } from '~/lib/cn';
import LoadingButton from './molecules/LoadingButton';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { personTypeDefault, personTypeMoral } from '~/utils/static_data/personTypesTaxRegimen';
import { HelpTooltipIcon } from './atoms/HelpTooltipIcon';
import { AutocompleteDivider } from './atoms/guardians/AutocompleteDivider';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import { DrawerAlert, DrawerAlertActions, DrawerAlertContent } from './organisms/guardians/DrawerAlert';
import { useAlert } from '~/hooks';
import HelpLink from './atoms/guardians/HelpLink';
import Mail from '~/public/icons/mail.svg';
import Phone from '~/public/icons/phone.svg';
import Plus from '~/public/icons/fi-rr-plus-small.svg';
import IcInfo from '/public/icons/information-white.svg';
import Pencil from '~/public/icons/pencil.svg';

// FIXME: We need to update react in order to get rid of this MUI component
import { TextFieldHelper } from './molecules/guardians/formFields/FormFieldsBilling';
import type { TextFieldProps } from '@mui/material';
import {
  useEditStudent,
  useIsPolling,
  useIsRecentAdded,
  useOpenFormStudent,
  usePolling,
  useSelectedStudent,
  useSummaryEdit,
} from '~/pages/guardians/[guardianHash]/onboarding';
import { GenderEnum, GuardianStudent, RetrieveGuardian, School, TaxingTypeEnum } from '@cometa/trpc/src/types';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';
import { useSendTrackEvent } from '@cometa/utils';
import { api } from '~/utils/api';
import { useSelectedSchool } from './molecules/common/AuthGlobal';
import { DevTool } from '@hookform/devtools';
import Tour from './atoms/common/Tour';
import { Styles, TooltipRenderProps } from 'react-joyride';
import dayjs from '~/lib/dayjs';
import dynamic from 'next/dynamic';
const FlagEmoji = dynamic(
  import('~/hooks/useTelephone').then((mod) => mod.FlagEmoji),
  { ssr: false }
);

const PercentageButton = ({
  setIsPolling,
  isPolling,
  maxValue,
  value,
  initialValue = 0,
  onClick,
}: {
  isPolling: boolean;
  setIsPolling: (value: boolean) => void;
  maxValue: number;
  value: number;
  initialValue?: number;
  onClick: () => void;
}) => {
  const widthValue = useSpring(initialValue);
  const width = useTransform(widthValue, [0, 100], ['0%', '100%']);

  const pollingPercentage = (value / maxValue) * 100;

  React.useEffect(() => {
    if (isPolling) {
      if (widthValue.get() !== value) {
        widthValue.set(pollingPercentage);
      }
      if (pollingPercentage === 100) {
        onClick();
        setIsPolling(false);
      }
    }
  }, [value, pollingPercentage, isPolling]);

  return (
    <Button
      disabled={isPolling}
      className={cn('w-full mt-9 lg:mt-12', { 'bg-[#5570FF66] relative overflow-hidden z-50': isPolling })}
      onClick={() => {
        setIsPolling(true);
      }}
    >
      {isPolling && <motion.span className="absolute top-0 left-0 h-full bg-blue-100 -z-0" style={{ width }} />}
      <span className="z-[1] relative">
        {isPolling ? `Cargando ${pollingPercentage.toFixed(0)}%` : 'Confirmar estudiantes'}
      </span>
    </Button>
  );
};

const extractDateChunks = (date: string) => {
  const [year, month, day] = date.split('-');
  return { day: parseInt(day), month: parseInt(month), year: parseInt(year) };
};

const GuardianInfoResolverEnabled = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('El email es inválido'),
  phone: z.string().min(6),
  terms_acceptance: z.literal(true, {
    description: 'Debes aceptar los términos y condiciones',
    errorMap: () => ({
      message: 'Debes aceptar los términos y condiciones',
    }),
  }),
});

const GuardianInfoResolverDisabled = z.object({
  phone: z.string().min(6),
  terms_acceptance: z.literal(true, {
    description: 'Debes aceptar los términos y condiciones',
    errorMap: () => ({
      message: 'Debes aceptar los términos y condiciones',
    }),
  }),
});

export type GuardianInfoFormValues = z.infer<typeof GuardianInfoResolverEnabled>;

type GuardianInfoProps = {
  onSubmit: (formData: GuardianInfoFormValues) => Promise<{ data: Record<string, string>; status: number } | void>;
  initialData?: Omit<Partial<GuardianInfoFormValues>, 'terms_acceptance'>;
  isLoading: boolean;
  isLoadingInfo?: boolean;
  school?: School;
  disabled: boolean;
};

const TermsAcceptanceTooltip = ({ step, tooltipProps }: TooltipRenderProps) => (
  <div className="relative bg-[#57537afb] text-white text-xs py-4 px-5 rounded-2xl" {...tooltipProps}>
    {step.content && <span>{step.content}</span>}
  </div>
);

const AlertActionsInProvider = () => (
  <DrawerAlertActions className="px-5 space-y-5">
    <div className="flex flex-col justify-center text-center">
      <span className="font-normal text-gray-300 text-sm/5">
        Si no tienes una cuenta creada y no te permite darte de alta, por favor comuníquese con soporte.
      </span>
      <span className="text-gray-300 font-normal list-decimal list-inside text-sm/5 mt-2.5">
        <span className="font-medium">Si ya tienes una cuenta creada,</span> puedes iniciar sesión a continuación
      </span>
    </div>
    <Link
      className="text-center block py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-sm outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100 disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium"
      type="button"
      href="/"
    >
      Ya tengo una cuenta en Cometa
    </Link>
    <a
      className="text-center block py-4 px-6 appearance-none text-blue-100 outline-none cursor-pointer transition-colors hover:text-blue-100/80 disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium text-sm"
      type="button"
      target="_blank"
      rel="noopener noreferrer"
      href={WHAT_ONBOARDING_HELP}
    >
      Contactar a soporte
    </a>
  </DrawerAlertActions>
);

const AlertActions = ({ clearErrors }: { clearErrors: UseFormClearErrors<GuardianInfoFormValues> }) => (
  <DrawerAlertActions className="px-[49.5px] space-y-5">
    <div className="flex flex-col justify-center text-center">
      <span className="font-medium text-secondary">¿Qué puedo hacer?</span>
      <span className="font-medium text-gray-600 list-decimal list-inside text-xs/5 mt-2.5">
        Comuníquese con soporte
      </span>
    </div>
    <a
      className="text-center block py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100 disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium"
      type="button"
      target="_blank"
      rel="noopener noreferrer"
      href={WHAT_ONBOARDING_HELP}
    >
      Contactar a soporte
    </a>
    <Button
      className="flex justify-center py-3 w-full font-medium bg-transparent text-blue-100 border-[1.5px] text-base border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
      onClick={() => clearErrors('root')}
    >
      Atrás
    </Button>
  </DrawerAlertActions>
);

const OnboardingGuardianInfo = ({
  onSubmit: propsOnSubmit,
  initialData,
  isLoading,
  isLoadingInfo,
  school,
  disabled,
}: GuardianInfoProps) => {
  const countriesWithoutPreferredCountries = countries.filter(
    (country) => country.value !== 'MX' && country.value !== 'US'
  );

  const [summaryEdit] = useSummaryEdit();

  const {
    handleSubmit,
    register,
    setValue,
    clearErrors,
    formState: { errors },
    setError,
    control,
  } = useForm<GuardianInfoFormValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(!disabled ? GuardianInfoResolverEnabled : GuardianInfoResolverDisabled),
    defaultValues: { ...initialData, terms_acceptance: summaryEdit ? true : undefined },
  });

  const telephone = useTelephone({
    initialValue: initialData?.phone,
    onNumberChange: (phone) => {
      setValue('phone', phone?.number?.toString(), { shouldValidate: true });
    },
  });

  const onSubmit: SubmitHandler<GuardianInfoFormValues> = async (values) => {
    if (!telephone.valid) {
      setError('phone', { type: 'validate', message: 'El número de teléfono es inválido' });
      return;
    }
    const result = await propsOnSubmit(values);

    if (result?.data) {
      Object.keys(result.data).forEach((key) =>
        setError(`root.${key}`, { type: 'validate', message: result.data[key] })
      );
    }
  };

  if (isLoadingInfo) {
    return (
      <div className="flex flex-col justify-center items-center flex-auto h-[calc(100vh_-_6.5rem_-_36px)]">
        <LoadingSpinner className="w-24 h-24 text-blue-100" />
      </div>
    );
  }

  const isProvider = school?.is_provider;

  return (
    <div>
      <DevTool control={control} />
      <article className="text-gray-300 mb-9">
        {!summaryEdit && (
          <>
            <h3 className="mb-8 text-2xl font-bold">Bienvenido a Cometa</h3>
            <p className="mb-8 font-light">
              Bienvenido a la plataforma de pagos escolares de <span className="font-bold">{school?.name}.</span>
            </p>
          </>
        )}
        <p className="font-light">Por favor complete sus datos para poder darlo de alta como pagador.</p>
      </article>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center">
        <Fieldset>
          <Fieldset.Legend>Datos personales</Fieldset.Legend>
          <CustomFormField label="Nombre/s" htmlFor="name" key="name" error={errors.name?.message}>
            <CustomInput placeholder="" className="p-5 rounded-[14px]" {...register('name', { disabled })} />
          </CustomFormField>
          <CustomFormField label="Apellido/s" htmlFor="last_name" key="last_name" error={errors.last_name?.message}>
            <CustomInput placeholder="" className="p-5 rounded-[14px]" {...register('last_name', { disabled })} />
          </CustomFormField>
        </Fieldset>
        <Fieldset>
          <Fieldset.Legend className="font-semibold text-gray-300">Datos de contacto</Fieldset.Legend>
          <Controller
            control={control}
            name="phone"
            render={() => (
              <CustomFormField label="Celular" error={errors.phone?.message} labelClassName="left-20 font-normal">
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
                <div className="pl-4 pr-1 flex items-center justify-center bg-white group-data-[error=true]:border group-data-[error=true]:border-x-0 group-data-[error=true]:border-error pt-3 pb-1 text-transparent group-[:not(:has(input:placeholder-shown))]:text-current group-focus-within:text-current">
                  <span>+{telephone.countryCallingCode}</span>
                </div>
                <CustomInput
                  placeholder={telephone.placeholder}
                  value={telephone.value}
                  onChange={(e) => {
                    if (errors?.phone) {
                      clearErrors('phone');
                    }
                    telephone.onChange(e.target.value);
                  }}
                  className="rounded-l-none rounded-r-[14px] group-data-[error=true]:outline-0 group-data-[error=true]:border group-data-[error=true]:border-error group-data-[error=true]:border-l-0 h-[67px] placeholder-transparent focus:placeholder-gray-500"
                />
              </CustomFormField>
            )}
          />
          <CustomFormField label="Email" htmlFor="email" key="email" error={errors.email?.message}>
            <CustomInput placeholder="" className="p-5 rounded-[14px]" {...register('email', { disabled })} />
          </CustomFormField>
        </Fieldset>
        {!summaryEdit && (
          <Controller
            control={control}
            name="terms_acceptance"
            render={({ field }) => (
              <div>
                <div className="flex items-start gap-5 px-4" id="terms-acceptance">
                  <Checkbox
                    id="terms-and-conditions"
                    className="mt-1.5"
                    checked={field.value}
                    onCheckedChange={(val) => {
                      field.onChange(val);
                    }}
                  />
                  <label htmlFor="terms-and-conditions">
                    <span className="text-sm text-gray-300 select-none">
                      Acepto los{' '}
                      <Link href="/terms" className="text-blue-100 underline">
                        Términos & Condiciones y políticas de privacidad.
                      </Link>
                    </span>
                  </label>
                </div>

                <Tour
                  run={Boolean(errors.terms_acceptance)}
                  spotlightClicks
                  steps={[
                    {
                      target: '#terms-acceptance',
                      content: 'Debes aceptar los Términos y condiciones para continuar.',
                      disableBeacon: true,
                    },
                  ]}
                  tooltipComponent={TermsAcceptanceTooltip}
                  callback={() => void 0}
                  styles={
                    {
                      options: {
                        arrowColor: '#57537afb',
                        overlayColor: 'rgba(0, 0, 0, 0.2)',
                      },
                    } as Styles
                  }
                />
              </div>
            )}
          />
        )}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={WHAT_ONBOARDING_HELP}
          className="block mx-auto text-sm font-normal text-blue-100 underline w-fit mt-14"
        >
          ¿Necesitas ayuda?
        </a>

        <Button className="w-full mt-6 lg:mt-12 lg:max-w-[338px] mx-auto block" disabled={isLoading}>
          {summaryEdit ? 'Confirmar' : 'Continuar'}
        </Button>
      </form>
      <DrawerAlert
        open={Boolean(errors.root?.email) || Boolean(errors.root?.phone)}
        onOpenChange={(open) => {
          if (!open) clearErrors('root');
        }}
      >
        <DrawerAlertContent>
          <div className="mb-10 mx-[49.5px] mt-6 flex flex-col items-center text-white space-y-6">
            <IcInfo />
            <p className="text-lg font-semibold text-center">Lo sentimos, ya existe un tutor con estos datos.</p>
          </div>
          {isProvider ? <AlertActionsInProvider /> : <AlertActions clearErrors={clearErrors} />}
        </DrawerAlertContent>
      </DrawerAlert>
    </div>
  );
};

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

export const StudentInfoResolver = z.object({
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
  section: z.string().optional().nullable(),
  level: z.string().optional(),
});

export type StudentInfoValues = z.infer<typeof StudentInfoResolver>;

type OnboardingStudentInfoProps = {
  onSubmit: (formData: StudentInfoValues) => Promise<{ data: Record<string, any>; status: number } | void>;
  onContinue?: () => void;
  showAlert?: boolean;
  hideAlert?: () => void;
  confirmAlert?: () => void;
  students: GuardianStudent[];
  isLoading: boolean;
  allowEdit: boolean;
  allowAdd: boolean;
  isOnboarding?: boolean;
  schoolId: string;
};

const OnboardingStudentInfo = ({
  onSubmit: propsOnSubmit,
  onContinue,
  showAlert,
  confirmAlert,
  hideAlert,
  students,
  isLoading,
  allowEdit,
  allowAdd,
  isOnboarding,
  schoolId,
}: OnboardingStudentInfoProps) => {
  const school = useSelectedSchool();
  const { isRecentAdded } = useIsRecentAdded();
  const [student, setStudent] = useSelectedStudent();
  const sendTrackEvent = useSendTrackEvent();
  const [openFormStudent, setOpenFormStudent] = useOpenFormStudent();
  const [isPolling, setIsPolling] = useIsPolling();
  const [studentPolling] = usePolling();
  const defaultOpen = allowAdd && !students.length;
  const allowEditOutOnboarding = allowEdit && !isOnboarding;
  const identifierRegex =
    /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
  const student_identifier_is_required = school?.config_dashboard?.student_identifier_is_required;
  const showCurp = (student_identifier_is_required && school?.is_provider) || !school?.is_provider;
  const identifierIsRequiredValidation = student_identifier_is_required
    ? z.string().min(1, 'Debes ingresar un CURP').regex(identifierRegex, 'El formato del CURP es incorrecto')
    : z.string().refine((value = '') => {
        if (!value) return true;
        if (!RegExp(identifierRegex).test(value)) return false;
        return true;
      }, 'El formato del CURP es incorrecto');

  const StudentInfoResolverFinal = StudentInfoResolver.extend({
    level:
      (openFormStudent && !student) || defaultOpen ? z.string().min(1, 'El grado es requerido') : z.string().optional(),
    section:
      (openFormStudent && !student) || defaultOpen
        ? z.string().min(1, 'La sección es requerida')
        : z.string().optional(),
    identifier: showCurp ? identifierIsRequiredValidation : z.string().optional(),
  });

  const {
    register,
    formState: { errors, isDirty },
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
  } = useForm<StudentInfoValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(StudentInfoResolverFinal),
  });
  const resetForm = () =>
    reset({
      id: undefined,
      first_name: undefined,
      last_name: undefined,
      identifier: undefined,
      birthdate: undefined,
      gender: undefined,
    });

  const [summaryEdit] = useSummaryEdit();

  const onSubmit: SubmitHandler<StudentInfoValues> = async (values) => {
    const result = await propsOnSubmit(values);

    if (result && result.status !== 200) {
      Object.keys(result.data).forEach((key) =>
        setError(`root.${key}`, { type: 'validate', message: result.data[key] })
      );
    } else {
      sendTrackEvent('portal: Onboarding Student Edit Complete');
      setStudent(null);
      setOpenFormStudent(false);
      resetForm();
    }
  };

  const { data: levels } = api.schools.getLevels.useQuery({
    school_id: schoolId,
  });
  const {
    data: sections,
    refetch: refetchSections,
    isFetching: isFetchingSections,
  } = api.schools.getSections.useQuery({
    school_id: schoolId,
    levels: getValues('level') ? [getValues('level') ?? ''] : undefined,
  });

  React.useEffect(() => {
    if (student !== null) {
      const _student = students.find((s) => s.id === student);
      if (!_student) return () => void 0;

      const { day, month, year } = extractDateChunks(_student.birthdate ?? '');

      reset({
        id: _student.id,
        first_name: _student.first_name,
        last_name: _student.last_name,
        identifier: _student.identifier ?? undefined,
        birthdate: _student.birthdate
          ? {
              day,
              month,
              year,
            }
          : undefined,
        gender: _student.gender as GenderEnum | undefined,
        section: _student.section,
        level: sections?.find((section) => section.id === _student.section)?.level ?? undefined,
      });
    } else resetForm();
  }, [student]);

  return (
    <div className="flex flex-col min-h-[calc(100vh_-_6rem)]">
      {!isOnboarding && (
        <AnimatePresence initial={false}>
          {isPolling && (
            <motion.div
              initial="initial"
              animate="enter"
              exit="exit"
              variants={{ initial: { opacity: 0 }, enter: { opacity: 0.3 }, exit: { opacity: 0 } }}
              className="fixed top-0 left-0 z-30 w-screen h-screen bg-black"
            />
          )}
        </AnimatePresence>
      )}
      <AnimatePresence initial={false} mode="wait" custom={student ? -1 : 1}>
        {(isLoading || Boolean(students.length)) && !student && !openFormStudent && (
          <motion.div
            custom={-1}
            key="student-list"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-auto mb-auto"
          >
            {isOnboarding ? (
              <article className="mb-6 text-gray-300">
                <h3 className="mb-2.5 text-xl font-semibold">Datos de los estudiantes</h3>
                <p className="font-light">
                  Puedes revisar y editar la información de los estudiantes de ser necesario.
                </p>
              </article>
            ) : (
              <article className="my-6 text-gray-300">
                <h3 className="text-xl font-bold">Estudiantes</h3>
              </article>
            )}

            <div className="flex flex-col mb-auto space-y-6" data-testid="students-list">
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
                students.map((student) => (
                  <div
                    key={`${student.id}_${student.first_name}_${student.last_name}}`}
                    className="w-full bg-white px-5 py-[18px] rounded-[14px] flex flex-col"
                  >
                    <div className="inline-flex items-center justify-between">
                      <span className="font-medium text-gray-300">
                        {student.first_name} {student.last_name}
                      </span>
                      {(allowEditOutOnboarding || allowEdit) && (
                        <button
                          className="px-2 py-2 text-blue-100 bg-transparent rounded-full hover:bg-slate-100"
                          onClick={() => {
                            setStudent(student.id);
                            setOpenFormStudent(true);
                          }}
                          data-testid="editPencil-button"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    <div className="border-b-2 border-[#EBEBEB] my-2.5" />
                    <div className="flex flex-col text-xs text-gray-300 gap-y-1">
                      <div>
                        <span className="mr-1 font-medium">CURP:</span>
                        <span>{student.identifier}</span>
                      </div>
                      <div>
                        <span className="mr-1 font-medium">Fecha de nacimiento:</span>
                        <span>{student.birthdate && dayjs(student.birthdate).format('DD/MM/YYYY')}</span>
                      </div>
                      {school?.is_provider && (
                        <>
                          <div>
                            <span className="mr-1 font-medium">Nivel:</span>
                            <span>
                              {levels?.find(
                                (level) =>
                                  level.id === sections?.find((section) => section.id === student.section)?.level
                              )?.name ?? undefined}
                            </span>
                          </div>
                          <div>
                            <span className="mr-1 font-medium">Sección:</span>
                            <span>{student.section_name}</span>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="mr-1 font-medium">Género:</span>
                        <span>{student.gender === GenderEnum.M ? 'Masculino' : 'Femenino'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              {allowAdd && (
                <button
                  className="inline-flex items-center justify-between w-full h-20 px-5 py-4 bg-[#f6f5fa] border border-indigo-500 shadow cursor-pointer rounded-2xl"
                  onClick={() => {
                    setOpenFormStudent(true);
                    setStudent(null);
                    resetForm();
                  }}
                  data-testid="addStudent-button"
                >
                  <div className="inline-flex flex-col items-start justify-center h-12 ">
                    <div className="font-medium tracking-tight text-center text-indigo-500">Agregar estudiante</div>
                  </div>
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </div>
            {isOnboarding && (
              <Button
                className="w-full mt-6 lg:mt-12 lg:max-w-[338px] block mx-auto"
                disabled={isLoading || (!isDirty && defaultOpen)}
                onClick={() => {
                  setStudent(null);
                  if (onContinue) onContinue();
                }}
              >
                {summaryEdit || defaultOpen ? 'Confirmar' : 'Continuar'}
              </Button>
            )}
            {!isOnboarding && isRecentAdded && (
              <PercentageButton
                setIsPolling={(value) => setIsPolling(value)}
                maxValue={studentPolling.maxValue}
                value={studentPolling.currentValue}
                isPolling={isPolling}
                onClick={() => {
                  if (onContinue) onContinue();
                }}
              />
            )}
          </motion.div>
        )}
        {(openFormStudent || defaultOpen) && (
          <motion.div
            custom={1}
            key="student-form"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
          >
            {isOnboarding && (
              <div className="flex items-center justify-between text-gray-300 mb-9">
                <h3 className="text-2xl font-bold">Detalles del estudiante</h3>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Fieldset>
                <Fieldset.Legend className="font-semibold text-gray-300">Datos personales</Fieldset.Legend>
                <CustomFormField htmlFor="first_name" label="Nombre/s" error={errors.first_name?.message}>
                  <CustomInput
                    placeholder=""
                    className="p-5 rounded-[14px]"
                    data-testid="firstName-input"
                    {...register('first_name')}
                  />
                </CustomFormField>
                <CustomFormField htmlFor="last_name" label="Apellido/s" error={errors.last_name?.message}>
                  <CustomInput
                    placeholder=""
                    className="p-5 rounded-[14px]"
                    data-testid="lastName-input"
                    {...register('last_name')}
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
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="day-input"
                      {...register('birthdate.day', { valueAsNumber: true, min: 1, max: 31 })}
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
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="month-input"
                      {...register('birthdate.month', { valueAsNumber: true, min: 1, max: 12 })}
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
                      placeholder=""
                      className="p-5 rounded-[14px] appearance-none"
                      type="number"
                      data-testid="year-input"
                      {...register('birthdate.year', { valueAsNumber: true })}
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
                {showCurp && (
                  <CustomFormField label="CURP" htmlFor="identifier" error={errors.identifier?.message}>
                    <CustomInput
                      placeholder=""
                      className="p-5 rounded-[14px]"
                      data-testid="curp-input"
                      {...register('identifier')}
                    />
                  </CustomFormField>
                )}
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
                        data-error={Boolean(errors.gender)}
                        className="group bg-white h-[67px] data-[error=true]:border-error data-[error=true]:border  data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1 w-full rounded-2xl"
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

              {allowAdd && (!student || isRecentAdded) && (
                <Fieldset>
                  <Fieldset.Legend>Datos escolares</Fieldset.Legend>
                  <div className="text-slate-600 ">
                    Complete los datos escolares para asociar los conceptos correspondientes.
                  </div>
                  <CustomFormField
                    label="Nivel"
                    htmlFor="level"
                    error={errors.section?.message}
                    hideHelperText
                    keepTopLabel={!!watch('level')}
                    staticLabel
                  >
                    <Controller
                      control={control}
                      name="level"
                      render={({ field }) => (
                        <Select
                          key={field.value}
                          defaultValue={field.value ?? undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            refetchSections();
                            setValue('section', undefined);
                          }}
                          data-testid="level-select"
                        >
                          <SelectTrigger
                            data-error={Boolean(errors.gender)}
                            className="group bg-white h-[67px] data-[error=true]:border-error data-[error=true]:border  data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1 w-full rounded-2xl"
                          >
                            <SelectValue />
                            <ExpandMore
                              width="24"
                              height="24"
                              className="text-blue-100 group-disabled:text-[#A6A6A6]"
                            />
                          </SelectTrigger>
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                            {levels?.map((level) => (
                              <SelectItem
                                key={level.id}
                                value={level.id}
                                className="flex hover:cursor-pointer"
                                textValue={level.name}
                              >
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </CustomFormField>
                  {Boolean(errors.level) && (
                    <HelperTextWithIcon isError data-testid="level-error">
                      El nivel es requerido
                    </HelperTextWithIcon>
                  )}

                  <CustomFormField
                    label="Sección"
                    htmlFor="section"
                    error={errors.section?.message}
                    hideHelperText
                    keepTopLabel={!!watch('section')}
                    staticLabel
                  >
                    <Controller
                      control={control}
                      name="section"
                      render={({ field }) => (
                        <Select
                          disabled={!getValues('level') || isFetchingSections}
                          key={field.value}
                          defaultValue={field.value ?? undefined}
                          onValueChange={field.onChange}
                          data-testid="section-select"
                        >
                          <SelectTrigger
                            data-error={Boolean(errors.gender)}
                            className="group bg-white h-[67px] data-[error=true]:border-error data-[error=true]:border data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1 w-full rounded-2xl"
                          >
                            <SelectValue />
                            <ExpandMore
                              width="24"
                              height="24"
                              className="text-blue-100 group-disabled:text-[#A6A6A6]"
                            />
                          </SelectTrigger>
                          <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                            {sections?.map((section) => (
                              <SelectItem
                                key={section.id}
                                value={section.id}
                                className="flex hover:cursor-pointer"
                                textValue={section.name}
                              >
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </CustomFormField>
                  {Boolean(errors.section) && (
                    <HelperTextWithIcon isError data-testid="section-error">
                      La sección es requerida
                    </HelperTextWithIcon>
                  )}

                  <div className="w-full h-16 mt-1 px-4 py-3.5 bg-indigo-50 rounded-2xl border-2 border-blue-500 justify-start items-center gap-2.5 inline-flex">
                    <div className="grow shrink basis-0 text-slate-600 text-base font-normal font-['Poppins'] leading-snug tracking-wide">
                      *Podrás agregar más estudiantes en el siguiente paso si lo deseas.
                    </div>
                  </div>
                </Fieldset>
              )}
              <Button
                className="w-full my-9 lg:mt-12 lg:max-w-[338px] block mx-auto"
                disabled={isLoading || !isDirty}
                data-testid="confirm-button"
              >
                Confirmar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={showAlert ?? false}>
        <Dialog.Content className="w-screen px-5">
          <div className="flex flex-col space-y-6">
            <span className="text-sm text-center">
              ¿Quieres volver sin confirmar los datos ingresados para el estudiante?
            </span>
            <Button
              className="px-5 py-3 text-sm"
              onClick={() => {
                setStudent(null);
                setOpenFormStudent(false);
                if (confirmAlert) confirmAlert();
              }}
              data-testid="confirm-alertButton"
            >
              Continuar de todos modos
            </Button>
            <Dialog.Close
              className="text-sm text-blue-100 bg-transparent"
              onClick={hideAlert}
              data-testid="cancel-alertButton"
            >
              Cancelar
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog>
      <DrawerAlert open={Boolean(errors.root?.identifier)} data-testid="duplicate-alert">
        <DrawerAlertContent>
          <div className="mb-10 mx-[49.5px] mt-6 flex flex-col items-center text-white space-y-6">
            <IcInfo />
            <p className="text-lg font-semibold text-center">Lo sentimos, ya existe un estudiante con estos datos.</p>
          </div>
          <DrawerAlertActions className="px-[49.5px] space-y-5">
            <div className="flex flex-col justify-center text-center">
              <span className="font-medium text-secondary">¿Qué puedo hacer?</span>
              <span className="font-medium text-gray-600 list-decimal list-inside text-xs/5 mt-2.5">
                Comuníquese con soporte
              </span>
            </div>
            <a
              className="text-center block py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100 disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium"
              type="button"
              target="_blank"
              rel="noopener noreferrer"
              href={WHAT_ONBOARDING_HELP}
              data-testid="contactSupport-link"
            >
              Contactar a soporte
            </a>
            <Button
              className="flex justify-center py-3 w-full font-medium bg-transparent text-blue-100 border-[1.5px] text-base border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
              onClick={() => clearErrors('root')}
              data-testid="cancel-alertButton"
            >
              Atrás
            </Button>
          </DrawerAlertActions>
        </DrawerAlertContent>
      </DrawerAlert>
    </div>
  );
};

const BillingInfoResolver = z.object({
  taxRegime: z.object({ name: z.string(), value: z.string(), personTypes: z.array(z.string()) }),
  rfc: z
    .string()
    .min(1, 'El RFC es requerido.')
    .refine((data) => data !== 'XAXX010101000', 'Este RFC no es válido'),
  billingName: z
    .string()
    .min(1, 'La razón social es requerida.')
    .regex(/^[a-zA-Z0-9Ññ &üÜ.]+$/, 'Recuerda no utilizar acentos.'),
  postalCode: z.string().min(1, 'El código postal es requerido.'),
  personType: z.nativeEnum(TaxingTypeEnum),
});

type BillingFormValues = z.infer<typeof BillingInfoResolver>;

const OnboardingBillingInfo = ({
  onCancel,
  onSubmit: propsOnSubmit,
  initialData,
  isLoading,
}: {
  onCancel: () => void;
  initialData: Partial<BillingFormValues>;
  isLoading: boolean;
  studentList: GuardianStudent[];
  onSubmit: (formValues: BillingFormValues) => Promise<{ data: Record<string, string>; status: number } | void>;
}) => {
  const {
    formState: { errors },
    watch,
    register,
    control,
    handleSubmit,
    setError,
  } = useForm<BillingFormValues>({
    defaultValues: initialData,
    resolver: zodResolver(BillingInfoResolver),
    mode: 'all',
    reValidateMode: 'onChange',
  });
  const [summaryEdit] = useSummaryEdit();
  const [isEditing, setIsEditing] = useEditStudent();
  const [openAlert, setOpenAlert] = React.useState(false);
  const { setAlert } = useAlert();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center flex-auto h-[calc(100vh_-_6.5rem_-_36px)]">
        <LoadingSpinner className="w-24 h-24 text-blue-100" />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col flex-auto h-[calc(100vh_-_6.5rem)]">
        <div className="flex-auto">
          <h5 className="mb-8 text-xl font-bold tracking-wide text-gray-300">
            ¿Quieres completar o revisar tus datos de facturación?
          </h5>

          <div>
            <LoadingButton
              type="button"
              onClick={() => {
                setIsEditing(true);
              }}
              className="mb-[25px] w-full font-bold"
            >
              Sí
            </LoadingButton>
            <button
              type="button"
              className="h-14 w-full font-bold bg-transparent text-blue-100 border-[1.5px] text-base border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
              onClick={onCancel}
            >
              Por ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urlSAT = 'https://www.sat.gob.mx/aplicacion/53027/genera-tu-constancia-de-situacion-fiscal';

  const personType = watch('personType');

  const taxRegimeValuesByPersonType = taxRegimeValues.filter((tax) => tax.personTypes.includes(personType));

  const onSubmit: SubmitHandler<BillingFormValues> = async (values) => {
    const res = await propsOnSubmit(values);
    if (res) {
      if (res?.data && res?.status === 400) {
        Object.keys(res.data).forEach((key) => setError(`root.${key}`, { type: 'validate', message: res.data[key] }));
      } else if (res?.status !== 200) setAlert('Error al guardar datos');
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <article className="text-gray-300 mb-9">
          <h3 className="mb-8 text-2xl font-bold">Complete los datos de facturación.</h3>
          <p className="mb-8 font-light">
            Los datos deben coincidir con los de tu{' '}
            <span className="font-semibold">constancia de situación fiscal.</span>{' '}
            <a
              href={urlSAT}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-medium underline cursor-pointer text-blue"
            >
              Quiero obtener mi constancia
            </a>
          </p>
        </article>
        <form className="text-gray-300 mb-[37px]" onSubmit={handleSubmit(onSubmit)}>
          <Fieldset>
            <legend className="font-semibold" id="demo-radio-buttons-group-label">
              Facturar como
            </legend>
            <Controller
              name="personType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  className="flex items-center gap-4"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={personTypeDefault} id="physical-person" />
                    <label htmlFor="physical-person">Persona física</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={personTypeMoral} id="legal-person" />
                    <label htmlFor="legal-person">Empresa</label>
                  </div>
                </RadioGroup>
              )}
            />
          </Fieldset>
          <Fieldset>
            <CustomFormField label="RFC*" htmlFor="rfc" error={errors.rfc?.message ?? errors.root?.rfc?.message}>
              <Controller
                control={control}
                render={({ field }) => (
                  <CustomInput
                    placeholder="RFC*"
                    className="placeholder-transparent bg-white rounded-[14px] p-5 enabled:hover:outline-[#212121]"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                )}
                name="rfc"
              />
            </CustomFormField>
            <CustomFormField
              label="Razón Social*"
              labelClassName="font-normal group-data-[error=false]:group-focus-within:text-gray-200"
              error={
                errors?.billingName || errors.root?.billing_name ? (
                  <span className="flex flex-row items-center">
                    {errors.billingName?.message ?? errors.root?.billing_name.message}
                    <HelpTooltipIcon>
                      <p className="text-xs">
                        {personType !== personTypeDefault ? 'La razón social' : 'El nombre y apellido'} debe coincidir
                        con el que tengas registrado en tu constancia de situación fiscal.
                      </p>
                      <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                        Obtener constancia de situación fiscal
                      </a>
                    </HelpTooltipIcon>
                  </span>
                ) : undefined
              }
              helperText={
                errors?.billingName === undefined && errors.root?.billing_name === undefined ? (
                  personType !== personTypeDefault ? (
                    <p>
                      La razón social debe ser <span className="font-medium">sin</span> el régimen capital ( SA.DE.CV).{' '}
                      <span className="font-medium">No se deben utilizar acentos </span> para que coincida con lo
                      registrado en el SAT.
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">No se deben utilizar acentos </span> para que coincida con lo
                      registrado en el SAT.
                    </p>
                  )
                ) : null
              }
            >
              <CustomInput
                placeholder="Nombre/s y apellido/s"
                {...register('billingName')}
                className={cn('bg-white rounded-[14px] p-5 placeholder-transparent enabled:hover:outline-[#212121]', {
                  'focus:placeholder-gray-200': personType === personTypeDefault,
                })}
              />
            </CustomFormField>
            <Controller
              control={control}
              name="taxRegime"
              render={({ field }) => (
                <AutocompleteDivider
                  sx={{ '& .MuiFormControl-root': { marginBottom: 0 } }}
                  id="mui-component-select-taxRegime"
                  name="taxRegime"
                  options={taxRegimeValuesByPersonType}
                  value={field.value}
                  clearIcon={null}
                  getOptionLabel={(option: (typeof taxRegimeValuesByPersonType)[0]) =>
                    option ? `${option.value} - ${option.name}` : ''
                  }
                  noOptionsText="Sin coincidencias"
                  renderInput={(params: TextFieldProps) => (
                    <TextFieldHelper
                      {...params}
                      label="Régimen fiscal*"
                      error={!!errors.taxRegime || !!errors.root?.taxing_system}
                      helperText={errors.taxRegime?.message ?? errors.root?.taxing_system?.message}
                      withHelpIcon={!!errors?.root?.taxing_system}
                      messageHelpIcon={
                        <>
                          <p className="text-xs">
                            El régimen fiscal debe coincidir con el que tengas registrado en tu constancia de situación
                            fiscal.
                          </p>
                          <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                            Obtener constancia de situación fiscal
                          </a>
                        </>
                      }
                    />
                  )}
                  onChange={(
                    _: React.ChangeEvent<HTMLInputElement>,
                    option: (typeof taxRegimeValuesByPersonType)[0]
                  ) => {
                    field.onChange(option);
                  }}
                />
              )}
            />
            <CustomFormField
              labelClassName="font-normal group-data-[error=false]:group-focus-within:text-gray-200"
              label="Código Postal*"
              htmlFor="postalCode"
              error={
                (errors?.postalCode || errors?.root?.postal_code) && (
                  <span className="flex flex-row items-center">
                    {errors?.postalCode?.message ?? errors?.root?.postal_code.message}
                    <HelpTooltipIcon>
                      <p className="text-xs">
                        El código postal debe coincidir con el que tengas registrado en tu constancia de situación
                        fiscal.
                      </p>
                      <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                        Obtener constancia de situación fiscal
                      </a>
                    </HelpTooltipIcon>
                  </span>
                )
              }
            >
              <CustomInput placeholder="" className="p-5 rounded-[14px]" {...register('postalCode')} />
            </CustomFormField>
          </Fieldset>
          <HelpLink href={WHAT_ONBOARDING_HELP} className="block my-12" />
          <Button className="w-full mt-6 lg:mt-12 lg:max-w-[338px] block mx-auto" disabled={isLoading}>
            {summaryEdit ? 'Confirmar' : 'Continuar'}
          </Button>
        </form>
      </div>
      <DrawerAlert open={openAlert}>
        <DrawerAlertContent>
          <div className="mb-10 mx-[49.5px] mt-6 flex flex-col items-center text-white space-y-6">
            <IcInfo />
            <p className="text-lg font-semibold text-center">Los datos no coinciden con los registrados en el SAT.</p>
          </div>
          <DrawerAlertActions className="px-[49.5px] space-y-5">
            <div className="text-center">
              <label className="font-medium text-secondary">¿Qué puedo hacer?</label>
              <ol className="space-y-1 font-medium text-gray-600 list-decimal list-inside text-xs/5 mt-2.5">
                <li>Revisar los datos ingresados.</li>
                <li>
                  Revisar tu <span className="font-semibold"> Constancia de situación fiscal</span> para registrar los
                  datos correctamente.
                </li>
              </ol>
            </div>
            <Button
              className="w-full py-3 font-medium"
              type="button"
              onClick={() => {
                setOpenAlert(false);
              }}
            >
              Entendido
            </Button>
            <a
              className="flex justify-center py-3 w-full font-medium bg-transparent text-blue-100 border-[1.5px] text-base border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
              href={urlSAT}
              target="_blank"
              rel="noreferrer"
            >
              Obtener mi Constancia
            </a>
          </DrawerAlertActions>
        </DrawerAlertContent>
      </DrawerAlert>
    </>
  );
};

const SummaryCard = ({
  children,
  onEdit,
  title,
  disabled,
}: React.PropsWithChildren<{ onEdit: () => void; title: string; disabled: boolean }>) => (
  <div className="flex items-stretch overflow-hidden bg-white rounded-[14px] text-gray-300">
    <div className={cn('flex-1 p-5', { 'pr-0': !disabled })}>
      <h5 className="mb-2 font-medium ">{title}</h5>
      {children}
    </div>
    {!disabled && (
      <button className="p-5 transition-colors bg-white hover:bg-slate-100" onClick={onEdit}>
        <Pencil className="w-4" />
      </button>
    )}
  </div>
);

const OnboardingSummary = ({
  onConfirm,
  user,
  students,
  onStudentEdit,
  onBillingEdit,
  onUserEdit,
  disabled,
  invoiceDisabled,
}: {
  onConfirm: () => void;
  user?: RetrieveGuardian;
  students: GuardianStudent[];
  onUserEdit: () => void;
  onStudentEdit: (studentId: string) => void;
  onBillingEdit: () => void;
  disabled: boolean;
  invoiceDisabled: boolean;
}) => {
  if (disabled) {
    return (
      <div className="min-h-[calc(100vh_-_5rem)] flex flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="my-auto rounded-3xl bg-white shadow-sm shadow-[#E3E0FF] flex flex-col items-center py-10 px-2 w-4/5 mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 67 66">
            <circle cx="33.499" cy="32.558" r="32.558" fill="#07CE80" />
            <path
              fill="#fff"
              fill-rule="evenodd"
              d="M46.098 23.36a2.645 2.645 0 0 1 .214 3.736L31.064 44.202l-9.05-8.186a2.645 2.645 0 1 1 3.549-3.923l5.098 4.61 11.702-13.128a2.645 2.645 0 0 1 3.735-.214Z"
              clip-rule="evenodd"
            />
          </svg>
          <h3 className="pt-3 text-xl font-semibold text-center text-gray-300">
            ¡Gracias {user?.first_name}, ya estamos listos!
          </h3>
          <span className="pt-3 text-base font-medium text-center text-gray-300">
            Se guardaron tus datos correctamente
          </span>
        </motion.div>
        <Button className="w-full mt-6 lg:mt-12 lg:max-w-[338px] block mx-auto" onClick={onConfirm}>
          Empezar
        </Button>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh_-_13rem)]">
      <article className="text-gray-300 mb-9">
        <h3 className="mb-8 text-2xl font-semibold">¡Gracias {user?.first_name}, ya casi estamos listos!</h3>
        <p className="font-light">Confirma los datos ingresados para completar el Onboarding.</p>
      </article>
      <section className="flex flex-col divide-y space-y-5 divide-[#CCCDE8] text-gray-300">
        <div>
          <h4 className="mb-2 text-xl font-medium">Tutor</h4>
          <SummaryCard disabled={disabled} title={`${user?.first_name} ${user?.last_name}`} onEdit={onUserEdit}>
            <ul className="space-y-1">
              <li className="flex items-center gap-1 text-xs">
                <Mail className="w-3.5" />
                {user?.email}
              </li>
              <li className="flex items-center gap-1 text-xs">
                <Phone className="w-3.5" />
                {user?.phone}
              </li>
            </ul>
          </SummaryCard>
        </div>
        <div className="pt-5">
          <h4 className="mb-2 text-xl font-medium">Estudiantes</h4>
          <ul className="space-y-2">
            {students.map((student) => (
              <li key={student.id}>
                <SummaryCard
                  disabled={disabled}
                  title={`${student.first_name} ${student.last_name}`}
                  onEdit={() => onStudentEdit(student.id)}
                >
                  <ul className="flex items-center gap-5 text-xs">
                    {student.identifier && <li>Curp: {student.identifier}</li>}
                    <li>Grado: {student.section_name}</li>
                  </ul>
                </SummaryCard>
              </li>
            ))}
          </ul>
        </div>
        {(user?.billing_name || user?.tax_id) && !invoiceDisabled && (
          <div className="pt-5">
            <h4 className="mb-2 text-xl font-medium">Datos de facturación</h4>
            <SummaryCard disabled={disabled} title={user?.tax_id ?? '—'} onEdit={onBillingEdit}>
              <span className="text-xs">{user?.billing_name}</span>
            </SummaryCard>
          </div>
        )}
      </section>
      <Button className="w-full mt-6 lg:mt-12 lg:max-w-[338px] block mx-auto" onClick={onConfirm}>
        Confirmar
      </Button>
    </div>
  );
};

export { OnboardingGuardianInfo, OnboardingStudentInfo, OnboardingBillingInfo, OnboardingSummary };
