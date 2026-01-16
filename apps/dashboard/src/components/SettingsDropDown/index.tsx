import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@cometa/utils';
import { Tooltip } from '../atoms/Tooltip';

type SettingsDropDownProps = {
  children: React.ReactNode;
  className?: string;
  tooltipMessage?: string;
};

const SettingsDropDown = ({ children, className, tooltipMessage }: SettingsDropDownProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div>
      <DropdownMenu.Root onOpenChange={setMenuOpen} open={menuOpen}>
        {tooltipMessage ? (
          <Tooltip message={tooltipMessage} side="top">
            <ThreeDotsButton className={className} isActive={menuOpen} />
          </Tooltip>
        ) : (
          <ThreeDotsButton className={className} isActive={menuOpen} />
        )}

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[220px] bg-white rounded-[14px] p-2 z-20 text-sm font-lota shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]"
            side="bottom"
            sideOffset={5}
            align="start"
            collisionBoundary={document.body}
            collisionPadding={10}
            avoidCollisions
          >
            {children}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

function ThreeDotsButton({ className, isActive }: { className?: string; isActive?: boolean }) {
  return (
    <DropdownMenu.Trigger asChild>
      <button
        className={cn(
          'flex items-center rounded-full justify-center w-10 h-10 outline-none transition-shadow',
          isActive ? 'bg-[#F3F6FB]' : 'bg-white hover:bg-[#F3F6FB]',
          className
        )}
        aria-label="threeDotbutton"
        data-testid="threeDotbutton"
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.99983 2.66667C2.73621 2.66667 3.33317 2.06971 3.33317 1.33333C3.33317 0.596954 2.73621 0 1.99983 0C1.26346 0 0.666504 0.596954 0.666504 1.33333C0.666504 2.06971 1.26346 2.66667 1.99983 2.66667Z"
            fill="#1C1C1D"
          />
          <path
            d="M1.99983 9.33354C2.73621 9.33354 3.33317 8.73658 3.33317 8.00021C3.33317 7.26383 2.73621 6.66687 1.99983 6.66687C1.26346 6.66687 0.666504 7.26383 0.666504 8.00021C0.666504 8.73658 1.26346 9.33354 1.99983 9.33354Z"
            fill="#1C1C1D"
          />
          <path
            d="M1.99983 15.9998C2.73621 15.9998 3.33317 15.4029 3.33317 14.6665C3.33317 13.9301 2.73621 13.3331 1.99983 13.3331C1.26346 13.3331 0.666504 13.9301 0.666504 14.6665C0.666504 15.4029 1.26346 15.9998 1.99983 15.9998Z"
            fill="#1C1C1D"
          />
        </svg>
      </button>
    </DropdownMenu.Trigger>
  );
}

export default SettingsDropDown;
