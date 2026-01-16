import { Button } from '@cometa/recreo';
import { cn } from '@cometa/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Tooltip } from '../Tooltip';
import IcMoreOption from '/public/assets/icons/minimal/ic_more.svg';

export type DropdownConceptID = {
  children: React.ReactNode;
  className?: string;
  classNameContent?: string;
  tooltipMessage?: string;
};

const ThreeDotsDropdown = ({ children, className, tooltipMessage, classNameContent }: DropdownConceptID) => (
  <div>
    <DropdownMenu.Root>
      {tooltipMessage ? (
        <Tooltip message={tooltipMessage} side="bottom">
          <ThreeDotsButton className={className} />
        </Tooltip>
      ) : (
        <ThreeDotsButton className={className} />
      )}

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[220px] bg-white rounded-md p-[5px] fixed -right-[20px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-20',
            classNameContent
          )}
          sideOffset={5}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
);

function ThreeDotsButton({ className }: { className?: string }) {
  return (
    <DropdownMenu.Trigger asChild>
      <Button
        className={cn('px-2 py-1.5 rounded-lg border border-legacy', className)}
        aria-label="threeDotbutton"
        data-testid="threeDotbutton"
        variant="text"
        color="legacy"
      >
        <IcMoreOption className="text-legacy" />
      </Button>
    </DropdownMenu.Trigger>
  );
}

export default ThreeDotsDropdown;
