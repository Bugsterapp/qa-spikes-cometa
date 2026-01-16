import * as React from 'react';
import * as RSelect from '@radix-ui/react-select';
import cn from 'classnames';

const Select = RSelect.Root;

const SelectGroup = RSelect.Group;

const SelectValue = RSelect.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RSelect.Trigger
    ref={ref}
    className={cn(
      'relative group appearance-none border border-[#919EAB52] data-[error=true]:border-[#FF4842] data-[error=true]:mb-3 rounded-l-xl p-4 flex justify-between bg-transparent items-center',
      className
    )}
    {...props}
  >
    {children}
  </RSelect.Trigger>
));
SelectTrigger.displayName = RSelect.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof RSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RSelect.Portal>
    <div className="relative">
      <RSelect.Content
        position="popper"
        side="bottom"
        ref={ref}
        className={cn(
          'max-h-[250px] mt-1 animate-in fade-in-80 relative z-50 min-w-[6rem] overflow-hidden bg-white text-slate-700 shadow-card rounded-[14px]',
          className
        )}
        {...props}
      >
        <RSelect.Viewport>{children}</RSelect.Viewport>
      </RSelect.Content>
    </div>
  </RSelect.Portal>
));
SelectContent.displayName = RSelect.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof RSelect.Label>,
  React.ComponentPropsWithoutRef<typeof RSelect.Label>
>(({ className, ...props }, ref) => (
  <RSelect.Label
    ref={ref}
    className={cn('py-2 pr-2 pl-8 text-sm font-semibold text-slate-900', className)}
    {...props}
  />
));
SelectLabel.displayName = RSelect.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof RSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RSelect.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm p-4 gap-2 text-sm font-medium outline-none focus:bg-[#EDEFF2] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state-checked="true"]:bg-gray-300',
      className
    )}
    {...props}
  >
    <RSelect.ItemText>{children}</RSelect.ItemText>
  </RSelect.Item>
));
SelectItem.displayName = RSelect.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof RSelect.Separator>,
  React.ComponentPropsWithoutRef<typeof RSelect.Separator>
>(({ className, ...props }, ref) => (
  <RSelect.Separator ref={ref} className={cn('-mx-1 h-px bg-[#919EAB3D]', className)} {...props} />
));
SelectSeparator.displayName = RSelect.Separator.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };
