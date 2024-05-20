import { Controller, useForm } from 'react-hook-form';
import IcPlus from '/public/assets/icons/ic_plus.svg';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { StepProps, FormValues4, FormDiscount, schemaStep4 } from './CreationConcepts';
import ConceptButton from './ConceptButton';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import Button from './Button';
import { cn } from '/src/utils/cn';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../../ui/Calendar';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

export function Step4Form({ setData, onNext, onBack, formData }: StepProps<FormValues4>) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName('dashboard: Concept | New Concept P2A.3 Descuentos');
  const formDiscountStep = useForm<FormDiscount>({
    resolver: zodResolver(schemaStep4),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      need_up_to_days: false,
    },
  });

  const [discountItems, setDiscountItems] = useState<FormDiscount[]>(formData?.early_bird_discounts ?? []);
  const showUpToDays = formDiscountStep.watch('need_up_to_days');
  const [showCreateDiscounts, setShowCreateDiscounts] = useState(false);
  const onSubmit = () => {
    setData({ early_bird_discounts: discountItems });
    onNext();
  };

  const handleCancel = () => {
    formDiscountStep.reset();
    setShowCreateDiscounts(false);
  };

  const needPicker = formData?.has_months_to_pay === 'false';
  const onSaveDiscount = (data: FormDiscount) => {
    setDiscountItems([...discountItems, data]);
    formDiscountStep.reset();
    setShowCreateDiscounts(false);
  };

  const handleNeedUpToDays = (value: boolean) => {
    if (!value) {
      formDiscountStep.setValue('up_to_days', '');
    } else {
      formDiscountStep.setValue('up_to_days', '0');
    }
  };
  return (
    <div className="flex flex-col h-full">
      <div className="min-h-[82vh]">
        <div className="py-6 mb-4 sticky top-0 z-10 bg-white">
          <h1 className="font-bold text-xl text-black">Descuento pronto pago</h1>
          <span className="text-sm text-[#637381] ">
            Puedes generar descuentos que apliquen únicamente si es que el padre de familia realiza el pago del concepto
            antes de una fecha específica.
          </span>
        </div>
        <div className="flex w-full flex-col">
          {discountItems.map((item, i) => (
            <div
              className="py-4 border border-gray-300 rounded-lg flex w-full justify-between px-4 mb-4"
              key={i + Math.random()}
            >
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col col-span-1 items-center">
                  <p className="text-sm text-[#637381]">Valor de dscto:</p>
                  <p className="p-1 mt-1 text-xs font-bold bg-[#54D62C29] text-[#229A16] rounded-md w-fit px-3">
                    {item.discount_value} {item.discount_type === 'AMOUNT' ? 'MXN' : '%'}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-[#637381] text-sm mt-[2px]">Vigencia del descuento</p>
                  <p className="p-1 text-sm font-medium mt-1">
                    Hasta{' '}
                    {needPicker ? (
                      <span className="font-medium">
                        el{' '}
                        {item.up_to_days === '' ? (
                          'mismo día de vencimiento'
                        ) : (
                          <div>
                            {isValid(new Date(item.up_to_days))
                              ? format(new Date(item.up_to_days), 'PPP', {
                                  locale: es,
                                })
                              : 'Fecha incorrecta'}
                          </div>
                        )}
                      </span>
                    ) : (
                      <span className="font-medium text-md">
                        {item?.need_up_to_days
                          ? 'el mismo día de vencimiento'
                          : `${item.up_to_days} días antes de la fecha de vencimiento`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setDiscountItems(discountItems.filter((_, index) => index !== i));
                  }}
                >
                  <IcTrash fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!showCreateDiscounts && (
          <button
            className="bg-white px-10 border-2 border-[#00AB55] border-opacity-[0.48] py-3 text-[#00AB55] hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg items-center flex"
            onClick={() => {
              setShowCreateDiscounts(true);
            }}
          >
            <IcPlus fill="currentColor" />
            Agregar descuento
          </button>
        )}
        {showCreateDiscounts && (
          <form id="discount_form" onSubmit={formDiscountStep.handleSubmit(onSaveDiscount)}>
            <div className="p-4 border-2 rounded-lg z-30">
              <p className="font-semibold text-base">
                {needPicker
                  ? '¿Hasta qué día los tutores tendrán acceso a este descuento?'
                  : '¿Hasta cuántos días antes de la fecha de vencimiento aplica el descuento?'}
              </p>
              {needPicker && (
                <div className="flex gap-2 items-center">
                  <label className="text-[#637381] font-normal text-sm">El concepto vence el:</label>
                  <label className="font-normal text-sm">
                    {format(new Date(formData?.due || ''), 'PPP', {
                      locale: es,
                    })}
                  </label>
                </div>
              )}
              {!showUpToDays && (
                <div
                  className={cn('mt-4 items-center z-10', {
                    'grid grid-cols-3': !needPicker,
                  })}
                >
                  {needPicker ? (
                    <Controller
                      control={formDiscountStep.control}
                      name="up_to_days"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              className={cn(
                                'w-full relative h-14 flex items-center justify-between px-4 mt-4 border border-[#E5E7EB] rounded-lg',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                <span className="font-normal">
                                  {format(new Date(field.value), 'PPP', {
                                    locale: es,
                                  })}
                                </span>
                              ) : (
                                <span className="font-normal text-[#919EAB]">Fecha</span>
                              )}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-lg z-10">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={(date) => field.onChange(date?.toISOString())}
                              initialFocus
                              toDate={new Date(formData?.due || '')}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  ) : (
                    <>
                      <TextField
                        error={formDiscountStep.formState.errors.up_to_days?.message}
                        value={formDiscountStep.watch('up_to_days')}
                      >
                        <CustomInput {...formDiscountStep.register('up_to_days')} type="number" />
                      </TextField>
                      <span className="col-span-2 ml-3 text-base font-normal text-[#637381]">
                        días antes de la fecha de vencimiento
                      </span>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center ml-3 mt-4">
                <Controller
                  control={formDiscountStep.control}
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
                <span className="mt-1 ml-2">El descuento aplicará hasta el mismo día de vencimiento.</span>
              </div>
              <div className="mt-6">
                <Controller
                  control={formDiscountStep.control}
                  name="discount_type"
                  render={({ field: { onChange, value } }) => (
                    <RadioGroup onValueChange={onChange} value={value}>
                      <span className="font-semibold text-base">¿Qué tipo de descuento deseas agregar?</span>
                      <div className="flex flex-row">
                        <div className="flex items-center mr-6 ml-2 space-x-2" data-testid="porcentual-radioButton">
                          <RadioGroupItem value="PERCENT" id="discount_percent" />
                          <Label htmlFor="discount_percent">Porcentual (%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="AMOUNT" id="discount_amount" />
                          <Label htmlFor="discount_amount">Monto (Pesos mexicanos)</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
                {formDiscountStep.formState.errors?.discount_type ? (
                  <span className="text-red-500 text-sm ml-2 mt-1">Debes seleccionar un tipo de descuento</span>
                ) : null}
              </div>
              <div className="mt-6">
                <span className="font-semibold text-base">¿Cuánto será el valor del descuento?</span>
              </div>
              <div className="mt-2 grid grid-cols-3 items-center">
                <TextField
                  error={
                    formDiscountStep.formState.touchedFields.discount_value &&
                    formDiscountStep.formState.isSubmitted &&
                    (formDiscountStep.formState.errors.discount_value ||
                      Number(formDiscountStep.watch('discount_value')) <= 0)
                      ? 'El valor del descuento debe ser mayor a 0'
                      : ''
                  }
                  value={formDiscountStep.watch('discount_value')}
                  unitType={formDiscountStep.watch('discount_type') === 'PERCENT' ? '%' : '$'}
                >
                  <CustomInput {...formDiscountStep.register('discount_value')} type="number" step="0.1" />
                </TextField>
              </div>
              <div className="pt-10 flex bg-white">
                <button
                  className="bg-white px-6 py-2 text-[#00AB55] hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="text-white text-base font-bold px-6 py-2 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
                  type="submit"
                >
                  Guardar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      <ConceptButton
        onBack={() => {
          onBack();
        }}
        textNext={!discountItems.length ? 'Omitir' : 'Siguiente'}
        onSubmit={onSubmit}
      />
    </div>
  );
}
