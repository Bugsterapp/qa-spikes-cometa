import Head from 'next/head';
import Navbar from '~/components/Navbar';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import Pencil from '/public/icons/pencil.svg';
import { api } from '~/utils/api';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/PhoneInput/Select';
import { GenderEnum } from '@cometa/trpc';
import { Button } from '~/components/ui/Button';
import Dialog from '~/components/molecules/common/Dialog';
import { WHAT_ONBOARDING_HELP_PROFILE } from '~/utils/linksWhatsapp';
import LoadingButton from '~/components/ui/LoadingButton';
import { DevTool } from '@hookform/devtools';
import { useSelectedSchool } from '~/stores/globalStore';
import { useSession } from 'next-auth/react';
import { DrawerAlert, DrawerAlertActions, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import IcInfo from '/public/icons/information-white.svg';
import { cn } from '~/lib/cn';
import { useSendEvent, useSendPageEvent } from '~/hooks/useSendEvent';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { PhoneInput } from '@cometa/recreo';

function Skeleton() {
  return (
    <div className="flex flex-col gap-[16px] px-5 py-6">
      <div className="flex flex-col gap-[8px]">
        <div className="h-[20px] w-[100px] bg-neutral-100 rounded animate-pulse" />
        <div className="h-[20px] w-full bg-neutral-100 rounded animate-pulse" />
        <div className="h-[20px] w-3/4 bg-neutral-100 rounded animate-pulse" />
      </div>

      <div className="bg-white border border-[#ebedf0] rounded-[12px]">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#ebedf0]">
          <div className="h-[24px] w-[100px] bg-neutral-100 rounded animate-pulse" />
          <div className="h-[32px] w-[80px] bg-neutral-100 rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col gap-[12px] px-4 py-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-[4px] h-[54px] justify-center">
              <div className="h-[20px] w-[120px] bg-neutral-100 rounded animate-pulse" />
              <div className="h-[24px] w-[200px] bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ProfileResolver = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('El email es inválido'),
  gender: z.enum(['M', 'F']),
});

type FormValues = z.infer<typeof ProfileResolver>;

function Profile() {
  const session = useSession();
  const [edit, setEdit] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const school = useSelectedSchool();
  const sendEvent = useSendEvent();
  const sendPageEvent = useSendPageEvent();

  useEffect(() => {
    sendPageEvent(TrackEvents.profile.pageViewed, PageViewedCategory);
  }, []);

  const { data: guardian, refetch: refetchGuardian, isLoading } = api.guardian.me.useQuery();

  const {
    register,
    control,
    formState: { errors, isDirty, isSubmitting },
    reset,
    handleSubmit,
    setError,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(ProfileResolver),
    defaultValues: {
      first_name: session.data?.user.first_name,
      last_name: session.data?.user.last_name,
      email: session.data?.user.email,
      gender: session.data?.user.gender as GenderEnum,
    },
  });

  const mutation = api.guardian.update.useMutation({
    onSuccess(res) {
      if (res.error) {
        Object.keys(res.data).forEach((key) => setError(`root.${key}`, { type: 'validate', message: res.data[key] }));
      }
      refetchGuardian();
      setEdit(false);
    },
  });

  useEffect(() => {
    const parsedValues = ProfileResolver.safeParse(guardian);
    if (guardian && parsedValues.success) {
      const { data } = parsedValues;
      reset({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        gender: data.gender,
      });
    }
  }, [guardian]);

  const submit = (values: FormValues) => {
    sendEvent(TrackEvents.profile.confirmClicked);
    if (isDirty && guardian?.id) {
      mutation.mutate({
        data: values,
        id: guardian.id,
        query: { force: true },
      });
    } else if (!isDirty) {
      setEdit(false);
    }
  };

  return (
    <>
      <DevTool control={control} />
      {isLoading ? (
        <Skeleton />
      ) : !edit ? (
        <div className="flex flex-col gap-[16px] px-5 py-6">
          {/* Page Title and Description */}
          <div className="flex flex-col gap-[8px]">
            <h2 className="text-[18px] font-bold leading-[20px] text-[#22222a]">Mi Perfil</h2>
            <p className="text-[14px] leading-[20px] text-[#535765]">
              Mantén tus datos correctos y actualizados. Si tu número de teléfono no es el correcto, contáctanos por{' '}
              <a
                href={WHAT_ONBOARDING_HELP_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1890ff] underline"
              >
                aquí
              </a>
              .
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white border border-[#ebedf0] rounded-[12px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#ebedf0]">
              <h3 className="text-[16px] font-semibold leading-[24px] text-[#22222a]">Mis datos</h3>
              {school?.config_portal?.enable_edit_guardian && (
                <button
                  className="bg-[#f3f6fb] flex items-center gap-1 px-4 py-[6px] rounded-full cursor-pointer"
                  onClick={() => {
                    sendEvent(TrackEvents.profile.editClicked);
                    setEdit(true);
                  }}
                  data-testid="edit-button"
                >
                  <span className="text-[14px] font-semibold leading-[20px] text-[#1c1c1d]">Editar</span>
                  <Pencil className="w-[14px] h-[14px]" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-[12px] px-4 py-3">
              {/* Nombre(s) */}
              <div className="flex flex-col gap-[4px] h-[54px] justify-center">
                <p className="text-[14px] leading-[20px] text-[#6e7480]">Nombre(s)</p>
                <p className="text-[16px] leading-[24px] text-[#22222a]">{guardian?.first_name || '-'}</p>
              </div>

              {/* Apellidos */}
              <div className="flex flex-col gap-[4px] h-[54px] justify-center">
                <p className="text-[14px] leading-[20px] text-[#6e7480]">Apellidos</p>
                <p className="text-[16px] leading-[24px] text-[#22222a]">{guardian?.last_name || '-'}</p>
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-[4px] h-[54px] justify-center">
                <p className="text-[14px] leading-[20px] text-[#6e7480]">Correo</p>
                <p className="text-[16px] leading-[24px] text-[#22222a]">{guardian?.email || '-'}</p>
              </div>

              {/* Teléfono Móvil */}
              <div className="flex flex-col gap-[4px] h-[54px] justify-center">
                <p className="text-[14px] leading-[20px] text-[#6e7480]">Teléfono Móvil</p>
                <p className="text-[16px] leading-[24px] text-[#22222a]">
                  {guardian?.phone || session.data?.user.phone || '-'}
                </p>
              </div>

              {/* Género */}
              <div className="flex flex-col gap-[4px] h-[54px] justify-center">
                <p className="text-[14px] leading-[20px] text-[#6e7480]">Género</p>
                <p className="text-[16px] leading-[24px] text-[#22222a]">
                  {guardian?.gender === GenderEnum.M
                    ? 'Masculino'
                    : guardian?.gender === GenderEnum.F
                    ? 'Femenino'
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[16px] px-5 py-6">
          {/* Page Title and Description */}
          <div className="flex flex-col gap-[8px]">
            <h2 className="text-[18px] font-bold leading-[20px] text-[#22222a]">Mi Perfil</h2>
            <p className="text-[14px] leading-[20px] text-[#535765]">
              Mantén tus datos correctos y actualizados. Si tu número de teléfono no es el correcto, contáctanos por{' '}
              <a
                href={WHAT_ONBOARDING_HELP_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1890ff] underline"
              >
                aquí
              </a>
              .
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white border border-[#ebedf0] rounded-[12px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#ebedf0]">
              <h3 className="text-[16px] font-semibold leading-[24px] text-[#22222a]">Mis datos</h3>
              <button
                className="bg-[#f3f6fb] flex items-center gap-[10px] px-4 py-[6px] rounded-full cursor-pointer"
                onClick={() => (isDirty ? setShowConfirmation(true) : setEdit(false))}
                data-testid="cancel-button"
              >
                <span className="text-[14px] font-semibold leading-[20px] text-[#1c1c1d]">Cancelar</span>
              </button>
            </div>

            {/* Form Content */}
            <form className="flex flex-col gap-5 px-4 py-3" onSubmit={handleSubmit(submit)}>
              {/* Nombre(s) */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] leading-[1.5] text-[#535765]">Nombre(s)</label>
                <input
                  className={cn(
                    'border border-[#c0c9d8] rounded-[6px] h-[48px] px-4 py-3 text-[16px] leading-[1.5] text-[#1c1c1d] w-full outline-none focus:border-[#513FFF]',
                    errors.first_name && 'border-red-500'
                  )}
                  defaultValue={guardian?.first_name}
                  disabled={isSubmitting}
                  {...register('first_name')}
                />
                {errors.first_name && <span className="text-red-500 text-sm mt-1">{errors.first_name.message}</span>}
              </div>

              {/* Apellidos */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] leading-[1.5] text-[#535765]">Apellidos</label>
                <input
                  className={cn(
                    'border border-[#c0c9d8] rounded-[6px] h-[48px] px-4 py-3 text-[16px] leading-[1.5] text-[#1c1c1d] w-full outline-none focus:border-[#513FFF]',
                    errors.last_name && 'border-red-500'
                  )}
                  defaultValue={guardian?.last_name}
                  disabled={isSubmitting}
                  {...register('last_name')}
                />
                {errors.last_name && <span className="text-red-500 text-sm mt-1">{errors.last_name.message}</span>}
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] leading-[1.5] text-[#535765]">Correo</label>
                <input
                  className={cn(
                    'border border-[#c0c9d8] rounded-[6px] h-[48px] px-4 py-3 text-[16px] leading-[1.5] text-[#1c1c1d] w-full outline-none focus:border-[#513FFF]',
                    errors.email && 'border-red-500'
                  )}
                  defaultValue={guardian?.email}
                  disabled={isSubmitting}
                  {...register('email')}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
              </div>

              {/* Teléfono Móvil */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] leading-[1.5] text-[#535765]">Teléfono Móvil</label>
                <PhoneInput
                  initialValue={guardian?.phone ?? session.data?.user.phone ?? ''}
                  label=""
                  onChange={() => null as any}
                  disabled
                  isLegacy={false}
                  className="[&>button]:!bg-[#f3f6fb] [&>button]:!h-[52px] [&>button]:!border-0 [&>button]:!border-r [&>button]:!border-r-[#c0c9d8] [&>button]:!border-solid [&>button]:!shadow-none [&>button]:!rounded-l-[6px] [&>button]:!px-[10px] [&>button]:!py-2 [&>div]:!h-[52px] [&>div]:!rounded-r-[6px] [&>div>div>input]:!bg-[#f3f6fb] [&>div>div>input]:!text-[#a5acc4] [&>div]:!border-none [&>div>label]:hidden"
                />
              </div>

              {/* Género */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] leading-[1.5] text-[#535765]">Género</label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={(field.value || guardian?.gender) ?? undefined}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        data-error={Boolean(errors.gender)}
                        data-testid="gender-list"
                        className={cn(
                          'bg-white border !border-[#c0c9d8] !rounded-[6px] !shadow-none h-[48px] !px-4 !py-3 w-full flex items-center gap-[10px] !border-r !outline-none focus:!border-[#513FFF]',
                          errors.gender && '!border-red-500'
                        )}
                      >
                        <div className="flex-1 text-[16px] leading-[1.5] text-[#1c1c1d] text-left">
                          <SelectValue data-testid="gender-value" placeholder="Género" />
                        </div>
                        <ExpandMore width="20" height="20" className="shrink-0 text-[#6e7480]" />
                      </SelectTrigger>
                      <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value={GenderEnum.M} className="flex hover:cursor-pointer" textValue="Masculino">
                          Masculino
                        </SelectItem>
                        <SelectItem value={GenderEnum.F} className="flex hover:cursor-pointer" textValue="Femenino">
                          Femenino
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Save Button */}
              <LoadingButton
                data-testid="confirm-button"
                className="bg-[#1c1c1d] text-white rounded-full w-full px-5 py-[10px] h-auto text-[14px] font-semibold leading-[20px] mt-5 shadow-none hover:bg-[#1c1c1d]/90 active:bg-[#513FFF]"
                disabled={isSubmitting || mutation.isPending || !isDirty}
                loading={mutation.isPending}
              >
                Guardar
              </LoadingButton>
            </form>
          </div>
        </div>
      )}

      <Dialog open={showConfirmation ?? false}>
        <Dialog.Content className="w-screen px-5">
          <div className="flex flex-col space-y-6">
            <span className="text-sm text-center">¿Quieres volver sin confirmar los datos ingresados?</span>
            <Button
              className="px-5 py-3 text-sm"
              onClick={() => {
                setEdit(false);
                reset();
                setShowConfirmation(false);
              }}
              data-testid="yesBack-alertButton"
            >
              Sí, volver
            </Button>
            <Dialog.Close
              className="text-sm text-blue-100 bg-transparent"
              onClick={() => setShowConfirmation(false)}
              data-testid="cancel-alertButton"
            >
              Cancelar
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog>
      <DrawerAlert open={Boolean(errors.root?.email)}>
        <DrawerAlertContent>
          <div className="mb-10 mx-[49.5px] mt-6 flex flex-col items-center text-white space-y-6">
            <IcInfo />
            <p className="text-lg font-semibold text-center">Lo sentimos, ya existe un tutor con estos datos.</p>
          </div>
          <DrawerAlertActions className="px-[49.5px] space-y-5">
            <div className="flex flex-col justify-center text-center">
              <span className="font-medium text-secondary">¿Qué puedo hacer?</span>
              <span className="font-medium text-gray-600 list-decimal list-inside text-xs/5 mt-2.5">
                Comuníquese con soporte
              </span>
            </div>
            <a
              className={cn(
                'text-center block py-4 px-6 appearance-none bg-blue-100 rounded-full text-white text-base font-normal outline-none shadow-[6px_6px_20px_rgba(85,112,255,0.3)] cursor-pointer hover:bg-[#364AFD] transition-colors hover:shadow-[6px_6px_35px_rgba(85, 112, 255, 0.42)] active:bg-blue-100',
                'disabled:shadow-none disabled:bg-[#EBEBEB] disabled:text-[#A6A6A6] w-full py-3 font-medium'
              )}
              type="button"
              target="_blank"
              rel="noopener noreferrer"
              href={WHAT_ONBOARDING_HELP_PROFILE}
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
        </DrawerAlertContent>
      </DrawerAlert>
    </>
  );
}

Profile.auth = true;

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Perfil</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export default Profile;
