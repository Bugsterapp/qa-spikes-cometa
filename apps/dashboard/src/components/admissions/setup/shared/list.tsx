import { Button, Switch } from '@cometa/recreo/v2';
import { cn } from '@cometa/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, GripVertical, Plus } from 'lucide-react';
import { memo } from 'react';
import { CheckIcon } from '../../icons';

type ListItemProps = {
  title: string | React.ReactNode;
  subtitle?: string;
  number?: number | string;
  isCompleted?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  showDragHandle?: boolean;
  className?: string;
  onClick?: () => void;
};

export function ListItem({
  title,
  subtitle,
  number,
  isCompleted = false,
  onAction,
  actionLabel = 'Configurar',
  actionDisabled = false,
  showDragHandle = false,
  className = '',
  onClick,
}: ListItemProps) {
  const displayTitle = number ? `${number} - ${title}` : title;

  return (
    <ListItemWrapper className={className} onClick={onClick}>
      <div className="flex items-center gap-3 flex-1">
        <DraggableItem showDragHandle={showDragHandle} />

        <div className="flex flex-col flex-1">
          <span className="text-base font-semibold text-neutral-900">{displayTitle}</span>

          {subtitle || onAction ? (
            <div className="flex items-center gap-1">
              {subtitle ? <span className="text-sm text-neutral-900">{subtitle}</span> : null}

              {onAction ? (
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction();
                  }}
                  disabled={actionDisabled}
                  className="p-0 h-auto hover:bg-transparent font-normal gap-1"
                >
                  {actionLabel}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <CheckIcon isChecked={isCompleted} />
    </ListItemWrapper>
  );
}

type SortableListItemProps<T> = {
  item: T;
  onAction?: (item: T) => void;
  getTitle: (item: T) => string;
  getNumber?: (item: T) => number | string;
  getId: (item: T) => string;
  isCompleted?: boolean;
  actionLabel?: string;
  showDragHandle?: boolean;
  onClick?: (item: T) => void;
  isDraggable?: boolean;
};

function SortableListItemComponent<T>({
  item,
  onAction,
  getTitle,
  getNumber,
  getId,
  isCompleted,
  actionLabel,
  showDragHandle = true,
  onClick,
  isDraggable = true,
}: SortableListItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getId(item),
    disabled: !isDraggable,
  });

  const style = isDraggable
    ? {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
      }
    : {};

  const handleClick = onClick ? () => onClick(item) : undefined;
  const handleAction = onAction ? () => onAction(item) : undefined;

  const content = (
    <div className="relative">
      <ListItem
        title={getTitle(item)}
        number={getNumber?.(item)}
        isCompleted={isCompleted}
        onAction={handleAction}
        actionLabel={actionLabel}
        showDragHandle={showDragHandle && isDraggable}
        onClick={handleClick}
      />
      {showDragHandle && isDraggable ? (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-[13px] top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-900 z-10"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      ) : null}
    </div>
  );

  if (isDraggable) {
    return (
      <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
        {content}
      </div>
    );
  }

  return content;
}

export const SortableListItem = memo(SortableListItemComponent) as typeof SortableListItemComponent;

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
  showDragHandle = true,
}: ToggleableListItemProps) {
  return (
    <ListItemWrapper className={className}>
      <div className="flex items-center gap-3 flex-1">
        <DraggableItem showDragHandle={showDragHandle} />

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
    </ListItemWrapper>
  );
}

type AddButtonProps = {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
};

export function AddButton({ onClick, label, icon = <Plus className="w-4 h-4" />, className = '' }: AddButtonProps) {
  return (
    <Button variant="ghost" onClick={onClick} className={cn('hover:bg-transparent w-fit', className)}>
      {icon}
      {label}
    </Button>
  );
}

function DraggableItem({ showDragHandle }: { showDragHandle: boolean }) {
  if (!showDragHandle) {
    return null;
  }

  return (
    <div className="cursor-grab active:cursor-grabbing text-neutral-400">
      <GripVertical className="w-5 h-5" />
    </div>
  );
}

type ListItemWrapperProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

function ListItemWrapper({ children, className, onClick }: ListItemWrapperProps) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between p-3 border border-neutral-100 rounded-md',
        'hover:bg-neutral-50 transition-all duration-200',
        {
          'cursor-pointer': onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
