import * as RSelect from '@radix-ui/react-select';
import { ComponentPropsWithoutRef, ElementRef, forwardRef, PropsWithChildren, ReactNode } from 'react';
import { cn } from '../utils/cn';
import Chevron from '/public/assets/icons/chevron.svg';
import { Label } from '@radix-ui/react-label';
import * as ScrollArea from '@radix-ui/react-scroll-area';

type SelectProps = PropsWithChildren<{
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  error?: string;
  labelClassNames?: string;
}> &
  RSelect.SelectProps;

const Select = ({
  children,
  placeholder,
  className,
  containerClassName,
  id,
  error,
  labelClassNames,
  ...props
}: SelectProps) => {
  const triggerId = id ?? 'recss-select';

  return (
    <div
      className={cn('relative group', containerClassName, {
        'mb-2': error,
      })}
    >
      <RSelect.Root {...props} disabled={props.disabled}>
        <RSelect.Trigger
          id={triggerId}
          data-error={error}
          disabled={props.disabled}
          className={cn(
            'bg-white border border-[#919EAB52] group-focus-within:border-[#00AB55] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-[:has(button[data-state="open"])]:border-[#00AB55] transition-colors rounded-lg p-3.5 data-[placeholder]:text-transparent flex flex-nowrap items-center justify-between relative disabled:text-[#919EABCC] h-14 disabled:cursor-wait',
            { 'border-red-400': error },
            className
          )}
          data-testid="schoolCycle-combobox"
        >
          <Label
            htmlFor={triggerId}
            className={cn(
              /* Translated label styles. Trust me, these work as expected 👇 */
              'text-[#919EAB] whitespace-nowrap cursor-pointer absolute z-[9] w-fit h-fit block transition-[top,transform] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-focus-within:text-[#00AB55] group-[:has(button[data-state="open"])]:text-[#00AB55] bg-white origin-top-left',
              'group-[:has(button[data-placeholder])]:text-base group-[:has(button[data-placeholder])]:left-[0.95rem] group-[:has(button[data-placeholder]:not([data-state="open"]))]:inset-y-0 group-[:has(button[data-placeholder])]:group-[:not(:has(button[data-state="open"]))]:my-auto',
              `group-[:not(:has(button[data-placeholder]))]:scale-75 group-[:not(:has(button[data-state="closed"]))]:scale-75 
              group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-x-[0px] group-[:has(button[data-state="open"])]:translate-x-[0px]
              group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-y-[-24px] group-[:has(button[data-state="open"])]:translate-y-[-24px]
              group-[:not(:has(button[data-placeholder]))]:group-[:not(:has(button[data-state="closed"]))]:left-[0.95rem] group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:left-[0.95rem]`,
              labelClassNames
            )}
          >
            {placeholder}
          </Label>
          {error ? (
            <div className="flex absolute -bottom-6 gap-1 items-center mb-1 max-h-4 text-xs font-thin text-red-500">
              <span className="text-elipsis">{error}</span>
            </div>
          ) : (
            ''
          )}
          <div className="flex overflow-hidden flex-row gap-2 whitespace-nowrap text-ellipsis">
            <RSelect.Value placeholder={placeholder} />
          </div>
          <RSelect.Icon>
            <Chevron className="w-4 h-3 text-[#637381] group-[:has(button[data-state='open'])]:rotate-180 transition-transform" />
          </RSelect.Icon>
        </RSelect.Trigger>
        {children}
      </RSelect.Root>
    </div>
  );
};

const SelectContent = forwardRef<ElementRef<typeof RSelect.Content>, ComponentPropsWithoutRef<typeof RSelect.Content>>(
  ({ className, children, ...props }, ref) => (
    <RSelect.Portal>
      <RSelect.Content
        ref={ref}
        className={cn(
          'overflow-scroll relative max-h-52 bg-white rounded-md border shadow-md z-[51] min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] border-slate-100 text-slate-700 animate-in fade-in-80',
          className
        )}
        position="popper"
        {...props}
      >
        <ScrollArea.Root className="ScrollAreaRoot" type="auto">
          <RSelect.Viewport asChild>
            <ScrollArea.Viewport className="ScrollAreaViewport">{children}</ScrollArea.Viewport>
          </RSelect.Viewport>
          <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
            <ScrollArea.Thumb className="ScrollAreaThumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </RSelect.Content>
    </RSelect.Portal>
  )
);
SelectContent.displayName = RSelect.Content.displayName;

const SelectItem = forwardRef<HTMLDivElement, RSelect.SelectItemProps & { extraContent?: ReactNode }>(
  ({ children, className, extraContent, ...props }, ref) => (
    <RSelect.Item
      key={props.value}
      className={cn('p-3 rounded-md flex items-center flex-row gap-1', className, {
        'hover:bg-gray-100 cursor-pointer': !props.disabled,
        'bg-white': props.disabled,
      })}
      {...props}
      ref={ref}
    >
      <RSelect.ItemText>{children}</RSelect.ItemText>
      <RSelect.ItemIndicator>{/* <CheckIcon /> */}</RSelect.ItemIndicator>
      {extraContent}
    </RSelect.Item>
  )
);

Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Value = RSelect.Value;
export default Select;
