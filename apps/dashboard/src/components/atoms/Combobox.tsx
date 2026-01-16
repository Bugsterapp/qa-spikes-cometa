import { useCombobox, type UseComboboxProps } from 'downshift';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '/src/utils/cn';

export interface Item {
  [key: string]: any;
}

export interface ComboboxProps<TData extends Item = Item> {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  items: TData[];
  setSearch: (search: string) => void;
  keyLabel: string;
  handleSelection: (item: TData | null) => void;
  className?: string;
  isItemDisabled?: UseComboboxProps<TData>['isItemDisabled'];
  defaultIsOpen?: UseComboboxProps<TData>['defaultIsOpen'];
}
interface ComboboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode;
  onReset?: () => void;
}

interface ComboboxOptionProps {
  value: Item;
  className?: string;
  children: React.ReactNode;
  index: number;
  isSelected?: boolean;
  allowHighlight?: boolean;
}
// will add type later
const ComboboxContext = createContext<any>(null);

export const useComboboxContext = () => {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error('useComboboxContext must be used within a Combobox');
  }
  return context;
};

export function Combobox<TData extends Item = Item>({
  children,
  value,
  onChange,
  items,
  setSearch,
  keyLabel,
  handleSelection,
  className,
  isItemDisabled = () => false,
  defaultIsOpen = false,
}: ComboboxProps<TData>) {
  const [selectedItem, setSelectedItem] = useState<TData | null>(null);

  useEffect(() => {
    const item = items.find((item) => item[keyLabel] === value);
    setSelectedItem(item || null);
  }, [value, items, keyLabel]);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    ...props
  } = useCombobox<TData>({
    defaultIsOpen,
    selectedItem,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem !== undefined && selectedItem !== null) {
        setSelectedItem(selectedItem);
        onChange(selectedItem?.[keyLabel] || '');
        handleSelection(selectedItem);
      }
    },
    items,
    onInputValueChange: ({ inputValue }) => {
      if (inputValue !== undefined) {
        setSearch(inputValue);
      }
    },
    itemToString(item) {
      return item ? item[keyLabel] : '';
    },
    onStateChange: ({ type, inputValue }) => {
      if (type === useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem) {
        setSelectedItem(null);
        handleSelection(null);
      }
      if (type === useCombobox.stateChangeTypes.InputBlur) {
        if (inputValue === '') {
          setSelectedItem(null);
          handleSelection(null);
        }
      }
    },
    isItemDisabled,
  });
  const clearResults = () => {
    setSearch('');
    setSelectedItem(null);
    handleSelection(null);
  };
  return (
    <ComboboxProvider
      value={{
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        clearResults,
        ...props,
      }}
    >
      <div className={cn('outline-none w-72', className)}>{children}</div>
    </ComboboxProvider>
  );
}

export const ComboboxProvider = ComboboxContext.Provider;

export function ComboboxInput({ className, icon, onReset, ...props }: ComboboxInputProps) {
  const { getInputProps, clearResults, selectedItem } = useComboboxContext();

  const clearInput = () => {
    clearResults();
    onReset?.();
  };
  return (
    <div className="flex border border-[#DDE1E5] rounded-lg items-center">
      {icon && <span className="pr-2 pl-3 text-[#637381]">{icon}</span>}
      <input
        {...getInputProps({
          ...props,
          onKeyDown: (e: any) => {
            if (e.key === 'Escape') {
              clearInput();
            }
          },
        })}
        placeholder={props.placeholder || 'Buscar...'}
        className={cn(
          'py-4 border-none text-base placeholder:text-[#919EAB] rounded-r-lg w-full active:outline-none focus:outline-none focus-within:ring-0 focus:ring-0 peer px-1 truncate',
          className
        )}
      />
      {selectedItem && (
        <button onClick={clearInput} type="button" className="flex items-center justify-center w-6 h-6 mr-2 bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <title>Clear</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

Combobox.Input = ComboboxInput;

function ComboboxOptions({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, getMenuProps } = useComboboxContext();
  const isHidden = !(isOpen && (Array.isArray(children) ? !!children.length : !!children));
  if (isHidden) return null;
  return (
    <ul
      {...getMenuProps()}
      className={cn('z-30 absolute w-72 bg-white mt-1 max-h-80 overflow-scroll p-3 rounded-lg', className)}
    >
      {isOpen ? children : null}
    </ul>
  );
}

function ComboboxOption({ value, className, children, index, isSelected, allowHighlight = true }: ComboboxOptionProps) {
  const { highlightedIndex, getItemProps, selectedItem } = useComboboxContext();
  const optionProps = getItemProps({ item: value, index, isSelected });
  const optionClassName = cn(
    'grid grid-cols-[85%_1fr] gap-2 items-center justify-between w-full p-3 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]',
    'aria-disabled:cursor-not-allowed aria-disabled:bg-gray-200',
    {
      'font-bold': selectedItem === value,
      'bg-blue-300': allowHighlight && highlightedIndex === index,
    },
    className
  );
  return (
    <li {...optionProps} key={optionProps.id} className={optionClassName}>
      {children}
    </li>
  );
}

function ComboboxHighlight({ children }: { children: React.ReactNode }) {
  const query = useComboboxContext()?.inputValue;

  const highlight = (text: string) => highlightMatch(text, query);

  return <span>{React.Children.map(children, (child) => (typeof child === 'string' ? highlight(child) : child))}</span>;
}
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);
  const regex = new RegExp(`(${normalizedQuery})`, 'gi');
  const matchIndices: Array<[number, number]> = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalizedText)) !== null) {
    matchIndices.push([match.index, match.index + match[1].length]);
  }

  if (matchIndices.length === 0) return text;

  const parts: Array<string> = [];
  let lastIndex = 0;

  for (const [start, end] of matchIndices) {
    parts.push(text.slice(lastIndex, start));
    parts.push(text.slice(start, end));
    lastIndex = end;
  }

  parts.push(text.slice(lastIndex));

  return (
    <span>
      {parts.map((part, index) =>
        normalize(part).toLowerCase() === normalizedQuery.toLowerCase() ? <strong key={index}>{part}</strong> : part
      )}
    </span>
  );
}

function normalize(str: string): string {
  return String(str)
    .normalize('NFD') // Decompose Unicode characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}
Combobox.Highlight = ComboboxHighlight;
Combobox.Options = ComboboxOptions;
Combobox.Option = ComboboxOption;
