import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import DashboardInput from '../../common/DashboardInput';
import { useFormik } from 'formik';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';
import SidebarActions from '/src/components/atoms/SidebarActions';
import DateInputsGroup from '../DateInputsGroup';
import { useMutation } from '@tanstack/react-query';
import useAlert from '/src/hooks/useAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import PhoneField from '/src/components/atoms/PhoneField';
import { TextField } from '@mui/material';
import { isRequired, isValidBirthdate, isValidEmail } from '/src/utils/validations';
import validator from '/src/utils/validator';
import { AxiosError } from 'axios';
import { changeMultipleErrors } from '/src/utils/errorsMessages';
import { api } from '/src/utils/api';
import { DashboardGuardian } from '@cometa/trpc/src/types';
interface IGuardianEditProps {
  onClose: () => void;
  guardian: DashboardGuardian;
}

interface IGuardianFormValue {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birthdate?: string;
}

export default function GuardianEdit({ guardian, onClose }: IGuardianEditProps) {
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();

  const initialValues: IGuardianFormValue = {
    first_name: guardian?.first_name || '',
    last_name: guardian?.last_name || '',
    email: guardian?.email || '',
    phone: guardian?.phone || '+52',
    birthdate: guardian.birthdate || '',
  };

  const validationRules = {
    email: [isRequired, isValidEmail],
    phone: [isRequired],
    first_name: [isRequired],
    last_name: [isRequired],
    birthdate: [isValidBirthdate],
  };

  const formik = useFormik<IGuardianFormValue>({
    validateOnMount: false,
    validateOnChange: true,
    validate: (values) => {
      const errors = validator(validationRules, values);
      return errors;
    },
    initialValues,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
  const queryEditGuardian = async (values: IGuardianFormValue) =>
    await ApiClient.patchGuardianDetail(session?.token || '', guardian.id, values);

  const mutation = useMutation(queryEditGuardian, {
    async onSuccess() {
      await utils.guardian.getDetails.invalidate();
      setAlertState({ open: true, severity: 'success', message: '¡Se guardaron los cambios de manera exitosa!' });
      sendTrackEventWithUserName('dashboard: Guardian | Changed');
      onClose();
    },
    onError(error: AxiosError | Error | any) {
      if (error.response?.status === 400 && error.response.data) formik.setErrors(error.response?.data);
      else {
        setAlertState({
          open: true,
          severity: 'error',
          message:
            error.response?.data?.detail === 'You do not have permission to perform this action.'
              ? 'No tienes permisos para realizar esta acción. Si necesitas activarlo, escríbenos por el chat de soporte.'
              : 'Ocurrió un error inesperado, por favor intenta de nuevo.',
        });
        onClose();
      }
    },
  });

  const modifyValues = (values: IGuardianFormValue) => {
    const { birthdate = '', ...newValues } = values;
    if (!birthdate) return newValues;
    return values;
  };

  const handleSubmit = async (values: IGuardianFormValue) => {
    const newValues = modifyValues(values);
    mutation.mutate(newValues);
  };

  return (
    <>
      <div className="flex flex-col flex-auto h-full overflow-auto px-9 mb-9">
        <SidebarHeader title="Información general" onClose={onClose} />
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col flex-auto mt-8">
            <DashboardInput
              name="first_name"
              value={formik.values.first_name}
              label="Nombre*"
              placeholder=""
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.first_name as string)}
            />
            <DashboardInput
              name="last_name"
              value={formik.values.last_name}
              label="Apellidos*"
              placeholder=""
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.last_name as string)}
            />
            <DateInputsGroup
              date={formik.values.birthdate?.split('-') || []}
              label="FECHA DE NACIMIENTO"
              setFieldValue={formik.setFieldValue}
              errors={changeMultipleErrors(formik.errors.birthdate as string)}
            />
            <DashboardInput
              name="email"
              value={formik.values.email}
              label="Correo electrónico*"
              placeholder=""
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.email as string)}
            />
            <PhoneField
              value={formik.values.phone}
              component={TextField}
              country="mx"
              onChange={(value) => {
                formik.setFieldValue('phone', value ? `+${value}` : '');
              }}
              inputProps={{
                label: 'Celular',
                name: 'phone',
                variant: 'outlined',
                required: true,
                error: 'phone' in formik.errors,
                helperText: changeMultipleErrors(formik.errors.phone as string),
              }}
            />
          </div>
        </form>
      </div>
      <SidebarActions className="z-10">
        <button
          className="bg-transparent px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg"
          disabled={mutation.isLoading}
          onClick={() => {
            onClose();
          }}
        >
          Cancelar
        </button>
        <span>
          <button
            onClick={() => {
              formik.submitForm();
            }}
            disabled={mutation.isLoading || !formik.isValid}
            className="text-white text-base font-bold px-20 py-3 rounded-lg bg-green hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
          >
            {mutation.isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </span>
      </SidebarActions>
    </>
  );
}
