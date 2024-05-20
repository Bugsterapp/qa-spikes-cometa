import { PropsWithChildren } from 'react';

type CIconButtonProps = PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
}>;

export default function CIconButton({ disabled, onClick, children }: CIconButtonProps) {
  return (
    <button
      type="button"
      className="text-white bg-transparent enabled:hover:bg-gray-200 disabled:cursor-not-allowed font-medium rounded-full text-sm p-2 text-center outline-none"
      data-testid="close-button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
