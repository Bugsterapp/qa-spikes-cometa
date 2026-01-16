import * as React from 'react';
import { Check, ChevronDownIcon } from 'lucide-react';
import { matchSorter, rankings } from 'match-sorter';

import { cn } from '@cometa/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const ComboboxContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
} | null>(null);

function useCombobox() {
  const context = React.useContext(ComboboxContext);
  if (!context) {
    throw new Error('Combobox components must be used within Combobox');
  }
  return context;
}

interface ComboboxProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Combobox({ open: controlledOpen, onOpenChange, value, onValueChange, children }: ComboboxProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <ComboboxContext.Provider value={{ open, setOpen, value, onValueChange, searchValue, setSearchValue }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  isError?: boolean;
}

function ComboboxTrigger({ className, children, placeholder, isError, ...props }: ComboboxTriggerProps) {
  const { open } = useCombobox();

  return (
    <PopoverTrigger asChild>
      <button
        role="combobox"
        aria-expanded={open}
        className={cn(
          // Base styles
          'flex h-12 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-4 py-3',
          'text-base font-lota text-foreground font-normal leading-[150%] transition-colors',
          // Border and hover
          'border-input',
          'hover:not(:focus):border-ring',
          // Focus state
          'focus:border-primary focus:border-2 focus-visible:outline-none focus-visible:ring-0',
          // Open state
          open && 'border-primary border-2',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50',
          'disabled:border-input disabled:hover:border-input',
          // Text alignment
          'text-left',
          // Error state
          isError && [
            'border-destructive',
            'bg-destructive/[0.04]',
            'hover:border-destructive',
            'focus:border-destructive',
            open && 'border-destructive',
          ],
          className
        )}
        {...props}
      >
        {children || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronDownIcon
          className={cn(
            'h-5 w-5 text-muted-foreground opacity-70 transition-transform duration-200 flex-shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>
    </PopoverTrigger>
  );
}

type Threshold = (typeof rankings)[keyof typeof rankings];
interface ComboboxContentProps {
  className?: string;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  filterThreshold?: Threshold;
}

function ComboboxContent({
  className,
  children,
  align = 'start',
  filterThreshold = matchSorter.rankings.CONTAINS,
}: ComboboxContentProps) {
  function filter(value: string, searchTerm: string, keywords?: string[]): number {
    if (searchTerm.length === 0) return 1;

    const searchables = [value, ...(keywords || [])];
    const results = matchSorter(searchables, searchTerm, {
      threshold: filterThreshold,
    });

    return results.length > 0 ? 1 : 0;
  }

  return (
    <PopoverContent className={cn('p-0', className)} align={align}>
      <Command filter={filter}>{children}</Command>
    </PopoverContent>
  );
}

interface ComboboxInputProps extends React.ComponentPropsWithoutRef<typeof CommandInput> {
  onValueChange?: (value: string) => void;
}

function ComboboxInput({ onValueChange, className, ...props }: ComboboxInputProps) {
  const { searchValue, setSearchValue } = useCombobox();

  return (
    <CommandInput
      value={searchValue}
      onValueChange={(value) => {
        setSearchValue(value);
        onValueChange?.(value);
      }}
      className={cn('font-lota', className)}
      {...props}
    />
  );
}

function ComboboxList({ ...props }: React.ComponentProps<typeof CommandList>) {
  return <CommandList {...props} />;
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof CommandEmpty>) {
  return <CommandEmpty className={cn('font-lota text-sm', className)} {...props} />;
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup className={cn('font-lota', className)} {...props} />;
}

interface ComboboxItemProps extends Omit<React.ComponentProps<typeof CommandItem>, 'onSelect'> {
  value: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}

function ComboboxItem({ value: itemValue, onSelect, children, className, ...props }: ComboboxItemProps) {
  const { value, onValueChange, setOpen, setSearchValue } = useCombobox();
  const isSelected = value === itemValue;

  return (
    <CommandItem
      value={itemValue}
      onSelect={() => {
        onSelect?.(itemValue);
        onValueChange?.(itemValue);
        setOpen(false);
        setSearchValue('');
      }}
      className={cn(
        // Base styles
        'relative py-2 pl-2 pr-8 text-sm font-lota font-normal',
        'mb-[2px] last:mb-0',
        // Selected state
        isSelected && ['!bg-primary/[0.08]', '!text-primary', 'font-semibold', 'rounded-lg'],
        className
      )}
      {...props}
    >
      {children}
      <Check className={cn('absolute right-2 size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
    </CommandItem>
  );
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  useCombobox,
};
