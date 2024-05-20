import MoneyInput from '../../ui/MoneyInput';
import { FormValues8, StepProps, schemaStepSingleOrder } from './CreationConcepts';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ConceptButton from './ConceptButton';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { format, parseISO, isDate } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from './Button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../../ui/Calendar';
import { cn } from '/src/utils/cn';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

export function StepSingleOrder({ setData, onNext, onBack, formData }: StepProps<FormValues8>) {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName('dashboard: Concept | New Concept P2A.1.2 Single Order');
  const formSingleOrderStep = useForm<FormValues8>({
    resolver: zodResolver(schemaStepSingleOrder),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      due: formData?.due,
      price: formData?.price,
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="min-h-[82vh]">
        <div className="py-6 mb-4 sticky top-0 z-10 bg-white">
          <h1 className="font-bold text-xl text-black">Precio y vencimiento</h1>
          <span className="text-sm text-[#637381] ">Ingresa el precio y fecha de vencimiento del concepto</span>
        </div>
        <MoneyInput
          label="Precio"
          value={+formSingleOrderStep.watch('price')}
          onChange={(value) => {
            formSingleOrderStep.setValue('price', +value);
          }}
          prefix="MXN"
          error={formSingleOrderStep.formState.errors.price?.message}
        />

        <Controller
          control={formSingleOrderStep.control}
          name="due"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full relative h-14 flex items-center justify-between px-4 mt-4 border border-[#E5E7EB] rounded-lg',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value ? (
                    <span className="font-normal">
                      {format(isDate(field.value) ? field.value : parseISO(String(field.value)), 'PPP', { locale: es })}
                    </span>
                  ) : (
                    <span className="font-normal text-[#919EAB]">Selecciona una fecha</span>
                  )}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de vencimiento</p>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-lg">
                {/* only for testing purposes, this ts ignore will be removed before merging */}
                {/* @ts-ignore */}
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      <ConceptButton
        onBack={() => {
          onBack();
        }}
        textNext="Siguiente"
        onSubmit={() => {
          setData({
            due: formSingleOrderStep.watch('due'),
            price: formSingleOrderStep.watch('price'),
          });
          onNext();
        }}
        disabledNext={!formSingleOrderStep.watch('due') || !formSingleOrderStep.watch('price')}
      />
    </div>
  );
}
