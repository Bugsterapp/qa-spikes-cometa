import { useCallback } from 'react';

type ColorInputsProps = {
  hexInput: string;
  rgbInput: { r: number; g: number; b: number };
  onHexChange: (hex: string) => void;
  onRgbChange: (channel: 'r' | 'g' | 'b', value: string) => void;
};

export function ColorInputs({ hexInput, rgbInput, onHexChange, onRgbChange }: ColorInputsProps) {
  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onHexChange(e.target.value);
    },
    [onHexChange]
  );

  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b') => (e: React.ChangeEvent<HTMLInputElement>) => {
      onRgbChange(channel, e.target.value);
    },
    [onRgbChange]
  );

  return (
    <div className="mx-[16px] mb-[24px] grid grid-cols-[1fr_0.7fr_0.7fr_0.7fr] gap-[8px]">
      <div>
        <label className="block text-[14px] font-semibold text-[#111111] mb-[4px] leading-[16px] pl-[4px]">Hex</label>
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          className="w-full h-[40px] px-[16px] py-[12px] border border-[#bac1d8] rounded-[8px] text-[14px] text-[#111111] leading-[16px]"
        />
      </div>

      <div>
        <label className="block text-[14px] font-semibold text-[#111111] mb-[4px] leading-[16px] pl-[4px]">R</label>
        <input
          type="number"
          min="0"
          max="255"
          value={rgbInput.r}
          onChange={handleRgbChange('r')}
          className="w-full h-[40px] px-[16px] py-[12px] border border-[#bac1d8] rounded-[8px] text-[14px] text-[#111111] leading-[16px]"
        />
      </div>

      <div>
        <label className="block text-[14px] font-semibold text-[#111111] mb-[4px] leading-[16px] pl-[4px]">G</label>
        <input
          type="number"
          min="0"
          max="255"
          value={rgbInput.g}
          onChange={handleRgbChange('g')}
          className="w-full h-[40px] px-[16px] py-[12px] border border-[#bac1d8] rounded-[8px] text-[14px] text-[#111111] leading-[16px]"
        />
      </div>

      <div>
        <label className="block text-[14px] font-semibold text-[#111111] mb-[4px] leading-[16px] pl-[4px]">B</label>
        <input
          type="number"
          min="0"
          max="255"
          value={rgbInput.b}
          onChange={handleRgbChange('b')}
          className="w-full h-[40px] px-[16px] py-[12px] border border-[#bac1d8] rounded-[8px] text-[14px] text-[#111111] leading-[16px]"
        />
      </div>
    </div>
  );
}
