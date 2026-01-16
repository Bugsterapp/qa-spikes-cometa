import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Tooltip } from '../atoms/Tooltip';

interface DropdownActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltipMessage?: string;
  testId?: string;
  labelClassName?: string;
}

export const DropdownActionItem: React.FC<DropdownActionItemProps> = ({
  icon,
  label,
  onClick,
  disabled,
  tooltipMessage,
  testId,
  labelClassName,
}) => {
  const button = (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-[#8B93A014] rounded-lg hover:font-bold"
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center w-5 h-5">{icon}</span>
      <span className={labelClassName}>{label}</span>
    </button>
  );

  return (
    <div className="w-full">
      {disabled && tooltipMessage ? (
        <Tooltip message={tooltipMessage} className="w-full">
          <DropdownMenu.Item className="w-full rounded-md outline-none" disabled={disabled}>
            {button}
          </DropdownMenu.Item>
        </Tooltip>
      ) : (
        <DropdownMenu.Item className="w-full rounded-md outline-none" disabled={disabled}>
          {button}
        </DropdownMenu.Item>
      )}
    </div>
  );
};
