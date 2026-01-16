import SidebarHeader from '../../../molecules/dashboard/SidebarHeader';
import DashboardInput from '../../common/DashboardInput';
import { useFormik } from 'formik';
import ApiClient from '/src/services/ApiClient';
import SidebarActions from '/src/components/atoms/SidebarActions';
import DateInputsGroup from '../DateInputsGroup';
import { useMutation } from '@tanstack/react-query';
import useAlert from '/src/hooks/useAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { isRequired, isValidBirthdate, isValidEmail, isValidFullNumber } from '/src/utils/validations';
import validator from '/src/utils/validator';
import { AxiosError } from 'axios';
import { changeMultipleErrors } from '/src/utils/errorsMessages';
import { api } from '/src/utils/api';
import { DashboardGuardian } from '@cometa/trpc/src/types';
import { PhoneInput } from '@cometa/recreo';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';

const GUARDIAN_FIELDS = {
  FIRST_NAME: 'guardian.first_name',
  LAST_NAME: 'guardian.last_name',
  EMAIL: 'guardian.email',
  PHONE: 'guardian.phone',
} as const;

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
  occupation?: string;
  workplace?: string;
  workphone?: string;
  school_id?: string;
}

export default function GuardianEdit({ guardian, onClose }: IGuardianEditProps) {
  const { setAlertState } = useAlert();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const utils = api.useUtils();
  const selectedSchool = useSelectedSchool();
  const { isFieldBlocked, getTooltipMessage } = useIntegrationsBlockedFields();

  const initialValues: IGuardianFormValue = {
    first_name: guardian?.first_name || '',
    last_name: guardian?.last_name || '',
    email: guardian?.email || '',
    phone: guardian?.phone || '',
    birthdate: guardian.birthdate || '',
    occupation: guardian.occupation || '',
    workplace: guardian.workplace || '',
    workphone: guardian.workphone || '',
    school_id: selectedSchool?.id,
  };

  const validationRules = {
    email: [isRequired, isValidEmail],
    phone: [isRequired, isValidFullNumber],
    first_name: [isRequired],
    last_name: [isRequired],
    birthdate: [isValidBirthdate],
    workphone: [isValidFullNumber],
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
  const mutation = useMutation({
    mutationFn: async (values: IGuardianFormValue) => await ApiClient.patchGuardianDetail(guardian.id, values),
    async onSuccess() {
      await utils.guardian.getDetails.invalidate();
      setAlertState({ open: true, severity: 'success', message: '¡Se guardaron los cambios de manera exitosa!' });
      sendTrackEventWithUserName(Events.guardian_changed);
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
              disabled={isFieldBlocked(GUARDIAN_FIELDS.FIRST_NAME)}
              tooltip={getTooltipMessage(GUARDIAN_FIELDS.FIRST_NAME)}
            />
            <DashboardInput
              name="last_name"
              value={formik.values.last_name}
              label="Apellidos*"
              placeholder=""
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.last_name as string)}
              disabled={isFieldBlocked(GUARDIAN_FIELDS.LAST_NAME)}
              tooltip={getTooltipMessage(GUARDIAN_FIELDS.LAST_NAME)}
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
              disabled={isFieldBlocked(GUARDIAN_FIELDS.EMAIL)}
              tooltip={getTooltipMessage(GUARDIAN_FIELDS.EMAIL)}
            />

            <PhoneInput
              ignoreValidation
              initialValue={formik.values.phone}
              onChange={(value) => {
                if (!isFieldBlocked(GUARDIAN_FIELDS.PHONE)) {
                  formik.setFieldValue('phone', value.number);
                  formik.setFieldError('phone', undefined);

                  if (!value.isValid()) {
                    formik.setFieldError('phone', 'Ingresa un número de teléfono válido');
                  }
                }
              }}
              label="Celular*"
              error={changeMultipleErrors(formik.errors.phone as string)}
              disabled={isFieldBlocked(GUARDIAN_FIELDS.PHONE)}
            />

            <h3 className="text-lg font-bold mt-8 mb-5">Información laboral</h3>
            <DashboardInput
              name="occupation"
              value={formik.values.occupation || ''}
              label="Ocupación (opcional)"
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.occupation as string)}
            />
            <DashboardInput
              name="workplace"
              value={formik.values.workplace || ''}
              label="Lugar de trabajo (opcional)"
              onChange={formik.handleChange}
              error={changeMultipleErrors(formik.errors.workplace as string)}
            />
            <PhoneInput
              ignoreValidation
              initialValue={formik.values?.workphone ?? ''}
              onChange={(value) => {
                formik.setFieldValue('workphone', value.number);
                formik.setFieldError('workphone', undefined);

                if (!value.isValid()) {
                  formik.setFieldError('workphone', 'Ingresa un número de teléfono válido');
                }
              }}
              label="Telf. de trabajo (opcional)"
              error={changeMultipleErrors(formik.errors.workphone as string)}
            />
          </div>
        </form>
      </div>
      <SidebarActions className="z-10">
        <button
          className="bg-transparent px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg"
          disabled={mutation.isPending}
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
            disabled={mutation.isPending || !formik.isValid}
            className="text-white text-base font-bold px-20 py-3 rounded-lg bg-green hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </span>
      </SidebarActions>
    </>
  );
}
