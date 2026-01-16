import {
  ContainerError,
  SelectInput,
  SelectInputContent,
  SelectInputItem,
  SelectInputTrigger,
  SelectInputValue,
} from '@cometa/recreo';
import { Input, Label } from '@cometa/recreo/v2';
import { TaxingSystem } from '@cometa/trpc/src/bot/types';
import { UseFormRegister, UseFormSetValue, FieldErrors, UseFormWatch } from 'react-hook-form';
import mexicoStates from '../../../../utils/static_data/mexicoStates.json';
import taxRegimeValues from '../../../../utils/static_data/taxRegimeValues';
import { FiscalEntityForm } from './types';

const taxRegimeOptions = taxRegimeValues.map((regime) => ({
  value: regime.value,
  label: `${regime.value} - ${regime.name}`,
}));

const stateOptions = mexicoStates.map((state) => ({
  value: state,
  label: state,
}));

type FieldsFormProps = {
  register: UseFormRegister<FiscalEntityForm>;
  errors: FieldErrors<FiscalEntityForm>;
  setValue: UseFormSetValue<FiscalEntityForm>;
  watch: UseFormWatch<FiscalEntityForm>;
};

export function FieldsForm({ register, errors, setValue, watch }: Readonly<FieldsFormProps>) {
  return (
    <>
      <div className="flex flex-col gap-5">
        <h3 className="text-[#22283a] text-lg font-semibold">Datos de identificación</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Razón social o denominación</Label>
            <Input
              {...register('name')}
              id="name"
              type="text"
              isError={!!errors.name?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.name?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">RFC</Label>
            <Input
              {...register('tax_id')}
              id="tax_id"
              type="text"
              isError={!!errors.tax_id?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
              maxLength={13}
            />
            <ContainerError error={errors.tax_id?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Régimen fiscal</Label>
            <SelectInput
              onValueChange={(value: string) => {
                setValue('taxing_system', value as TaxingSystem, { shouldValidate: true });
              }}
              value={watch('taxing_system')}
            >
              <SelectInputTrigger className="w-full outline-none rounded-md h-12">
                <SelectInputValue placeholder="Selecciona una opción" />
              </SelectInputTrigger>
              <SelectInputContent className="w-full outline-none">
                {taxRegimeOptions.map((regime) => (
                  <SelectInputItem
                    key={regime.value}
                    value={regime.value}
                    className="w-full hover:bg-[#F5FAFF] outline-none"
                  >
                    {regime.label}
                  </SelectInputItem>
                ))}
              </SelectInputContent>
            </SelectInput>
            <ContainerError error={errors.taxing_system?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Fecha de emisión de la constancia</Label>
            <Input
              {...register('issued_at')}
              id="issued_at"
              type="date"
              isError={!!errors.issued_at?.message}
              placeholder="Selecciona una fecha"
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.issued_at?.message as string} />
          </div>
        </div>
      </div>

      <div className="h-px bg-[#d0d8e9] w-full" />

      <div className="flex flex-col gap-5">
        <h3 className="text-[#22283a] text-lg font-semibold">Datos de dirección</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Nombre de la Entidad Federativa (Estado)</Label>
            <SelectInput
              onValueChange={(value: string) => {
                setValue('state', value, { shouldValidate: true });
              }}
              value={watch('state')}
            >
              <SelectInputTrigger className="w-full outline-none rounded-md h-12">
                <SelectInputValue placeholder="Selecciona una opción" />
              </SelectInputTrigger>
              <SelectInputContent className="w-full outline-none">
                {stateOptions.map((state) => (
                  <SelectInputItem
                    key={state.value}
                    value={state.value}
                    className="w-full hover:bg-[#F5FAFF] outline-none"
                  >
                    {state.label}
                  </SelectInputItem>
                ))}
              </SelectInputContent>
            </SelectInput>
            <ContainerError error={errors.state?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Código postal</Label>
            <Input
              {...register('postal_code')}
              id="postal_code"
              inputMode="numeric"
              type="text"
              isError={!!errors.postal_code?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
              maxLength={5}
            />
            <ContainerError error={errors.postal_code?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Ciudad</Label>
            <Input
              {...register('city')}
              id="city"
              type="text"
              isError={!!errors.city?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.city?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Nombre de la colonia</Label>
            <Input
              {...register('district')}
              id="district"
              type="text"
              isError={!!errors.district?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.district?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Nombre de la vialidad (calle)</Label>
            <Input
              {...register('address_name')}
              id="address_name"
              type="text"
              isError={!!errors.address_name?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.address_name?.message as string} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#22283a] text-base font-normal">Número exterior</Label>
            <Input
              {...register('address_number')}
              id="address_number"
              type="text"
              isError={!!errors.address_number?.message}
              placeholder=""
              className="px-4 py-3 rounded-md text-[#22283a] h-12 border-[#d0d8e9]"
            />
            <ContainerError error={errors.address_number?.message as string} />
          </div>
        </div>
      </div>
    </>
  );
}
