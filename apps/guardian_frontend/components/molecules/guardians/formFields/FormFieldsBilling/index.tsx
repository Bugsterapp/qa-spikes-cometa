// TODO: REFACTOR THIS TO USE ONBOARDING-LIKE FORM
import { FormikProps } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import FormField, { HelperTextWithIcon } from '~/components/CustomFormField';
import { AutocompleteDivider } from '~/components/atoms/guardians/AutocompleteDivider';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import { DrawerAlert, DrawerAlertActions, DrawerAlertContent } from '~/components/organisms/guardians/DrawerAlert';
import { cn } from '~/lib/cn';
import { personTypeDefault, personTypeMoral } from '~/utils/static_data/personTypesTaxRegimen';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import IcInfo from '/public/icons/information-white.svg';
import { Button } from '~/components/ui/Button';
import { HelpTooltipIcon } from '~/components/atoms/HelpTooltipIcon';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';

export type TextFieldHelperProps = {
  withHelpIcon?: boolean;
  messageHelpIcon?: React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  className?: string;
};

export const TextFieldHelper = ({
  withHelpIcon,
  messageHelpIcon,
  error,
  helperText,
  label,
  placeholder,
  disabled,
  value,
  onChange,
  name,
  className,
}: TextFieldHelperProps) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      id={name}
      name={name}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2 border rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        error ? 'border-red-500' : 'border-gray-300',
        disabled && 'bg-[#EBEBEB] text-[#A6A6A6] cursor-not-allowed border-none',
        className
      )}
    />
    {helperText && (
      <HelperTextWithIcon isError={!!error} className="flex flex-row items-center mt-px ml-0">
        {helperText}
        {withHelpIcon && (
          <HelpTooltipIcon>
            <span className="text-xs">{messageHelpIcon}</span>
          </HelpTooltipIcon>
        )}
      </HelperTextWithIcon>
    )}
  </div>
);

const FormFieldsBilling = ({ formik, disabledAll = false }: { formik: FormikProps<any>; disabledAll?: boolean }) => {
  const taxRegimeValuesByPersonType = taxRegimeValues.filter((tax) =>
    tax.personTypes.includes(formik.values.personType)
  );
  const urlSAT = 'https://www.sat.gob.mx/aplicacion/53027/genera-tu-constancia-de-situacion-fiscal';
  const [openAlert, setOpenAlert] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);
  const sendEvent = useSendEvent();

  useEffect(() => {
    if (formik.errors && firstInput.current) firstInput.current.focus();
    if (formik.isSubmitting)
      setOpenAlert(
        !!formik.errors.rfc ||
          !!formik.errors?.billing_name ||
          !!formik.errors?.taxing_system ||
          !!formik.errors?.postal_code
      );
  }, [formik.errors, formik.isSubmitting]);

  const handleChangeToUpperCase: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.value = e.target.value.toUpperCase();
    formik.handleChange(e);
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        {!disabledAll && (
          <div className="mb-[43px]">
            <p className="text-gray-300">
              Los datos deben coincidir con los de tu&nbsp;
              <span className="font-semibold">constancia de situación fiscal.</span>
            </p>
            <a
              href={urlSAT}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline cursor-pointer text-blue"
            >
              Quiero obtener mi constancia
            </a>
          </div>
        )}
        <div className="text-gray-300 mb-[37px]">
          <label className="font-semibold" id="demo-radio-buttons-group-label">
            Facturar como
          </label>
          <div className="flex flex-row gap-4 mt-2" role="radiogroup" aria-labelledby="demo-radio-buttons-group-label">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="radio-buttons-group"
                value={personTypeDefault}
                checked={formik.values.personType === personTypeDefault}
                disabled={disabledAll}
                onChange={(e) => {
                  sendEvent(TrackEvents.billing.form.personType, {
                    personType: e.target.value === 'N' ? 'natural person' : 'business',
                  });
                  formik.setFieldValue('personType', e.target.value);
                  formik.setFieldValue('taxRegime', null);
                  formik.setErrors({});
                }}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={disabledAll ? 'text-gray-400' : ''}>Persona física</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="radio-buttons-group"
                value={personTypeMoral}
                checked={formik.values.personType === personTypeMoral}
                disabled={disabledAll}
                onChange={(e) => {
                  sendEvent(TrackEvents.billing.form.personType, {
                    personType: e.target.value === 'N' ? 'natural person' : 'business',
                  });
                  formik.setFieldValue('personType', e.target.value);
                  formik.setFieldValue('taxRegime', null);
                  formik.setErrors({});
                }}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={disabledAll ? 'text-gray-400' : ''}>Empresa</span>
            </label>
          </div>
        </div>
        <div className="mb-[17px]">
          {/* TODO: refactor mb when replace AutoComplete MUI*/}
          <div className="mb-3">
            <FormField label="RFC*" error={formik.errors.rfc as string}>
              <CustomInput
                onClick={() => sendEvent(TrackEvents.billing.form.taxId)}
                ref={firstInput}
                placeholder="RFC*"
                value={formik.values.rfc}
                onChange={handleChangeToUpperCase}
                name="rfc"
                disabled={disabledAll}
                className="placeholder-transparent bg-white rounded-[10px] p-5 py-4 enabled:hover:outline-[#212121]"
              />
            </FormField>
          </div>
          <div className="mb-3">
            <FormField
              label="Razón Social*"
              error={
                (formik.errors?.billingName as string) ||
                (formik.errors?.billing_name && (
                  <span className="flex flex-row items-center">
                    {formik.errors.billing_name as string}
                    <HelpTooltipIcon>
                      <p className="text-xs">
                        {formik.values.personType !== personTypeDefault ? 'La razón social' : 'El nombre y apellido'}{' '}
                        debe coincidir con el que tengas registrado en tu constancia de situación fiscal.
                      </p>
                      <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                        Obtener constancia de situación fiscal
                      </a>
                    </HelpTooltipIcon>
                  </span>
                ))
              }
              helperText={
                formik?.errors?.billing_name === undefined && formik?.errors.billingName === undefined ? (
                  formik.values.personType !== personTypeDefault ? (
                    <p>
                      La razón social debe ser <span className="font-medium">sin</span> el régimen capital (SA.DE.CV){' '}
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
                onClick={() => sendEvent(TrackEvents.billing.form.billingName)}
                placeholder="Nombre/s y apellido/s"
                value={formik.values.billingName}
                onChange={handleChangeToUpperCase}
                name="billingName"
                disabled={disabledAll}
                className={cn(
                  'placeholder-transparent bg-white rounded-[10px] p-5 py-4 enabled:hover:outline-[#212121]',
                  {
                    'focus:placeholder-gray-200': formik.values.personType === personTypeDefault,
                  }
                )}
              />
            </FormField>
          </div>
          <div className="mb-3">
            <AutocompleteDivider
              options={taxRegimeValuesByPersonType as any}
              value={formik.values.taxRegime}
              getOptionLabel={(option: (typeof taxRegimeValuesByPersonType)[0]) =>
                option ? `${option.value} - ${option.name}` : ''
              }
              onChange={(_: any, option: (typeof taxRegimeValuesByPersonType)[0]) => {
                formik.setFieldValue('taxRegime', option);
              }}
              onClick={() => sendEvent(TrackEvents.billing.form.taxRegime)}
              placeholder="Régimen fiscal*"
              disabled={disabledAll}
            />
            {((formik.errors.taxRegime as string) || (formik.errors.taxing_system as string)) && (
              <HelperTextWithIcon isError>
                {(formik.errors.taxRegime as string) || (formik.errors.taxing_system as string)}
                {formik.errors?.taxing_system && (
                  <HelpTooltipIcon>
                    <p className="text-xs">
                      El régimen fiscal debe coincidir con el que tengas registrado en tu constancia de situación
                      fiscal.
                    </p>
                    <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                      Obtener constancia de situación fiscal
                    </a>
                  </HelpTooltipIcon>
                )}
              </HelperTextWithIcon>
            )}
            {!formik.errors.taxRegime && !formik.errors.taxing_system && <span className="block h-5" />}
          </div>
        </div>
        <h6 className="mb-5 font-medium text-gray-300">Dirección de tu domicilio fiscal:</h6>
        <div className="mb-3">
          <FormField
            label="Código Postal*"
            error={
              (formik.errors?.postalCode as string) ||
              (formik.errors?.postal_code && (
                <span className="flex flex-row items-center">
                  {formik.errors.postal_code as string}
                  <HelpTooltipIcon>
                    <p className="text-xs">
                      El código postal debe coincidir con el que tengas registrado en tu constancia de situación fiscal.
                    </p>
                    <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                      Obtener constancia de situación fiscal
                    </a>
                  </HelpTooltipIcon>
                </span>
              ))
            }
          >
            <CustomInput
              onClick={() => sendEvent(TrackEvents.billing.form.zipCode)}
              placeholder="Código Postal*"
              value={formik.values.postalCode}
              onChange={formik.handleChange}
              name="postalCode"
              disabled={disabledAll}
              className="placeholder-transparent bg-white rounded-[10px] p-5 py-4 enabled:hover:outline-[#212121]"
            />
          </FormField>
        </div>
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

export default FormFieldsBilling;
