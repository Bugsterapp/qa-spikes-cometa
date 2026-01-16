import React, { forwardRef, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../Button';
import TextAreaGrow from '/src/components/atoms/TextAreaGrow/TextAreaGrow';
import { format, isDate, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import CalendarIcon from 'public/assets/icons/ic_calendar.svg';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { cn } from '@cometa/utils';
import TextField from '/src/components/CustomFormTexField';
import { Calendar } from '@cometa/recreo';
import Alert from '/src/components/ui/Alert';

type DueDateForm = {
  newDueDate: Date;
  comment?: string | undefined;
};

type IFormEditDueDate = {
  currentDueDate: Date | undefined;
  onSubmitDueDate: (data: DueDateForm) => void;
  setOpenEditDateDialog: (open: boolean) => void;
  isLoading: boolean;
};

export const FormEditDueDate = forwardRef<HTMLFormElement, IFormEditDueDate>(
  ({ currentDueDate, onSubmitDueDate, setOpenEditDateDialog, isLoading }, ref) => {
    const schema = z.object({
      newDueDate: z.date(),
      comment: z.string().optional(),
    });
    type FormValues = z.infer<typeof schema>;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = useForm<FormValues>({
      defaultValues: {
        newDueDate: currentDueDate || new Date(),
        comment: '',
      },
      resolver: zodResolver(schema),
    });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const onSubmit = (data: FormValues) => {
      onSubmitDueDate(data);
    };
    return (
      <div className="max-w-[385px] w-screen">
        <form ref={ref} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mb-5">
            <Controller
              control={control}
              name="newDueDate"
              render={({ field }) => (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full relative text-left font-normal text-[#9DA9B4] rounded-lg flex justify-between border border-[#919EAB52] pr-2 pl-3',
                        !field.value && 'text-muted-foreground'
                      )}
                      onClick={() => setIsCalendarOpen(true)}
                    >
                      {field.value ? (
                        format(isDate(field.value) ? field.value : parseISO(String(field.value)), 'PPP', { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="w-5 h-5 fill-[#919EAB]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-[52] rounded-3xl">
                    <Calendar
                      mode="single"
                      defaultMonth={currentDueDate}
                      selected={field.value}
                      fromDate={currentDueDate}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <div className="mt-4 mb-6">
              <Controller
                control={control}
                name="comment"
                render={({ field }) => (
                  <TextField
                    label="Comentario (opcional)"
                    value={watch('comment')}
                    error={errors.comment?.message}
                    className={`${errors.comment ? 'mb-7' : ''} p-0 items-center text-base text-[#212B36] border-none`}
                    textareaGrow
                  >
                    <TextAreaGrow
                      {...field}
                      ref={textAreaRef}
                      id={field.name}
                      className="min-h-[79px]"
                      onChange={(value: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const textarea = textAreaRef.current;
                        if (textarea) {
                          textarea.style.height = '56px';
                          textarea.style.height = `${textarea.scrollHeight}px`;
                        }
                        field.onChange(value);
                      }}
                      errors={!!errors.comment?.message}
                    />
                  </TextField>
                )}
              />
            </div>
            <Alert
              message="Si el tutor tiene activado el pago domiciliado, se realizará el cobro en la fecha domiciliada, incluso si se modifica la fecha de vencimiento."
              variant="info"
            />
          </div>
          <div className="flex space-x-2 w-full justify-between items-center px-4">
            <Dialog.Close asChild>
              <Button variant="ghost" onClick={() => setOpenEditDateDialog(false)} className="w-full h-9 text-green">
                Descartar
              </Button>
            </Dialog.Close>
            <Button
              type="submit"
              className="w-full h-9"
              disabled={isLoading || currentDueDate?.toISOString() === watch('newDueDate')?.toISOString()}
            >
              {isLoading ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-5" /> : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

FormEditDueDate.displayName = 'FormEditDueDate';
