import { Button } from '@cometa/recreo';
import { CompoundingEnum, type InterestSchema, TypeF30Enum } from '@cometa/trpc/src/types';
import { cn } from '@cometa/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import CAlert from '/src/components/atoms/CAlert';
import Sheet, { ContainerActions } from '/src/components/atoms/Sheet';
import { RadioGroup, RadioGroupItem } from '/src/components/ui/RadioGroup';
import { api } from '/src/utils/api';

const schema = z.object({
  compounding: z.nativeEnum(CompoundingEnum),
  type: z.nativeEnum(TypeF30Enum),
  value: z.number().positive('Este valor debe ser mayor a 0'),
  day_offset: z.number().positive('El valor del descuento debe ser mayor a 0'),
});

export type FormValues = z.infer<typeof schema>;

type InterestSidePanelPros = {
  conceptId: string;
  interestSchemas: InterestSchema[];
  index?: number;
  onClose: () => void;
  open: boolean;
};

const defaultInterest: FormValues = {
  compounding: CompoundingEnum.SINGLE,
  type: TypeF30Enum.PERCENT,
  value: 0,
  day_offset: 0,
};

function InterestSidePanel({ conceptId, interestSchemas, index, onClose, open }: InterestSidePanelPros) {
  const isEdit = typeof index === 'number';
  const currentInterest: InterestSchema = isEdit
    ? interestSchemas[index]
    : {
        compounding: defaultInterest.compounding,
        type: defaultInterest.type,
        value: defaultInterest.value,
        day_offset: defaultInterest.day_offset,
        month_offset: 0,
      };
  const editInterestMutation = api.concepts.updateConcept.useMutation();

  const parseInterests = (data: FormValues) => {
    if (isEdit) {
      const updatedInterests = [...interestSchemas];
      updatedInterests[index] = {
        ...data,
        month_offset: 0,
      };
      return updatedInterests;
    }
    return [...interestSchemas, { ...data, month_offset: 0 }];
  };

  const onSubmit = async (data: FormValues) => {
    await editInterestMutation.mutate(
      {
        id: conceptId,
        updateFields: {
          interest_schema: parseInterests(data),
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
      compounding: currentInterest.compounding,
      type: currentInterest.type,
      value: currentInterest.value,
      day_offset: currentInterest.day_offset,
    },
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const { register } = form;

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[535px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <div
            className={cn(
              'flex items-center justify-between bg-white border-b border-[#D5DEED] px-8 py-5 sticky top-0'
            )}
          >
            <h3 className="text-[#454D64] font-bold text-lg">{isEdit ? 'Editar' : 'Añadir'} interés</h3>
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
                ¿Cuántos días después de la fecha de vencimiento se generará el recargo?
              </span>
              <div>
                <div className="flex items-center">
                  <TextField className="w-[76px] h-[56px]">
                    <CustomInput
                      {...register('day_offset', { valueAsNumber: true })}
                      type="number"
                      ref={register('day_offset').ref}
                    />
                  </TextField>
                  <span className="col-span-2 ml-3 text-base font-normal text-[#637381]">
                    días después de la fecha de vencimiento
                  </span>
                </div>
                {form.formState.errors.day_offset?.message && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-red-500 -bottom-6 max-h-4">
                    <span className="text-elipsis">{form.formState.errors.day_offset.message}</span>
                  </div>
                )}
              </div>
              <Controller
                control={form.control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup onValueChange={onChange} value={value}>
                    <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                      ¿Cómo deseas que sea el recargo generado?
                    </span>
                    <div className="flex flex-row">
                      <div className="flex items-center ml-2 mr-6 space-x-2" data-testid="porcentual-radioButton">
                        <RadioGroupItem
                          value="PERCENT"
                          id="interest_percent"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="discount_percent">Porcentual (%)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="AMOUNT"
                          id="interest_amount"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="discount_amount">Monto (Pesos mexicanos)</label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
              <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                ¿Cuánto es el recargo que se debe aplicar?{' '}
              </span>
              <div>
                <TextField className="h-[56px] w-[160px]">
                  <>
                    <CustomInput
                      {...register('value', { valueAsNumber: true })}
                      ref={register('value').ref}
                      type="number"
                    />
                    <div className="font-lota text-[#919EAB]">{form.watch('type') === 'PERCENT' ? '%' : 'MXN'}</div>
                  </>
                </TextField>
                {form.formState.errors.value?.message && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-red-500 -bottom-6 max-h-4">
                    <span className="text-elipsis">{form.formState.errors.value?.message}</span>
                  </div>
                )}
              </div>
              <Controller
                control={form.control}
                name="compounding"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup onValueChange={onChange} value={value}>
                    <span className="font-lota text-[16px] font-semibold leading-[24px] text-left">
                      ¿Cuántas veces se debe aumentar el recargo?
                    </span>
                    <div className="grid grid-cols-3">
                      <div className="flex items-center min-w-[130px]  flex-1 gap-4" data-testid="single-radioButton">
                        <RadioGroupItem
                          value={CompoundingEnum.SINGLE}
                          id="interest_single"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="interest_single">Una única vez</label>
                      </div>
                      <div className="flex items-center min-w-[130px]  flex-1 gap-4" data-testid="daily-radioButton">
                        <RadioGroupItem
                          value={CompoundingEnum.DAILY}
                          id="interest_daily"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="interest_daily">Cada día</label>
                      </div>
                      <div className="flex items-center min-w-[130px]  flex-1 gap-4" data-testid="daily-radioButton">
                        <RadioGroupItem
                          value={CompoundingEnum.WEEKLY}
                          id="interest_weekly"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="interest_weekly">Cada semana</label>
                      </div>
                      <div
                        className="flex items-center min-w-[130px] mt-4 flex-1 gap-4"
                        data-testid="fortnightly-radioButton"
                      >
                        <RadioGroupItem
                          value={CompoundingEnum.FORTNIGHTLY}
                          id="interest_fortnightly"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="interest_fortnightly">Cada 15 días</label>
                      </div>
                      <div
                        className="flex items-center min-w-[130px] mt-4 flex-1 gap-4"
                        data-testid="monthly-radioButton"
                      >
                        <RadioGroupItem
                          value={CompoundingEnum.MONTHLY}
                          id="interest_monthly"
                          className="border-green disabled:border-gray-600"
                        />
                        <label htmlFor="interest_monthly">Cada mes</label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
          <ContainerActions>
            <Button
              onClick={onClose}
              size="medium"
              variant="text"
              color="legacy"
              disabled={editInterestMutation.isPending}
            >
              Descartar
            </Button>
            <Button
              onClick={form.handleSubmit((data) => {
                onSubmit(data);
              })}
              size="medium"
              variant="solid"
              color="legacy"
              disabled={editInterestMutation.isPending}
            >
              Guardar
            </Button>
          </ContainerActions>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

export default InterestSidePanel;
