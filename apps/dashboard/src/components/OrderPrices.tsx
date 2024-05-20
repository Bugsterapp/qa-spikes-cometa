// --- Imports ---

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '../utils/cn';
import Select from './Select';
import { Tooltip } from './atoms/Tooltip';
import MoneyInput from './ui/MoneyInput';
import ConceptButton from './organisms/dashboard/ConceptButton';
import { Button } from './ui/Button';
import NFormTextField from './CustomFormTexField';
import CustomInput from './CustomInput';

import IcRefresh from 'public/assets/icons/ic_refresh.svg';
import TrashIcon from '/public/assets/icons/trash_outline.svg';

import { FormValues7, StepProps, schemaStepOrders } from './organisms/dashboard/CreationConcepts';
import useSendTrackEventWithUserName from '../hooks/useSendTrackEventWithUserName';

// --- Interfaces ---
interface Group {
  type: string;
  attributes: Attribute[];
}
interface Attribute {
  id: number;
  name: string;
}
interface CombinationDetail {
  id?: string;
  name: string;
  type: string;
}

interface Combination {
  id: string;
  details: { [key: string]: CombinationDetail[] };
}

type GroupedCombinations = {
  [type: string]: {
    [name: string]: Combination[];
  };
};

type MutableIconType = {
  action: () => void;
  isIconDisabled: boolean;
};
// --- Utility Functions ---

const convertToGroupArray = (data: any[]): Group[] =>
  data.map((group) => ({
    type: group.type,
    attributes: group.items,
  }));
const arrayToObject = (arr: any[]) =>
  arr.reduce((acc, curr) => {
    acc[curr.id] = {
      order_price: curr.order_price,
      attributes: curr.attributes,
      enabled: curr.enabled,
    };
    return acc;
  }, {});
const prepareDefaultPricesArray = (
  combinations: Combination[]
): { id: string; order_price: number; attributes: CombinationDetail[] }[] =>
  combinations.map((combination: Combination) => {
    const combinationKey = Object.keys(combination.details)[0];
    const attributes: CombinationDetail[] = combination.details[combinationKey];

    return {
      id: combination.id,
      order_price: 0,
      enabled: 1,
      attributes: attributes,
    };
  });
const generateCombinations = (groupedAttributes: Group[]): Combination[] => {
  // Helper function to generate Cartesian product of arrays
  function cartesianProduct(arrs: Attribute[][]): Attribute[][] {
    return arrs.reduce(
      (acc: Attribute[][], curr: Attribute[] | undefined) =>
        acc.flatMap((x) => (curr ? curr.map((y) => [...x, y]) : [])),
      [[]]
    );
  }
  // Extract attributes for each type
  const attributeLists = groupedAttributes.map((group) => group.attributes);

  // Generate Cartesian product of attributes
  const combinations = cartesianProduct(attributeLists);

  // Create an array of key-value pairs
  const combinationsArray: Combination[] = [];

  combinations.forEach((combination) => {
    const key = combination.map((attr) => attr.name).join(' / ');
    const value = combination.map((attr, idx) => ({
      name: attr.name,
      type: groupedAttributes[idx].type,
    }));
    const uniqueID = key.split(' / ').join('_'); // Simple way to generate a unique ID
    const detail: { [key: string]: CombinationDetail[] } = { [key]: value };
    combinationsArray.push({ id: uniqueID, details: detail });
  });

  return combinationsArray;
};

const groupByTypeAndName = (combinationsArray: Combination[]): GroupedCombinations => {
  const groupedByTypeAndName: GroupedCombinations = {};

  combinationsArray.forEach((combination) => {
    const key = Object.keys(combination.details)[0];
    const details = combination.details[key] || [];

    details.forEach((detail: CombinationDetail) => {
      if (!groupedByTypeAndName[detail.type]) {
        groupedByTypeAndName[detail.type] = {};
      }

      if (!groupedByTypeAndName[detail.type][detail.name]) {
        groupedByTypeAndName[detail.type][detail.name] = [];
      }

      groupedByTypeAndName[detail.type][detail.name].push(combination);
    });
  });

  return groupedByTypeAndName;
};

const StepOrdersCreation = ({ onBack, onNext, setData, formData }: StepProps<FormValues7>) => {
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();
  sendTrackEventWithUserName('dashboard: Concept | New Concept P2B.2 Ordenes');
  const [removedCombinations, setRemovedCombinations] = useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [disabledStatus, setDisabledStatus] = useState<Record<string, boolean>>({});
  const groupedAttributes = convertToGroupArray(formData?.attributes?.slice(0, 3) || []);
  const attributeTypes = groupedAttributes.map((group: Group) => group.type);
  const defaultPricesObject = useMemo(
    () => arrayToObject(prepareDefaultPricesArray(generateCombinations(groupedAttributes))),
    [groupedAttributes]
  ) as any;
  const formOrdersAttributes = useForm<FormValues7>({
    resolver: zodResolver(schemaStepOrders),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      orders_attributes: defaultPricesObject,
    },
  });
  const { handleSubmit, setValue, clearErrors } = formOrdersAttributes;

  const onSubmit = (data: any) => {
    const ordersObject = data.orders_attributes;

    const updatedOrdersObject: typeof ordersObject = {};

    Object.keys(ordersObject).forEach((key) => {
      if (!removedCombinations.includes(key)) {
        updatedOrdersObject[key] = ordersObject[key];
      }
    });

    setData({ orders_attributes: updatedOrdersObject });
    onNext();
  };

  const handleAction = (itemId: string) => {
    const currentStatus = disabledStatus[itemId] ?? false;
    setDisabledStatus({
      ...disabledStatus,
      [itemId]: !currentStatus,
    });

    currentStatus ? enableById(itemId) : disableById(itemId);
    clearErrors(`orders_attributes.${itemId}.order_price`);
    setRemovedCombinations((prev) => [...prev, itemId]);
  };

  const disableById = (id: string) => {
    setValue(`orders_attributes.${id}.enabled`, 0);
    setValue(`orders_attributes.${id}.order_price`, 0);
    clearErrors(`orders_attributes.${id}.order_price`);
  };

  const enableById = (id: string) => {
    setValue(`orders_attributes.${id}.enabled`, 1);
    setValue(`orders_attributes.${id}.order_price`, defaultPrice);
    clearErrors(`orders_attributes.${id}.order_price`);
  };

  const applyToAll = () => {
    Object.keys(defaultPricesObject).forEach((key) => {
      setValue(`orders_attributes.${key}.order_price`, defaultPrice);
      setValue(`orders_attributes.${key}.enabled`, 1);
      clearErrors(`orders_attributes.${key}.order_price`);
    });
  };

  return (
    <div className="relative ">
      <div className="sticky top-0 z-20 pt-5 pb-6 bg-white">
        <h6 className="text-xl font-bold text-black">Precios</h6>
        <span className="text-sm text-[#637381]">
          Registra los precios que se deberán cobrar para los distintos atributos y opciones de tu concepto.
        </span>
        <span id="divider" className="border-b border-[#919EAB3D] w-full block mt-6" />
      </div>
      <div className="flex items-center justify-between gap-4 pt-2">
        <Select
          name="groupBy"
          placeholder="Agrupar por:"
          className="w-[168px] h-10 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
          onValueChange={(value) => setGroupBy(value !== 'none' ? value : null)}
          disabled={attributeTypes.length === 0}
          labelClassNames="mt-3 px-1"
        >
          <Select.Content className="outline-none z-[999]">
            <Select.Item className="outline-none" value="none" key="">
              Ninguno
            </Select.Item>
            {attributeTypes.map((type: any) => (
              <Select.Item className="outline-none" value={type} key={type}>
                {type}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <div id="vertical-divider" className="border-r border-[#919EAB3D] h-10" />
        <MoneyInput
          onChange={(value) => setDefaultPrice(Number(value))}
          value={defaultPrice}
          prefix="MXN "
          label="Precio base"
          className="max-h-[40px] p-2"
          labelClassNames="bottom-[32px] px-1"
        />
        <Button
          type="button"
          disabled={attributeTypes.length === 0}
          variant="outline"
          size="sm"
          onClick={applyToAll}
          className="h-[40px] w-[170px] text-sm text-green border-green rounded-lg hover:shadow-md"
        >
          Aplicar a todos
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-[69vh] flex flex-col justify-between">
        {!groupBy && (
          <div className={cn('border rounded-lg border-[#DFE3E8] my-6')}>
            <div className="grid grid-cols-2 gap-10 rounded-t-lg px-4 py-2 bg-[#F9FAFB] w-full">
              <span className="text-[#637381] text-sm ">Nombre</span>
              <span className="text-[#637381] text-sm">Precio</span>
            </div>
            <div className="flex flex-wrap w-full px-4 bg-white rounded-b-lg ">
              {generateCombinations(groupedAttributes).map((item, index, array) => {
                const isDisabled = disabledStatus[item.id] || false;
                return (
                  <div
                    className={cn('grid grid-cols-[258px_137px_1fr] py-3 items-center w-full', {
                      'border-b border-[#DFE3E8]': index !== array.length - 1,
                    })}
                    key={Object.keys(item)[0]}
                  >
                    <span
                      className={cn('items-center', {
                        'text-[#637381] line-through': isDisabled,
                      })}
                    >
                      {Object.keys(item.details)[0]}
                    </span>
                    <div className="flex justify-end">
                      {!isDisabled ? (
                        <div className="py-2">
                          <NFormTextField
                            label="Precio"
                            error={
                              formOrdersAttributes.formState.errors.orders_attributes?.[item.id]?.order_price?.message
                            }
                            value={formOrdersAttributes.watch(`orders_attributes.${item.id}.order_price`)}
                            prefix="MXN "
                            className="max-h-[40px] p-1"
                            errorClassNames="hidden"
                          >
                            <CustomInput
                              onChange={(e: any) => {
                                setValue(`orders_attributes.${item.id}.order_price`, Number(e.target.value));
                                clearErrors(`orders_attributes.${item.id}.order_price`);
                              }}
                              value={formOrdersAttributes.watch(`orders_attributes.${item.id}.order_price`)}
                            />
                          </NFormTextField>
                        </div>
                      ) : (
                        <div className="h-[55px]" />
                      )}
                    </div>
                    <MutableIcon action={() => handleAction(item.id)} isIconDisabled={isDisabled} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {groupBy && (
          <div className="space-y-6">
            {Object.entries(groupByTypeAndName(generateCombinations(groupedAttributes))[groupBy]).map(
              ([name, attributes]) => (
                <>
                  <div className="border rounded-lg border-[#DFE3E8] mt-6">
                    <div className="grid grid-cols-2 gap-10 rounded-t-lg px-4 py-2 bg-[#F9FAFB] w-full">
                      <span className="text-[#637381] text-lg font-bold ">{groupBy + ' ' + name}</span>
                    </div>
                    <div className="flex flex-wrap w-full px-5 bg-white rounded-b-lg">
                      {attributes.map((attribute: Combination, index, array) => {
                        const combinationKey = Object.keys(attribute.details)[0];
                        const isDisabled = disabledStatus[attribute.id] || false;

                        return (
                          <div
                            className={cn('grid grid-cols-[258px_137px_1fr] py-3 items-center w-full', {
                              'border-b border-[#DFE3E8]': index !== array.length - 1,
                            })}
                            key={combinationKey}
                          >
                            <span
                              className={cn('items-center', {
                                'text-[#637381] line-through': isDisabled,
                              })}
                            >
                              {combinationKey}
                            </span>
                            <div className="flex justify-end">
                              {!isDisabled ? (
                                <div className="py-2">
                                  <NFormTextField
                                    label="Precio"
                                    error={
                                      formOrdersAttributes.formState.errors.orders_attributes?.[attribute.id]
                                        ?.order_price?.message
                                    }
                                    value={formOrdersAttributes.watch(`orders_attributes.${attribute.id}.order_price`)}
                                    prefix="MXN "
                                    className="max-h-[40px] p-1"
                                    errorClassNames="hidden"
                                  >
                                    <CustomInput
                                      onChange={(e: any) => {
                                        setValue(
                                          `orders_attributes.${attribute.id}.order_price`,
                                          Number(e.target.value)
                                        );
                                        clearErrors(`orders_attributes.${attribute.id}.order_price`);
                                      }}
                                      value={formOrdersAttributes.watch(
                                        `orders_attributes.${attribute.id}.order_price`
                                      )}
                                    />
                                  </NFormTextField>
                                </div>
                              ) : (
                                <div className="h-[55px]" />
                              )}
                            </div>
                            <MutableIcon action={() => handleAction(attribute.id)} isIconDisabled={isDisabled} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        )}
        <ConceptButton
          className="sticky bottom-0 z-30 mt-6"
          onBack={() => {
            onBack();
          }}
          disabledNext={Object.keys(formOrdersAttributes.formState.errors).length > 0}
        />
      </form>
    </div>
  );
};

export const MutableIcon = React.memo(({ action, isIconDisabled }: MutableIconType) => {
  const [isToggle, setIsToggle] = useState(isIconDisabled);

  const handleAction = () => {
    setIsToggle(!isToggle);
    action();
  };

  return (
    <div className="flex items-center justify-end p-2" onClick={handleAction}>
      {isToggle && (
        <Tooltip message="Restablecer opción">
          <IcRefresh
            className={cn('cursor-pointer transition-opacity duration-300', {
              'opacity-0': !isToggle,
              'opacity-100': isToggle,
            })}
          />
        </Tooltip>
      )}
      {!isToggle && (
        <Tooltip message="Eliminar opción">
          <TrashIcon
            className={cn('cursor-pointer w-5 transition-opacity duration-300', {
              'opacity-0': isToggle,
              'opacity-100': !isToggle,
            })}
          />
        </Tooltip>
      )}
    </div>
  );
});

export default StepOrdersCreation;
