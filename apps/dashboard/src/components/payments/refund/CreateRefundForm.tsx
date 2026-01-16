import {
  InvoiceActionEnum,
  PayinFulfillmentDetail,
  CreateRefundDashboardRequestDTOPaymentMethodEnum,
  Payin,
  StatusCf3Enum,
} from '@cometa/trpc/src/types';
import { ChangeEvent, forwardRef, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { formatDateShort, formatPrice } from '/src/utils/general';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import Button from '../../organisms/dashboard/Button';
import { CalendarIcon } from 'lucide-react';
import { endOfMonth, format } from 'date-fns';
import Select from '../../Select';
import TextField from '/src/components/CustomFormTexField';
import TextAreaGrow from '/src/components/atoms/TextAreaGrow/TextAreaGrow';
import { Label } from '../../ui/Label';
import CustomInput from '../../CustomInput';
import CheckBox from '../../atoms/CheckBox';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { cn } from '@cometa/utils';
import { Calendar } from '@cometa/recreo';

export const paymentMethodsRefund = [
  { label: 'Efectivo', value: CreateRefundDashboardRequestDTOPaymentMethodEnum.Cash },
  { label: 'Transferencia bancaria', value: CreateRefundDashboardRequestDTOPaymentMethodEnum.Transfer },
  { label: 'Tarjeta de crédito', value: CreateRefundDashboardRequestDTOPaymentMethodEnum.CreditCard },
  { label: 'Tarjeta de débito', value: CreateRefundDashboardRequestDTOPaymentMethodEnum.DebitCard },
  { label: 'Por Definir', value: CreateRefundDashboardRequestDTOPaymentMethodEnum.ToDefine },
];

export enum unassignconceptEnum {
  unassingConcept = 'unassing_concept',
  notUnassignConcept = 'not_unassing_concept',
}

const schema = z.object({
  id: z.number(),
  invoiceAction: z.nativeEnum(InvoiceActionEnum).default(InvoiceActionEnum.NoAction),
  comment: z
    .string()
    .min(1, { message: 'Debes completar este campo para continuar' })
    .max(70, { message: 'Solo puedes escribir hasta 70 caracteres.' }),
  paymentMethod: z.nativeEnum(CreateRefundDashboardRequestDTOPaymentMethodEnum),
  amount: z.number({ invalid_type_error: 'Falta completar este campo' }).positive('El precio debe ser mayor a 0'),
  registeredAt: z.date(),
  unassignConcept: z.nativeEnum(unassignconceptEnum).default(unassignconceptEnum.notUnassignConcept),
});

export type CreateRefundFormSchema = z.infer<typeof schema>;

interface CreateRefundFormProps {
  payinFulfillments: PayinFulfillmentDetail[];
  payins: Payin[];
  onSubmit: (data: CreateRefundFormSchema) => void;
  onValidChange?: (value: boolean) => void;
  disabled?: boolean;
}

const CreateRefundForm = forwardRef<HTMLFormElement, CreateRefundFormProps>(
  ({ payinFulfillments, payins, disabled, onValidChange, onSubmit }, ref) => {
    const { control, setValue, watch, register, formState, handleSubmit, resetField } = useForm<CreateRefundFormSchema>(
      {
        resolver: zodResolver(schema),
        defaultValues: {
          id: payinFulfillments.find((pf) => !pf.refund)?.id ?? payinFulfillments[0].id,
          invoiceAction: InvoiceActionEnum.NoAction,
          unassignConcept: unassignconceptEnum.notUnassignConcept,
        },
      }
    );

    const [charCount, setCharCount] = useState(0);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const textarea = textAreaRef.current;
    const selectedPF = payinFulfillments.find((pf) => pf.id === watch('id')) ?? payinFulfillments[0];

    const onChangeAmount = (event: ChangeEvent<HTMLInputElement>) => {
      const restAmount = +selectedPF.total_paid;
      const inputNumber = event?.target?.valueAsNumber;
      const option = {
        shouldDirty: true,
        shouldValidate: true,
      };
      if (inputNumber >= restAmount) {
        setValue('amount', restAmount, option);
      } else if (inputNumber < 0) {
        setValue('amount', 0, option);
      } else {
        setValue('amount', inputNumber, option);
      }
    };

    useEffect(() => {
      if (onValidChange) onValidChange(formState.isValid);
    }, [formState.isValid, onValidChange]);

    const withOutInvoiceEmited = !selectedPF.invoice || selectedPF.invoice.status !== StatusCf3Enum.Success;

    return (
      <form ref={ref} className="py-5 space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="px-8 space-y-6">
          <div className="space-y-2.5">
            <h6>Información del pago</h6>
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(+value);
                    resetField('amount');
                    resetField('invoiceAction');
                    resetField('unassignConcept');
                    resetField('registeredAt');
                  }}
                  value={field.value.toString()}
                >
                  {payinFulfillments.map((payinFulfillment) => {
                    const payin = payins.find((p) => p.id === payinFulfillment.payin);
                    if (!payin) return null;

                    return (
                      <div
                        key={payinFulfillment.id}
                        className="px-4 py-3.5 rounded-lg bg-[#F4F6F8] flex flex-row justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <span className="text-[11px] font-lota text-[#637381]">
                            {payinFulfillment.paid_date ? formatDateShort(payinFulfillment.paid_date, true) : '-'}
                          </span>
                          <span className="text-sm font-semibold text-[#5A5D72]">
                            ID: <span className="text-[#212B36]">{payin.correlative_id}</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-lota text-[#637381]">Monto pagado</span>
                          <span className="font-lota text-sm font-semibold text-[#212B36]">
                            {formatPrice(payinFulfillment.total_paid, 'MXN')}
                          </span>
                        </div>
                        {payinFulfillments.length > 1 ? (
                          <>
                            {payinFulfillment.refund ? (
                              <div className="flex flex-col items-end">
                                <span className="text-[11px] font-semibold font-lota text-[#B78103]">Devuelto</span>
                                <span className="font-lota text-sm font-semibold text-[#637381]">
                                  {formatPrice(payinFulfillment.refund.amount, 'MXN')}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-2">
                                <RadioGroupItem
                                  value={payinFulfillment.id.toString()}
                                  id={`pf-radio-${payinFulfillment.id}`}
                                  data-testid={`pf-radio-${payinFulfillment.id}`}
                                  disabled={disabled}
                                />
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </div>
          <div className="space-y-6">
            <span>Ingresa los datos para la devolución</span>
            <Controller
              control={control}
              name="registeredAt"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger type="button" asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full relative justify-start text-left font-normal rounded-md border-gray-300 mt-2 border h-14',
                        {
                          'text-muted-foreground': !field.value,
                        }
                      )}
                      disabled={disabled}
                    >
                      <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de devolución</p>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span className="text-base">
                        {field.value ? format(field.value, 'dd / MM / yyyy') : <span>Selecciona una fecha</span>}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      fromDate={new Date(selectedPF.paid_date)}
                      toMonth={endOfMonth(new Date())}
                      showOutsideDays
                      fixedWeeks={false}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <div className="flex flex-row gap-x-6">
              <Controller
                control={control}
                name="paymentMethod"
                disabled={disabled}
                render={({ field }) => (
                  <Select
                    placeholder="Método de pago"
                    className="w-full h-[54px]"
                    containerClassName="w-full"
                    {...field}
                    onValueChange={field.onChange}
                    error={formState.errors.paymentMethod?.message}
                  >
                    <Select.Content className="flex flex-col w-full rounded-lg">
                      {paymentMethodsRefund.map((method) => (
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
                  disabled={disabled}
                />
              </TextField>
            </div>
            <div className="flex flex-col">
              <Controller
                control={control}
                disabled={disabled}
                name="comment"
                render={({ field }) => (
                  <TextField
                    label="Motivo"
                    value={watch('comment')}
                    error={formState.errors.comment?.message}
                    textareaGrow
                    className={cn('p-0 items-center text-base text-[#212B36] border-none', {
                      'mb-7': formState.errors.comment?.message,
                    })}
                  >
                    <TextAreaGrow
                      {...field}
                      className="border-[#919EAB52]"
                      ref={textAreaRef}
                      onChange={(value: React.ChangeEvent<HTMLTextAreaElement>) => {
                        if (textarea) {
                          textarea.style.height = '56px';
                          textarea.style.height = `${textarea.scrollHeight}px`;
                        }
                        const newText = value.target.value;
                        setCharCount(newText.length);
                        field.onChange(value);
                      }}
                      errors={!!formState.errors.comment?.message}
                    />
                  </TextField>
                )}
              />
              {formState.errors.comment?.message?.includes('70') && (
                <div className="-mt-[16px] self-end">
                  <span className="text-xs text-[#637381]">{charCount}/70</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {payinFulfillments.length > 1 ? null : (
          <div className="px-8 space-y-4">
            <div className="space-y-1">
              <h6 className="font-semibold">¿Quieres que el concepto sea desasignado para el estudiante?</h6>
            </div>
            <Controller
              control={control}
              disabled={disabled}
              defaultValue={unassignconceptEnum.notUnassignConcept}
              name="unassignConcept"
              render={({ field: { onChange, value } }) => (
                <RadioGroup onValueChange={onChange} value={value}>
                  <div className="flex items-start gap-8 px-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value={unassignconceptEnum.notUnassignConcept}
                        id="not_unassing_concept"
                        data-testid="not_unassing_concept-radio"
                      />
                      <Label htmlFor="not_unassing_concept" className="text-[#212B36]">
                        No
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value={unassignconceptEnum.unassingConcept}
                        id="unassing_concept"
                        data-testid="unassing_concept-radio"
                      />
                      <Label htmlFor="unassing_concept" className="text-[#212B36]">
                        Sí
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}
        <div className="px-8 space-y-4">
          <div className="space-y-1">
            <h6 className="font-semibold">
              ¿Quieres realizar alguna acción de facturación? <span className="italic font-normal">(opcional)</span>
            </h6>
            {withOutInvoiceEmited && (
              <span className="text-sm italic text-[#637381] block">
                Actualmente no tienes una factura emitida para cancelar.
              </span>
            )}
          </div>
          <Controller
            control={control}
            disabled={disabled}
            defaultValue={InvoiceActionEnum.NoAction}
            name="invoiceAction"
            render={({ field }) => (
              <div className="flex flex-row text-base gap-x-4">
                <div className="flex items-center pr-3 gap-x-1">
                  <CheckBox
                    className="m-2"
                    id="credit_note"
                    data-testid="credit_note-checkbox"
                    onChange={(event) => {
                      if (event.target.checked) field.onChange(InvoiceActionEnum.EmitCreditNote);
                    }}
                    onClick={() => {
                      if (field.value === InvoiceActionEnum.EmitCreditNote) field.onChange(InvoiceActionEnum.NoAction);
                    }}
                    checked={field.value === InvoiceActionEnum.EmitCreditNote}
                    disabled={withOutInvoiceEmited || field.disabled}
                  />
                  <Label
                    htmlFor="credit_note"
                    className={cn('font-normal', {
                      'text-[#919EAB]': withOutInvoiceEmited || field.disabled,
                    })}
                  >
                    Emitir nota de crédito
                  </Label>
                </div>
                <div className="flex items-center pr-3 gap-x-1">
                  <CheckBox
                    className="m-2 peer"
                    id="cancel_invoice"
                    data-testid="cancel_invoice-checkbox"
                    onChange={(event) => {
                      if (event.target.checked) field.onChange(InvoiceActionEnum.Cancel);
                    }}
                    onClick={() => {
                      if (field.value === InvoiceActionEnum.Cancel) field.onChange(InvoiceActionEnum.NoAction);
                    }}
                    checked={field.value === InvoiceActionEnum.Cancel}
                    disabled={withOutInvoiceEmited || field.disabled}
                  />
                  <Label
                    htmlFor="cancel_invoice"
                    className={cn('font-normal', {
                      'text-[#919EAB]': withOutInvoiceEmited || field.disabled,
                    })}
                  >
                    Cancelar factura
                  </Label>
                </div>
              </div>
            )}
          />
        </div>
      </form>
    );
  }
);

export default CreateRefundForm;
