import React, { ReactNode, useState } from 'react';
import { cn } from '@cometa/utils';
import { Combobox } from '@headlessui/react';
import IcSearch from '/public/assets/icons/ic_search.svg';
import IcClose from '/public/assets/icons/ic_close.svg';

type ComboboxOption = { id: string; name: string };

type ComboboxProps<T> = {
  children: ((filteredOptions: T[]) => ReactNode[]) | ReactNode[];
  placeholder: string;
  selectedOption: T | null;
  setSelectedOption: (option: T | null) => void;
  data: T[];
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
};

export function Root<T extends ComboboxOption>({
  children,
  placeholder,
  selectedOption,
  setSelectedOption,
  disabled,
  isLoading,
  data,
  className,
}: ComboboxProps<T>) {
  const [filteredOptions, setFilteredOptions] = useState(data);

  const handleInputChange = (value: string) => {
    const options = data.filter((item) => item?.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredOptions(options);
  };

  if (selectedOption) {
    return (
      <div className="flex items-center justify-between relative w-full border-2 rounded-lg shadow-sm px-4 py-4 mb-4 text-left cursor-default focus-within:outline-none focus-within:ring-1 ring-blue-500 border-blue-500 sm:text-sm font-semibold group focus:ring-0">
        {selectedOption.name}
        <button
          onClick={() => setSelectedOption(null)}
          disabled={disabled}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
        >
          <IcClose fill="#212B36" />
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center w-full text-gray-600 bg-white border-2 h-16 px-4 py-2 rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]">
        Cargando...
      </div>
    );
  }

  if (filteredOptions.length === 0) {
    return (
      <div className="flex text-gray-600 flex-col items-start font-sm gap-1 p-1">
        <span className="text-base">No se encontraron resultados</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center relative w-full border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 mb-4 text-left cursor-default focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 sm:text-sm group',
        className
      )}
    >
      <IcSearch />
      <Combobox disabled={disabled} value={selectedOption}>
        <Combobox.Button className="bg-transparent">
          <Combobox.Input
            onChange={(event) => handleInputChange(event.target.value)}
            autoComplete="off"
            placeholder={placeholder}
            className="block w-full pl-3 pr-10 py-2 text-base border-0 bg-transparent rounded-md focus:outline-none sm:text-sm focus:ring-0"
          />
        </Combobox.Button>
        <Combobox.Options className="absolute z-10 flex flex-col w-full px-3 py-4 mt-1 text-base list-none bg-white rounded-md shadow-lg top-full right-0 max-h-60 focus:outline-none sm:text-sm">
          <div className="overflow-y-auto">{typeof children === 'function' ? children(filteredOptions) : children}</div>
        </Combobox.Options>
      </Combobox>
    </div>
  );
}

export function Option<T extends ComboboxOption>({
  children,
  option,
  setSelectedOption,
  disabled,
}: {
  children: ReactNode;
  option: T;
  setSelectedOption: (option: T) => void;
  disabled?: boolean;
}) {
  return (
    <Combobox.Option
      key={option.id}
      value={option.id}
      className="flex items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]"
      onClick={() => setSelectedOption(option)}
      disabled={disabled}
    >
      {children}
    </Combobox.Option>
  );
}
