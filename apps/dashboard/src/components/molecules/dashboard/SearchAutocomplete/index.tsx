import { Combobox } from '@headlessui/react';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SearchAutocompleteProps {
  autocompleteKey?: any;
  data: any[];
  optionLabel: (option: any) => string;
  renderOption: (props: any, option: any) => any;
  onChangeTextField: (event: any) => void;
  onChangeAutocomplete: (event: any, value: any, reason: string) => void;
  onClickAutocomplete: (event: any) => void;
  labelTextField?: string;
  placeholderTextField: string;
  inputText: string;
  icon?: any;
  width?: string;
  loading?: boolean;
}

export default function SearchAutocomplete(props: SearchAutocompleteProps) {
  const {
    data,
    renderOption,
    onChangeTextField,
    onChangeAutocomplete,
    onClickAutocomplete,
    placeholderTextField,
    inputText,
    width,
    loading,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue(null);
    onChangeAutocomplete(null, null, 'clear');
  };

  return (
    <div ref={containerRef} className="h-full" style={{ width: width || '14rem' }}>
      <Combobox
        onChange={(value) => {
          setSelectedValue(value);
          onChangeAutocomplete(null, value, 'selectOption');
          setIsOpen(false);
        }}
      >
        {({ open }) => (
          <div className="relative w-full">
            <div className="flex items-center w-full border border-[#DDE1E5] rounded-lg overflow-hidden bg-white">
              <div className="flex items-center pl-3 pointer-events-none">
                {props.icon ? props.icon : <Search size={20} />}
              </div>
              <Combobox.Input
                className="flex-1 w-auto min-w-0 pl-3 py-4 border-none text-base placeholder:text-[#919EAB] bg-transparent active:outline-none focus:outline-none focus-within:ring-0 focus:ring-0 peer truncate"
                onChange={onChangeTextField}
                onClick={(e) => {
                  setIsOpen(true);
                  onClickAutocomplete(e);
                }}
                placeholder={placeholderTextField}
                value={inputText}
              />
              {selectedValue && inputText && (
                <button
                  onClick={handleClearSelection}
                  className="shrink-0 flex items-center justify-center w-6 h-6 mr-3 cursor-pointer"
                  type="button"
                >
                  <X size={20} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-0.5" />
                </button>
              )}
            </div>

            {(open || isOpen) && (loading || data.length > 0) && (
              <Combobox.Options
                static
                className="absolute top-full left-0 z-50 mt-2 w-full bg-white shadow-[0_5px_5px_-3px_rgba(0,0,0,0.2),0_8px_10px_1px_rgba(0,0,0,0.14),0_3px_14px_2px_rgba(0,0,0,0.12)] max-h-60 rounded overflow-auto focus:outline-none text-base"
              >
                {loading ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Cargando...</div>
                ) : (
                  data.map((option, index) => (
                    <Combobox.Option
                      key={index}
                      value={option}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 text-sm break-words ${
                          active ? 'bg-[rgba(0,0,0,0.04)]' : 'bg-white'
                        }`
                      }
                    >
                      {renderOption({}, option)}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            )}
          </div>
        )}
      </Combobox>
    </div>
  );
}
