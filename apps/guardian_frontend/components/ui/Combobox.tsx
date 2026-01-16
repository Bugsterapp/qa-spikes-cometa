import React from 'react';
import { useCombobox, UseComboboxProps } from 'downshift';
import { cn } from '@cometa/utils';
import CustomInput from '../atoms/guardians/CustomInput';
import CustomFormField from '~/components/CustomFormField';
import Chevron from '~/public/icons/chevron.svg';
import { matchSorter, MatchSorterOptions } from 'match-sorter';

type ComboboxOption = Record<string, any>;

type ComboboxProps<T = ComboboxOption> = {
  options: T[];
  placeholder: string;
  optionIdentifier: keyof T;
  sorterOptions: MatchSorterOptions;
} & Omit<UseComboboxProps<T>, 'items'>;

function getOptionsFilter(inputValue: string, sorterOptions: MatchSorterOptions) {
  if (!inputValue) {
    return () => true;
  }
  return (option: ComboboxOption) => matchSorter([option], inputValue, sorterOptions).length > 0;
}

function Combobox({ options, placeholder, optionIdentifier, itemToString, sorterOptions, ...props }: ComboboxProps) {
  const [items, setItems] = React.useState(options);
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    setInputValue,
    getItemProps,
    selectedItem,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setItems(options.filter(getOptionsFilter(inputValue, sorterOptions)));
      setInputValue(inputValue);
    },
    items,
    itemToString: itemToString ? itemToString : (item) => (item ? item.label : ''),
    ...props,
  });

  return (
    <>
      <CustomFormField label={placeholder}>
        <CustomInput theme="recreo" className="w-full p-5 pr-9" placeholder="" {...getInputProps()} />
        <button
          aria-label="toggle menu"
          className="absolute inset-y-0 h-2 my-auto right-5"
          type="button"
          {...getToggleButtonProps()}
        >
          <Chevron
            className={cn('text-[#2B2D30] w-4', {
              'rotate-180': isOpen,
            })}
          />
        </button>
      </CustomFormField>

      <ul
        className={`absolute bg-white !-mt-5 shadow-md max-h-80 overflow-y-scroll p-0 z-10 ${cn({
          hidden: !isOpen,
        })}`}
        {...getMenuProps()}
      >
        {isOpen &&
          (items.length > 0 ? (
            items.map((item, index) => (
              <li
                className={cn(
                  highlightedIndex === index && 'bg-blue-300',
                  selectedItem === item && 'font-bold',
                  'py-2 px-3 shadow-sm flex flex-col'
                )}
                key={item[optionIdentifier]}
                {...getItemProps({ item, index })}
              >
                <span>{itemToString ? itemToString(item) : ''}</span>
              </li>
            ))
          ) : (
            <li className="py-2 px-3 shadow-sm flex flex-col w-full">
              <span>
                {!selectedItem ? 'No se encontraron resultados' : itemToString ? itemToString(selectedItem) : ''}
              </span>
            </li>
          ))}
      </ul>
    </>
  );
}

export default Combobox;
