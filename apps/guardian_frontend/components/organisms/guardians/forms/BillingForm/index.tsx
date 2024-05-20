import React, { useState } from 'react';
import { useFormik } from 'formik';
import { isPostalCode, isRequired, isValidRFC } from '~/utils/validations';
import validator, { PackRules } from '~/utils/validator';
import FormFieldsBilling from '~/components/molecules/guardians/formFields/FormFieldsBilling';
import ApiClient from '~/services/ApiClient';
import useUpdateSession from '~/hooks/useUpdateSession';
import { useAlert } from '~/hooks';
import { useVerifyRFC } from '@cometa/hooks';
import DialogUpdateBilling from '~/components/molecules/guardians/dialogs/DialogUpdateBilling';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import { useRouter } from 'next/router';
import { Events } from '~/constants/events';
import Pencil from '~/public/icons/pencil.svg';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';
import { WHAT_LINK } from '~/utils/linksWhatsapp';
import { personTypeDefault } from '~/utils/static_data/personTypesTaxRegimen';
import type { Session } from 'next-auth';
import type { FormikValues } from 'formik';
import useSendTrackEvent from '~/hooks/useSendEvent';

const validationRules: PackRules = {
  taxRegime: [isRequired],
  rfc: [isRequired, isValidRFC],
  billingName: [isRequired],
  street: [isRequired],
  numberExt: [isRequired],
  postalCode: [isRequired, isPostalCode],
  transport: [isRequired],
  other: [isRequired],
};
interface BillingFormProps {
  session: Session;
  defaultEditing?: boolean;
  hrefBack?: string;
}
const BillingForm = ({ session, defaultEditing = false, hrefBack }: BillingFormProps) => {
  const { refetchDependentsWithErrors, refetchUser } = useVerifyRFC();
  const haveRFC = session?.user.tax_id && session?.user.taxing_system;
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(!haveRFC || defaultEditing);
  const updateSession = useUpdateSession();
  const _router = useRouter();
  const { setAlert } = useAlert();
  const sendTrackEvent = useSendTrackEvent();
  const handleClose = () => {
    setLoading(false);
    setOpen(false);
  };

  const onSubmit = () => {
    setLoading(true);
    if (haveRFC) {
      setOpen(true);
    } else {
      updateBilling();
    }
  };

  const initialValues = {
    taxRegime: taxRegimeValues.find((tax) => tax.value === session.user.taxing_system) || {
      name: '',
      value: '',
      personTypes: [],
    },
    rfc: session.user.tax_id || '',
    billingName: session.user.billing_name || '',
    postalCode: session.user.postal_code || '',
    personType: session.user.taxing_type || personTypeDefault,
  };
  const validate = (values: FormikValues) => {
    const errors = validator(validationRules, values);
    setFormErrors(formik.errors);
    return errors;
  };
  const formik = useFormik({
    validateOnMount: false,
    validateOnChange: Object.keys(formErrors).length > 0,
    initialValues,
    validate,
    onSubmit,
  });
  const goToBillingOptions = () => {
    _router.push(_router.asPath.replace('edit', ''));
  };
  const goToBack = () => {
    if (hrefBack) _router.push(hrefBack);
    else goToBillingOptions();
  };
  const updateBilling = () => {
    sendTrackEvent(Events['rfc_assignment_changed']);
    const formValues = formik.values;

    const formParsedValues = {
      tax_id: formValues.rfc,
      billing_name: formValues.billingName,
      taxing_system: formValues.taxRegime.value,
      postal_code: formValues.postalCode,
      taxing_type: formValues.personType,
    };

    return ApiClient.patchGuardian({ ...formParsedValues }, session.user?.id || '', session.token, true)
      .then(async () => {
        await updateSession.mutate();
        setAlert(
          !session.user.tax_id && hrefBack ? 'Nuevo RFC agregado a la lista' : 'Datos guardados correctamente',
          'success',
          true,
          () => goToBack()
        );
        setIsEditing(false);
        await refetchUser();
        await refetchDependentsWithErrors();
      })
      .catch((error) => {
        if (error?.response?.data && error.response?.status === 400) {
          if (error.response.data?.Message) return setAlert(error.response.data.Message);
          if (error.response.data?.error) return setAlert('No se puede cambiar en estos momentos');
          formik.setErrors(error.response.data);
        } else setAlert('No se puede cambiar en estos momentos');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const CFDICategories = Object.entries(session.user.cfdi_config_detail) || [];

  return (
    <>
      <section className="flex items-center justify-between mb-5 ">
        <h2 className="text-xl text-gray-300">Detalles</h2>
        {haveRFC && (
          <button
            type="button"
            className="rounded-lg text-base font-bold bg-gray-200 bg-opacity-10 text-gray-300 flex border-none px-4 py-1.5 items-center space-x-2 cursor-pointer enabled:hover:bg-opacity-20 transition-colors"
            onClick={() => {
              sendTrackEvent(Events['rfc_edit_opened']);
              setIsEditing(true);
            }}
            disabled={isEditing}
          >
            <span>Editar</span>
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </section>
      <form className="flex flex-col flex-auto" onSubmit={formik.handleSubmit}>
        <div className="mb-9">
          <FormFieldsBilling formik={formik} disabledAll={!isEditing} />
        </div>
        {!isEditing && (
          <div className="text-gray-300">
            <h3 className="text-base font-bold">Categorías de uso del CFDI:</h3>
            {CFDICategories.map(([category, detail], index) => (
              <React.Fragment key={detail.code + '-' + category}>
                <p className="text-base">
                  {index === 0
                    ? `Para las facturas de ${detail.description}, la categoría de uso de CFDI es la siguiente`
                    : `Para las facturas de ${detail.description}:`}
                </p>
                <div className="px-5 py-4 bg-[#EBEBEB] rounded-1.5xl text-sm text-gray-900">
                  {detail.code} - {detail.name}
                </div>
              </React.Fragment>
            ))}
            <p className="text-base font-normal">
              En caso quieras modificar las categorías de uso de algunas de tus facturas; por favor, contáctanos vía
              <a className="ml-1 text-blue-100 underline" target="_blank" rel="noreferrer" href={WHAT_LINK}>
                WhatsApp.
              </a>
            </p>
          </div>
        )}

        {isEditing && (
          <div className="flex justify-around w-full">
            <button
              className="px-8 py-4 text-base font-bold text-blue-100 transition-colors bg-transparent border-none rounded-full outline-none cursor-pointer hover:bg-blue-100 hover:bg-opacity-10"
              id="billing-form-cancel"
              onClick={() => {
                if (haveRFC) {
                  formik.setErrors({});
                  setIsEditing(false);
                } else _router.back();
              }}
            >
              Cancelar
            </button>
            <button
              className="flex items-center px-8 py-4 text-base font-bold text-white bg-blue-100 border-none rounded-full outline-none cursor-pointer"
              id="billing-form-submit"
              disabled={loading}
              type="submit"
              name="onboarding-3-submit"
            >
              {loading && <LoadingSpinner className="w-4 h-4 mr-2 text-white" />}
              {haveRFC ? 'Guardar' : 'Siguiente'}
            </button>
          </div>
        )}
      </form>
      <DialogUpdateBilling open={open} handleClose={handleClose} onAgree={updateBilling} />
    </>
  );
};

export default BillingForm;
