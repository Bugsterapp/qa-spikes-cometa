import { cn } from '@cometa/utils';
import type { LucideIcon } from 'lucide-react';

type TextEditorButtonProps = {
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function TextEditorButton({ icon: Icon, isActive, onClick, disabled = false }: TextEditorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative shrink-0 flex items-center justify-center hover:opacity-100 transition-opacity disabled:cursor-not-allowed',
        isActive ? 'opacity-100' : 'opacity-60'
      )}
    >
      <Icon className="w-[11px] h-[11px] text-[#a5acc4]" />
    </button>
  );
}
