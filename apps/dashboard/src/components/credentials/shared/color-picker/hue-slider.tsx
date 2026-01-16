import { useRef, useCallback } from 'react';

type HueSliderProps = {
  hue: number;
  pureHueHex: string;
  onChange: (hue: number) => void;
};

export function HueSlider({ hue, pureHueHex, onChange }: HueSliderProps) {
  const hueRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min((e as MouseEvent).clientX - rect.left, rect.width));
      onChange((x / rect.width) * 360);
    },
    [onChange]
  );

  const hueX = (hue / 360) * 100;

  return (
    <div className="mx-[16px] mb-[16px]">
      <div
        ref={hueRef}
        className="relative h-[12px] rounded-[24px] border border-[rgba(0,0,0,0.1)] cursor-pointer"
        style={{
          background:
            'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
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
          className="absolute w-[32px] h-[32px] top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${hueX}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-white border-2 border-[rgba(0,0,0,0.1)]" />
          <div
            className="absolute inset-[25%] rounded-full border-2 border-white"
            style={{ backgroundColor: pureHueHex }}
          />
          <div className="absolute inset-[25%] rounded-full border border-black/20" />
        </div>
      </div>
    </div>
  );
}
