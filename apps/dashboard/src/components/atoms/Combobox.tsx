import { useCombobox } from 'downshift';
import React, { useEffect, useState } from 'react';
import { cn } from '/src/utils/cn';
import { createContext, useContext } from 'react';

interface Item {
  [key: string]: any;
}

interface ComboboxProps {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  items: Item[];
  setSearch: (search: string) => void;
  keyLabel: string;
  handleSelection: (item: Item) => void;
}
interface ComboboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode;
}

interface ComboboxOptionProps {
  value: Item;
  className?: string;
  children: React.ReactNode;
  index: number;
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

export function Combobox({ children, value, onChange, items, setSearch, keyLabel, handleSelection }: ComboboxProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
  } = useCombobox({
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
        handleSelection({});
      }
      if (type === useCombobox.stateChangeTypes.InputBlur) {
        if (inputValue === '') {
          setSelectedItem(null);
          handleSelection({});
        }
      }
    },
  });
  const clearResults = () => {
    setSearch('');
    setSelectedItem(null);
    handleSelection({});
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
      <div className="outline-none w-72">{children}</div>
    </ComboboxProvider>
  );
}

export const ComboboxProvider = ComboboxContext.Provider;

export function ComboboxInput({ className, icon, ...props }: ComboboxInputProps) {
  const { getInputProps, clearResults, selectedItem } = useComboboxContext();

  return (
    <div className="flex border border-[#DDE1E5] rounded-lg items-center">
      {icon && <span className="pr-2 pl-3 text-[#637381]">{icon}</span>}
      <input
        {...getInputProps({
          ...props,
          onKeyDown: (e: any) => {
            if (e.key === 'Escape') {
              clearResults();
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
        <button onClick={clearResults} className="flex items-center justify-center w-6 h-6 mr-2 bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
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
  return (
    <ul
      {...getMenuProps()}
      className={cn(
        'z-30 absolute w-72 bg-white mt-1 max-h-80 overflow-scroll p-3 rounded-lg',
        {
          hidden: !(isOpen && children),
        },
        className
      )}
    >
      {isOpen ? children : null}
    </ul>
  );
}

function ComboboxOption({ value, className, children, index }: ComboboxOptionProps) {
  const { highlightedIndex, getItemProps, selectedItem } = useComboboxContext();
  const optionProps = getItemProps({ item: value, index });
  const optionClassName = cn(
    selectedItem === value && 'font-bold',
    'grid grid-cols-[85%_1fr] gap-2 items-center justify-between w-full p-3 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]',
    highlightedIndex === index && 'bg-blue-300',
    className
  );
  return (
    <li {...optionProps} key={optionProps.index} className={optionClassName}>
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

  matchIndices.forEach(([start, end]) => {
    parts.push(text.slice(lastIndex, start));
    parts.push(text.slice(start, end));
    lastIndex = end;
  });

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
