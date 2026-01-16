import React, { MouseEvent, useCallback, useState, useEffect, useMemo } from 'react';
import { useSelect } from 'downshift';
import { cn } from '/src/utils/cn';
import Chevron from '/public/assets/icons/chevron.svg';
import CheckBox from '/src/components/atoms/CheckBox';
import { useTableConfig } from '/src/hooks/useTableConfig';

export type Item<T> = {
  label: string;
  value: T;
};

type MultipleSelectionComponentProps<T> = {
  items: Item<T>[];
  classNames?: string;
  label?: string;
  allSelectedLabel?: string;
  className?: string;
  fullWidth?: boolean;
  disableAll?: boolean;
  labelName?: string;
  showSelectAll?: boolean;
  onChange?: (items: Item<T>[]) => void;
  formData?: any;
  tableName?: string;
};

interface FiltersConfig<T> {
  selected_items?: Item<T>[];
}

const Label = ({ className, children }: React.PropsWithChildren<{ className: string }>) => (
  <label className={className}>{children}</label>
);

function MultipleSelectionComponent<T>({
  items,
  onChange,
  classNames,
  label = 'Select items',
  allSelectedLabel,
  className,
  fullWidth,
  labelName = 'items',
  showSelectAll = true,
  disableAll,
  formData,
  tableName,
}: MultipleSelectionComponentProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Item<T>[]>(items);

  const {
    shouldUseApi,
    tableConfig,
    isLoading,
    initializedRef,
    previousSchoolIdRef,
    schoolId,
    upsertConfig,
    processTableConfig,
  } = useTableConfig<FiltersConfig<T>>({ tableName });

  const processedTableConfig = useMemo(
    () =>
      processTableConfig<Item<T>[]>((filtersConfig: FiltersConfig<T>) => {
        if (
          filtersConfig?.selected_items &&
          Array.isArray(filtersConfig.selected_items) &&
          filtersConfig.selected_items.length > 0
        ) {
          return filtersConfig.selected_items;
        }
        return null;
      }),
    [processTableConfig, tableConfig]
  );

  const updateTableConfig = (selected_items: Item<T>[]) => {
    if (shouldUseApi) {
      upsertConfig({
        selected_items,
      });
    }
  };

  useEffect(() => {
    if (previousSchoolIdRef.current && previousSchoolIdRef.current !== schoolId) {
      initializedRef.current = false;

      if (disableAll) {
        setSelectedItems([]);
        onChange?.([]);
      } else if (items.length > 0) {
        setSelectedItems(items);
        onChange?.(items);
      }
    }
  }, [schoolId, items, disableAll, onChange, initializedRef, previousSchoolIdRef]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    if (shouldUseApi && isLoading) {
      return;
    }

    if (processedTableConfig) {
      setSelectedItems(processedTableConfig);
      onChange?.(processedTableConfig);
      initializedRef.current = true;
      return;
    } else if (!disableAll && items.length > 0) {
      setSelectedItems(items);
      onChange?.(items);
      initializedRef.current = true;
      return;
    }

    if (formData?.months_to_pay && formData.months_to_pay.length > 0) {
      setSelectedItems(formData.months_to_pay);
      onChange?.(formData.months_to_pay);
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
  }, [processedTableConfig, isLoading, formData, items, disableAll, onChange, shouldUseApi, initializedRef]);

  const { isOpen, getMenuProps, getItemProps, getToggleButtonProps, highlightedIndex } = useSelect<Item<T>>({
    items,
    itemToString: (item) => (item ? item.label : ''),
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;

      setSelectedItems((prevState) => {
        const index = prevState.indexOf(selectedItem);
        let newState;

        if (index > -1) {
          newState = [...prevState.slice(0, index), ...prevState.slice(index + 1)];
        } else {
          newState = [...prevState, selectedItem];
        }

        onChange?.(newState);

        updateTableConfig(newState);

        return newState;
      });
    },
  });

  const isSelected = useCallback(
    (item: Item<T>) => selectedItems.some((selectedItem) => selectedItem.label === item.label),
    [selectedItems]
  );

  const handleCheckboxClick = (e: MouseEvent<HTMLInputElement>, item: Item<T>) => {
    e.stopPropagation();
    setSelectedItems((prevState) => {
      const newState = isSelected(item) ? prevState.filter((i) => i.label !== item.label) : [...prevState, item];

      onChange?.(newState);

      updateTableConfig(newState);

      return newState;
    });
  };

  const selectAllItems = (e: MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newState = selectedItems.length === items.length ? [] : items;
    setSelectedItems(newState);
    onChange?.(newState);

    updateTableConfig(newState);
  };

  const displaySelectedItems = (selectedItems: Item<T>[]) => {
    const selectedItemCount = selectedItems.length;
    const allItemsSelected = selectedItemCount === items.length;

    if (selectedItemCount === 0) {
      return `Seleccionar ${labelName}`;
    } else if (allItemsSelected) {
      return allSelectedLabel || `Todos ${labelName}`;
    } else if (selectedItemCount === 1) {
      return selectedItems[0].label;
    } else {
      return selectedItems.map((item) => item.label).join(', ');
    }
  };

  return (
    <div className={cn('relative w-full', className)} aria-disabled={disableAll}>
      <div
        {...getToggleButtonProps()}
        className={cn(
          'cursor-pointer py-3.5 px-4 bg-white border border-gray-300 rounded-lg flex justify-between items-center focus-within:border-green-500 group max-h-[54px] max-w-[320px] w-full overflow-hidden',
          { 'border-green-500': isOpen },
          { 'w-full max-w-full': fullWidth },
          classNames
        )}
        data-testid="multiselect-dropButton"
        aria-disabled={disableAll}
      >
        <Label
          className={cn(
            'text-gray-500 absolute z-10 w-auto h-auto block transition-all ease-in-out duration-200 bg-white origin-top-left group-focus-within:border-green-500 group-focus-within:text-green-500 group-focus-within',
            'scale-75 transform -translate-y-6 left-4',
            { 'text-green-500': isOpen },
            {
              'scale-100 transform translate-y-0': !isOpen && selectedItems.length === 0 && labelName !== 'meses',
            }
          )}
        >
          {label}
        </Label>
        <span
          className={cn(
            'select-none whitespace-nowrap overflow-hidden overflow-ellipsis',
            { 'text-white': !isOpen || selectedItems.length < 1 },
            { 'text-foreground': (!isOpen && selectedItems.length > 0) || labelName === 'meses' }
          )}
          data-testid={`${label}-list`}
        >
          {displaySelectedItems(selectedItems)}
        </span>
        <Chevron className={cn('w-4 h-3 text-[#637381]', { 'transform rotate-180': isOpen })} />
      </div>
      <ul
        {...getMenuProps()}
        className={cn(
          'w-full bg-white max-h-[412px] overflow-auto rounded-md border border-slate-100 text-slate-700 shadow-md animate-in fade-in-80 z-40 absolute scrollbar top-full',
          { block: isOpen },
          { hidden: !isOpen }
        )}
      >
        {showSelectAll && isOpen && (
          <li
            onClick={(e: any) => {
              selectAllItems(e);
            }}
            className={cn('p-3 cursor-pointer hover:bg-slate-100 select-none')}
          >
            <CheckBox checked={selectedItems.length === items.length} readOnly className="mr-3" />
            Seleccionar todo
          </li>
        )}
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`${item.value}-${index}-${item.label}`}
              {...getItemProps({ item, index })}
              id={item.value as string}
              data-testid={`${item.label}-listOption`}
              onChange={(e) => e.preventDefault()}
              onClick={(e: any) => {
                handleCheckboxClick(e, item);
              }}
              className={cn(
                'p-3 cursor-pointer hover:bg-slate-100',
                { 'bg-gray-100': highlightedIndex === index },
                { 'bg-gray-200': isSelected(item) }
              )}
            >
              {' '}
              <CheckBox checked={isSelected(item)} readOnly className="mr-3" />
              {item.label}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default MultipleSelectionComponent;
