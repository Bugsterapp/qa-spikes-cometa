import * as RSelect from '@radix-ui/react-select';
import { ComponentPropsWithoutRef, ElementRef, forwardRef, PropsWithChildren } from 'react';
import { cn } from '../utils/cn';
import Chevron from '/public/assets/icons/chevron.svg';
import { Label } from '@radix-ui/react-label';

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
    <div className={cn('relative group', containerClassName)}>
      <RSelect.Root {...props}>
        <RSelect.Trigger
          id={triggerId}
          data-error={error}
          className={cn(
            'bg-white border border-[#919EAB52] group-focus-within:border-[#00AB55] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-[:has(button[data-state="open"])]:border-[#00AB55] transition-colors rounded-lg p-3.5 data-[placeholder]:text-transparent flex flex-nowrap items-center justify-between relative disabled:text-[#919EABCC]',
            { 'border-red-400': error },
            className
          )}
        >
          <Label
            htmlFor={triggerId}
            className={cn(
              /* Translated label styles. Trust me, these work as expected 👇 */
              'text-[#919EAB] cursor-pointer absolute z-[9] w-fit h-fit block transition-[top,transform] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-focus-within:text-[#00AB55] group-[:has(button[data-state="open"])]:text-[#00AB55] bg-white origin-top-left',
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
            <div className="absolute flex items-center gap-1 text-xs font-thin text-red-500 -bottom-6 max-h-4">
              <span className="text-elipsis">{error}</span>
            </div>
          ) : (
            ''
          )}
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
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
          'relative z-50 min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-slate-100 bg-white text-slate-700 shadow-md animate-in fade-in-80',
          className
        )}
        position="popper"
        {...props}
      >
        <RSelect.Viewport className="p-1 max-h-52 scrollbar data-[radix-select-viewport]:">{children}</RSelect.Viewport>
      </RSelect.Content>
    </RSelect.Portal>
  )
);
SelectContent.displayName = RSelect.Content.displayName;

const SelectItem = forwardRef<HTMLDivElement, RSelect.SelectItemProps>(({ children, className, ...props }, ref) => (
  <RSelect.Item className={cn('p-4 hover:bg-gray-100 cursor-pointer rounded-md', className)} {...props} ref={ref}>
    <RSelect.ItemText>{children}</RSelect.ItemText>
    <RSelect.ItemIndicator>{/* <CheckIcon /> */}</RSelect.ItemIndicator>
  </RSelect.Item>
));

Select.Content = SelectContent;
Select.Item = SelectItem;

export default Select;
