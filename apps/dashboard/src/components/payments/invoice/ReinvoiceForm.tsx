import { Controller, useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import IcExclamation from 'public/assets/icons/ic_exclamation_16.svg';
import { DashboardStudent } from '@cometa/trpc/src/types';
import SelectAndVerifyRFC from './SelectAndVerifyRFC';
import { forwardRef, useEffect } from 'react';
import { Tooltip } from 'src/components/atoms/Tooltip';
import CAlert from '../../atoms/CAlert';
import TextAreaGrow from '../../atoms/TextAreaGrow/TextAreaGrow';
import { TextField } from '@cometa/recreo';

const schema = z.object({
  with_relation: z.enum(['with_relation', 'without_relation']),
  observations: z.string().optional(),
});

export type ReinvoiceFormSchema = z.infer<typeof schema>;

interface ReinvoiceFormProps {
  disabledWithRelation?: boolean;
  disabledWithOutRelation?: boolean;
  student?: DashboardStudent;
  studentLoading: boolean;
  open?: boolean;
  disabledVerifyRFC?: boolean;
  setRFCError?: (value: boolean) => void;
  onValidChange?: (value: boolean) => void;
  onSubmit: (data: ReinvoiceFormSchema) => void;
}

const ReinvoiceForm = forwardRef<HTMLFormElement, ReinvoiceFormProps>(
  (
    {
      disabledWithOutRelation,
      disabledWithRelation,
      studentLoading,
      disabledVerifyRFC,
      open,
      onSubmit,
      onValidChange,
      setRFCError,
      student,
    },
    ref
  ) => {
    const { control, watch, handleSubmit, formState, register } = useForm<ReinvoiceFormSchema>({
      resolver: zodResolver(schema),
    });

    useEffect(() => {
      if (onValidChange) onValidChange(formState.isValid);
    }, [formState.isValid, onValidChange]);

    const emit_with = watch('with_relation');

    return (
      <form className="px-8 py-2.5 space-y-7" ref={ref} onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2.5">
          <h4 className="font-semibold">¿Cómo quieres refacturar?</h4>
          <Controller
            control={control}
            name="with_relation"
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                <div className="flex flex-row text-base gap-x-4">
                  <div className="flex items-center pr-3 gap-x-1">
                    <RadioGroupItem
                      className="m-2 peer"
                      value="with_relation"
                      id="type_with_relation"
                      data-testid="type_with_relation-radio"
                      disabled={disabledWithRelation}
                    />
                    <Label className="peer-disabled:text-gray-600" htmlFor="type_with_relation">
                      Con relación
                    </Label>
                  </div>
                  <div className="flex items-center pr-3 gap-x-1">
                    <RadioGroupItem
                      className="m-2 peer"
                      value="without_relation"
                      id="type_without_relation"
                      data-testid="type_without_relation-radio"
                      disabled={disabledWithOutRelation}
                    />
                    <Label className="peer-disabled:text-gray-600" htmlFor="type_without_relation">
                      Sin relación
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          />
          {disabledWithRelation && (
            <CAlert
              message="Solo puedes refacturar sin relación debido a que la refacturación será sobre una factura ya cancelada."
              className="text-start"
            />
          )}
          <div className="inline-flex items-center px-4 gap-x-2 text-[#717993] text-sm">
            ¿Qué es facturar sin relación?
            <Tooltip message="Cuando no se requiera relacionar con otra factura generada previamente.">
              <IcExclamation className="text-[#98A2B3]" />
            </Tooltip>
          </div>
        </div>
        {!!emit_with && (
          <SelectAndVerifyRFC
            disabled={disabledVerifyRFC}
            open={open}
            student={student}
            studentLoading={studentLoading}
            setRFCError={setRFCError}
          />
        )}
        {emit_with === 'without_relation' && (
          <div className="mb-auto">
            <TextField label="Comentario adicional" className="w-full" value={watch('observations')} textareaGrow>
              <TextAreaGrow id="observations" className="border-none" errors={false} {...register('observations')} />
            </TextField>
          </div>
        )}
      </form>
    );
  }
);

export default ReinvoiceForm;
