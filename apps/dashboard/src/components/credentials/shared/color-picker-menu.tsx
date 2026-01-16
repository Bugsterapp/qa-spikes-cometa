import { cn } from '@cometa/utils';
import { useCredential } from '../credential-context';
import { CREDENTIAL_SIDE } from '../types';
import { ColorPicker } from './color-picker';
import { lightenColor } from '../utils/color';

function FlipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path
        d="M17 8V6C17 5.46957 16.7893 4.96086 16.4142 4.58579C16.0391 4.21071 15.5304 4 15 4H9M9 4L12 1M9 4L12 7M17 12V17C17 17.5304 16.7893 18.0391 16.4142 18.4142C16.0391 18.7893 15.5304 19 15 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ColorPickerMenuProps = {
  className?: string;
};

export function ColorPickerMenu({ className = '' }: ColorPickerMenuProps) {
  const { config, setConfig, side, toggleSide } = useCredential();

  const textColor = config.color_scheme.text_color;
  const backgroundColor = config.color_scheme.background.primary;
  const flipText = side === CREDENTIAL_SIDE.FRONT ? 'Ver dorso' : 'Ver frente';

  function handleTextColorChange(newColor: string) {
    setConfig({
      ...config,
      color_scheme: {
        ...config.color_scheme,
        text_color: newColor,
      },
    });
  }

  function handleBackgroundColorChange(newColor: string) {
    setConfig({
      ...config,
      color_scheme: {
        ...config.color_scheme,
        background: {
          primary: newColor,
          secondary: lightenColor(newColor, 0.25),
        },
      },
    });
  }
  return (
    <div
      className={cn(
        'bg-white border border-neutral-300 rounded-[8px] flex items-center justify-center gap-[12px] px-[71px] py-3 w-[356px] shadow-[0px_20px_25px_-5px_rgba(34,40,58,0.1),0px_8px_10px_-6px_rgba(34,40,58,0.1)]',
        className
      )}
    >
      <button
        onClick={toggleSide}
        className="flex items-center gap-3 text-sm leading-5 text-[#22283a] hover:text-neutral-700 transition-colors flex-shrink-0"
        type="button"
      >
        <FlipIcon />
        <span className="font-normal whitespace-nowrap">{flipText}</span>
      </button>

      <div className="flex items-center gap-[30px] flex-shrink-0">
        <ColorPicker label="Texto" color={textColor} onChange={handleTextColorChange} showBorder />

        <ColorPicker label="Fondo" color={backgroundColor} onChange={handleBackgroundColorChange} showBorder />
      </div>
    </div>
  );
}
