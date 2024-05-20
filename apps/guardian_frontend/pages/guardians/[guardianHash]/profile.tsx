import Head from 'next/head';
import Navbar from '~/components/Navbar';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import FormField from '~/components/CustomFormField';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import Pencil from '/public/icons/pencil.svg';
import { api } from '~/utils/api';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/PhoneInput/Select';
import { GenderEnum } from '@cometa/trpc';
import { Button } from '~/components/atoms/Button';
import PageHeader from '~/components/PageHeader';
import Dialog from '~/components/molecules/common/Dialog';
import { WHAT_ONBOARDING_HELP } from '~/utils/linksWhatsapp';
import LoadingButton from '~/components/molecules/LoadingButton';
import { DevTool } from '@hookform/devtools';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { useSession } from 'next-auth/react';
import { DrawerAlert, DrawerAlertActions, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import IcInfo from '/public/icons/information-white.svg';
import { cn } from '~/lib/cn';

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

  const { data: guardian } = api.guardian.me.useQuery(undefined, {
    staleTime: Infinity,
  });

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

      const parsedData = ProfileResolver.safeParse(res.data);
      if (parsedData.success) {
        setEdit(false);
        reset({
          first_name: parsedData.data.first_name,
          last_name: parsedData.data.last_name,
          gender: parsedData.data.gender,
          email: parsedData.data.email,
        });
      }
    },
  });

  useEffect(() => {
    const parsedValues = ProfileResolver.safeParse(guardian);
    if (guardian && parsedValues.success) {
      reset({
        first_name: parsedValues.data.first_name,
        last_name: parsedValues.data.last_name,
        email: parsedValues.data.email,
        gender: parsedValues.data.gender,
      });
    }
  }, [guardian]);

  const submit = (values: FormValues) => {
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
      <div className="min-h-[76px]">
        {!edit ? (
          <div className="border-b border-b-[#E3E0FF] flex justify-between px-5 py-2 min-h-[76px] items-center mb-8">
            <h2 className="text-lg font-semibold text-[#283877]">Mi perfil</h2>
            {school?.config_portal?.enable_edit_guardian && (
              <Button variant="ghost" onClick={() => setEdit(true)} data-testid="edit-button">
                Editar
                <Pencil className="w-4 ml-1" />
              </Button>
            )}
          </div>
        ) : (
          <PageHeader
            buttonAction={() => (isDirty ? setShowConfirmation(true) : setEdit(false))}
            headerText="Editar datos del perfil"
            className="mb-8"
          />
        )}
      </div>

      <form className="flex flex-col px-5" onSubmit={handleSubmit(submit)}>
        <FormField label="Nombre/s" className="mb-3" error={errors.first_name?.message}>
          <CustomInput
            className="px-5 pt-[25px] pb-[18px] rounded-[14px]"
            defaultValue={guardian?.first_name}
            disabled={!edit || isSubmitting}
            {...register('first_name')}
          />
        </FormField>
        <FormField label="Apellido/s" className="mb-3" error={errors.last_name?.message}>
          <CustomInput
            className="px-5 pt-[25px] pb-[18px] rounded-[14px]"
            defaultValue={guardian?.last_name}
            disabled={!edit || isSubmitting}
            {...register('last_name')}
          />
        </FormField>
        <FormField label="Email*" className="mb-3" error={errors.email?.message}>
          <CustomInput
            className="px-5 pt-[25px] pb-[18px] rounded-[14px]"
            defaultValue={guardian?.email}
            disabled={!edit || isSubmitting}
            {...register('email')}
          />
        </FormField>
        <FormField label="Celular*" className="mb-3">
          <CustomInput
            disabled
            className="px-5 pt-[25px] pb-[18px] rounded-[14px]"
            value={guardian?.phone ?? session.data?.user.phone ?? ''}
          />
        </FormField>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select
              key={field.value}
              value={(field.value || guardian?.gender) ?? undefined}
              onValueChange={field.onChange}
              disabled={!edit || isSubmitting}
            >
              <SelectTrigger
                data-error={Boolean(errors.gender)}
                data-testid="gender-list"
                className="group bg-white h-[67px] data-[error=true]:border-error data-[error=true]:border  data-[error=true]:border-r-0 py-0 px-0 pl-4 pr-1 w-full rounded-2xl"
              >
                <SelectValue data-testid="gender-value" placeholder="Género" />
                <ExpandMore
                  width="24"
                  height="24"
                  className="text-blue-100 group-disabled:text-[#A6A6A6] group-data-[state='open']:rotate-180 transition-transform"
                />
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
        {edit && (
          <>
            <span className="text-[#57537A] mt-3">
              Para solicitar el cambio de número del celular contáctanos vía{' '}
              <a
                data-testid="whatsapp-link"
                href={WHAT_ONBOARDING_HELP}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#513FFF]"
              >
                WhatsApp.
              </a>
            </span>
            <LoadingButton
              data-testid="confirm-button"
              className="mt-8"
              disabled={isSubmitting || mutation.isLoading || !isDirty}
              loading={mutation.isLoading}
            >
              Confirmar
            </LoadingButton>
          </>
        )}
      </form>

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
