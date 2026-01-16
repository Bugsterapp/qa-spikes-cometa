import { Button } from '@cometa/recreo';
import type { EarlyBirdDiscount } from '@cometa/trpc/src/types';
import { DiscountTypeEnum } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import CAlert from '/src/components/atoms/CAlert';
import Sheet, { ContainerActions } from '/src/components/atoms/Sheet';
import { RadioGroup, RadioGroupItem } from '/src/components/ui/RadioGroup';
import { api } from '/src/utils/api';

const schema = z
  .object({
    name: z.string(),
    discount_type: z.nativeEnum(DiscountTypeEnum),
    up_to_days: z.number(),
    discount_value: z
      .number({
        required_error: 'El valor del descuento es requerido',
        invalid_type_error: 'Debe ingresar un valor numérico válido',
      })
      .positive('El valor del descuento debe ser mayor a 0'),
    need_up_to_days: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.need_up_to_days) {
        return data.up_to_days > 0;
      }
      return true;
    },
    {
      path: ['up_to_days'],
      message: 'Este valor debe ser mayor a 0',
    }
  )
  .refine((data) => data.discount_type !== DiscountTypeEnum.PERCENT || data.discount_value <= 100, {
    path: ['discount_value'],
    message: 'El porcentaje de descuento no puede ser mayor a 100',
  });

export type FormValues = z.infer<typeof schema>;

type EarlyBirdDiscountSidePanelProps = {
  conceptId: string;
  earlyBirdDiscounts: EarlyBirdDiscount[];
  index?: number;
  onClose: () => void;
  open: boolean;
};

const defaultEarlyBirdDiscount: FormValues = {
  name: '',
  discount_type: DiscountTypeEnum.PERCENT,
  up_to_days: 0,
  discount_value: 0,
  need_up_to_days: false,
};

function EarlyBirdDiscountSidePanel({
  conceptId,
  earlyBirdDiscounts,
  index,
  onClose,
  open,
}: EarlyBirdDiscountSidePanelProps) {
  const isEdit = typeof index === 'number';
  const currentEarlyBirdDiscount: EarlyBirdDiscount = isEdit ? earlyBirdDiscounts[index] : defaultEarlyBirdDiscount;
  const [needUpToDays, setNeedUpToDays] = useState(currentEarlyBirdDiscount.up_to_days === 0);
  const editEarlyBirdDiscountMutation = api.concepts.updateConcept.useMutation();

  const parseEarlyBirdDiscounts = (data: FormValues) => {
    if (isEdit) {
      const updatedDiscounts = [...earlyBirdDiscounts];
      updatedDiscounts[index] = {
        ...data,
      };
      return updatedDiscounts;
    }
    return [...earlyBirdDiscounts, { ...data }];
  };

  const onSubmit = async (data: FormValues) => {
    await editEarlyBirdDiscountMutation.mutate(
      {
        id: conceptId,
        updateFields: {
          early_bird_discounts: parseEarlyBirdDiscounts(data),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCloseSheet = () => {
    onClose();
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentEarlyBirdDiscount.name,
      discount_type: currentEarlyBirdDiscount.discount_type,
      up_to_days: currentEarlyBirdDiscount.up_to_days,
      discount_value: currentEarlyBirdDiscount.discount_value,
      need_up_to_days: needUpToDays,
    },
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const { register } = form;

  const handleNeedUpToDays = (value: boolean) => {
    if (!value) {
      form.setValue('up_to_days', 1);
      setNeedUpToDays(true);
    } else {
      form.setValue('up_to_days', 0);
      setNeedUpToDays(false);
    }
  };

  useEffect(() => {
    setNeedUpToDays(currentEarlyBirdDiscount.up_to_days !== 0);
  }, [currentEarlyBirdDiscount]);

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[535px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <div
            className={cn(
              'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0'
            )}
          >
            <h3 className="text-[#454D64] font-bold text-lg">{isEdit ? 'Editar' : 'Añadir'} descuento pronto pago</h3>
            <div className="flex items-center gap-2">
              <span
                onClick={handleCloseSheet}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleCloseSheet();
                }}
                className="px-2 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full"
              >
                <XIcon className="text-[#98A2B3] w-4" />
              </span>
            </div>
          </div>

          <div className="overflow-y-auto ">
            <div className="relative flex flex-col gap-6 px-8 py-7">
              <CAlert
                type="warning"
                message="Los cambios solo afectarán a los pagos y facturas que se realicen a partir de ahora."
              />
              <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                ¿Hasta cuántos días antes de la fecha de vencimiento tendrán acceso al descuento?
              </span>
              {needUpToDays ? (
                <div>
                  <div className="flex items-center">
                    <TextField className="w-[76px] h-[56px] ">
                      <CustomInput
                        {...register('up_to_days', { valueAsNumber: true })}
                        type="number"
                        ref={register('up_to_days').ref}
                      />
                    </TextField>
                    <span className="col-span-2 ml-3 text-base font-normal text-[#637381]">
                      días antes de la fecha de vencimiento
                    </span>
                  </div>
                  {form.formState.errors.up_to_days?.message && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-red-500 -bottom-6 max-h-4">
                      <span className="text-elipsis">{form.formState.errors.up_to_days.message}</span>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex items-center gap-1 ml-3">
                <Controller
                  control={form.control}
                  name="need_up_to_days"
                  render={({ field: { onChange, value } }) => (
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 mt-1 text-[#00AB55] rounded-md disabled:text-[#919EAB] "
                        checked={value}
                        onChange={(e) => {
                          onChange(e.target.checked);
                          handleNeedUpToDays(e.target.checked);
                        }}
                      />
                    </label>
                  )}
                />
                <span className="col-span-2 ml-3 text-base font-normal text-[#1C1C1D]">
                  El descuento aplicará hasta el mismo día de vencimiento.
                </span>
              </div>
              <Controller
                control={form.control}
                name="discount_type"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      form.trigger('discount_value');
                    }}
                    value={value}
                  >
                    <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                      ¿Qué tipo de descuento se aplicará?
                    </span>
                    <div className="flex flex-row">
                      <div className="flex items-center ml-2 mr-6 space-x-2" data-testid="porcentual-radioButton">
                        <RadioGroupItem
                          value="PERCENT"
                          id="discount_percent"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="discount_percent">Porcentual (%)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="AMOUNT"
                          id="discount_amount"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="discount_amount">Monto (Pesos mexicanos)</label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
              <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                ¿Cuánto será el valor del descuento?
              </span>
              <div>
                <TextField className="h-[56px] w-[160px]">
                  <>
                    <CustomInput
                      {...register('discount_value', { valueAsNumber: true })}
                      ref={register('discount_value').ref}
                      type="number"
                    />
                    <div className="font-lota text-[#919EAB]">
                      {form.watch('discount_type') === 'PERCENT' ? '%' : 'MXN'}
                    </div>
                  </>
                </TextField>
                {form.formState.errors.discount_value?.message && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-red-500 -bottom-6 max-h-4">
                    <span className="text-elipsis">{form.formState.errors.discount_value.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ContainerActions>
            <Button
              onClick={onClose}
              size="medium"
              variant="text"
              color="legacy"
              disabled={editEarlyBirdDiscountMutation.isPending}
            >
              Descartar
            </Button>
            <Button
              onClick={form.handleSubmit((data) => {
                onSubmit(data);
              })}
              size="medium"
              color="legacy"
              variant="solid"
              disabled={editEarlyBirdDiscountMutation.isPending || !form.formState.isValid}
            >
              Guardar
            </Button>
          </ContainerActions>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

export default EarlyBirdDiscountSidePanel;
