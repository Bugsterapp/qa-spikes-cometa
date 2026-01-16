import * as RSelect from '@radix-ui/react-select';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { Label } from '@radix-ui/react-label';
import { cn } from '@cometa/utils';

type SelectProps = PropsWithChildren<{
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  id?: string;
  error?: string;
  labelClassNames?: string;
  isLegacy?: boolean;
}> &
  RSelect.SelectProps;

function Select({
  children,
  placeholder,
  className,
  containerClassName,
  id,
  error,
  labelClassNames,
  isLegacy = true,
  ...props
}: SelectProps) {
  if (isLegacy) {
    return (
      <div
        className={cn('relative group', containerClassName, {
          'mb-2': error,
        })}
      >
        <RSelect.Root {...props} disabled={props.disabled}>
          <RSelect.Trigger
            id={id}
            data-error={error}
            disabled={props.disabled}
            data-testid={placeholder}
            className={cn(
              'bg-white border border-[#919EAB52] group-focus-within:border-[#00AB55] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-[:has(button[data-state="open"])]:border-[#00AB55] transition-colors rounded-lg p-3.5 data-[placeholder]:text-transparent flex flex-nowrap items-center justify-between relative disabled:text-[#919EABCC] h-14 disabled:cursor-not-allowed',
              { 'border-red-400': error },
              className
            )}
          >
            <Label
              htmlFor={id}
              className={cn(
                /* Translated label styles. Trust me, these work as expected 👇 */
                'text-[#919EAB] whitespace-nowrap cursor-pointer absolute z-[9] w-fit h-fit block transition-[top,transform] ease-[cubic-bezier(0.0, 0, 0.2, 1)] group-focus-within:text-[#00AB55] group-[:has(button[data-state="open"])]:text-[#00AB55] bg-white origin-top-left',
                'group-[:has(button[data-placeholder])]:text-base group-[:has(button[data-placeholder])]:left-[0.95rem] group-[:has(button[data-placeholder]:not([data-state="open"]))]:inset-y-0 group-[:has(button[data-placeholder])]:group-[:not(:has(button[data-state="open"]))]:my-auto',
                `group-[:not(:has(button[data-placeholder]))]:scale-75 group-[:not(:has(button[data-state="closed"]))]:scale-75 
                group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-x-[0px] group-[:has(button[data-state="open"])]:translate-x-[0px]
                group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:translate-y-[-24px] group-[:has(button[data-state="open"])]:translate-y-[-24px]  
                group-[:not(:has(button[data-placeholder]))]:group-[:not(:has(button[data-state="closed"]))]:left-[0.95rem] group-[:not(:has(button[data-placeholder]))]:group-[:has(button[data-state="closed"])]:left-[0.95rem]`,
                { 'peer-focus-within:text-[#212B36] text-[#212B36]': error },
                labelClassNames
              )}
            >
              {placeholder}
            </Label>

            {error ? (
              <div className="absolute flex items-center gap-1 mb-1 text-xs font-normal text-red-500 -bottom-6 max-h-4">
                <span className="text-elipsis">{error}</span>
              </div>
            ) : (
              ''
            )}

            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              <RSelect.Value placeholder={placeholder} />
            </div>

            <RSelect.Icon>
              <ChevronIcon className="w-4 h-3 text-[#637381] group-[:has(button[data-state='open'])]:rotate-180 transition-transform" />
            </RSelect.Icon>
          </RSelect.Trigger>
          {children}
        </RSelect.Root>
      </div>
    );
  }

  return (
    <RSelect.Root {...props} disabled={props.disabled}>
      <RSelect.Trigger
        id={id}
        data-error={error}
        disabled={props.disabled}
        className={cn(
          'w-full bg-white border border-[#919EAB52] rounded-lg p-4 flex items-center justify-between disabled:text-[#919EABCC] disabled:cursor-not-allowed data-[placeholder]:text-[#919EAB]',
          { 'border-red-400': error },
          className
        )}
      >
        <RSelect.Value placeholder={placeholder ?? 'Selecciona una opción'} />
        <RSelect.Icon>
          <ChevronIcon className="w-4 h-3 text-[#637381] group-[:has(button[data-state='open'])]:rotate-180 transition-transform" />
        </RSelect.Icon>
      </RSelect.Trigger>

      {children}
    </RSelect.Root>
  );
}

const SelectContent = forwardRef<ElementRef<typeof RSelect.Content>, ComponentPropsWithoutRef<typeof RSelect.Content>>(
  ({ className, children, ...props }, ref) => (
    <RSelect.Portal>
      <RSelect.Content
        ref={ref}
        className={cn(
          'relative z-[51] min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] rounded-md border border-slate-100 bg-white text-slate-700 shadow-md animate-in fade-in-80 max-h-52 overflow-scroll',
          className
        )}
        position="popper"
        {...props}
      >
        {children}
      </RSelect.Content>
    </RSelect.Portal>
  )
);
SelectContent.displayName = RSelect.Content.displayName;

const SelectItem = forwardRef<
  HTMLDivElement,
  RSelect.SelectItemProps & { extraContent?: ReactNode; prefixContent?: ReactNode }
>(({ children, className, extraContent, prefixContent, ...props }, ref) => (
  <RSelect.Item
    key={props.value}
    className={cn('p-3 hover:bg-gray-100 cursor-pointer rounded-md flex items-center flex-row gap-1', className)}
    {...props}
    ref={ref}
  >
    {prefixContent}
    <RSelect.ItemText>{children}</RSelect.ItemText>
    {extraContent}
  </RSelect.Item>
));

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      className={className}
    >
      <title>Chevron Icon</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Value = RSelect.Value;
Select.ChevronIcon = ChevronIcon;

export { Select };
