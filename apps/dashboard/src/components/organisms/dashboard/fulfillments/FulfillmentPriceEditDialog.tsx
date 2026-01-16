import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import TextAreaGrow from 'src/components/atoms/TextAreaGrow/TextAreaGrow';
import Dialog from '/src/components/atoms/Dialog';
import TextField from '/src/components/CustomFormTexField';
import { Button } from '/src/components/ui/Button';
import MoneyInput from '/src/components/ui/MoneyInput';
import { cn } from '/src/utils/cn';
import { formatPrice } from '/src/utils/general';
import ICWarning from '/public/assets/icons/ic_warning.svg';

type FulfillmentPriceEditDialogProps = {
  amount: number;
  originalAmount?: number;
  onDone?: (data: { comment?: string; newAmount: number }, skipSponsoredValidation?: boolean) => void;
  setOpen: (value: boolean) => void;
  onAmountChange?: (value: number) => void;
  sponsoredPaymentError?: {
    show: boolean;
    message: string;
    details: any;
  };
  isLoading?: boolean;
};

export const FulfillmentPriceEditDialog = forwardRef<HTMLFormElement, FulfillmentPriceEditDialogProps>(
  ({ amount, originalAmount, onDone, onAmountChange, sponsoredPaymentError, isLoading }, ref) => {
    const schema = z.object({
      comment: z.string().max(70, 'Solo puedes escribir hasta 70 caracteres.').optional(),
      newAmount: z.coerce.number().min(0, 'El nuevo precio debe ser mayor o igual a cero.'),
    });
    type FormValues = z.infer<typeof schema>;

    const [charCount, setCharCount] = useState<number>(0);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const textarea = textAreaRef.current;

    const onSubmit = (data: FormValues) => {
      onDone?.(data, sponsoredPaymentError?.show);
    };

    const {
      formState: { errors },
      handleSubmit,
      watch,
      control,
    } = useForm<FormValues>({
      resolver: zodResolver(schema),
      mode: 'onChange',
    });

    const newAmount = watch('newAmount');
    const diff = (originalAmount as number) - amount;
    const result = newAmount == undefined ? amount : newAmount - diff;

    return (
      <div className="max-w-[385px] w-screen">
        <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-5">
            <div className="my-5">
              <Controller
                control={control}
                name="newAmount"
                render={({ field }) => (
                  <MoneyInput
                    prefix="$"
                    label="Nuevo precio"
                    {...field}
                    step="0.01"
                    error={errors.newAmount?.message}
                    disabled={isLoading}
                    onChange={(value) => {
                      onAmountChange?.(Number(value));
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </div>

            <div className={`${errors.comment?.message?.includes('completar') ? 'mb-5' : ''} flex flex-col`}>
              <Controller
                control={control}
                name="comment"
                render={({ field }) => (
                  <TextField
                    label="Comentario (opcional)"
                    value={watch('comment')}
                    error={errors.comment?.message}
                    textareaGrow
                    className="p-0 items-center text-sm	 text-[#212B36] border-none"
                  >
                    <TextAreaGrow
                      {...field}
                      ref={textAreaRef}
                      className={cn(
                        'w-full h-[54px] resize-none py-3.5 placeholder-transparent focus:placeholder-gray-500 overflow-hidden focus:border-green outline-none text-sm peer rounded-lg z-[2] bg-transparent ring-0 focus:ring-0',
                        {
                          'border-red-500 focus:border-red-500': errors.comment,
                          'opacity-50 cursor-not-allowed': isLoading,
                        }
                      )}
                      disabled={isLoading}
                      onChange={(value) => {
                        if (textarea) {
                          textarea.style.height = '56px';
                          textarea.style.height = `${textarea.scrollHeight}px`;
                        }
                        const newText = value.target.value;
                        setCharCount(newText.length);
                        field.onChange(value);
                      }}
                      errors={!!errors.comment}
                    />
                  </TextField>
                )}
              />
              {errors.comment?.message?.includes('70') && (
                <div className="mt-1 self-end">
                  <span>{errors.comment?.message}</span>
                  <span className="text-xs text-[#637381]">{charCount}/70</span>
                </div>
              )}
            </div>
          </div>

          {sponsoredPaymentError?.show && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <ICWarning className="w-6 h-6 flex-shrink-0" />
                <div className="ml-3">
                  <div className="text-sm text-amber-700 text-left">
                    <p className="font-bold">Estás a punto de generar un pago patrocinado.</p>
                    <p className="mt-2 font-medium">
                      Esto significa que este estudiante no tendrá que pagar nada por esta orden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={cn('mb-4 py-4 px-4 rounded-lg flex justify-between items-center', {
              'bg-sky-100': result >= 0,
              'bg-yellow-200': result < 0,
            })}
          >
            <div className="text-left">
              <p className={cn('text-xs text-bold pb-1', { 'text-gray-700': result < 0 })}>Total pendiente de pago:</p>
              <p className="text-xs">(Incluido pagos parciales, dctos y recargos)</p>
            </div>
            <div className={cn('font-bold text-gray-600 text-base', { 'text-gray-700': result < 0 })}>
              {formatPrice(result)}
            </div>
          </div>

          <div className="flex justify-center gap-x-10">
            <Dialog.Close
              className={cn(
                'text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap',
                {
                  'opacity-50 cursor-not-allowed pointer-events-none': isLoading,
                }
              )}
              disabled={isLoading}
            >
              Cancelar
            </Dialog.Close>

            <Button
              className={cn(
                'text-white font-bold py-2 px-8 rounded-lg text-sm whitespace-nowrap shadow-[0_8px_16px_#00AB553D] disabled:cursor-not-allowed disabled:opacity-50',
                {
                  'bg-green hover:bg-green-800': !sponsoredPaymentError?.show,
                  'bg-amber-600 hover:bg-amber-700 shadow-[0_8px_16px_rgba(245,158,11,0.24)]':
                    sponsoredPaymentError?.show,
                }
              )}
              type="submit"
              disabled={isLoading || (result < 0 && !sponsoredPaymentError?.show)}
            >
              {isLoading ? (
                <img src="/assets/oval.svg" alt="loading" className="mx-auto h-5" />
              ) : sponsoredPaymentError?.show ? (
                'Confirmar pago patrocinado'
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);
