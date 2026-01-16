import { Switch } from '@cometa/recreo/v2';
import { cn } from '@cometa/utils';

type ToggleableListItemProps = {
  id: string;
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  showDragHandle?: boolean;
};

export function ToggleableListItem({
  id,
  label,
  description,
  isEnabled,
  onToggle,
  disabled = false,
  className = '',
}: ToggleableListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-[12px] border border-neutral-100 rounded-md',
        'hover:bg-neutral-50 transition-all duration-200',
        className
      )}
    >
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
  );
}
