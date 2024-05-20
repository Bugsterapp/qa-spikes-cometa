import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import TextField from '/src/components/CustomFormTexField';
import TextAreaGrow from 'src/components/atoms/TextAreaGrow/TextAreaGrow';
import Dialog from '/src/components/atoms/Dialog';
import MoneyInput from '../../ui/MoneyInput';
import { cn } from '/src/utils/cn';

type DialogFormSpecialDiscountProps = {
  finalAmount: string;
  onSubmitDiscount?: (data: { name: string; discount: number }) => void;
  setOpenSpecialDiscount: (openSpecialDiscount: boolean) => void;
  optional?: boolean;
};

export const DialogFormSpecialDiscount = forwardRef<HTMLFormElement, DialogFormSpecialDiscountProps>(
  ({ finalAmount, onSubmitDiscount, optional, setOpenSpecialDiscount }, ref) => {
    const schema = z.object({
      name: z
        .string()
        .min(1, 'Debes completar este campo para continuar.')
        .max(70, 'Solo puedes escribir hasta 70 caracteres.'),
      discount: z.coerce
        .number()
        .positive('Ingresa un descuento mayor a $0.00 para continuar.')
        .max(
          optional ? parseFloat(finalAmount) - 1 : parseFloat(finalAmount),
          optional ? 'El total a pagar no puede ser menor a $1.' : 'No puedes ingresar un monto mayor al total a pagar.'
        ),
    });

    const [charCount, setCharCount] = useState<number>(0);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const textarea = textAreaRef.current;

    type FormValues = z.infer<typeof schema>;

    const onSubmit = (data: FormValues) => {
      setOpenSpecialDiscount(false);
      onSubmitDiscount && onSubmitDiscount(data);
    };

    const {
      formState: { errors },
      handleSubmit,
      watch,
      control,
    } = useForm<FormValues>({
      defaultValues: {
        name: '',
        discount: 0,
      },
      resolver: zodResolver(schema),
      mode: 'onChange',
    });

    return (
      <div className="max-w-[385px] w-screen">
        <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-5">
            <div className={`${errors.name?.message?.includes('completar') ? 'mb-5' : ''} flex flex-col`}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label="Motivo"
                    value={watch('name')}
                    error={errors.name?.message}
                    textareaGrow
                    className="p-0 items-center text-base text-[#212B36] border-none"
                  >
                    <TextAreaGrow
                      {...field}
                      ref={textAreaRef}
                      className={cn(
                        'w-full h-[54px] resize-none py-3.5 placeholder-transparent focus:placeholder-gray-500 overflow-hidden focus:border-green outline-none text-base peer rounded-lg z-[2] bg-transparent ring-0 focus:ring-0',
                        {
                          'border-red-500 focus:border-red-500': errors.name,
                        }
                      )}
                      onChange={(value) => {
                        if (textarea) {
                          textarea.style.height = '56px';
                          textarea.style.height = `${textarea.scrollHeight}px`;
                        }
                        const newText = value.target.value;
                        setCharCount(newText.length);
                        field.onChange(value);
                      }}
                      errors={!!errors.name}
                    />
                  </TextField>
                )}
              />
              {errors.name?.message?.includes('70') && (
                <div className="mt-1 self-end">
                  {/* <span>{errors.name?.message}</span> */}
                  <span className="text-xs text-[#637381]">{charCount}/70</span>
                </div>
              )}
            </div>
            <div className="my-5">
              <Controller
                control={control}
                name="discount"
                render={({ field }) => (
                  <MoneyInput
                    prefix="$"
                    label="Monto a descontar"
                    {...field}
                    step="0.01"
                    error={errors.discount?.message}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-center gap-x-10">
            <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
              Cancelar
            </Dialog.Close>

            <button
              className="text-white font-bold py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D] disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              // disabled={loading}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    );
  }
);
