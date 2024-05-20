import { gray } from 'tailwindcss/colors';
interface BoxColorTextProps {
  bgcolor?: string;
  color?: string;
  text: string;
}

const BoxColorText = ({ bgcolor, color, text }: BoxColorTextProps) => (
  <div
    className="py-px px-[7px] rounded-[4px] inline-flex bg-[var(--box-color-text-bg)] text-[var(--box-color-text)]"
    style={
      { '--box-color-text-bg': bgcolor || gray[100], '--box-color-text': color || gray[800] } as React.CSSProperties
    }
  >
    <span className="font-bold text-[10px]">{text}</span>
  </div>
);

export default BoxColorText;
