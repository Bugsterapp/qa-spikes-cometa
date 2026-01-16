import { useRef, useCallback } from 'react';

type SaturationBrightnessSelectorProps = {
  saturation: number;
  brightness: number;
  hexColor: string;
  pureHueHex: string;
  onChange: (saturation: number, brightness: number) => void;
};

export function SaturationBrightnessSelector({
  saturation,
  brightness,
  hexColor,
  pureHueHex,
  onChange,
}: SaturationBrightnessSelectorProps) {
  const saturationRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!saturationRef.current) return;
      const rect = saturationRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min((e as MouseEvent).clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min((e as MouseEvent).clientY - rect.top, rect.height));
      onChange(x / rect.width, 1 - y / rect.height);
    },
    [onChange]
  );

  const selectorX = saturation * 100;
  const selectorY = (1 - brightness) * 100;

  return (
    <div
      ref={saturationRef}
      className="relative h-[262px] rounded-[8px] border border-[rgba(0,0,0,0.1)] cursor-crosshair mx-[16px] mt-[16px] mb-[16px]"
      style={{
        background: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%),
                     linear-gradient(to right, rgba(255,255,255,1) 0%, ${pureHueHex} 100%)`,
        backgroundBlendMode: 'multiply',
      }}
      onMouseDown={(e) => {
        handleChange(e);
        const handleMove = (moveEvent: MouseEvent) => {
          handleChange(moveEvent);
        };
        const handleUp = () => {
          document.removeEventListener('mousemove', handleMove);
          document.removeEventListener('mouseup', handleUp);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
      }}
    >
      <div
        className="absolute w-[32px] h-[32px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${selectorX}%`, top: `${selectorY}%` }}
      >
        <div className="absolute inset-0 rounded-full bg-white border-2 border-[rgba(0,0,0,0.1)]" />
        <div
          className="absolute inset-[25%] rounded-full border-2 border-white"
          style={{ backgroundColor: hexColor }}
        />
        <div className="absolute inset-[25%] rounded-full border border-black/20" />
      </div>
    </div>
  );
}
