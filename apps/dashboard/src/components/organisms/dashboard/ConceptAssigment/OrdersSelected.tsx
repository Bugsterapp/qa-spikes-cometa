import { Controller, useForm } from 'react-hook-form';
import { FormValuesOrders, SelectedOrdersSchema, StepAssingProps } from '/src/pages/concepts/[conceptId]';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '/src/utils/api';
import { formatDateShort } from '/src/utils/general';
import { renderMoney } from '/src/utils/datagridHeaders';
import CheckBox from '/src/components/atoms/CheckBox';
import Select from '/src/components/Select';
import { Order } from '@cometa/trpc/src/types';
import CAlert from '/src/components/atoms/CAlert';
import { AlertToClose } from '../Step1Form';
import ConceptButton from '../ConceptButton';

export function Step1OrderSelection({
  setData,
  formData,
  onNext,
  onBack,
  setAlertToCloseSheet,
}: StepAssingProps<FormValuesOrders> & AlertToClose) {
  const formSelectedOrders = useForm<FormValuesOrders>({
    defaultValues: {
      orders: formData?.orders || [],
    },
    resolver: zodResolver(SelectedOrdersSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
  const conceptId = router.query.conceptId as string;

  const { data: ordersData } = api.schools.schoolsConceptOrdersList.useQuery(
    {
      concept_id: conceptId,
    },
    {
      enabled: !!conceptId,
    }
  );

  type Result = { type: string; names: string[] }[];

  function extractAttributes(data: Order[]): Result {
    const attributesMap: Map<string, Set<string>> = new Map();

    for (const order of data) {
      for (const attr of order.attributes) {
        if (!attributesMap.has(attr.type)) {
          attributesMap.set(attr.type, new Set());
        }
        attributesMap.get(attr.type)?.add(attr.name);
      }
    }

    const result: Result = [];

    attributesMap.forEach((namesSet, type) => {
      result.push({ type: type, names: Array.from(namesSet) });
    });

    return result;
  }

  const orders = ordersData && ordersData.results;
  const attributes = orders && extractAttributes(orders);
  const ordersSelected = formSelectedOrders.watch('orders');

  const { errors, isDirty } = formSelectedOrders.formState;

  const onSubmit = (data: FormValuesOrders) => {
    setData?.(data);
    onNext();
  };

  return (
    <form ref={formRef} onSubmit={formSelectedOrders.handleSubmit(onSubmit)}>
      <div className="min-h-[90vh] flex flex-col justify-between">
        <div className="px-8 pt-6">
          <p className="text-xl font-bold">Órdenes a asignar</p>
          <p className="font-normal text-sm text-[#637381] mt-2 mb-8">
            {attributes && attributes?.length > 0
              ? 'Selecciona las órdenes que tendrán disponibles los estudiantes asignados:'
              : 'Selecciona los meses que se cobrarán a los estudiantes asignados:'}
          </p>
          {/* Componente seleccion */}
          <Controller
            control={formSelectedOrders.control}
            name="orders"
            render={({ field: { onChange } }) => (
              <MultipleOrderSelect
                items={orders || []}
                ordersSelected={ordersSelected}
                onChange={onChange}
                grouping={attributes && attributes?.length > 0}
                groups={attributes}
                error={errors?.orders?.message}
              />
            )}
          />
        </div>
        <ConceptButton
          textBack="Cancelar"
          children={
            <>
              <p className="text-lg font-bold">{ordersSelected?.length}</p>
              <p className="text-sm font-normal">órdenes seleccionadas</p>
            </>
          }
          onBack={() => {
            if (isDirty || Object.keys(formData?.orders || {}).length > 1) {
              setAlertToCloseSheet(true);
            } else {
              onBack();
            }
          }}
        />
      </div>
    </form>
  );
}

type MultipleOrderSelectProps = {
  items: Order[];
  onChange?: (items: Order[]) => void;
  grouping?: boolean;
  groups?: { type: string; names: string[] }[];
  error?: string;
  ordersSelected?: Order[];
};

function MultipleOrderSelect({
  items,
  onChange,
  grouping = false,
  groups,
  error,
  ordersSelected,
}: MultipleOrderSelectProps) {
  const [selectedItems, setSelectedItems] = useState<Order[]>(ordersSelected ? [...ordersSelected] : []);
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const groupByType = () => {
    if (!groupBy || groupBy === 'all') return { all: items };

    const grouped = {} as Record<string, Order[]>;
    for (const item of items) {
      const filteredAttributes = item.attributes.filter((attr) => attr.type === groupBy);
      for (const attr of filteredAttributes) {
        // Si el nombre del atributo no existe en el objeto 'grouped', inicializar con un array vacío
        if (!grouped[attr.name]) {
          grouped[attr.name] = [];
        }

        grouped[attr.name].push(item);
      }
    }

    return grouped;
  };

  const ordersGrouped = groupByType();

  const selectAllItems = (attribute: string) => {
    const ordersToSelect = ordersGrouped[attribute || 'all'];
    if (isGroupSelected(attribute)) {
      const newSelectedItems = selectedItems.filter((order) => !ordersToSelect.some((i) => i.id === order.id));
      setSelectedItems(newSelectedItems);
      onChange?.(newSelectedItems);
    } else {
      const newSelectedItems = [...new Set([...selectedItems, ...ordersToSelect])];
      setSelectedItems(newSelectedItems);
      onChange?.(newSelectedItems);
    }
  };

  const isSelected = (item: Order) => selectedItems.some((i) => i.id === item.id);

  const handleCheckboxClick = (item: Order) => {
    if (isSelected(item)) {
      setSelectedItems((prevState) => {
        const newState = prevState.filter((i) => i.id !== item.id);
        onChange?.(newState);
        return newState;
      });
    } else {
      setSelectedItems((prevState) => {
        const newState = [...prevState, item];
        onChange?.(newState);
        return newState;
      });
    }
  };

  const isGroupSelected = (attribute: string) => {
    const ordersToSelect = ordersGrouped[attribute || 'all'];
    return ordersToSelect.every((order) => selectedItems.some((i) => i.id === order.id));
  };

  const isItemGroupSelected = (attribute: string) => {
    const ordersToSelect = ordersGrouped[attribute || 'all'];
    const someSelected = ordersToSelect.some((order) => selectedItems.some((item) => item.id === order.id));
    const allSelected = ordersToSelect.every((order) => selectedItems.some((item) => item.id === order.id));

    return someSelected && !allSelected;
  };

  return (
    <div>
      {error && (
        <div className="absolute top-[50px] px-2">
          <CAlert className="mb-4" type="error" message="Debes seleccionar al menos una orden para poder continuar." />
        </div>
      )}
      {grouping && (
        <div>
          <Select
            name="groupBy"
            placeholder="Agrupar por:"
            className="w-[168px] mb-6 h-10 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
            onValueChange={(val) => setGroupBy(val === 'all' ? null : val)}
            labelClassNames="mt-3 px-1"
          >
            <Select.Content className="outline-none z-[9999]">
              <Select.Item className="outline-none" value="all" key="">
                Ninguno
              </Select.Item>
              {groups?.map((group: { type: string; names: string[] }) => (
                <Select.Item className="outline-none" value={group.type} key={group.type}>
                  {group.type}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )}
      {Object.keys(ordersGrouped || {}).map((key) => (
        <div key={key} className="rounded-lg gap-3 border border-[#DFE3E8] mb-6">
          <button
            type="button"
            className="w-full bg-[#F9FAFB] px-4 py-4 flex items-center cursor-pointer hover:bg-[#F3F4F6] rounded-lg"
            onClick={() => {
              selectAllItems(key);
            }}
          >
            <CheckBox
              readOnly
              className="mr-3"
              checked={isGroupSelected(key)}
              indeterminate={isItemGroupSelected(key)}
            />
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold text-base text-[#637381]">
                {!grouping ? 'Todos los meses' : !groupBy || groupBy === 'all' ? 'Nombre' : `${groupBy} ${key}`}
              </p>
              {grouping && <p className="font-semibold text-base text-[#637381] mr-[8%]">Precio</p>}
            </div>
          </button>
          <div>
            {ordersGrouped &&
              ordersGrouped[key].map((item, index) => (
                <div key={`${index}_${item.id}`} className="flex justify-between border-b cursor-pointer">
                  <button
                    type="button"
                    className="flex flex-row items-center px-4 py-3"
                    onClick={() => {
                      handleCheckboxClick(item);
                    }}
                  >
                    <CheckBox readOnly className="mr-3" checked={isSelected(item)} />
                    <div className="flex flex-col items-baseline">
                      <p className="text-base text-left">{item.name}</p>
                      {item.due && (
                        <span className="text-xs text-[#637381]">{formatDateShort(item.due || '', true)}</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center px-4 py-3">
                    <p className="text-sm">{renderMoney(item.price)}</p>
                    <p className="text-sm text-[#637381] ml-1">MXN</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
