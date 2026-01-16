import { Controller, useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import TextField from 'src/components/CustomFormTexField';
import CustomInput from 'src/components/CustomInput';
import Select from '../../Select';
import { CreateDashboardCreditNoteRequestDTOPaymentMethodEnum, DashboardStudent } from '@cometa/trpc/src/types';
import { ChangeEvent, forwardRef, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SelectAndVerifyRFC from './SelectAndVerifyRFC';
import TextAreaGrow from '../../atoms/TextAreaGrow/TextAreaGrow';

const paymentMethods = [
  { label: 'Efectivo', value: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum.Value01 },
  { label: 'Transferencia bancaria', value: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum.Value03 },
  { label: 'Tarjeta de crédito', value: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum.Value04 },
  { label: 'Tarjeta de débito', value: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum.Value28 },
  { label: 'Por Definir', value: CreateDashboardCreditNoteRequestDTOPaymentMethodEnum.Value99 },
];

const schema = z.object({
  type: z.enum(['total', 'partial']),
  payment_method: z.nativeEnum(CreateDashboardCreditNoteRequestDTOPaymentMethodEnum),
  amount: z.number({ invalid_type_error: 'Falta completar este campo' }).positive('El precio debe ser mayor a 0'),
  observations: z.string().optional(),
});

export type CreateCreditNoteFormSchema = z.infer<typeof schema>;

interface CreateCreditNoteFormProps {
  amount: number;
  amountInCreditNotes: number;
  clientIdentifier: string;
  student?: DashboardStudent;
  studentLoading: boolean;
  open?: boolean;
  disabledVerifyRFC?: boolean;
  setRFCError?: (value: boolean) => void;
  onValidChange?: (value: boolean) => void;
  onSubmit: (data: CreateCreditNoteFormSchema) => void;
}

const CreateCreditNoteForm = forwardRef<HTMLFormElement, CreateCreditNoteFormProps>(
  (
    {
      amount,
      amountInCreditNotes,
      clientIdentifier,
      studentLoading,
      disabledVerifyRFC,
      open,
      setRFCError,
      student,
      onValidChange,
      onSubmit,
    },
    ref
  ) => {
    const { control, setValue, watch, register, resetField, formState, handleSubmit } =
      useForm<CreateCreditNoteFormSchema>({
        resolver: zodResolver(schema),
      });

    const canMarkTotal = amountInCreditNotes === 0;

    const onChangeAmount = (event: ChangeEvent<HTMLInputElement>) => {
      const restAmount = amount - amountInCreditNotes;
      const inputNumber = event?.target?.valueAsNumber;
      const option = {
        shouldDirty: true,
        shouldValidate: true,
      };
      if (inputNumber >= restAmount) {
        restAmount === amount ? setValue('amount', restAmount - 0.01, option) : setValue('amount', restAmount, option);
      } else if (inputNumber < 0) {
        setValue('amount', 0, option);
      } else {
        setValue('amount', inputNumber, option);
      }
    };

    const showForm = !!watch('type');
    const disabledAmount = watch('type') === 'total';

    useEffect(() => {
      const subscription = watch((value, { name, type }) => {
        if (name === 'type' && type === 'change') {
          value.type === 'total'
            ? setValue('amount', amount, { shouldDirty: true, shouldValidate: true })
            : resetField('amount');
        }
      });
      return () => subscription.unsubscribe();
    }, [watch, amount, resetField, setValue]);

    useEffect(() => {
      if (onValidChange) onValidChange(formState.isValid);
    }, [formState.isValid, onValidChange]);

    return (
      <form ref={ref} className="px-8 py-2.5 space-y-7" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          <div className="space-y-5">
            <div className="flex flex-row items-center justify-between">
              <span className="text-xl font-bold">Crear nota de crédito</span>
              <div className="rounded-lg border border-[#919EAB3D] py-1 px-2 text-[#637381]">
                Factura relacionada: <span className="text-[#000E5F]">{clientIdentifier}</span>
              </div>
            </div>
            <div className="text-sm text-[#637381]">
              Seleccione primero si la nota de crédito será completa o parcial.
            </div>
          </div>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value} ref={field.ref}>
                <div className="flex flex-row text-base gap-x-4">
                  <div className="flex items-center pr-3 gap-x-1">
                    <RadioGroupItem
                      className="m-2 peer"
                      value="total"
                      id="type_total"
                      data-testid="type_total-radio"
                      disabled={!canMarkTotal}
                    />
                    <Label className="m-2 peer-disabled:text-gray-600" htmlFor="type_total">
                      Completa
                    </Label>
                  </div>
                  <div className="flex items-center pr-3 gap-x-1">
                    <RadioGroupItem
                      className="m-2"
                      value="partial"
                      id="type_partial"
                      data-testid="type_partial-radio"
                    />
                    <Label htmlFor="type_partial">Parcial</Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          />
          {showForm && (
            <div className="flex flex-row items-center w-full gap-x-4">
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <Select
                    placeholder="Método de pago"
                    className="w-full h-[54px]"
                    containerClassName="w-full"
                    {...field}
                    onValueChange={field.onChange}
                    error={formState.errors.payment_method?.message}
                  >
                    <Select.Content className="flex flex-col w-full rounded-lg">
                      {paymentMethods.map((method) => (
                        <Select.Item className="w-full" value={method.value} key={method.label}>
                          {method.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
              <TextField
                className="w-full h-[54px] rounded-lg"
                LeftIcon="$"
                label="Monto"
                value={watch('amount')}
                error={formState.errors.amount?.message}
              >
                <CustomInput
                  {...register('amount')}
                  onBlur={onChangeAmount}
                  onChange={onChangeAmount}
                  type="number"
                  step="0.01"
                  disabled={disabledAmount}
                />
              </TextField>
            </div>
          )}
        </div>
        {showForm && (
          <SelectAndVerifyRFC
            disabled={disabledVerifyRFC}
            open={open}
            student={student}
            studentLoading={studentLoading}
            setRFCError={setRFCError}
          />
        )}
        <div className="mb-auto">
          <TextField label="Comentario adicional" className="w-full" value={watch('observations')} textareaGrow>
            <TextAreaGrow id="observations" className="border-none" errors={false} {...register('observations')} />
          </TextField>
        </div>
      </form>
    );
  }
);

export default CreateCreditNoteForm;
