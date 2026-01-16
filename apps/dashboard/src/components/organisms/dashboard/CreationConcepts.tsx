import { Controller, useForm } from 'react-hook-form';
import Button from './Button';
import { z } from 'zod';

import { useState } from 'react';

import MoneyInput from '/src/components/ui/MoneyInput';
import { parseCurrency } from '@cometa/utils';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO, isDate, endOfMonth, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

import { Order } from './Step2Form';
import { cn } from '/src/utils/cn';
import { Calendar } from '@cometa/recreo';
export const schema = z
  .object({
    type: z.string().min(1, 'Falta completar este campo'),
    school_cycle: z.string().min(1, 'Falta completar este campo'),
    name: z.string().min(1, 'Falta completar este campo'),
    bank_account: z.string().min(1, 'Falta completar este campo').optional(),
    not_invoicing_bank_account: z.string().min(1, 'Falta completar este campo').optional(),
    entity: z.string().min(1, 'Falta completar este campo'),
    root_concept: z.enum(['optional', 'required']).optional(),
    payment_only_in_dashboard: z.enum(['true', 'false']).optional(),
    recurrent_payment: z.enum(['true', 'false']).optional(),
    has_due_date: z.enum(['true', 'false']).optional(),
    inscription: z.boolean().optional(),
    has_months_to_pay: z.enum(['true', 'false']).optional(),
    available_in_online_store: z.enum(['true', 'false']).optional(),
  })
  .refine(
    (data) => {
      if (data.payment_only_in_dashboard === 'false' && (!data.bank_account || data.bank_account.length <= 1)) {
        return false;
      }
      return true;
    },
    { message: 'Falta completar este campo', path: ['bank_account'] }
  );

export const schemaStep2 = z.object({
  months_to_pay: z.array(z.any()).min(1, 'Falta completar este campo'),
  price: z.number().positive('El precio debe ser mayor a 0').min(1, 'Falta completar este campo'),
  payday: z.string().min(1, 'Falta completar este campo'),
  orders: z.array(z.any()).default([]),
  year_start: z.string().min(1, 'Falta completar este campo'),
  setup_periodic_restrictions: z.enum(['true', 'false']),
  same_school_cycle: z.boolean().optional(),
});

const SurchargeInfo = z
  .object({
    month_offset: z.number().min(1, 'Este campo es requerido'),
    interest_type: z.enum(['PERCENT', 'AMOUNT']),
    compounding: z.enum(['SINGLE', 'DAILY', 'WEEKLY', 'MONTHLY', 'FORTNIGHTLY']),
    interest_value: z
      .string()
      .min(1, 'Este campo es requerido')
      .refine((data) => {
        // we should only allow positive numbers
        if (Number(data) <= 0) {
          return false;
        }
        return true;
      }),
  })
  .refine((data) => data.month_offset !== 0, {
    message: 'Month offset must be 0',
    path: ['month_offset'],
  })
  .refine((data) => data.interest_value !== '0', {
    message: 'Interest value must be greater than 0',
  });

export const schemaStep3 = z
  .object({
    has_surcharge: z.string().min(1, 'Este campo es requerido'),
    month_offset: z.number().optional(),
    interest_type: z.enum(['PERCENT', 'AMOUNT']).optional(),
    compounding: z.enum(['SINGLE', 'DAILY', 'WEEKLY', 'MONTHLY', 'FORTNIGHTLY']).optional(),
    interest_value: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data?.has_surcharge === 'true') {
        return SurchargeInfo.parse(data);
      }
      return true;
    },
    {
      message: 'Surcharge fields are required when has_surcharge is true',
      path: [],
    }
  )
  .refine(
    (data) => {
      if (data.interest_type === 'PERCENT') {
        return Number(data.interest_value) <= 100;
      }
      return true;
    },
    {
      message: 'El descuento no puede ser mayor al 100%',
      path: ['interest_value'],
    }
  );

export const schemaStepSingleOrder = z.object({
  due: z.number().min(1, 'Este campo es requerido'),
  price: z.number().min(1, 'Este campo es requerido'),
});

const discountSchema = z
  .object({
    up_to_days: z.string(),
    need_up_to_days: z.boolean(),
    discount_type: z.enum(['PERCENT', 'AMOUNT']),
    discount_value: z.string().min(1, 'Este campo es requerido'),
  })
  .refine(
    (data) => {
      if (!data.need_up_to_days) {
        return data.up_to_days && (Number(data.up_to_days) > 0 || data.up_to_days.length > 0);
      } else {
        data.up_to_days = '';
      }
      return true;
    },
    {
      message: 'Este campo es requerido.',
      path: ['up_to_days'],
    }
  )
  .refine(
    (data) => {
      if (data.discount_type === 'PERCENT') {
        return Number(data.discount_value) <= 100;
      }
      return true;
    },
    {
      message: 'El descuento no puede ser mayor al 100%',
      path: ['discount_value'],
    }
  );

export type FormDiscount = z.infer<typeof discountSchema>;

export const schemaStep4 = discountSchema;

export const schemaStep5 = z
  .object({
    has_sales_tax: z.enum(['true', 'false']).optional(),
    product_key: z.string().min(1, 'Falta completar este campo').optional(),
    unit_type: z.string().min(1, 'Falta completar este campo').optional(),
    has_rvoe: z.enum(['true', 'false']).optional(),
    rvoe: z.string().min(1, 'Falta completar este campo').optional(),
    is_billable: z.enum(['true', 'false']),
    series: z.optional(z.object({ code: z.string(), id: z.string() })),
    series_selector: z.enum(['true', 'false']),
    does_invoice_as_general_public: z.enum(['true', 'false']).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.is_billable === 'false') {
      return true;
    }
    if (!val.has_sales_tax) {
      ctx.addIssue({
        path: ['has_sales_tax'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!val.has_rvoe) {
      ctx.addIssue({
        path: ['has_rvoe'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!val.product_key) {
      ctx.addIssue({
        path: ['product_key'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!val.unit_type) {
      ctx.addIssue({
        path: ['unit_type'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
    if (val.has_rvoe === 'true' && !val.rvoe) {
      ctx.addIssue({
        path: ['rvoe'],
        message: 'Falta completar este campo',
        code: z.ZodIssueCode.custom,
      });
    }
  });

const schemaStepAttributes = z.object({
  attributes: z.array(z.any()).default([]),
  price: z.number().positive().default(0),
});

export const schemaStepOrders = z.object({
  orders_attributes: z.record(
    z
      .object({
        order_price: z.number(),
        enabled: z.number().min(0),
        attributes: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
          })
        ),
      })
      .refine(
        (data) => {
          if (data.enabled === 0) {
            return data.order_price === 0;
          }
          if (data.enabled === 1 && data.order_price === 0) {
            return false;
          }
          return true;
        },
        { message: 'El precio no debe ser 0 si una orden esta activa', path: ['order_price'] }
      )
  ),
});

export type FormValues1 = z.infer<typeof schema>;
export type FormValues2 = z.infer<typeof schemaStep2>;
export type FormValues3 = z.infer<typeof schemaStep3>;
export type FormValues4 = { early_bird_discounts: z.infer<typeof schemaStep4>[] };
export type FormValues5 = z.infer<typeof schemaStep5>;
export type FormValues6 = z.infer<typeof schemaStepAttributes>;
export type FormValues7 = z.infer<typeof schemaStepOrders>;
export type FormValues8 = z.infer<typeof schemaStepSingleOrder>;
export type FormValues = FormValues1 &
  FormValues2 &
  FormValues3 &
  FormValues4 &
  FormValues5 &
  FormValues6 &
  FormValues7 &
  FormValues8;
export type StepProps<T> = {
  setData: (data: T) => void;
  onNext: (data?: T) => void;
  onBack: () => void;
  formData?: Partial<FormValues>;
};

type ChipProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};
const Chip: React.FC<ChipProps> = ({ label, value, onChange, disabled }) => (
  <button
    className="bg-white text-green text-xs px-3 py-1.5 border border-green rounded-full hover:bg-green hover:text-white transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-400 cursor:disabled"
    disabled={disabled}
    type="button"
    onClick={() => onChange(value)}
  >
    {label}
  </button>
);
export const MostUsedChips = ({ onChange, disabled }: Pick<ChipProps, 'onChange' | 'disabled'>) => (
  <div className="flex items-center w-full gap-2">
    <p className="text-xs text-[#637381]">Recomendado</p>
    <div className="flex flex-wrap justify-between w-full">
      <Chip label="Día 5" value="5" onChange={onChange} disabled={disabled} />
      <Chip label="Día 10" value="10" onChange={onChange} disabled={disabled} />
      <Chip label="Día 15" value="15" onChange={onChange} disabled={disabled} />
      <Chip label="Día 28" value="28" onChange={onChange} disabled={disabled} />
      <Chip label="Último día del mes" value="-1" onChange={onChange} disabled={disabled} />
    </div>
  </div>
);

type OrdersToPayProps = {
  editOrder: (id: string, data: any) => void;
  orders: Order[];
};

export const OrdersToPay: React.FC<OrdersToPayProps> = ({ orders, editOrder }) => (
  <div>
    <div className="p-4 overflow-scroll border-2 rounded-lg">
      {orders?.map((order, index) => {
        if (order) {
          return (
            <OrderCard order={order} key={order.id} editByOrderId={editOrder} isLast={index === orders.length - 1} />
          );
        } else {
          return null;
        }
      })}
    </div>
  </div>
);
const OrderCard = ({
  order,
  editByOrderId,
  isLast,
}: {
  order: Order;
  editByOrderId: (id: string, data: any) => void;
  isLast: boolean;
}) => {
  const { handleSubmit, control, formState } = useForm({
    defaultValues: {
      id: order.id,
      due: order.due,
      price: order.price,
      modified: false,
    },
    // resolver: zodResolver(),
  });

  const { isDirty } = formState;
  const [isEditing, setIsEditing] = useState(false);
  const onSubmit = (data: any) => {
    editByOrderId(order.id, { ...data, modified: true });
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* remove the border if is last */}
      <div className={cn('py-4 flex flex-col gap-3', !isLast && 'border-b-2')}>
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[#717993] text-xs">Mes a pagar</h3>
            <p className="text-black">{order.monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(!isEditing)} type="button">
              {isEditing ? (
                <span className="text-sm font-bold text-green">Cancelar</span>
              ) : (
                <div className="flex items-center gap-2">
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.4952 0.449895L12.5502 2.5049C13.1247 3.05222 13.1482 3.96114 12.6027 4.5374L5.85273 11.2874C5.60825 11.5298 5.28782 11.6808 4.94523 11.7149L1.81773 11.9999H1.75023C1.55087 12.001 1.35927 11.9228 1.21773 11.7824C1.0595 11.6248 0.979771 11.4048 1.00023 11.1824L1.32273 8.0549C1.35685 7.7123 1.5078 7.39187 1.75023 7.1474L8.50023 0.397395C9.08209 -0.0941911 9.94002 -0.0716141 10.4952 0.449895ZM7.99023 2.9999L10.0002 5.00989L11.5002 3.5474L9.45273 1.4999L7.99023 2.9999Z"
                      fill="#00AB55"
                    />
                  </svg>
                  <p className="text-sm font-bold text-green">Editar</p>
                </div>
              )}
            </button>
            {isEditing ? (
              <button
                type="submit"
                disabled={!isDirty}
                className={`text-white bg-green rounded-lg text-xs font-bold p-1 px-2 h-7 ${
                  !isDirty ? 'disabled:text-gray-500 disabled:bg-gray-200' : ''
                }`}
              >
                Guardar
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex flex-col w-1/2">
            {isEditing ? (
              <Controller
                control={control}
                name="due"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger type="button" asChild>
                      <Button
                        variant="outline"
                        className={`w-full relative justify-start text-left font-normal rounded-md border-gray-300 mt-2 border h-14 ${
                          !field.value && 'text-muted-foreground'
                        }`}
                      >
                        <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de vencimiento</p>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {field.value ? (
                            format(
                              isDate(field.value) ? field.value : parseISO(String(field.value)),
                              'dd / MM / yyyy',
                              {
                                locale: es,
                              }
                            )
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disableNavigation
                        defaultMonth={startOfMonth(new Date(order.due))}
                        toMonth={endOfMonth(new Date(order.due))}
                        showOutsideDays
                        fixedWeeks={false}
                        disabled={(date) => {
                          const month = new Date(order.due).getMonth();
                          return date.getMonth() !== month;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ) : (
              <div>
                <p className="text-[#717993] text-xs">Vencimiento</p>
                <p className="text-sm text-black">
                  {format(order.due, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }).replace(/^\w/, (c) =>
                    c.toUpperCase()
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {isEditing ? (
              <div className="mt-2">
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => <MoneyInput prefix="MXN" min="0" {...field} />}
                />
              </div>
            ) : (
              <div className="flex flex-col justify-end">
                <p className="text-[#717993] text-xs">Precio (Inc. IVA) </p>
                <p className="text-sm text-black">{parseCurrency(order.price)} MXN</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
