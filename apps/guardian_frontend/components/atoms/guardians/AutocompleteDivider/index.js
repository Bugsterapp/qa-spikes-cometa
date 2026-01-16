import { useState, useRef, useEffect } from 'react';

export const AutocompleteDivider = ({
  options = [],
  value,
  onChange,
  placeholder = '',
  disabled = false,
  getOptionLabel,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const getLabel = (option) => {
    if (getOptionLabel) return getOptionLabel(option);
    if (option?.name && option?.value) return `${option.value} - ${option.name}`;
    return option || '';
  };

  const filteredOptions = options.filter((option) => {
    const label = getLabel(option).toString().toLowerCase();
    return label.includes(inputValue.toLowerCase());
  });

  useEffect(() => {
    if (value) {
      setInputValue(getLabel(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option) => {
    setInputValue(getLabel(option));
    setIsOpen(false);
    if (onChange) {
      onChange(null, option);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleOptionClick(filteredOptions[highlightedIndex], highlightedIndex);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-[#1D2939] placeholder-gray-400 text-base peer pb-1 pt-3 px-5 rounded-lg border-none outline outline-transparent outline-1 disabled:bg-[#E4E5F4] disabled:text-[#909095] group-data-[error=true]:outline-error focus:outline-transparent bg-white shadow-[0px_2px_50px_0px_#6C6CCD26]"
          autoComplete="off"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li key={index} className="border-b border-gray-200 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleOptionClick(option, index)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                    className={`w-full text-left px-4 py-2 focus:outline-none transition-colors ${
                      highlightedIndex === index ? 'bg-[rgba(0,0,0,0.04)]' : 'bg-white'
                    }`}
                  >
                    <span className="block text-sm text-gray-900">{getLabel(option)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};
