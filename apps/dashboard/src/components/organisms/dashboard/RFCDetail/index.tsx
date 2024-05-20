import { UseMutationResult } from '@tanstack/react-query';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '/src/utils/cn';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import taxRegimeValues from '/src/utils/static_data/taxRegimeValues';
import EditButton from '/public/assets/icons/ic_edit_sidepanel.svg';
import { useState } from 'react';
import SidebarActions from '/src/components/atoms/SidebarActions';
import CFDIFields from '/src/utils/static_data/CFDIFields';
import cfdiCategories from '/src/utils/static_data/cfdiCategories';

import { NumberFormatBase as NumericFormat } from 'react-number-format';
import Select from '/src/components/Select';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import { IMutationErrors } from '../AssingStudentRFC';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import CAlert from '/src/components/atoms/CAlert';
import { useRouter } from 'next/router';
import { DashboardGuardian, Guardian, TaxingTypeEnum } from '@cometa/trpc/src/types';
import type { AxiosError } from 'axios';

interface RFCDetailProps {
  onClose: () => void;
  guardianDetail: DashboardGuardian | Guardian | undefined;
  mutation: UseMutationResult<unknown, AxiosError, IUpdateData, unknown>;
  errorsMutation?: IMutationErrors;
  showTutorDetail?: boolean;
}
export interface IUpdateData {
  billing_info: RFCDetailFormValues;
  id: DashboardGuardian['id'];
}
const schema = z
  .object({
    taxing_type: z.nativeEnum(TaxingTypeEnum),
    billing_name: z
      .string({
        required_error: 'Este campo es necesario para continuar.',
        invalid_type_error: 'Este campo es necesario para continuar.',
      })
      .nonempty('Este campo es necesario para continuar'),
    postal_code: z
      .string()
      .min(4, 'Este código postal no es válido')
      .max(5)
      .nonempty('Este campo es necesario para continuar'),

    tax_id: z
      .string()
      .min(12, 'Este RFC no es válido')
      .refine((data) => data !== 'XAXX010101000', 'Este RFC no es válido'),
    taxing_system: z.string({
      required_error: 'Este campo es necesario para continuar.',
      invalid_type_error: 'Este campo es necesario para continuar.',
    }),
    cfdi_config: z
      .object({
        OTHER: z.string().optional(),
        TRANSPORT: z.string().optional(),
        MONTHLY_FEE: z.string().optional(),
        INSCRIPTION: z.string().optional(),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // if person type is natural, tax id must be a valid RFC
      if (data.taxing_type === TaxingTypeEnum.N) {
        const rfcRegex =
          /^([A-ZÑ&]{4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
        return rfcRegex.test(data.tax_id) || data.tax_id.length !== 12;
      } else {
        const rfcRegex =
          /^([A-ZÑ&]{3}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
        return rfcRegex.test(data.tax_id) || data.tax_id?.length !== 13;
      }
    },
    { message: 'El RFC no es válido', path: ['tax_id'] }
  );
export type RFCDetailFormValues = z.infer<typeof schema>;

export default function RFCDetail({
  onClose,
  guardianDetail,
  mutation,
  errorsMutation,
  showTutorDetail = false,
}: RFCDetailProps) {
  const router = useRouter();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  const [ableToEdit, setAbleToEdit] = useState(
    !guardianDetail?.billing_info?.taxing_system || !guardianDetail?.billing_info?.tax_id
  );

  const [openDialog, setOpenDialog] = useState(false);

  const guardianBillingInfo =
    !!guardianDetail?.billing_info?.taxing_system && !!guardianDetail?.billing_info?.tax_id
      ? guardianDetail?.billing_info
      : {};

  const taxRegime = taxRegimeValues.find((tax) => tax.value === (guardianBillingInfo as any)?.taxing_system);

  const {
    register,
    formState: { errors },
    resetField,
    handleSubmit,
    watch,
    control,
  } = useForm<RFCDetailFormValues>({
    defaultValues: {
      ...guardianBillingInfo,
      taxing_type: (guardianDetail?.billing_info?.taxing_type as TaxingTypeEnum | null | undefined) ?? TaxingTypeEnum.N,
      taxing_system: taxRegime?.value,
    },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const personType = watch('taxing_type');
  const cfdi_guardian = watch('cfdi_config');
  const taxRegimeValuesByPersonType = taxRegimeValues.filter((tax) => tax.personTypes.includes(personType));

  const onSubmit = (data: RFCDetailFormValues) => {
    mutation.mutate({ billing_info: { ...data }, id: guardianDetail?.id ?? '' });
  };

  const handleViewTutor = () => {
    sendTrackEventWithUserName('dashboard: Invoices | View Guardian');
    router.push(`/guardian/${guardianDetail?.id}`);
  };

  return (
    <div className="h-full">
      <div className="flex flex-col flex-auto h-full">
        <div className="sticky z-20 w-full px-8 bg-white">
          {!ableToEdit && !showTutorDetail && (
            <EditButton className="absolute cursor-pointer top-5 right-48" onClick={() => setAbleToEdit(true)} />
          )}
          <SidebarHeader
            title="Detalle de facturación"
            onClose={() => {
              if (ableToEdit) {
                setOpenDialog(true);
              } else {
                onClose();
              }
            }}
          />
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className="px-8 mmb-2">
            {showTutorDetail && (
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-base font-semibold">Tutor vinculado:</span>
                  <span className="text-base font-medium">
                    {guardianDetail?.first_name} {guardianDetail?.last_name}
                  </span>
                </div>
                <CAlert
                  type="info"
                  message="Podrás editar los datos desde la página de Detalle de Tutor."
                  action={
                    <>
                      <button
                        onClick={handleViewTutor}
                        className="bg-transparent rounded-md text-sm text-[#00AB55] font-bold border border-[#04297A] py-1 px-2"
                      >
                        <span className="whitespace-nowrap text-[#04297A]">Ver tutor</span>
                      </button>
                    </>
                  }
                />
              </div>
            )}
            <div>
              <span className="text-base font-semibold">Estudiantes facturando con este RFC</span>
            </div>
            <div className="mb-8">
              <div className="flex mt-4">
                {guardianDetail?.billing_info?.billable_dependents?.map((student) => (
                  <div key={student.id} className="flex mr-[18px] items-center">
                    <div className="w-2 h-2 mr-1 rounded-[50%] bg-[#919EAB]" />
                    <span className="text-[#919EAB]">
                      {student?.first_name} {student?.last_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div id="form_rfc">
              <form className="flex flex-col justify-between h-full" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-span-2 space-y-8">
                  <div id="person_type_input" className="relative flex flex-col space-y-5">
                    <h5 className="text-sm font-bold">Facturar como:</h5>
                    {errors.taxing_type?.message && (
                      <div
                        id="personType_error"
                        className="absolute flex items-center gap-1 text-xs font-thin text-red-500 max-h-4"
                      >
                        <span className="text-elipsis">Falta completar este campo</span>
                      </div>
                    )}
                    <Controller
                      name="taxing_type"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <div className="flex ml-3">
                          <label
                            className={cn('flex items-center text-sm disabled:text-[#919EAB]', {
                              'text-red-600': !!errors.taxing_type?.message,
                            })}
                          >
                            <input
                              onChange={(e) => {
                                onChange(e.target.value);
                                resetField('taxing_system');
                              }}
                              disabled={!ableToEdit}
                              checked={value === TaxingTypeEnum.N}
                              type="radio"
                              value={TaxingTypeEnum.N}
                              className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green disabled:border-[#919EAB] disabled:checked:before:bg-[#919EAB] disabled:checked:text-white disabled:checked:hover:border-[#919EAB]"
                            />
                            Persona física
                          </label>
                          <label
                            className={cn('flex items-center text-sm ml-8', {
                              'text-red-600': !!errors.taxing_type?.message,
                            })}
                          >
                            <input
                              disabled={!ableToEdit}
                              type="radio"
                              checked={value === TaxingTypeEnum.M}
                              value={TaxingTypeEnum.M}
                              onChange={(e) => {
                                onChange(e.target.value);
                                resetField('taxing_system');
                              }}
                              className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green disabled:border-[#919EAB] disabled:checked:before:bg-[#919EAB] disabled:checked:text-white disabled:checked:hover:border-[#919EAB]"
                            />
                            Persona moral
                          </label>
                        </div>
                      )}
                    />
                  </div>
                  <TextField label="RFC" error={errors?.tax_id?.message ?? errorsMutation?.rfc} value={watch('tax_id')}>
                    <CustomInput
                      {...register('tax_id')}
                      type="text"
                      disabled={!ableToEdit}
                      className={!ableToEdit ? 'text-[#919EAB]' : ''}
                    />
                  </TextField>
                  <TextField
                    label="Razón social"
                    error={errors.billing_name?.message ?? errorsMutation?.billing_name}
                    value={watch('billing_name')}
                  >
                    <CustomInput
                      {...register('billing_name')}
                      type="text"
                      placeholder="Nombre/s y apellido/s"
                      disabled={!ableToEdit}
                      className={!ableToEdit ? 'text-[#919EAB]' : ''}
                    />
                  </TextField>
                  <Controller
                    control={control}
                    name="taxing_system"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        placeholder="Régimen fiscal"
                        className="w-full h-[60px]"
                        disabled={!ableToEdit}
                        onValueChange={onChange}
                        value={value}
                        error={errors.taxing_system?.message ?? errorsMutation?.taxing_system}
                      >
                        <Select.Content
                          key={value}
                          className="flex flex-col overflow-hidden rounded-lg min-w-[420px] max-w-[450px]"
                        >
                          {taxRegimeValuesByPersonType.map((taxRegime) => (
                            <Select.Item key={`${taxRegime.value}_${taxRegime.name}`} value={taxRegime.value}>
                              {taxRegime.value} - {taxRegime.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                  />
                </div>
                <div className="col-span-2 mt-8 space-y-8">
                  <h5 className="text-sm font-bold">Dirección de domicilio fiscal:</h5>
                  <TextField
                    label="Código postal"
                    error={errors.postal_code?.message || errorsMutation?.postal_code}
                    value={watch('postal_code')}
                  >
                    <Controller
                      control={control}
                      name="postal_code"
                      render={({ field: { ...props } }) => (
                        <NumericFormat
                          type="tel"
                          disabled={!ableToEdit}
                          format={formatZip}
                          {...props}
                          className="w-full text-[#1D2939] disabled:text-[#919EAB] placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent"
                        />
                      )}
                    />
                  </TextField>
                </div>
                {!ableToEdit && (
                  <div className="col-span-2 mt-8 mb-10 space-y-4">
                    <h5 className="text-sm font-bold">Categorías de uso de CFDI</h5>
                    <p className="text-[13px] text-justify text-[#212B36]">
                      Las categorías de uso de CFDI no pueden ser modificadas desde el Dashboard.
                      <br /> Para cualquier modificación puede contactar directamente a soporte.
                    </p>
                    {CFDIFields.map((field) => {
                      const cfdi_name = cfdiCategories.find(
                        (cfdi) => cfdi.value === cfdi_guardian?.[field.key.toUpperCase() as keyof typeof cfdi_guardian]
                      )?.name;
                      return (
                        <div key={field.key}>
                          <TextField label={field.title} value={cfdi_name}>
                            <CustomInput
                              type="text"
                              value={cfdi_name}
                              disabled={!ableToEdit}
                              className={!ableToEdit ? 'text-[#919EAB]' : ''}
                            />
                          </TextField>
                        </div>
                      );
                    })}
                  </div>
                )}
                {ableToEdit && (
                  <SidebarActions className="z-10 mt-5 bg-white">
                    <button
                      className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
                      type="button"
                      onClick={() => {
                        setOpenDialog(true);
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
                      disabled={!ableToEdit || Object.keys(errors).length > 0 || mutation?.isLoading}
                      type="submit"
                    >
                      Guardar
                    </button>
                  </SidebarActions>
                )}
              </form>
            </div>
          </div>
        </div>
        <Dialog.Root open={openDialog} position="right" classNames="right-12">
          <Dialog.Title>¿Estás seguro que deseas descartar los cambios?</Dialog.Title>
          <Dialog.Description>No se guardarán los cambios que has realizado hasta el momento.</Dialog.Description>
          <div className="flex justify-center gap-x-10">
            <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
              Atrás
            </Button>
            <Button
              variant="cancel"
              size="tooltip"
              onClick={() => {
                setAbleToEdit(false);
                onClose();
              }}
            >
              Sí, descartar
            </Button>
          </div>
        </Dialog.Root>
      </div>
    </div>
  );
}

const formatZip = (val: string) => {
  const zip = val.substring(0, 5);
  return `${zip}`;
};
