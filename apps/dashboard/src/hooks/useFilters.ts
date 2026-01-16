import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

type FormFilterData = Record<string, { checked: boolean; name: string }>;

export function useFilters() {
  const [formFilterData, setFormFilterData] = useState<FormFilterData>({});
  const [itemsCount, setItemsCount] = useState<{ watchKey: string; count: number }[]>([]);

  const formRef = useRef() as React.MutableRefObject<UseFormReturn<FormFilterData>>;

  function handleFilter(data: FormFilterData, methods: UseFormReturn<FormFilterData>) {
    formRef.current = methods;
    setFormFilterData(data);
  }

  function handleChangeChipFilter(data: FormFilterData) {
    setFormFilterData(data);
    formRef.current && formRef.current.reset(data);
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  }

  function handleClearFilter() {
    setFormFilterData({});
    formRef && formRef.current && formRef.current.reset({});
    setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
  }

  return {
    formFilterData,
    handleFilter,
    handleChangeChipFilter,
    handleClearFilter,
    itemsCount,
    setItemsCount,
  };
}
