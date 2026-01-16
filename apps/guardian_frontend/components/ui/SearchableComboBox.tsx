import { useEffect, useState } from 'react';
import { useCombobox } from 'downshift';
import { Check } from 'lucide-react';
import { cn } from '@cometa/utils';

interface ComboBoxProps<T> {
  items: T[];
  label?: string;
  placeholder: string;
  onSelectedItemChange: (selectedItem: T | null) => void;
  itemToString: (item: T | null) => string;
  filterItems: (item: T, inputValue: string) => boolean;
  selectedValue?: T | null;
  onInputValueChange?: (inputValue?: string) => void;
  isLoading?: boolean;
  error?: string;
  id?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  variant?: 'floating' | 'static';
  disabled?: boolean;
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
  error,
  id,
  className,
  containerClassName,
  labelClassName,
  variant = 'floating',
  disabled = false,
}: ComboBoxProps<T>) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    setInputValue,
  } = useCombobox({
    items: filteredItems,
    initialSelectedItem: selectedValue ?? null,
    onInputValueChange: ({ inputValue }) => {
      if (onInputValueChange) onInputValueChange(inputValue);
      setFilteredItems(items.filter((item) => filterItems(item, inputValue || '')));
      setInputValue(inputValue || '');
    },
    itemToString,
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange(selectedItem as T | null);
    },
    isOpen: disabled ? false : undefined,
  });

  useEffect(() => {
    if (isInitialLoad && selectedValue) {
      setInputValue(itemToString(selectedValue));
      setIsInitialLoad(false);
    }
  }, [selectedValue, setInputValue, itemToString, isInitialLoad]);

  return (
    <div className={cn('relative', containerClassName)}>
      {variant === 'static' && label && (
        <label
          {...getLabelProps()}
          htmlFor={id}
          className={cn('block text-sm font-medium mb-1', { 'text-gray-400': disabled }, labelClassName)}
        >
          {label}
        </label>
      )}

      <div
        className={cn('relative group', {
          'mb-2': error,
        })}
      >
        <div
          className={cn(
            'bg-white border border-[#919EAB52] transition-colors rounded-lg p-3.5 flex flex-nowrap items-center justify-between relative',
            variant === 'floating' ? 'h-14' : 'h-11',
            {
              'border-red-400': error && !disabled,
              'group-focus-within:border-[#00AB55]': !disabled,
              'ease-[cubic-bezier(0.0, 0, 0.2, 1)]': !disabled,
              'bg-gray-50 cursor-not-allowed': disabled,
              'opacity-70': disabled,
            },
            className
          )}
        >
          {variant === 'floating' && label && (
            <label
              {...getLabelProps()}
              htmlFor={id}
              className={cn(
                'whitespace-nowrap cursor-pointer absolute z-[9] w-fit h-fit block transition-[top,transform] ease-[cubic-bezier(0.0, 0, 0.2, 1)] bg-white origin-top-left',
                isOpen || selectedItem || getInputProps().value
                  ? 'scale-75 translate-y-[-24px] left-[0.95rem]'
                  : 'text-base left-[0.95rem] inset-y-0 my-auto',
                {
                  'text-[#919EAB]': !disabled,
                  'group-focus-within:text-[#00AB55]': !disabled,
                  'text-gray-400': disabled,
                },
                labelClassName
              )}
            >
              {label}
            </label>
          )}

          {error && !disabled ? (
            <div className="absolute flex items-center gap-1 mb-1 text-xs font-normal text-red-500 -bottom-6 max-h-4">
              <span className="text-elipsis">{error}</span>
            </div>
          ) : null}

          <div className="overflow-hidden text-ellipsis whitespace-nowrap w-full">
            <input
              id={id}
              {...getInputProps()}
              disabled={disabled}
              className={cn('w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0', {
                'cursor-not-allowed text-gray-500': disabled,
              })}
              placeholder={variant === 'floating' ? (isOpen || selectedItem ? '' : placeholder) : placeholder}
              onBlur={() => {
                if (selectedItem) {
                  setInputValue(itemToString(selectedItem));
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedItem && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue('');
                  onSelectedItemChange(null);
                }}
                className="p-1 bg-white rounded-full flex items-center justify-center"
                disabled={disabled}
              >
                <XIcon className="w-4 h-4 text-[#637381]" />
              </button>
            )}

            <button
              type="button"
              {...getToggleButtonProps({ disabled })}
              aria-label="toggle menu"
              className={cn('flex bg-white items-center justify-center', { 'cursor-not-allowed': disabled })}
            >
              <ChevronIcon
                className={cn('w-4 h-4', {
                  'rotate-180': isOpen,
                  'text-[#637381]': !disabled,
                  'text-gray-400': disabled,
                })}
              />
            </button>
          </div>
        </div>

        <ul
          {...getMenuProps()}
          className={cn(
            'absolute z-[51] min-w-full w-full rounded-md border border-slate-100 bg-white text-slate-700 shadow-md animate-in fade-in-80 max-h-52 overflow-auto mt-1',
            !isOpen && 'hidden'
          )}
        >
          {isOpen &&
            (filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <li
                  key={`${itemToString(item)}-${index}`}
                  {...getItemProps({ item, index })}
                  className={cn('p-3 hover:bg-slate-50 cursor-pointer rounded-md flex items-center flex-row gap-1', {
                    'bg-slate-50': highlightedIndex === index,
                  })}
                >
                  {selectedItem === item && <Check className="w-4 h-4 text-[#00AB55]" />}
                  <span>{itemToString(item)}</span>
                </li>
              ))
            ) : (
              <div className="p-3 text-center text-[#919EAB]">
                {isLoading ? 'Cargando resultados...' : 'No hay resultados'}
              </div>
            ))}
        </ul>
      </div>
    </div>
  );
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      className={className}
    >
      <title>Chevron Icon</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      className={className}
    >
      <title>Clear Icon</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default SearchableComboBox;
