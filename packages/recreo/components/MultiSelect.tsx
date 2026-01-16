import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, XCircle, ChevronDown, XIcon, MinusIcon } from 'lucide-react';
import { Separator } from './ui/Separator';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/Command';
import { cn } from '@cometa/utils';
import { ButtonHTMLAttributes, ComponentType, forwardRef, KeyboardEvent, useEffect, useState } from 'react';

const multiSelectVariants = cva('ml-2', {
  variants: {
    variant: {
      default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
      secondary: 'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      inverted: 'inverted',
      primary: 'border-[#00AB55] text-[#00AB55] bg-white hover:bg-card/80',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface MultiSelectProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  noPlaceholder?: boolean;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
  error?: string;
  color?: 'galaxy' | 'black' | 'legacy';
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Selecciona opciones',
      noPlaceholder = false,
      animation = 0,
      maxCount = 2,
      modalPopover = false,
      className,
      error,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => setSelectedValues(defaultValue), [defaultValue]);

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    let baseMaxCount = maxCount;
    const longWordsCount = selectedValues.slice(0, 2).filter((value) => value.length > 9).length;
    if (longWordsCount > 1) {
      baseMaxCount = 1;
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, baseMaxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                'flex w-full rounded-lg border border-[#919EAB52] min-h-10 h-auto items-center justify-between bg-white hover:bg-white',
                'px-1 pl-2 py-3.5 data-[placeholder]:text-transparent disabled:text-[#919EABCC] h-14 disabled:cursor-not-allowed',
                'text-[#1C1C1D] font-normal relative mb-1',
                { 'border-red-400 mb-3': !!error },
                className
              )}
            >
              {selectedValues.length > 0 ? (
                <>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      {selectedValues.slice(0, baseMaxCount).map((value) => {
                        const option = options.find((o) => o.value === value);
                        const IconComponent = option?.icon;
                        return (
                          <Badge
                            key={value}
                            className={cn(multiSelectVariants({ variant }), 'ml-1 px-1.5 py-1')}
                            style={{ animationDuration: `${animation}s` }}
                          >
                            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                            {option?.label}
                            <XCircle
                              className="ml-1 h-4 w-4 cursor-pointer"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleOption(value);
                              }}
                            />
                          </Badge>
                        );
                      })}
                      {selectedValues.length > baseMaxCount && (
                        <Badge
                          className={cn(
                            'bg-transparent text-foreground border-foreground/1 hover:bg-transparent',
                            multiSelectVariants({ variant }),
                            'ml-1 px-1.5 py-1'
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          <span>+{selectedValues.length - baseMaxCount} más</span>
                          <XCircle
                            className="ml-1 h-4 w-4 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              clearExtraOptions();
                            }}
                          />
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <XIcon
                        className="h-4 ml-1 cursor-pointer text-[#1C1C1D]"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClear();
                        }}
                      />
                      <Separator orientation="vertical" className="flex min-h-6 h-full" />
                      <ChevronDown className="h-4 mr-2 cursor-pointer text-[#1C1C1D]" />
                    </div>
                  </div>
                  {noPlaceholder ? null : (
                    <span className="absolute left-3 -top-2.5 bg-white text-xs text-[#212B36] px-1">{placeholder}</span>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className={cn('text-base text-[#919EAB] mx-3', { 'text-[#1C1C1D]': !!error })}>
                    {placeholder}
                  </span>
                  <ChevronDown className="h-4 cursor-pointer text-[#919EAB] mr-2" />
                </div>
              )}
            </Button>
            {error ? (
              <div className="absolute -bottom-1.5 left-4 text-xs font-normal text-red-500">
                <span className="text-elipsis">{error}</span>
              </div>
            ) : null}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0 border border-slate-100 bg-white resize-none overflow-auto"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput placeholder="Buscar..." onKeyDown={handleInputKeyDown} className="text-base" />
            <CommandList>
              <CommandEmpty>
                <span className="mx-4 text-[#1C1C1D]">No se encontraron opciones.</span>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer px-2 py-3 hover:bg-[#F5FAFF] flex items-center"
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 border-[#637381]',
                      selectedValues.length === options.length
                        ? 'bg-[#00AB55] border-[#00AB55] text-white'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </div>
                  <span className="text-base text-[#1C1C1D]/80">(Seleccionar todo)</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer px-2 py-3 hover:bg-[#F5FAFF] flex items-center"
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 border-[#637381]',
                          isSelected ? 'bg-[#00AB55] border-[#00AB55] text-white' : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && <option.icon className="mr-2 h-4 w-4 text-[#1C1C1D]" />}
                      <span className="text-base text-[#1C1C1D]/80">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator className="bg-[#919EAB]" />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem onSelect={handleClear} className="flex-1 justify-center cursor-pointer">
                        Limpiar
                      </CommandItem>
                      <Separator orientation="vertical" className="flex min-h-6 h-full" />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Cerrar
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
