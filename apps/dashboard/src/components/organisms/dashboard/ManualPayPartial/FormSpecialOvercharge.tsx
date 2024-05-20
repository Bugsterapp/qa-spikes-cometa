import React, { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import TextField from '/src/components/CustomFormTexField';
import Dialog from '/src/components/atoms/Dialog';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { cn } from '/src/utils/cn';
import MoneyInput from '/src/components/ui/MoneyInput';
import TextAreaGrow from '/src/components/atoms/TextAreaGrow/TextAreaGrow';

type OverchargeForm = {
  name: string;
  specialValue: number;
  isVisible: boolean;
};

type IFormSpecialOvercharge = {
  setOpenSpecialOvercharge: (openOvercharge: boolean) => void;
  onSubmitOvercharge: (data: OverchargeForm) => void;
};

export const FormSpecialOvercharge = forwardRef<HTMLFormElement, IFormSpecialOvercharge>(
  ({ onSubmitOvercharge, setOpenSpecialOvercharge }, ref) => {
    const schema = z.object({
      name: z
        .string()
        .min(1, 'Debes completar este campo para continuar')
        .max(70, 'Solo puedes escribir hasta 70 caracteres.'),
      specialValue: z.coerce.number().positive('Ingresa un recargo mayor a $0.00 para continuar.'),
      isVisible: z.boolean().transform((val) => (val ? false : true)),
    });
    const [charCount, setCharCount] = useState<number>(0);

    type FormValues = z.infer<typeof schema>;

    const onSubmit = (data: FormValues) => {
      setOpenSpecialOvercharge(false);
      onSubmitOvercharge && onSubmitOvercharge(data);
    };
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const textarea = textAreaRef.current;

    const {
      formState: { errors },
      handleSubmit,
      watch,
      control,
    } = useForm<FormValues>({
      defaultValues: {
        name: '',
        specialValue: undefined,
        isVisible: false,
      },
      resolver: zodResolver(schema),
      mode: 'onChange',
    });
    return (
      <div className="max-w-[385px] w-screen">
        <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-5">
            <div className="flex flex-col">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label="Motivo"
                    value={watch('name')}
                    error={errors.name?.message}
                    textareaGrow
                    className={`${errors.name ? 'mb-7' : ''} p-0 items-center text-base text-[#212B36] border-none`}
                  >
                    <TextAreaGrow
                      {...field}
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
                      errors={!!errors.name?.message}
                    />
                  </TextField>
                )}
              />
              {errors.name?.message?.includes('70') && (
                <div className="-mt-[16px] self-end">
                  <span className="text-xs text-[#637381]">{charCount}/70</span>
                </div>
              )}
            </div>
            <div className="my-4">
              <Controller
                control={control}
                name="specialValue"
                render={({ field }) => (
                  <MoneyInput prefix="$" label="Monto a agregar" {...field} error={errors.specialValue?.message} />
                )}
              />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Controller
                control={control}
                name="isVisible"
                render={({ field: { onChange, value } }) => (
                  <label className="inline-flex items-center text-sm gap-3">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[#00AB55] rounded-md disabled:text-[#919EAB] "
                      checked={value}
                      onChange={(e) => {
                        onChange(e.target.checked);
                      }}
                    />
                    Agregar como recargo oculto
                  </label>
                )}
              />
              <Tooltip
                message="Los tutores no podrán ver el detalle
                del motivo y monto exacto a 
                agregar en el portal de Cometa; 
                sin embargo, el monto si será 
                agregado al total a pagar."
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn('cursor-pointer transition-opacity duration-300')}
                >
                  <g clip-path="url(#clip0_20014_2177)">
                    <path
                      d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0V0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                      fill="#98A2B3"
                    />
                    <path
                      d="M8.00017 3.33344C7.82335 3.33344 7.65378 3.40367 7.52876 3.5287C7.40373 3.65372 7.3335 3.82329 7.3335 4.0001V9.33343C7.3335 9.51025 7.40373 9.67981 7.52876 9.80484C7.65378 9.92986 7.82335 10.0001 8.00017 10.0001C8.17698 10.0001 8.34655 9.92986 8.47157 9.80484C8.5966 9.67981 8.66684 9.51025 8.66684 9.33343V4.0001C8.66684 3.82329 8.5966 3.65372 8.47157 3.5287C8.34655 3.40367 8.17698 3.33344 8.00017 3.33344Z"
                      fill="#98A2B3"
                    />
                    <path
                      d="M8.66684 12.0001C8.66684 11.6319 8.36836 11.3334 8.00017 11.3334C7.63197 11.3334 7.3335 11.6319 7.3335 12.0001C7.3335 12.3683 7.63197 12.6668 8.00017 12.6668C8.36836 12.6668 8.66684 12.3683 8.66684 12.0001Z"
                      fill="#98A2B3"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_20014_2177">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </Tooltip>
            </div>
          </div>
          <div className="flex justify-center gap-x-10">
            <Dialog.Close
              className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
              data-testid="cancel-button"
            >
              Cancelar
            </Dialog.Close>

            <button
              className="text-white font-bold py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-green shadow-[0_8px_16px_#00AB553D] disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              data-testid="add-button"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    );
  }
);
