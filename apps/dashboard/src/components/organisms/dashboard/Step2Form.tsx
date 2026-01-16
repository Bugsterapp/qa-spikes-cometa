import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomInput from '/src/components/CustomInput';
import * as RSelect from '@radix-ui/react-select';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import { useMemo, useState } from 'react';
import { api } from '../../../utils/api';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import MultipleSelectionComponent from './MultiSelect';
import MoneyInput from '/src/components/ui/MoneyInput';
import { StepProps, FormValues2, schemaStep2, MostUsedChips, OrdersToPay } from './CreationConcepts';
import ConceptButton from './ConceptButton';
import { format, getMonth, getYear, eachMonthOfInterval, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { es } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';

export function Step2Form({ setData, onBack, onNext, formData }: StepProps<FormValues2 & { orders: Order[] }>) {
  const selectedSchool = useSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName(Events.concept_new_p2a1_meses);

  const { data: schoolCycles } = api.charge.schoolCycleList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );
  const selectedSchoolCycle = schoolCycles?.find((sc) => sc.id === formData?.school_cycle);

  const formStep2 = useForm<FormValues2>({
    resolver: zodResolver(schemaStep2),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      months_to_pay: formData?.months_to_pay,
      price: formData?.price,
      payday: formData?.payday,
      setup_periodic_restrictions: formData?.setup_periodic_restrictions || 'true',
    },
  });

  const months_to_pay = formStep2.watch('months_to_pay') || formData?.months_to_pay;
  const price = formStep2.watch('price');
  const payday = formStep2.watch('payday');

  const hasMonthsToPayAndPriceAndPayday = months_to_pay?.length > 0 && price > 0 && payday !== undefined;

  const { setValue } = formStep2;

  const errors = formStep2.formState.errors;

  const onSubmit = (data: FormValues2) => {
    setData({ ...data, orders });
    onNext();
  };

  const dueDates = [
    { value: 1, name: '1ero de cada mes' },
    { value: 2, name: '2 de cada mes' },
  ];

  for (let i = 3; i <= 28; i++) {
    dueDates.push({ value: i, name: `${i} de cada mes` });
  }

  dueDates.push(
    { value: -3, name: 'Tercer último día del mes' },
    { value: -2, name: 'Penúltimo día del mes' },
    { value: -1, name: 'Último día del mes' }
  );

  const months = useMemo(
    () =>
      selectedSchoolCycle?.year_start && selectedSchoolCycle?.year_end
        ? generateMonths(
            selectedSchoolCycle?.year_start as number,
            selectedSchoolCycle?.year_end as number,
            formData?.inscription
          )
        : [],
    [selectedSchoolCycle?.year_start, selectedSchoolCycle?.year_end, formData?.school_cycle]
  );
  const [orders, setOrders] = useState<Order[]>([]);

  useMemo(() => {
    const monthz = months_to_pay?.map((month) => month.value);
    const newOrders = monthz?.length && price && payday ? generateOrders(monthz, price, parseInt(payday)) : [];

    const mergedOrders = newOrders.map((newOrder) => {
      const existingOrder = orders.find((order) => order.id === newOrder.id);
      if (existingOrder) {
        if (!existingOrder.modified) {
          return { ...newOrder };
        }
        return existingOrder;
      }
      return newOrder;
    });

    setOrders(mergedOrders);
  }, [months_to_pay, price, payday]);
  const editOrder = (id: string, newData: any) => {
    const updatedOrders = editOrderById(orders, id, { ...newData, modified: true });
    setOrders(updatedOrders);
  };

  return (
    <div className="relative h-full min-h-[92vh] scroll-y">
      <div className="sticky top-0 z-20 pt-5 pb-6 bg-white">
        <div className="pb-6 border-b border-gray-300">
          <h1 className="pb-2 text-xl font-bold text-black">Meses a cobrar</h1>
          <span className="text-sm text-[#637381] ">
            Selecciona y configura el mes o los meses a cobrar, así como el precio y la fecha de vencimiento en el mes.
          </span>
        </div>
      </div>
      <form className="">
        <div className="flex flex-col gap-4">
          <Controller
            control={formStep2.control}
            name="months_to_pay"
            render={({ field: { onChange } }) => (
              <MultipleSelectionComponent
                items={
                  months.map((ct) => ({
                    value: ct,
                    label: `${ct.name}`,
                  })) || []
                }
                key={months.map((ct) => ct.id).join('')}
                onChange={onChange}
                label="Meses a cobrar"
                allSelectedLabel="Todos"
                labelName="meses"
                fullWidth
                disableAll
                className="mt-4"
                classNames="min-h-[54px]"
                formData={formData}
              />
            )}
          />
          <CustomInput {...formStep2.register('year_start')} value={selectedSchoolCycle?.year_start || ''} hidden />
          <Controller
            control={formStep2.control}
            name="price"
            render={({ field }) => (
              <MoneyInput
                {...field}
                prefix="MXN"
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
            )}
          />
          <Controller
            control={formStep2.control}
            name="payday"
            render={({ field: { onChange, value, ref } }) => (
              <RSelect.Root onValueChange={(e) => onChange(e)} value={value}>
                <RSelect.Trigger
                  data-error={Boolean(errors.payday)}
                  ref={ref}
                  className="relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] rounded-xl p-4 flex justify-between bg-transparent items-center w-full"
                >
                  <label className="absolute -top-2.5 left-3.5 bg-white text-[#919EAB] group-[[data-error=true]]:text-[#FF4842] text-xs">
                    Dia de vencimiento
                  </label>
                  <RSelect.Value placeholder="Selecciona un dia de vencimiento" />
                  <Chevron className="text-[#637381] w-3 ml-16" />
                </RSelect.Trigger>
                <RSelect.Portal>
                  <RSelect.Content
                    className="p-4 z-[9999] bg-white rounded-lg shadow-md min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                    position="popper"
                  >
                    <RSelect.Viewport className="max-h-[400px] space-y-2">
                      {dueDates?.map((dueDates) => (
                        <RSelect.Item
                          className="data-[state=checked]:bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                          key={`${dueDates.name}_${dueDates.value}`}
                          value={String(dueDates.value)}
                        >
                          <RSelect.ItemText>{dueDates.name}</RSelect.ItemText>
                        </RSelect.Item>
                      ))}
                    </RSelect.Viewport>
                  </RSelect.Content>
                </RSelect.Portal>
              </RSelect.Root>
            )}
          />

          <MostUsedChips onChange={(value) => setValue('payday', value)} />
          {orders.length !== 1 && (
            <Controller
              control={formStep2.control}
              name="setup_periodic_restrictions"
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={orders.length === 1 ? 'false' : field.value}>
                  <span className="text-base font-semibold">¿El concepto tendrá restricción periódica?</span>
                  <span className="text-[12px] text-[#717993] mb-2">
                    Restricción periódica: Para pagar un mes tengo que haber pagado el mes previo.
                  </span>
                  <div className="flex flex-row gap-4 px-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="true"
                        id="setup_periodic_restrictions_true"
                        data-testid="setupPeriodicRestrictions-yes-radio"
                        error={Boolean(errors.setup_periodic_restrictions)}
                      />
                      <Label htmlFor="setup_periodic_restrictions_true">Sí</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="false"
                        id="setup_periodic_restrictions_false"
                        data-testid="setupPeriodicRestrictions-no-radio"
                        error={Boolean(errors.setup_periodic_restrictions)}
                      />
                      <Label htmlFor="setup_periodic_restrictions_false">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          )}
        </div>
        {hasMonthsToPayAndPriceAndPayday && orders.length > 0 && (
          <div id="divider" className="border-b border-[#919EAB3D] mt-8 mb-6" />
        )}
      </form>
      {hasMonthsToPayAndPriceAndPayday && orders.length > 0 && (
        <div className="pb-10">
          <p className="text-[#637381] text-sm mb-4">
            Puedes revisar y editar los meses a cobrar de manera independiente aquí:
          </p>
          <OrdersToPay editOrder={editOrder} orders={orders || []} />
        </div>
      )}
      {formData && formData?.orders && !hasMonthsToPayAndPriceAndPayday && !orders.length && (
        <div className="pb-10">
          <p className="text-[#637381] text-sm mb-4">
            Puedes revisar y editar los meses a cobrar de manera independiente aquí:
          </p>
          <OrdersToPay editOrder={editOrder} orders={formData?.orders || []} />
        </div>
      )}

      <ConceptButton
        onBack={() => {
          onBack();
        }}
        className={hasMonthsToPayAndPriceAndPayday ? 'sticky bottom-0' : 'absolute bottom-0'}
        onSubmit={formStep2.handleSubmit(onSubmit)}
        disabledNext={!hasMonthsToPayAndPriceAndPayday}
      />
    </div>
  );
}

interface Month {
  id: string;
  name: string;
  date: Date;
  monthNumber: number;
}

export interface Order {
  id: string;
  price: number;
  due: Date;
  months_to_pay: number;
  monthName: string;
  modified: boolean;
}
export const generateMonths = (start: number, end: number, startFromJanuary = false): Month[] => {
  if (start > end) {
    throw new Error('Start year cannot be greater than end year');
  }

  const startMonth = startFromJanuary ? 0 : 7;
  const startDate = new Date(start, startMonth);
  const endDate = new Date(end, 7, 31);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map((month) => {
    const monthNumber = getMonth(month);
    const name = format(month, 'MMMM - yyyy', { locale: es });
    const nameMonth = name[0].toUpperCase() + name.slice(1).toLowerCase();
    return {
      id: uuidv4(),
      name: nameMonth.replace('-', ' '),
      date: month,
      monthNumber,
    };
  });
};

export const generateOrders = (selectedMonths: Month[], price: number, day: number): Order[] => {
  if (selectedMonths.length === 0) {
    throw new Error('No months selected');
  }
  if (typeof price !== 'number') {
    throw new Error('Price must be a number');
  }
  if (typeof day !== 'number') {
    throw new Error('Day must be a number');
  }

  selectedMonths.sort((a, b) => a.date.getTime() - b.date.getTime());

  return selectedMonths.map((month) => {
    // Adjust the day of the month
    const dueDate = new Date(month.date);
    const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();

    if (day < 0) {
      if (Math.abs(day) > lastDayOfMonth) {
        throw new Error('Absolute value of day cannot be greater than the number of days in the month');
      }
      // Set the date to the last day of the current month plus the day value
      dueDate.setDate(lastDayOfMonth + day + 1);
    } else {
      if (day > lastDayOfMonth) {
        dueDate.setDate(lastDayOfMonth);
      } else {
        dueDate.setDate(day);
      }
    }
    if (!isValid(dueDate)) {
      throw new Error('Invalid date');
    }
    // Extract only the month name from the date
    const monthName = format(dueDate, 'MMMM yyyy', { locale: es });
    // const paydayPretty = format(dueDate, "d 'de' MMMM 'de' yyyy", { locale: es });
    const id = `${month.monthNumber}_${getYear(month.date)}`;

    return {
      id,
      price,
      due: dueDate,
      months_to_pay: month.monthNumber + 1,
      modified: false,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    };
  });
};

const editOrderById = (orders: Order[], id: string, newData: Order): Order[] => {
  let orderFound = false;

  const updatedOrders = orders.map((order) => {
    if (order.id === id) {
      orderFound = true;

      // If newData contains a due date, use that to update the order's due date
      if (newData.due) {
        newData.due = new Date(newData.due);
      }

      return {
        ...order,
        ...newData,
      };
    }
    return order;
  });

  if (!orderFound) {
    throw new Error(`Order with id ${id} not found`);
  }

  return updatedOrders;
};
