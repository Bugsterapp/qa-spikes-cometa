import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cometa/recreo/v2';
import { PhoneInput } from '@cometa/recreo/components/PhoneInput';
import Sheet from '/src/components/atoms/Sheet';
import { useUserForm, UserFormDTO } from '/src/hooks/useUserForm';
import { MEMBERSHIPS } from '../../constants/memberships';
import IcCloseDrawer from '/public/assets/icons/ic_close_drawer.svg';
import IcInfoCircleBlue from '/public/assets/icons/ic_info_circle_blue.svg';
import { useWelcomeFlowStore } from '/src/stores/welcomeFlowStore';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { useMemo } from 'react';

type AddUserDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormDTO) => void;
  isLoading?: boolean;
};

export function AddUserDrawer({ isOpen, onClose, onSave, isLoading = false }: AddUserDrawerProps) {
  const store = useWelcomeFlowStore();
  const teamMembers = store((state) => state.teamMembers);
  const selectedSchoolId = useSelectedSchoolId();

  const { data: existingUsers = [] } = api.schools.getUsers.useQuery(
    {
      schoolId: selectedSchoolId as string,
      query: {},
    },
    {
      enabled: !!selectedSchoolId,
    }
  );

  const normalizedUsers = useMemo(() => {
    const allUsers = [...existingUsers, ...teamMembers];

    return {
      emails: new Set(allUsers.map((user) => user.email.toLowerCase().trim())),
      phones: new Set(allUsers.map((user) => user.mobile?.trim()).filter((phone): phone is string => Boolean(phone))),
    };
  }, [teamMembers, existingUsers]);

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    setValue,
    onSubmit,
    defaultValues,
    reset,
  } = useUserForm({
    mode: 'create',
    onSave,
    existingEmails: normalizedUsers.emails,
    existingPhones: normalizedUsers.phones,
  });

  function handleClose() {
    reset(defaultValues);
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-lg font-['Lota_Grotesque'] antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)] !z-[60]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-8 py-4 border-b border-[#d0d8e9] rounded-t-lg">
            <h2 className="text-lg font-semibold text-[#22283a] leading-none">Invitar colaborador</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-[9px] rounded-full hover:bg-gray-100 transition-colors"
            >
              <IcCloseDrawer className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-[#e8f4ff] border border-[#64b5ff] rounded-lg px-4 py-3 flex gap-3">
                <div className="pt-0.5">
                  <IcInfoCircleBlue className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#0d4f8c] leading-5 font-normal">
                    Enviaremos un correo con instrucciones de acceso para que puedan ingresar y completar la información
                    fiscal, bancaria o legal por ti.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-normal text-[#22283a]">Nombre</Label>
                  <Input
                    {...register('first_name')}
                    type="text"
                    placeholder=" "
                    className="h-12"
                    isError={!!errors.first_name}
                  />
                  {errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-normal text-[#22283a]">Apellido</Label>
                  <Input
                    {...register('last_name')}
                    type="text"
                    placeholder=" "
                    className="h-12"
                    isError={!!errors.last_name}
                  />
                  {errors.last_name && <p className="text-sm text-red-500">{errors.last_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-normal text-[#22283a]">Correo electrónico</Label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder=" "
                    className="h-12"
                    isError={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <PhoneInput
                    label="Teléfono (opcional)"
                    onChange={(value) => {
                      setValue('mobile', value.number, { shouldDirty: true, shouldValidate: true });
                    }}
                    onRawValueChange={(rawValue) => {
                      setValue('mobile', rawValue, { shouldDirty: true, shouldValidate: true });
                    }}
                    initialValue={watch('mobile') ?? undefined}
                    isLegacy={false}
                    error={errors.mobile?.message}
                    ignoreValidation
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-normal text-[#22283a]">Rol dentro del equipo</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('membership', value, { shouldDirty: true, shouldValidate: true });
                    }}
                    value={watch('membership')}
                  >
                    <SelectTrigger className="w-full h-12" isError={!!errors.membership}>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {Object.entries(MEMBERSHIPS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#697086] leading-5 font-normal">
                    Recomendamos el rol de Administrador para Contadores, Tesoreros o Representantes Legales que
                    necesiten subir documentos.
                  </p>
                  {errors.membership && <p className="text-sm text-red-500">{errors.membership.message}</p>}
                </div>
              </div>
            </form>
          </div>

          <div className="px-8 py-4 border-t border-[#d0d8e9] flex items-center justify-end gap-4 rounded-b-lg">
            <Button type="button" variant="secondary" size="default" onClick={handleClose} disabled={isLoading}>
              Descartar
            </Button>
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
