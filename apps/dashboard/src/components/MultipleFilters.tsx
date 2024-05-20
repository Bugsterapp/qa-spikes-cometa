import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { matchSorter } from 'match-sorter';

import Filter from 'public/assets/images/filter.svg';
import FilterButton from './FilterButton';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import CheckBox from './atoms/CheckBox';
import IcCircleClose from '/public/assets/icons/ic_circle_close.svg';
import React from 'react';
import { cn } from '../utils/cn';
type FormFilterDataValue = { checked: boolean };
export type FormFilterData = Record<string, { checked: boolean; name: string }>;
export type FormFilterDataWithId = Record<string, FormFilterData>;
export type Params = Record<string, string[] | boolean>;
export interface Content {
  id: string | number;
  name: string;
  description?: string;
}
export interface FilterItems {
  header: string;
  contents?: Content[];
  watchKey: string;
}
export type Props<T> = {
  filterItems: T[];
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn) => void;
  onClearFilter: () => void;
  itemsCount: { watchKey: string; count: number }[];
  setItemsCount: (items: { watchKey: string; count: number }[]) => void;
};
interface MultipleFiltersChipsProps {
  onChange: (formFilterData: FormFilterData) => void;
  formFilterData: FormFilterData;
  setItemsCount: (items: { watchKey: string; count: number }[]) => void;
  itemsCount: { watchKey: string; count: number }[];
}
const RowCheckBox = ({
  id,
  name,
  description,
  watchKey,
  methods,
}: {
  id: string | number;
  name: string;
  description?: string;
  watchKey: string;
  methods: UseFormReturn<FormFilterData, any>;
}) => (
  <Controller
    control={methods.control}
    name={`${watchKey}$${id}`}
    defaultValue={{ checked: false, name }}
    render={({ field: { onChange, value } }) => (
      <label
        htmlFor={String(id)}
        className="min-h-[56px] flex items-center h-full gap-3 py-2 group cursor-pointer hover:bg-[#EBF8F1] px-4 rounded-lg curso"
      >
        <CheckBox
          id={String(id)}
          onChange={(event) => {
            value.checked = event.target.checked;
            onChange(value);
          }}
          checked={value.checked}
        />
        <div className="flex flex-col">
          <span className="text-sm font-light select-none text-secondary" data-testid={`${name}-filterOption`}>
            {name}
          </span>
          {description && (
            <span className="text-xs font-normal select-none text-[#637381] my-[2px]">{description}</span>
          )}
        </div>
      </label>
    )}
  />
);

const handleIsActive = (isActiveValues: boolean[], key: string, value: FormFilterDataValue): boolean[] => {
  if (value.checked) {
    isActiveValues.push(key.endsWith('true'));
  }
  return isActiveValues;
};

export const formFilterDataToParams = (formFilterData: FormFilterData) => {
  let isActiveValues: boolean[] = [];
  let hasDebtValues: boolean[] = [];

  const result = Object.entries(formFilterData || {}).reduce((acc, [key, value]) => {
    if (key.startsWith('is_active')) {
      isActiveValues = handleIsActive(isActiveValues, key, value);
    } else if (key.startsWith('has_debt')) {
      hasDebtValues = handleIsActive(hasDebtValues, key, value);
    } else if (value.checked) {
      const [keyName, keyId] = key.split('$');
      if (acc[keyName]) {
        (acc[keyName] as string[]).push(keyId);
      } else {
        acc[keyName] = [keyId];
      }
    }
    return acc;
  }, {} as Record<string, string[] | boolean>);

  if (isActiveValues.length === 1) {
    result['is_active'] = isActiveValues[0];
  }

  if (hasDebtValues.length === 1) {
    result['has_debt'] = hasDebtValues[0];
  }

  return result;
};

const generateRandomId = () => Math.random().toString(36).substr(2, 9);
interface Item {
  checked: boolean;
  name: string;
}

function transformItem(item: Content | [string | number, string, string | undefined]): Content {
  if (Array.isArray(item)) {
    const [id, name, description] = item;
    return { id, name, description };
  } else {
    return item;
  }
}

type JsonData<T> = Record<keyof T, Content[] | [string | number, string][]>;

export function normalizeFilters<T>(jsonData: JsonData<T>): Record<keyof T, Content[]> {
  return Object.entries(jsonData).reduce((acc: Record<keyof T, Content[]>, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      if (typeof value[0] === 'object') {
        acc[key as keyof T] = (value as Content[]).filter((item) => item.id !== '').map(transformItem);
      } else {
        acc[key as keyof T] = (value as [string | number, string, string | undefined][]).map(transformItem);
      }
    } else {
      acc[key as keyof T] = [];
    }
    return acc;
  }, {} as Record<keyof T, Content[]>);
}
const MultipleFilters = <T extends FilterItems>({
  filterItems,
  handleFilter,
  onClearFilter,
  itemsCount,
  setItemsCount,
}: Props<T>) => {
  const methods = useForm<FormFilterData>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrollingTop, setScrollingTop] = useState(false);
  const [scrollingBottom, setScrollingBottom] = useState(false);
  const [scrollingContentTop, setScrollingContentTop] = useState(false);
  const scrollingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollingContentRef = useRef<HTMLDivElement>(null);
  const onSubmit = (data: FormFilterData) => {
    const values = methods.getValues();
    const mappedFilteredItems = filterItems.map(({ watchKey }) => {
      const count = countCheckedByKey(values, watchKey);
      return {
        watchKey,
        count,
      };
    });
    setItemsCount(mappedFilteredItems);
    handleFilter(data, methods);
    setOpen(false);
  };
  const handleClear = () => {
    const items = itemsCount.map((item) => ({ watchKey: item.watchKey, count: 0 }));
    methods.reset({});
    onClearFilter();
    formRef.current?.reset();
    setItemsCount(items);
  };
  const handleScroll = () => {
    const currentScrollPosition = scrollingRef.current?.scrollTop || 0;
    const scrollBottom =
      scrollingRef.current?.scrollHeight ||
      0 - (scrollingRef.current?.scrollTop || 0 + (scrollingRef.current?.clientHeight || 0));

    if (currentScrollPosition > 60) {
      setScrollingTop(true);
    } else {
      setScrollingTop(false);
    }
    if (scrollBottom > 50) {
      setScrollingBottom(true);
    } else {
      setScrollingBottom(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      filterItems.map(({ header, contents, watchKey }) => {
        const matchedContents =
          search === ''
            ? contents
            : matchSorter(contents as Content[], search, {
                keys: ['name'],
                threshold: matchSorter.rankings.CONTAINS,
              });

        return {
          header,
          contents: matchedContents,
          watchKey,
        };
      }),
    [filterItems, search, itemsCount]
  );

  function countCheckedByKey(
    objects: {
      [key: string]: Item;
    },
    key: string
  ) {
    let count = 0;

    for (const prop in objects) {
      if (prop.startsWith(key) && objects[prop].checked) {
        count++;
      }
    }

    return count;
  }

  const handleSearch = (str: string) => {
    setSearch(str);
    scrollingRef?.current?.scrollTo(0, 0);
  };
  const handleContentScroll = () => {
    const currentScrollPosition: number = scrollingContentRef.current?.scrollTop || 0;
    if (currentScrollPosition > 30) {
      setScrollingContentTop(true);
    } else {
      setScrollingContentTop(false);
    }
  };
  return (
    <>
      <div className="relative inline-block text-left">
        <DropdownMenuPrimitive.Root onOpenChange={setOpen} open={open}>
          <DropdownMenuPrimitive.Trigger asChild className="mb-1">
            <FilterButton>
              <Filter />
              <span className="font-bold">Filtrar</span>
            </FilterButton>
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              id="content"
              align="start"
              sideOffset={3}
              className="w-64 rounded-2xl shadow-md bg-white overflow-x-scroll max-h-[350px] z-30"
              ref={scrollingContentRef}
              onScroll={handleContentScroll}
            >
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex flex-col justify-between h-full"
                ref={formRef}
                key={`${itemsCount?.length} `}
              >
                <div
                  className={`w-full h-full max-h-[56px] bg-white flex items-center justify-between px-6 sticky top-0 py-4 ${
                    scrollingContentTop ? 'shadow-card' : ''
                  }`}
                >
                  <p className="text-base font-bold text-black">Filtrar por:</p>
                </div>
                {filteredItems.map(({ header, contents, watchKey }, index) => {
                  const shouldDisplaySearch =
                    (filterItems?.find((item) => item?.watchKey === watchKey)?.contents?.length ?? 0) > 5;
                  const count = itemsCount?.find((item) => item && item?.watchKey === watchKey)?.count || 0;
                  return (
                    <Popover key={`header-${watchKey}-${index}`}>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full h-full max-h-[56px] bg-white flex items-center justify-between px-6 border-t border-[#919EAB3D] py-4"
                          type="button"
                          onClick={() => setSearch('')}
                        >
                          <div className="flex items-center gap-2" data-testid={`${header}-filterBy`}>
                            <p>{header}</p>
                            {count > 0 && (
                              <span className="bg-blue-secondary-200 text-white rounded-full text-[10px] h-5 w-5 flex items-center justify-center">
                                {count}
                              </span>
                            )}
                          </div>
                          <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M1.99981 14.9999C1.76616 15.0004 1.53972 14.919 1.35981 14.7699C1.1553 14.6004 1.02666 14.3564 1.00227 14.0919C0.977884 13.8274 1.05975 13.564 1.22981 13.3599L5.70981 7.99994L1.38981 2.62994C1.22204 2.42335 1.14354 2.1584 1.17169 1.89376C1.19985 1.62912 1.33233 1.38662 1.53981 1.21994C1.74898 1.03591 2.02544 0.94747 2.30258 0.975943C2.57973 1.00442 2.83243 1.14722 2.99981 1.36994L7.82981 7.36994C8.13313 7.73895 8.13313 8.27094 7.82981 8.63994L2.82981 14.6399C2.62635 14.8854 2.31805 15.0191 1.99981 14.9999Z"
                              fill="#3366FF"
                            />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverPrimitive.Portal>
                        <PopoverContent
                          className="w-64 max-h-[400px] overflow-scroll p-0 rounded-2xl"
                          side="right"
                          align="start"
                          sideOffset={9}
                          ref={scrollingRef}
                          onScroll={handleScroll}
                        >
                          {shouldDisplaySearch && (
                            <div
                              className={cn(
                                'h-full min-h-[56px] w-full flex items-center justify-center px-3 gap-2 sticky top-0 z-50 bg-white',
                                {
                                  'shadow-card': scrollingTop,
                                }
                              )}
                              key={`header-${watchKey}-${index}`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M17.31 15.9L20.71 19.29C20.8993 19.4778 21.0058 19.7334 21.0058 20C21.0058 20.2666 20.8993 20.5222 20.71 20.71C20.5222 20.8993 20.2666 21.0058 20 21.0058C19.7334 21.0058 19.4778 20.8993 19.29 20.71L15.9 17.31C14.5025 18.407 12.7767 19.0022 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19.0022 12.7767 18.407 14.5025 17.31 15.9ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5Z"
                                  fill="#919EAB"
                                />
                              </svg>
                              <input
                                type="text"
                                className="w-full h-[56px] focus:ring-0 focus:outline-none focus:border-0 focus-within:border-0 border-none"
                                onChange={(e) => handleSearch(e.target.value)}
                                value={search}
                              />
                              <button
                                onClick={() => setSearch('')}
                                className={cn('bg-white', {
                                  'opacity-0': search.length === 0,
                                })}
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.4086 11.9991L17.7045 7.71268C18.0962 7.32088 18.0962 6.68565 17.7045 6.29385C17.3127 5.90205 16.6776 5.90205 16.2859 6.29385L12 10.5903L7.71414 6.29385C7.3224 5.90205 6.68726 5.90205 6.29551 6.29385C5.90377 6.68565 5.90377 7.32088 6.29551 7.71268L10.5914 11.9991L6.29551 16.2856C6.10638 16.4732 6 16.7286 6 16.995C6 17.2614 6.10638 17.5168 6.29551 17.7044C6.4831 17.8936 6.73845 18 7.00483 18C7.27121 18 7.52656 17.8936 7.71414 17.7044L12 13.408L16.2859 17.7044C16.4734 17.8936 16.7288 18 16.9952 18C17.2616 18 17.5169 17.8936 17.7045 17.7044C17.8936 17.5168 18 17.2614 18 16.995C18 16.7286 17.8936 16.4732 17.7045 16.2856L13.4086 11.9991Z"
                                    fill="#919EAB"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                          <div
                            className={cn('flex flex-col justify-between min-h-[140px] pt-2', {
                              'min-h-[390px]': shouldDisplaySearch,
                            })}
                          >
                            <div className="px-2">
                              <div className="w-full h-full text-sm text-gray-700">
                                {(contents?.length || [].length) > 0 ? (
                                  <div className="flex flex-col" key={generateRandomId()}>
                                    {contents?.map((item) => (
                                      <RowCheckBox
                                        key={item.id}
                                        id={item.id}
                                        name={item.name}
                                        watchKey={watchKey}
                                        methods={methods}
                                        description={item.description}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <p className="w-full h-full flex items-center justify-center min-h-[260px] px-8 leading-relaxed text-[#919EAB] text-center">
                                    No hemos encontrado filtros con ese criterio de búsqueda.
                                  </p>
                                )}
                              </div>
                            </div>
                            <div
                              className={cn('w-full sticky bottom-0 min-h-[56px] bg-white flex items-center py-4', {
                                'shadow-cardBottom': scrollingBottom,
                              })}
                            >
                              <button
                                className="w-6/12 text-sm font-bold bg-transparent border-none text-blue-secondary-200"
                                data-testid="clean-button"
                                onClick={handleClear}
                                type="button"
                              >
                                Limpiar
                              </button>
                              <div className="flex justify-center w-6/12">
                                <button
                                  className="px-5 bg-blue-secondary-200 py-2 text-white rounded-md font-bold shadow-button  max-h-[36px] text-sm"
                                  type="submit"
                                  data-testid="apply-button"
                                  onClick={methods.handleSubmit(onSubmit)}
                                >
                                  Aplicar
                                </button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </PopoverPrimitive.Portal>
                    </Popover>
                  );
                })}
              </form>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
    </>
  );
};

export const MultipleFiltersChips = ({
  onChange,
  formFilterData,
  setItemsCount,
  itemsCount,
}: MultipleFiltersChipsProps) => {
  const handleCleanFilters = () => {
    onChange({});
    const prev = itemsCount.map((item) => ({ ...item, count: 0 }));
    setItemsCount(prev);
  };
  const handleRemove = (keyToRemove: string) => {
    const newFormFilterData = {
      ...formFilterData,
    };
    newFormFilterData[keyToRemove].checked = false;
    onChange(newFormFilterData);
  };
  const formFilterDataChecked = useMemo(
    () => Object.entries(formFilterData || {}).filter(([_, value]) => value.checked),
    [formFilterData]
  );
  return (
    <div className="flex flex-wrap gap-4 px-6 py-2 min-h-[20px]">
      {/* map object and array inside and show name as a div test */}
      {formFilterDataChecked.map(([key, value]) => (
        <button
          className="flex items-center gap-2 px-2 py-1 text-sm transition-colors duration-300 bg-white border rounded-full text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300"
          onClick={() => {
            handleRemove(key);
          }}
          key={key}
        >
          {value.name} <IcCircleClose />
        </button>
      ))}
      {!!formFilterDataChecked.length && (
        <button
          className="text-sm font-semibold bg-transparent border-none text-blue text-blue-secondary-200"
          onClick={handleCleanFilters}
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
};

export const MultipleFiltersChipsShorted = ({
  onChange,
  formFilterData,
  setItemsCount,
  itemsCount,
}: MultipleFiltersChipsProps) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [overflowCount, setOverflowCount] = useState(0);
  const chipSpaceWidth = 40;
  const chipWidth = 340;

  const handleCleanFilters = () => {
    onChange({});
    const prev = itemsCount.map((item) => ({ ...item, count: 0 }));
    setItemsCount(prev);
  };

  const handleRemove = (keyToRemove: string) => {
    const newFormFilterData = { ...formFilterData };
    newFormFilterData[keyToRemove].checked = false;
    onChange(newFormFilterData);
  };

  const formFilterDataChecked = useMemo(
    () => Object.entries(formFilterData || {}).filter(([_, value]) => value.checked),
    [formFilterData]
  );

  useEffect(() => {
    let totalWidth = 0;
    const newVisibleItems: number[] = [];
    let newOverflowCount = 0;

    formFilterDataChecked.forEach(([_, value], index) => {
      // Assuming an average character is 8px wide, and adding some extra pixels for padding and icon
      const estimatedWidth = value.name.length * 8 + chipSpaceWidth;

      if (totalWidth + estimatedWidth <= chipWidth) {
        totalWidth += estimatedWidth;
        newVisibleItems.push(index);
      } else {
        newOverflowCount++;
      }
    });

    setVisibleItems(newVisibleItems);
    setOverflowCount(newOverflowCount);
  }, [formFilterDataChecked]);

  return (
    <div className={cn('flex justify-between gap-4 py-2 min-h-[20px]')}>
      <div className="flex gap-3">
        {formFilterDataChecked.map(
          ([key, value], index) =>
            visibleItems.includes(index) && (
              <button
                key={key}
                className="flex items-center gap-2 px-2 py-1 text-sm transition-colors duration-300 bg-white border rounded-full text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300"
                onClick={() => handleRemove(key)}
              >
                {value.name} <IcCircleClose />
              </button>
            )
        )}
        {overflowCount > 0 && (
          <button className="flex items-center gap-2 px-2 py-1 text-sm transition-colors duration-300 bg-white border rounded-full text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300">
            {overflowCount}+
          </button>
        )}
      </div>
      {!!formFilterDataChecked.length && (
        <button
          className="text-sm font-semibold bg-transparent border-none text-blue text-blue-secondary-200"
          onClick={handleCleanFilters}
        >
          Limpiar
        </button>
      )}
    </div>
  );
};

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-slate-100 ', className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-700',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none focus:bg-slate-100 data-[state=open]:bg-slate-100 ',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    {/* <ChevronRight className="w-4 h-4 ml-auto" /> */}
  </DropdownMenuPrimitive.SubTrigger>
));
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'animate-in slide-in-from-left-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-100 bg-white p-1 text-slate-700 shadow-md',
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

//
// Popover /////////////////////////////////////////////////////////////////////
//

const Popover = PopoverPrimitive.Root;
// const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 z-50 w-72 rounded-md border border-slate-100 bg-white shadow-md outline-none',
      className
    )}
    {...props}
  />
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
export default MultipleFilters;
