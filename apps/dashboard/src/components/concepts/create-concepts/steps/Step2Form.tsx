import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomInput from '/src/components/CustomInput';
import * as RSelect from '@radix-ui/react-select';
import Chevron from '/public/assets/icons/studentDetail/chevron.svg';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import MultipleSelectionComponent from '../../../organisms/dashboard/MultiSelect';
import MoneyInput from '/src/components/ui/MoneyInput';
import { FormValues2, MostUsedChips, OrdersToPay, schemaStep2, StepProps } from '../CreateConcept';
import ConceptButton from '../../../organisms/dashboard/ConceptButton';
import { eachMonthOfInterval, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '../../../ui/RadioGroup';
import { Label } from '../../../ui/Label';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { SCHOOL_CYCLE_CONSTANTS } from '/src/constants/schoolCycle';

const formatMonthName = (date: Date): string => {
  const name = format(date, 'MMMM yyyy', { locale: es });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

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

  const normalizeMonthsToCurrentCycle = useMemo(() => {
    if (!formData?.months_to_pay || !selectedSchoolCycle?.year_start) return [];

    return formData.months_to_pay.map((month) => {
      const monthNumber = month.value.monthNumber;
      const selectedYearStart = selectedSchoolCycle.year_start || SCHOOL_CYCLE_CONSTANTS.DEFAULT_SCHOOL_YEAR;

      const isSecondYear = month.value.wasSecondYear;

      const nominalYear = isSecondYear ? selectedYearStart + 1 : selectedYearStart;
      const nominalDate = new Date(nominalYear, monthNumber);
      const name = formatMonthName(nominalDate);

      if (month.value.dueDateInfo?.isAnomalous) {
        const dueDateInfo = month.value.dueDateInfo;

        const originalYearDiff = dueDateInfo.dueYear - dueDateInfo.nominalYear;

        const newDueYear = nominalYear + originalYearDiff;

        const updatedDueDateInfo = {
          ...dueDateInfo,
          nominalYear: nominalYear,
          dueYear: newDueYear,
          cycleStartYear: selectedYearStart,
        };

        return {
          value: {
            ...month.value,
            name,
            date: nominalDate.toISOString(),
            wasSecondYear: isSecondYear,
            dueDateInfo: updatedDueDateInfo,
          },
          label: name,
        };
      }

      return {
        value: {
          ...month.value,
          name,
          date: nominalDate.toISOString(),
          wasSecondYear: isSecondYear,
          dueDateInfo: month.value.dueDateInfo
            ? {
                ...month.value.dueDateInfo,
                nominalYear: nominalYear,
                dueYear: nominalYear,
                cycleStartYear: selectedYearStart,
              }
            : undefined,
        },
        label: name,
      };
    });
  }, [formData?.months_to_pay, selectedSchoolCycle?.year_start]);

  const formStep2 = useForm<FormValues2>({
    resolver: zodResolver(schemaStep2),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      months_to_pay: normalizeMonthsToCurrentCycle,
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

  const [orders, setOrders] = useState<Order[]>([]);

  const monthsForSelection = useMemo(() => {
    if (!formData?.available_months) return [];

    const isInscriptionType = formData.type === 'INSCRIPTION' || formData.type === 'REINSCRIPTION';
    const totalMonths = isInscriptionType
      ? SCHOOL_CYCLE_CONSTANTS.INSCRIPTION_TOTAL_MONTHS
      : SCHOOL_CYCLE_CONSTANTS.REGULAR_CONCEPT_TOTAL_MONTHS;

    return formData.available_months.slice(0, totalMonths).map((month, index) => {
      const monthNumber = month.value.monthNumber;
      const year = selectedSchoolCycle?.year_start || SCHOOL_CYCLE_CONSTANTS.DEFAULT_SCHOOL_YEAR;
      const startMonth = formData.concept_start_month || 0;

      const cyclesPassed = Math.floor((startMonth + index) / 12);
      const adjustedYear = year + cyclesPassed;

      const baseDate = new Date(adjustedYear, monthNumber);
      const name = formatMonthName(baseDate);

      return {
        value: {
          ...month.value,
          name,
          date: baseDate.toISOString(),
        },
        label: name,
      };
    });
  }, [selectedSchoolCycle, formData?.available_months, formData?.concept_start_month, formData?.type]);

  useMemo(() => {
    const monthz = formStep2.getValues('months_to_pay');
    if (!monthz?.length || !price || !payday || !selectedSchoolCycle) return;

    const startMonth = formData?.concept_start_month || 0;
    const baseYear = selectedSchoolCycle.year_start || SCHOOL_CYCLE_CONSTANTS.DEFAULT_SCHOOL_YEAR;

    const startDate = new Date(baseYear, startMonth);
    const endDate = new Date(baseYear + 1, SCHOOL_CYCLE_CONSTANTS.REGULAR_START_MONTH);

    const allMonthsInCycle = eachMonthOfInterval({ start: startDate, end: endDate });

    const selectedMonths: Order[] = monthz
      .map((month) => {
        const dueDateInfo = month.value.dueDateInfo;

        if (dueDateInfo?.isAnomalous) {
          const dueDate = new Date(dueDateInfo.dueYear, dueDateInfo.dueMonth);

          dueDate.setDate(dueDateInfo.dueDay);

          return {
            id: uuidv4(),
            name: month.value.name,
            date: parseISO(month.value.date),
            monthNumber: month.value.monthNumber,
            price: price,
            due: dueDate,
            months_to_pay: month.value.monthNumber + 1,
            monthName: month.label,
            modified: {
              price: false,
              date: true,
            },
          };
        }

        const matchingDate = allMonthsInCycle.find(
          (date) =>
            date.getMonth() === month.value.monthNumber &&
            date.getFullYear() === new Date(month.value.date).getFullYear()
        );

        if (!matchingDate) return null;

        const dueDate = new Date(matchingDate);
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();

        if (parseInt(payday) < 0) {
          dueDate.setDate(lastDayOfMonth + parseInt(payday) + 1);
        } else {
          dueDate.setDate(Math.min(parseInt(payday), lastDayOfMonth));
        }

        return {
          id: uuidv4(),
          name: month.value.name,
          date: parseISO(month.value.date),
          monthNumber: month.value.monthNumber,
          price: price,
          due: dueDate,
          months_to_pay: month.value.monthNumber + 1,
          monthName: month.label,
          modified: {
            price: false,
            date: false,
          },
        };
      })
      .filter((order): order is Order => order !== null);

    const mergedOrders: Order[] = selectedMonths.map((newOrder) => {
      const existingOrder = orders.find((order) => order.monthName === newOrder.monthName);
      if (existingOrder) {
        return {
          ...newOrder,
          price: existingOrder.modified.price ? existingOrder.price : newOrder.price,
          due: existingOrder.modified.date ? existingOrder.due : newOrder.due,
          modified: existingOrder.modified,
        };
      }
      return newOrder;
    });

    setOrders(mergedOrders);
  }, [formStep2.watch('months_to_pay'), price, payday, selectedSchoolCycle]);

  const editOrder = (id: string, newData: any) => {
    const updatedOrders = editOrderById(orders, id, {
      ...newData,
      modified: {
        ...newData.modified,
        price: newData.price !== undefined && newData.price !== orders.find((o) => o.id === id)?.price,
        date: newData.due !== undefined && newData.due !== orders.find((o) => o.id === id)?.due,
      },
    });
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
            defaultValue={normalizeMonthsToCurrentCycle}
            render={({ field: { onChange, value } }) => (
              <MultipleSelectionComponent
                items={monthsForSelection}
                key={monthsForSelection.map((month) => month.value.id).join('_')}
                onChange={(items) => {
                  const uniqueItems = items.filter(
                    (item, index, self) =>
                      index ===
                      self.findIndex(
                        (t) =>
                          t.value.monthNumber === item.value.monthNumber &&
                          new Date(t.value.date).getFullYear() === new Date(item.value.date).getFullYear()
                      )
                  );
                  onChange(uniqueItems);
                }}
                label="Meses a cobrar"
                allSelectedLabel="Todos"
                labelName="meses"
                fullWidth
                disableAll
                className="mt-4"
                classNames="min-h-[54px]"
                formData={{ months_to_pay: value }}
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
          <OrdersToPay editOrder={editOrder} orders={orders || []} globalPrice={price} />
        </div>
      )}
      {formData && formData?.orders && !hasMonthsToPayAndPriceAndPayday && !orders.length && (
        <div className="pb-10">
          <p className="text-[#637381] text-sm mb-4">
            Puedes revisar y editar los meses a cobrar de manera independiente aquí:
          </p>
          <OrdersToPay editOrder={editOrder} orders={formData?.orders || []} globalPrice={price} />
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

export interface Order {
  id: string;
  price: number;
  due: Date;
  months_to_pay: number;
  monthName: string;
  modified: {
    price: boolean;
    date: boolean;
  };
  name: string;
  date: Date;
  monthNumber: number;
}

const editOrderById = (orders: Order[], id: string, newData: Order): Order[] => {
  let orderFound = false;

  const updatedOrders = orders.map((order) => {
    if (order.id === id) {
      orderFound = true;

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
