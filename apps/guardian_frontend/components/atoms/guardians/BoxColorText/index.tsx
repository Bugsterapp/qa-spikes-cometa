import { gray } from 'tailwindcss/colors';
import { cn } from '~/lib/cn';
interface BoxColorTextProps extends React.HTMLAttributes<HTMLDivElement> {
  bgcolor?: string;
  color?: string;
  text: string;
}

const BoxColorText = ({ bgcolor, color, text, className }: BoxColorTextProps) => (
  <div
    className={cn(
      'py-px px-[7px] rounded-[4px] inline-flex bg-[var(--box-color-text-bg)] text-[var(--box-color-text)]',
      className
    )}
    style={
      { '--box-color-text-bg': bgcolor || gray[100], '--box-color-text': color || gray[800] } as React.CSSProperties
    }
  >
    <span className="font-bold text-[10px] leading-4">{text}</span>
  </div>
);

export default BoxColorText;
