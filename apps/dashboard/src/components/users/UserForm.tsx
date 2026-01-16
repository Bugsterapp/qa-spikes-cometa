import { Button, Input, Select, TextField } from '@cometa/recreo';
import { UserDTO } from '@cometa/trpc';
import { FC } from 'react';

import SidebarActions from '/src/components/atoms/SidebarActions';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Alert from '/src/components/ui/Alert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { useUserForm, UserFormDTO } from '/src/hooks/useUserForm';
import { MEMBERSHIPS } from '/src/constants/memberships';
import { PhoneInput } from '@cometa/recreo/components/PhoneInput';

interface UserFormProps {
  onClose: () => void;
  onSave: (data: UserFormDTO) => void;
  isLoading?: boolean;
  user?: UserDTO;
  mode?: 'create' | 'edit';
}

const UserForm: FC<UserFormProps> = ({ onClose, onSave, isLoading, user, mode = 'edit' }) => {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    watch,
    setValue,
    onSubmit,
  } = useUserForm({ user, mode, onSave });

  return (
    <div className="flex flex-col flex-auto px-8 min-h-[calc(100vh-135px)] justify-between">
      <div>
        <SidebarHeader
          title={mode === 'create' ? 'Nuevo Usuario' : 'Editar usuario'}
          disabled={isLoading}
          boxClassName="px-0"
          onClose={onClose}
        />
        <div className="mb-2 border rounded-2xl p-4">
          <div className="mb-2 border-b pb-2">
            <label className="text-base font-bold">Datos del usuario</label>
          </div>

          <Alert
            className="mt-4"
            variant="info"
            message='Todos los usuarios agregados a la plataforma tendrán acceso total a todas las funciones disponibles. Si deseas personalizar los permisos, haz click en "opciones" y "Editar permisos".'
          />

          <div className="flex flex-col gap-4 mt-6">
            <TextField label="Nombre" error={errors.first_name?.message} value={watch('first_name')}>
              <Input {...register('first_name')} type="text" />
            </TextField>
            <TextField label="Apellido" error={errors.last_name?.message} value={watch('last_name')}>
              <Input {...register('last_name')} type="text" />
            </TextField>
            <TextField label="Email" error={errors.email?.message} value={watch('email')}>
              <Input {...register('email')} type="email" />
            </TextField>
            <PhoneInput
              label="Teléfono (opcional)"
              onChange={(value) => {
                setValue('mobile', value.number, { shouldDirty: true, shouldValidate: true });
              }}
              onRawValueChange={(rawValue) => {
                setValue('mobile', rawValue, { shouldDirty: true, shouldValidate: true });
              }}
              initialValue={watch('mobile') ?? undefined}
              error={errors.mobile?.message}
              ignoreValidation
            />
            <Select
              placeholder="Rol"
              className="w-full outline-none min-h-[56px] h-full mb-1"
              onValueChange={(value) => {
                setValue('membership', value, { shouldDirty: true, shouldValidate: true });
              }}
              error={errors.membership?.message}
              defaultValue={watch('membership')}
            >
              <Select.Content className="w-full outline-none">
                {Object.entries(MEMBERSHIPS).map(([key, value]) => (
                  <Select.Item key={key} value={key} className="w-full hover:bg-[#F5FAFF] outline-none">
                    {value}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        <SidebarActions className="grid grid-cols-2 px-0 shadow-none">
          <Button
            className="bg-white px-4 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
            onClick={() => {
              sendTrackEventWithUserName(`dashboard: User ${mode} | Clicked cancel`);
              onClose();
            }}
            disabled={isLoading}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            className="text-white text-base font-bold px-2 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap w-full flex-1"
            disabled={mode === 'edit' ? !user || !isValid : !isValid}
            onClick={handleSubmit(onSubmit)}
          >
            Guardar
          </Button>
        </SidebarActions>
      </div>
    </div>
  );
};

export default UserForm;
