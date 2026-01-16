import { useState, useRef, useEffect, useCallback } from 'react';
import { ColorPickerPanel } from './color-picker-panel';

type ColorPickerProps = {
  label: string;
  color: string;
  onChange: (color: string) => void;
  showBorder?: boolean;
};

export function ColorPicker({ label, color, onChange, showBorder = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePicker = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex items-center gap-[12px]">
      <div className="relative flex items-center">
        <button
          onClick={togglePicker}
          className={`w-[19px] h-[19px] rounded-full flex-shrink-0 ${showBorder ? 'border border-[#cdcdcd]' : ''}`}
          style={{ backgroundColor: color }}
          type="button"
        />

        {isOpen ? <ColorPickerPanel ref={pickerRef} color={color} onChange={onChange} /> : null}
      </div>

      <span className="font-normal whitespace-nowrap text-sm leading-5 text-[#22283a]">{label}</span>
    </div>
  );
}
