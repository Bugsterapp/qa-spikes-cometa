import { useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import { Check } from 'lucide-react';
import { cn } from '/src/utils/cn';

interface ComboBoxProps<T> {
  items: T[];
  label: string;
  placeholder: string;
  onSelectedItemChange: (selectedItem: T | null) => void;
  itemToString: (item: T | null) => string;
  filterItems: (item: T, inputValue: string) => boolean;
  selectedValue?: T | null;
  onInputValueChange?: (inputValue?: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
}

const SearchableComboBox = <T,>({
  items,
  label,
  placeholder,
  onSelectedItemChange,
  itemToString,
  filterItems,
  selectedValue,
  onInputValueChange,
  isLoading,
  hasError = false,
}: ComboBoxProps<T>) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items: filteredItems,
    selectedItem: selectedValue ?? null,
    onInputValueChange: ({ inputValue, isOpen, selectedItem: currentSelected }) => {
      if (isOpen || !currentSelected) {
        if (onInputValueChange) onInputValueChange(inputValue);
      }
      setFilteredItems(items.filter((item) => filterItems(item, inputValue || '')));
    },
    itemToString,
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange(selectedItem as T | null);
    },
  });

  return (
    <div>
      <div className="relative flex flex-col w-full gap-1">
        <div
          className={cn(
            'flex rounded-lg px-4 py-2 border bg-white gap-0.5 justify-between items-center',
            hasError
              ? 'border-red-500'
              : 'border-[#C0C9D8] focus-within:ring-green focus-within:hover:ring-green focus-within:ring-[1.5px]'
          )}
        >
          <div className="w-full">
            <label className="w-fit text-xs px-1 text-[#717993] absolute -top-2.5 bg-white" {...getLabelProps()}>
              {label}
            </label>
            <input
              placeholder={placeholder}
              className="w-full px-1.5 focus-within:outline-none border-none outline-none focus:outline-none focus-within:ring-0"
              {...getInputProps()}
            />
          </div>
          <button aria-label="toggle menu" className="px-2 pt-1" type="button" {...getToggleButtonProps()}>
            {isOpen ? (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.94116 7.18907L6.06568 3.06454L10.1902 7.18907C10.6048 7.60364 11.2745 7.60364 11.6891 7.18907C12.1036 6.77449 12.1036 6.10478 11.6891 5.69021L6.80979 0.810935C6.39522 0.396356 5.72551 0.396356 5.31093 0.810935L0.431664 5.69021C0.0170859 6.10478 0.017086 6.77449 0.431664 7.18907C0.846243 7.59302 1.52658 7.60365 1.94116 7.18907Z"
                  fill="#717993"
                />
              </svg>
            ) : (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.1796 0.810934L6.05505 4.93546L1.93052 0.810934C1.51594 0.396355 0.84624 0.396355 0.431661 0.810934C0.0170829 1.22551 0.0170829 1.89522 0.431661 2.30979L5.31093 7.18907C5.72551 7.60364 6.39521 7.60364 6.80979 7.18907L11.6891 2.30979C12.1036 1.89522 12.1036 1.22551 11.6891 0.810934C11.2745 0.406986 10.5942 0.396355 10.1796 0.810934Z"
                  fill="#717993"
                />
              </svg>
            )}
          </button>
          {selectedItem && (
            <button
              type="button"
              onClick={() => {
                onSelectedItemChange(null);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <ul
          className={cn(
            'shadow-lg w-full rounded-md bg-white mt-1 max-h-72 overflow-scroll p-0 z-10',
            !isOpen && 'hidden'
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            (filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <li
                  className={cn('py-2 px-3 shadow-sm flex flex-col', {
                    'bg-gray-200': highlightedIndex === index,
                    'font-bold': selectedItem === item,
                  })}
                  key={itemToString(item)}
                  {...getItemProps({ item, index })}
                >
                  <span className="flex">
                    {selectedItem === item && <Check />}
                    {itemToString(item)}
                  </span>
                </li>
              ))
            ) : (
              <li className="flex flex-col px-3 py-2 shadow-sm">
                <span>{isLoading ? 'Cargando resultados...' : 'No encontramos el elemento'}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchableComboBox;
