import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from './color-conversions';
import { SaturationBrightnessSelector } from './saturation-brightness-selector';
import { HueSlider } from './hue-slider';
import { ColorInputs } from './color-inputs';

type ColorPickerPanelProps = {
  color: string;
  onChange: (color: string) => void;
};

export const ColorPickerPanel = forwardRef<HTMLDivElement, ColorPickerPanelProps>(({ color, onChange }, ref) => {
  const rgb = hexToRgb(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const [hue, setHue] = useState(hsv.h);
  const [saturation, setSaturation] = useState(hsv.s);
  const [brightness, setBrightness] = useState(hsv.v);
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [rgbInput, setRgbInput] = useState(rgb);
  const isUserTypingHexRef = useRef(false);
  const isUserTypingRgbRef = useRef(false);

  useEffect(() => {
    const newRgb = hsvToRgb(hue, saturation, brightness);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);

    if (!isUserTypingHexRef.current) {
      setHexInput(newHex.toUpperCase());
    }
    if (!isUserTypingRgbRef.current) {
      setRgbInput(newRgb);
    }

    onChange(newHex);
  }, [hue, saturation, brightness, onChange]);

  const handleSaturationBrightnessChange = useCallback((newSaturation: number, newBrightness: number) => {
    isUserTypingHexRef.current = false;
    isUserTypingRgbRef.current = false;
    setSaturation(newSaturation);
    setBrightness(newBrightness);
  }, []);

  const handleHueChange = useCallback((newHue: number) => {
    isUserTypingHexRef.current = false;
    isUserTypingRgbRef.current = false;
    setHue(newHue);
  }, []);

  const handleHexInputChange = useCallback(
    (value: string) => {
      setHexInput(value);
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        const newRgb = hexToRgb(value);
        const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
        setRgbInput(newRgb);
        setHue(newHsv.h);
        setSaturation(newHsv.s);
        setBrightness(newHsv.v);
        onChange(value);
        isUserTypingHexRef.current = false;
        isUserTypingRgbRef.current = false;
      } else {
        isUserTypingHexRef.current = true;
      }
    },
    [onChange]
  );

  const handleRgbInputChange = useCallback(
    (channel: 'r' | 'g' | 'b', value: string) => {
      const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
      const newRgb = { ...rgbInput, [channel]: numValue };
      isUserTypingRgbRef.current = true;
      isUserTypingHexRef.current = true;
      setRgbInput(newRgb);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHexInput(newHex.toUpperCase());
      setHue(newHsv.h);
      setSaturation(newHsv.s);
      setBrightness(newHsv.v);
      onChange(newHex);
    },
    [rgbInput, onChange]
  );

  const pureHueColor = hsvToRgb(hue, 1, 1);
  const pureHueHex = rgbToHex(pureHueColor.r, pureHueColor.g, pureHueColor.b);

  return (
    <div
      ref={ref}
      className="absolute top-full mt-[22px] z-50 bg-white rounded-[12px] shadow-[0px_16px_32px_0px_rgba(35,23,5,0.26)] w-[368px] left-1/2 -translate-x-1/2"
    >
      <div className="absolute -top-[6px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white left-1/2 -translate-x-1/2" />

      <SaturationBrightnessSelector
        saturation={saturation}
        brightness={brightness}
        hexColor={hexInput}
        pureHueHex={pureHueHex}
        onChange={handleSaturationBrightnessChange}
      />

      <HueSlider hue={hue} pureHueHex={pureHueHex} onChange={handleHueChange} />

      <ColorInputs
        hexInput={hexInput}
        rgbInput={rgbInput}
        onHexChange={handleHexInputChange}
        onRgbChange={handleRgbInputChange}
      />
    </div>
  );
});

ColorPickerPanel.displayName = 'ColorPickerPanel';
