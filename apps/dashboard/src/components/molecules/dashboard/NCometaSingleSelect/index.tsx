import { Combobox } from '@headlessui/react';
import { IconButton } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import IcSearch from '/public/assets/icons/ic_search.svg';
import IcClose from '/public/assets/icons/ic_close.svg';
import { formatPrice } from '/src/utils/general';
import SelectChip from '/src/components/atoms/SelectChip';

interface CAutocompleteProps {
  placeholder: string;
  setSelected: (arg0: string | null) => void;
  currentValue: any;
  data: any[];
  disabled?: boolean;
  isLoading?: boolean;
}

const CAutocomplete = ({
  data,
  setSelected,
  placeholder,
  currentValue,
  disabled = false,
  isLoading,
}: CAutocompleteProps) => {
  const [renderOptions, setRenderOptions] = React.useState<any[]>(data);
  useEffect(() => {
    setRenderOptions(data);
  }, [data]);
  const statusPercent = ['BRILLAMONT', 'PERCENT'];
  const refinedData = useMemo(() => {
    const dataFiltered = renderOptions?.sort((a, b) => a.is_assigned - b.is_assigned);
    return dataFiltered;
  }, [renderOptions]);

  const handleInputChange = (value: string) => {
    const newData = data ? data.filter((item) => item.name.toLowerCase().includes(value.toLowerCase())) : data;
    setRenderOptions(newData);
  };

  return (
    <>
      {currentValue ? (
        <div className="flex items-center justify-between relative w-full border-2 rounded-lg shadow-sm px-4 py-4 mb-4 text-left cursor-default focus-within:outline-none focus-within:ring-1 ring-blue-500 border-blue-500 sm:text-sm font-semibold group focus:ring-0">
          {currentValue.name}
          <IconButton
            onClick={() => {
              setSelected(null);
            }}
            disabled={disabled}
          >
            <IcClose fill="#212B36" />
          </IconButton>
        </div>
      ) : (
        <>
          <div className="flex items-center relative w-full border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 mb-4 text-left cursor-default focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 sm:text-sm group">
            <IcSearch />
            <Combobox disabled={disabled} value={currentValue} onChange={setSelected}>
              <Combobox.Button className="bg-transparent">
                <Combobox.Input
                  onChange={(event) => {
                    handleInputChange(event.target.value);
                  }}
                  autoComplete="off"
                  placeholder={placeholder}
                  className="block w-full pl-3 pr-10 py-2 text-base border-0 bg-transparent rounded-md focus:outline-none sm:text-sm focus:ring-0"
                />
              </Combobox.Button>
              <Combobox.Options
                as="div"
                className="absolute z-10 flex flex-col w-full px-3 py-4 mt-1 text-base list-none bg-white rounded-md shadow-lg top-full right-0 max-h-60 focus:outline-none sm:text-sm"
              >
                <ul className="overflow-y-auto">
                  {!isLoading && refinedData ? (
                    <>
                      {refinedData?.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item}
                          className="flex items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]"
                          disabled={item.is_assigned || item.is_already_assigned}
                          onClick={() => {
                            setSelected(item);
                          }}
                        >
                          <span
                            className={`${
                              (item.is_assigned || item.is_already_assigned) && 'text-[#B3B3B3]'
                            } text-base disabled:opacity-50`}
                          >
                            {item.name}
                          </span>
                          {item.is_assigned && <SelectChip theme="blue">Ya asignado</SelectChip>}
                          {item.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                          {item.is_already_assigned && <SelectChip theme="blue">Ya asignada</SelectChip>}
                          {item.type && !item.is_already_assigned && (
                            <div className="py-1 px-2 rounded-lg text-[#229A16] bg-[#54D62C1F] font-bold text-xs w-max">
                              {statusPercent.includes(item.type)
                                ? `${parseFloat(item.value)}%`
                                : formatPrice(item.value, 'MXN')}{' '}
                              de dscto
                            </div>
                          )}
                        </Combobox.Option>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full text-gray-600 h-8 bg-white border-none pt-1 rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]">
                      <span className="text-base bg-gray-200 w-full h-full rounded-lg py-1 px-2">Cargando...</span>
                    </div>
                  )}
                  {refinedData.length < 1 && (
                    <div className="flex text-gray-600 flex-col items-start font-normal gap-1 p-1">
                      <span className="text-base">No se encontraron resultados</span>
                    </div>
                  )}
                </ul>
              </Combobox.Options>
            </Combobox>
          </div>
        </>
      )}
    </>
  );
};

export default CAutocomplete;
