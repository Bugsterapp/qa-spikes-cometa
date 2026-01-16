import Head from 'next/head';
import { Button } from '~/components/ui/Button';
import { Tabs, TabsContent, TabsTrigger } from '~/components/Tabs';
import Cometa from '~/public/cometa-logo.svg';
import { useForm } from 'react-hook-form';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import FormField from '~/components/FormField';
import CustomFormField from '~/components/CustomFormField';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '~/components/Toast/useToast';
import { cn } from '~/lib/cn';
import useTelephone, { allowedCountries, countries, CountryCode } from '~/hooks/useTelephone';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '~/components/PhoneInput/Select';
import * as React from 'react';
import { useThrottle } from '@cometa/hooks';
import { WHAT_LOGIN } from '~/utils/linksWhatsapp';
import { sendPageViewedEvent, sendTrackEvent } from '~/utils/events';
import ExpandMore from '~/public/icons/ic_expand_more.svg';
import dynamic from 'next/dynamic';
import { api } from '~/utils/api';
import { MethodEnum } from '@cometa/trpc';
import type { GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '~/server/auth';

const FlagEmoji = dynamic(() => import('~/hooks/useTelephone').then((mod) => mod.FlagEmoji), { ssr: false });
const SelectContent = dynamic(() => import('~/components/PhoneInput/Select').then((mod) => mod.SelectContent), {
  ssr: false,
});

const telephoneValidation = z.object({
  method: z.literal(MethodEnum.WHATSAPP),
  telephone: z
    .string({ required_error: 'El número no es válido', invalid_type_error: 'El número no es válido' })
    .min(6, 'El número no es válido'),
  mail: z.never().optional(),
});

const mailValidation = z.object({
  method: z.literal(MethodEnum.MAIL),
  mail: z.string().email('El correo no es válido'),
  telephone: z.never().optional(),
});

const schema = z.discriminatedUnion('method', [telephoneValidation, mailValidation]);

type FormState =
  | { telephone: string; mail?: never; method: MethodEnum.WHATSAPP }
  | { mail: string; telephone?: never; method: MethodEnum.MAIL };

let pageViewed = false;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session?.user?.hash) {
    return {
      redirect: {
        destination: `/guardians/${session.user.hash}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const Home = () => {
  if (!pageViewed && typeof window !== 'undefined') {
    sendPageViewedEvent('portal: Login Page');
    pageViewed = true;
  }

  const {
    handleSubmit,
    register,
    unregister,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
    clearErrors,
    trigger,
    getValues,
    resetField,
  } = useForm<FormState>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { method: MethodEnum.WHATSAPP },
    resolver: zodResolver(schema),
  });

  const debouncedSubmitting = useThrottle(isSubmitting, 500);

  const { mutate, isPending: isLoading } = api.guardian.sendCode.useMutation({
    onError: (_, variables) => {
      sendTrackEvent('portal: Login Page submit', {
        method: variables.method,
        status: 'failure',
        reason: 'Not found',
      });
      toast({
        title:
          variables.method === MethodEnum.WHATSAPP
            ? `No tenemos registrado ese WhatsApp, por favor intenta con otro número o prueba ingresando con correo.`
            : `No tenemos registrado ese correo, por favor intenta con otro o prueba ingresando con WhatsApp`,
        variant: 'error',
      });
    },
    onSuccess: (_data, variables) => {
      sendTrackEvent('portal: Login Page submit', {
        method: variables.method,
        status: 'success',
      });
      toast({
        title:
          variables.method === MethodEnum.WHATSAPP
            ? 'Se envió el link de acceso a tu WhatsApp.'
            : 'Se envió el link de acceso a tu correo.',
        variant: 'success',
      });
    },
  });

  const { toast } = useToast();

  const onSubmit = (data: FormState) => {
    if (schema.safeParse(data).success) {
      mutate({
        method: method === MethodEnum.MAIL ? MethodEnum.MAIL : MethodEnum.WHATSAPP,
        value: (method === MethodEnum.MAIL ? data.mail : telephone.number?.toString()) ?? '',
      });
    } else {
      if (data.mail) {
        trigger('mail');
      } else {
        setError('telephone', { type: 'random', message: 'El número no es válido' });
      }
      sendTrackEvent('portal: Login Page submit', {
        method: data.method,
        status: 'failure',
        reason: data.mail ? 'Invalid email address' : 'Invalid phone number',
      });
    }
  };

  const method = watch('method');
  const telephone = useTelephone({
    onNumberChange: (phone) => {
      if (phone?.isValid()) {
        setValue('telephone', phone?.number?.toString(), { shouldValidate: true });
      }
    },
  });

  const countriesWithoutPreferredCountries = countries.filter(
    (country) => country.value !== 'MX' && country.value !== 'US'
  );

  if (method === MethodEnum.WHATSAPP && telephone.valid && errors?.telephone) {
    clearErrors('telephone');
    trigger('telephone');
  }

  const resetTelephone = React.useCallback(() => {
    telephone.onChange('');
    resetField('telephone');
    unregister('telephone');
  }, [telephone, resetField, unregister]);

  React.useEffect(() => {
    if (method === MethodEnum.MAIL) {
      resetTelephone();
    }
  }, [method]);

  React.useEffect(() => {
    if (!getValues().telephone) {
      register('telephone');
    }
  }, [register]);

  return (
    <>
      <Head>
        <title>Cometa</title>
      </Head>
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] grid-rows-[auto_auto] lg:grid-rows-1 min-h-screen bg-gradient-to-t from-[#BEBDFF66] to-[#D3FDFF66] max-h-fit">
        <div className="flex flex-col items-center lg:items-start bg-[#4A5CFF] bg-gradient-mobile bg-right-top lg:bg-gradient-desktop lg:bg-bottom h-fit lg:h-full bg-no-repeat p-10 pb-20 lg:py-[4.6rem] lg:px-[6.5rem] text-white">
          <Cometa className="self-start w-24 lg:w-40" />
          <h3 className="font-bold mt-[75px] lg:text-3xl lg:mt-32">Bienvenido a Cometa</h3>
          <span className="text-sm text-center max-w-[268px] lg:text-2xl lg:text-left font-light lg:max-w-lg lg:mb-auto mt-10 ">
            El portal de pagos de tu escuela, donde podrás realizar todos los pagos escolares.
          </span>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col pt-[50px] max-lg:min-h-[65vh] max-lg:pb-14 px-9 items-center lg:items-start lg:justify-center lg:px-12 xl:px-24 2xl:px-28 max-w-md w-full mx-auto lg:max-w-[700px]"
        >
          <h3 className="my-0 text-lg font-bold mb-7 text-[#57537A] lg:text-3xl">Ingresar a mi cuenta</h3>
          <Tabs
            value={method}
            className="border-b-[#909090] border-b border-solid border-t-0 border-x-0 w-full"
            onValueChange={(val) => setValue('method', val as MethodEnum)}
          >
            <TabsTrigger
              value={MethodEnum.WHATSAPP}
              className="flex-col w-full text-xs font-light xl:text-sm lg:flex-row lg:font-normal lg:uppercase"
            >
              Enviar acceso <span className="hidden lg:block">&nbsp;</span>{' '}
              <b className="text-sm font-normal lg:text-xs xl:text-sm">vía WhatsApp</b>
            </TabsTrigger>
            <TabsTrigger
              value={MethodEnum.MAIL}
              className="flex-col w-full text-xs font-light xl:text-sm lg:flex-row lg:font-normal lg:uppercase"
            >
              Enviar acceso <span className="hidden lg:block">&nbsp;</span>{' '}
              <b className="text-sm font-normal lg:text-xs xl:text-sm">vía Email</b>
            </TabsTrigger>
            <TabsContent
              value={MethodEnum.MAIL}
              className="flex flex-col items-center lg:items-start lg:mt-9 data-[state='inactive']:m-0 lg:data-[state='active']:min-h-[151px]"
            >
              <h5 className="text-center lg:text-left lg:text-base lg:max-w-[384px] font-normal text-[#57537A] text-sm m-0 max-w-[278px] mb-6 lg:mb-9">
                Coloca el correo al que normalmente te llegan los mensajes del colegio.
              </h5>
              <FormField label="Correo" error={errors?.mail?.message} className="lg:max-w-[330px]">
                <CustomInput
                  placeholder="  "
                  className="p-5 rounded-[14px]"
                  {...register('mail', { shouldUnregister: true })}
                />
              </FormField>
            </TabsContent>
            <TabsContent
              value={MethodEnum.WHATSAPP}
              className="flex flex-col items-center lg:items-start lg:mt-9  data-[state='inactive']:m-0"
            >
              <h5 className="text-center lg:text-left lg:text-base lg:max-w-[384px] font-normal text-[#57537A] text-sm m-0 max-w-[278px] mb-4 lg:mb-9">
                Coloca el número al que normalmente te llegan los mensajes del colegio.
              </h5>
              <CustomFormField
                label="Celular"
                error={errors.telephone?.message}
                labelClassName="left-20"
                className="lg:max-w-[330px]"
              >
                <Select value={telephone.country} onValueChange={(e) => telephone.onChangeCountry(e as CountryCode)}>
                  <SelectTrigger className="bg-[#f3f5f9] h-[67px] group-data-[error=true]:border-[#FF4842] group-data-[error=true]:border  group-data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1">
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
                    if (errors?.telephone) {
                      clearErrors('telephone');
                    }
                    telephone.onChange(e.target.value);
                  }}
                  className="rounded-l-none rounded-r-[14px] group-data-[error=true]:outline-0 group-data-[error=true]:border group-data-[error=true]:border-error group-data-[error=true]:border-l-0 h-[67px] placeholder-transparent focus:placeholder-gray-500"
                />
              </CustomFormField>
            </TabsContent>
          </Tabs>
          <Button
            className="w-full mt-6 lg:mt-12 lg:max-w-[338px]"
            type="submit"
            disabled={debouncedSubmitting || isLoading}
          >
            Enviarme link para log in
          </Button>
          {method === MethodEnum.MAIL && (
            <span className="text-sm lg:text-base lg:text-left lg:max-w-[423px] text-center mt-10 max-w-[257px] text-[#57537A]">
              Revisa tu correo y tu bandeja de spam. Recuerda que el link expira en 24 horas.
            </span>
          )}
          <a
            className={cn('text-[#4A5CFF] underline text-base mt-10', {
              'lg:mt-20 lg:mb-[47px]': method === MethodEnum.WHATSAPP,
            })}
            href={WHAT_LOGIN}
            target="_blank"
            rel="noopener noreferrer"
          >
            Necesito ayuda
          </a>
        </form>
      </section>
    </>
  );
};

export default Home;
