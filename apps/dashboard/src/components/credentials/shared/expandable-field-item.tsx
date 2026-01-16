import type { ReactNode } from 'react';
import { Switch } from '@cometa/recreo/v2';
import { Separator } from '@cometa/recreo/components/ui/Separator';
import { cn } from '@cometa/utils';

type ExpandableFieldItemProps = {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function ExpandableFieldItem({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  children,
  disabled,
  className,
}: ExpandableFieldItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col border border-neutral-100 hover:bg-neutral-50 transition-all duration-200 rounded-md',
        className
      )}
    >
      <div className="flex items-center justify-between p-[12px]">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <label
              htmlFor={id}
              className={cn('block text-base font-medium', {
                'text-neutral-900 cursor-pointer': !disabled,
                'text-neutral-400 cursor-not-allowed': disabled,
              })}
            >
              {label}
            </label>
            {description ? (
              <p
                className={cn('text-sm mt-1 leading-relaxed', {
                  'text-neutral-600': !disabled,
                  'text-neutral-400': disabled,
                })}
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex-shrink-0 mt-1">
            <Switch id={id} checked={isEnabled} onCheckedChange={onToggle} disabled={disabled} />
          </div>
        </div>
      </div>

      {isEnabled ? (
        <>
          <div className="flex justify-center">
            <Separator className="w-[95%]" />
          </div>
          <div className="px-[12px] pb-[12px] pt-[12px]">{children}</div>
        </>
      ) : null}
    </div>
  );
}
