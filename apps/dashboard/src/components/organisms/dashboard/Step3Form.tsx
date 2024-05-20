import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import CAlert from '/src/components/atoms/CAlert';
import MoneyInput from '/src/components/ui/MoneyInput';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { StepProps, FormValues3, schemaStep3 } from './CreationConcepts';
import ConceptButton from './ConceptButton';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

export function Step3Form({ setData, onNext, onBack, formData }: StepProps<FormValues3>) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName('dashboard: Concept | New Concept P2A.2 Recargos');
  const formStep3 = useForm<FormValues3>({
    resolver: zodResolver(schemaStep3),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      month_offset: formData?.month_offset,
      has_surcharge: `${formData?.has_surcharge}`,
      interest_type: formData?.interest_type,
      interest_value: formData?.interest_value,
      compounding: formData?.compounding,
    },
  });
  const onSubmit = (data: FormValues3) => {
    setData(data);
    onNext();
  };
  const { errors } = formStep3.formState;

  return (
    <form onSubmit={formStep3.handleSubmit(onSubmit)}>
      <div className="pb-10 min-h-[82vh]">
        <div className="pb-6 pt-5 bg-white sticky top-0 z-20">
          <h1 className="font-bold text-xl text-black">Recargos</h1>
          <span className="text-sm text-[#637381]">
            Define el recargo que se aplicará al concepto cuando se encuentra vencido.
          </span>
        </div>
        <div>
          <CAlert type="info" message="Si tienes un requerimiento especial, contáctanos por el chat." />
        </div>
        <div className="mt-8">
          <Controller
            control={formStep3.control}
            name="has_surcharge"
            render={({ field: { onChange } }) => (
              <RadioGroup
                onValueChange={onChange}
                error={errors.has_surcharge ? 'Campo requerido' : ''}
                defaultValue={formData?.has_surcharge ? `${formData?.has_surcharge}` : 'false'}
              >
                <span className="font-semibold text-base">
                  ¿El concepto generará recargos si no se paga antes de la fecha de vencimiento?
                </span>
                <div className="flex flex-row">
                  <div className="flex items-center mr-6 ml-2 space-x-2">
                    <RadioGroupItem value="true" id="has_surcharge_yes" />
                    <Label htmlFor="has_surcharge_yes">Sí</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="has_surcharge_no" />
                    <Label htmlFor="has_surcharge_no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          />
        </div>
        {formStep3.watch('has_surcharge') === 'true' ? (
          <>
            <div className="mt-8">
              <span className="font-semibold text-base">
                ¿Cuántos días después de la fecha de vencimiento se generará el recargo?
              </span>
              <div className="mt-4 flex items-center">
                {/* <TextField
                      error={formStep3.formState.errors.month_offset?.message}
                      value={formStep3.watch('month_offset')}
                    >
                      <CustomInput {...formStep3.register('month_offset')} type="number" />
                    </TextField> */}
                <div className="max-w-[80px]">
                  <Controller
                    control={formStep3.control}
                    name="month_offset"
                    render={({ field }) => (
                      <MoneyInput
                        {...field}
                        decimalScale={0}
                        label=""
                        max={100}
                        errorClassNames="min-w-[220px]"
                        error={errors.month_offset ? 'La cantidad de días debe ser mayor a 0' : ''}
                      />
                    )}
                  />
                </div>
                <span className="col-span-2 ml-3 text-base font-normal text-[#637381]">
                  días después de la fecha de vencimiento
                </span>
              </div>
              <div className="mt-8">
                <Controller
                  control={formStep3.control}
                  name="interest_type"
                  render={({ field: { onChange, value } }) => (
                    <RadioGroup onValueChange={onChange} value={value} error={errors?.interest_type?.message}>
                      <span className="font-semibold text-base">¿Cómo deseas que sea el recargo generado?</span>
                      <div className="flex flex-row">
                        <div className="flex items-center mr-6 ml-2 space-x-2">
                          <RadioGroupItem value="PERCENT" id="discount_percent" />
                          <Label htmlFor="discount_percent">Porcentual(%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="AMOUNT" id="discount_amount" />
                          <Label htmlFor="discount_amount">Monto (Pesos mexicanos)</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="mt-8">
                <span className="font-semibold text-base">¿Cuánto es el recargo que se debe aplicar?</span>
              </div>
              <div className="mt-4 grid grid-cols-3 items-center">
                <TextField
                  error={formStep3.formState.errors.interest_value ? 'El valor del recargo debe ser mayor a 0' : ''}
                  value={formStep3.watch('interest_value')}
                  errorClassNames="ml-[-17px] min-w-[220px]"
                  unitType={formStep3.watch('interest_type') === 'PERCENT' ? '%' : '$'}
                >
                  <CustomInput {...formStep3.register('interest_value')} type="number" />
                </TextField>
              </div>
            </div>
            <div className="mt-8">
              <Controller
                control={formStep3.control}
                name="compounding"
                render={({ field: { onChange, value } }) => (
                  <>
                    <RadioGroup onValueChange={onChange} value={value}>
                      <span className="font-semibold text-base">¿Cuántas veces se debe aumentar el recargo?</span>
                      <div className="flex flex-wrap">
                        <div className="flex items-center min-w-[130px]  flex-1 gap-4">
                          <RadioGroupItem value="SINGLE" id="surcharge_compounding" />
                          <Label className="whitespace-nowrap" htmlFor="surcharge_compounding">
                            Una única vez
                          </Label>
                        </div>
                        <div className="flex items-center min-w-[130px]  flex-1 gap-4">
                          <RadioGroupItem value="DAILY" id="surcharge_daily" />
                          <Label className="whitespace-nowrap" htmlFor="surcharge_daily">
                            Cada día
                          </Label>
                        </div>
                        <div className="flex items-center min-w-[130px]  flex-1 gap-4">
                          <RadioGroupItem value="WEEKLY" id="surcharge_weekly" />
                          <Label className="whitespace-nowrap" htmlFor="surcharge_weekly">
                            Cada semana
                          </Label>
                        </div>
                        <div className="flex items-center min-w-[130px] mt-4 flex-1 gap-4">
                          <RadioGroupItem value="MONTHLY" id="surcharge_montly" />
                          <Label className="whitespace-nowrap" htmlFor="surcharge_montly">
                            Cada mes
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {errors.compounding && (
                      <p className="text-red-500 text-xs mt-1">La cantidad de días debe ser mayor a 0"</p>
                    )}
                  </>
                )}
              />
            </div>
          </>
        ) : null}
      </div>
      <ConceptButton
        onBack={() => {
          onBack();
        }}
        // className='abosolute bottom-0'
      />
    </form>
  );
}
