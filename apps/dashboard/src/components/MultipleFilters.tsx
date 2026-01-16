import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { matchSorter } from 'match-sorter';
import { Tooltip } from '/src/components/atoms/Tooltip';

import { Button } from '@cometa/recreo';
import Exclamation from 'public/assets/icons/ic_exclamation_solid.svg';
import Filter from 'public/assets/images/filter.svg';
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, UseFormReturn } from 'react-hook-form';
import { Events } from '../constants/events';
import useSendTrackEventWithUserName from '../hooks/useSendTrackEventWithUserName';
import { cn } from '../utils/cn';
import CheckBox from './atoms/CheckBox';
import IcCircleClose from '/public/assets/icons/ic_circle_close.svg';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useTableConfig } from '/src/hooks/useTableConfig';

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
  header: string | React.ReactElement;
  contents?: Content[];
  watchKey: string;
  message?: string;
}
export type Props<T> = {
  filterItems: T[];
  handleFilter: (formFilterData: FormFilterData, methods: UseFormReturn) => void;
  onClearFilter: () => void;
  itemsCount: { watchKey: string; count: number }[];
  setItemsCount: (items: { watchKey: string; count: number }[]) => void;
  postFixElement?: JSX.Element | ReactElement<any, any> | ((elementId: string) => JSX.Element | null) | undefined;
  selectedItems?: FormFilterData;
  isLegacy?: boolean;
  tableName?: string;
};

const RowCheckBox = ({
  id,
  name,
  description,
  watchKey,
  methods,
  postFixElement,
  schoolId,
}: {
  id: string | number;
  name: string;
  description?: string;
  watchKey: string;
  methods: UseFormReturn<FormFilterData, any>;
  postFixElement?: JSX.Element | ReactElement<any, any> | ((elementId: string) => JSX.Element | null) | undefined;
  schoolId: string;
}) => {
  const fieldName = `${watchKey}$${id}`;
  const checkboxId = `${schoolId}-${id}`;

  return (
    <Controller
      control={methods.control}
      name={fieldName}
      defaultValue={{ checked: false, name }}
      render={({ field: { onChange, value } }) => (
        <label
          htmlFor={checkboxId}
          className="min-h-[56px] flex items-center h-full gap-3 py-2 group cursor-pointer hover:bg-[#EBF8F1] px-4 rounded-lg"
        >
          <CheckBox
            id={checkboxId}
            onChange={(event) => {
              value.checked = event.target.checked;
              onChange(value);
            }}
            checked={value?.checked || false}
          />
          <div className={cn('flex flex-col gap-2', { 'flex-row items-center': postFixElement })}>
            <span className="text-sm font-light select-none text-foreground" data-testid={`${name}-filterOption`}>
              {name}
            </span>
            {postFixElement && (
              <>{typeof postFixElement === 'function' ? postFixElement(String(id)) : postFixElement}</>
            )}
            {description && (
              <span className="text-xs font-normal select-none text-[#637381] my-[2px]">{description}</span>
            )}
          </div>
        </label>
      )}
    />
  );
};

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
    if (key.startsWith('is_active') || key.startsWith('active')) {
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

const generateDeterministicId = (schoolId: string, prefix = '', watchKey?: string, itemId?: string | number) => {
  const parts = [prefix, schoolId];

  if (watchKey) {
    parts.push(watchKey);
  }
  if (itemId !== undefined) {
    parts.push(String(itemId));
  }

  return parts.filter(Boolean).join('-').replace(/\W+/g, '-');
};

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

export type JsonData<T> = Record<keyof T, Content[] | [string | number, string][]>;

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

interface FilterFiltersConfig {
  filters: FormFilterData;
}

const extractHeaderText = (header: string | React.ReactElement): string => {
  if (typeof header === 'string') {
    return header;
  }

  if (!React.isValidElement(header)) {
    return 'Unknown';
  }

  const children = (header.props as { children?: React.ReactNode })?.children;

  if (!children) {
    return 'Unknown';
  }

  const textParts = React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return child;
    }
    if (React.isValidElement(child)) {
      return extractHeaderText(child);
    }
    return '';
  });

  return textParts?.join('').trim() || '';
};

const MultipleFilters = <T extends FilterItems>({
  filterItems,
  handleFilter,
  onClearFilter,
  itemsCount,
  setItemsCount,
  postFixElement,
  selectedItems,
  isLegacy = true,
  tableName,
}: Props<T>) => {
  const methods = useForm<FormFilterData>({
    mode: 'onBlur',
  });

  methods.watch();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrollingTop, setScrollingTop] = useState(false);
  const [scrollingBottom, setScrollingBottom] = useState(false);
  const [scrollingContentTop, setScrollingContentTop] = useState(false);
  const scrollingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollingContentRef = useRef<HTMLDivElement>(null);

  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;

  const {
    shouldUseApi,
    isLoading,
    initializedRef: tableInitializedRef,
    previousSchoolIdRef: tablePreviousSchoolIdRef,
    upsertConfig,
    processTableConfig,
  } = useTableConfig<FilterFiltersConfig>({ tableName });

  useEffect(() => {
    if (tablePreviousSchoolIdRef.current && tablePreviousSchoolIdRef.current !== schoolId) {
      methods.reset({});

      setSearch('');
      setOpen(false);

      tableInitializedRef.current = false;

      setItemsCount(itemsCount.map((item) => ({ ...item, count: 0 })));
      onClearFilter();

      formRef.current?.reset();
    }
  }, [schoolId, setItemsCount, itemsCount, onClearFilter, methods, tableInitializedRef, tablePreviousSchoolIdRef]);

  const processedTableConfig = useMemo(
    () => processTableConfig<FormFilterData | null>((filtersConfig) => filtersConfig?.filters || null),
    [processTableConfig]
  );

  useEffect(() => {
    if (tableInitializedRef.current) {
      return;
    }

    if (shouldUseApi && isLoading) {
      return;
    }

    if (processedTableConfig) {
      methods.reset({});

      setTimeout(() => {
        methods.reset(processedTableConfig);

        const mappedFilteredItems = filterItems.map(({ watchKey }) => {
          const count = countCheckedByKey(processedTableConfig, watchKey);
          return { watchKey, count };
        });

        setItemsCount(mappedFilteredItems);
        handleFilter(processedTableConfig, methods);
        tableInitializedRef.current = true;
      }, 0);
      return;
    }

    if (selectedItems && Object.entries(selectedItems).length > 0) {
      methods.reset({});

      setTimeout(() => {
        methods.reset(selectedItems);
        const mappedFilteredItems = filterItems.map(({ watchKey }) => {
          const count = countCheckedByKey(selectedItems, watchKey);
          return { watchKey, count };
        });
        setItemsCount(mappedFilteredItems);
        tableInitializedRef.current = true;
      }, 0);
      return;
    }

    tableInitializedRef.current = true;
  }, [
    processedTableConfig,
    isLoading,
    filterItems,
    selectedItems,
    shouldUseApi,
    handleFilter,
    methods,
    setItemsCount,
    schoolId,
    tableInitializedRef,
  ]);

  const sendSectionsTrackEvent = (
    mappedFilteredItems: {
      watchKey: string;
      count: number;
      header: string | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    }[],
    itemsCount: {
      watchKey: string;
      count: number;
    }[]
  ) => {
    const previewSectionsSet = new Set(itemsCount.filter((item) => item.count > 0).map((item) => item.watchKey));

    const sections = mappedFilteredItems.filter((item) => item.count > 0 && !previewSectionsSet.has(item.watchKey));

    if (sections.length > 0) {
      sendTrackEventWithUserName(Events.multiple_filters_applied, {
        tableName: tableName,
        is_legacy: isLegacy,
        url: window?.location?.href,
        sections_watchKey: sections.map((item) => item.watchKey),
        sections_name: sections.map((item) => extractHeaderText(item.header)),
      });
    }
  };

  const onSubmit = (data: FormFilterData) => {
    setOpen(false);

    const cleanData: FormFilterData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && (value.checked || value.checked === false)) {
        acc[key] = { ...value };
      }
      return acc;
    }, {} as FormFilterData);

    const mappedFilteredItems = filterItems.map(({ watchKey, header }) => ({
      watchKey,
      count: countCheckedByKey(cleanData, watchKey),
      header,
    }));

    setItemsCount(mappedFilteredItems);
    handleFilter(cleanData, methods);

    sendSectionsTrackEvent(mappedFilteredItems, itemsCount);

    if (shouldUseApi) {
      setTimeout(() => {
        upsertConfig({
          filters: cleanData,
        });
      }, 10);
    }
  };

  const handleClear = () => {
    const items = itemsCount.map((item) => ({ watchKey: item.watchKey, count: 0 }));
    methods.reset({});
    onClearFilter();
    formRef.current?.reset();
    setItemsCount(items);

    if (shouldUseApi) {
      upsertConfig({
        filters: {},
      });
    }
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
      filterItems.map(({ header, contents, watchKey, message }) => {
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
          message,
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

    if (!objects) return count;

    for (const prop in objects) {
      if (prop.startsWith(key) && objects[prop]?.checked) {
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

  useEffect(() => {
    if (selectedItems && Object.entries(selectedItems).length > 0 && schoolId === tablePreviousSchoolIdRef.current) {
      Object.keys(selectedItems).map((key) => {
        methods.setValue(key, { ...selectedItems[key] });
      });
      const mappedFilteredItems = filterItems.map(({ watchKey }) => {
        const count = countCheckedByKey(selectedItems, watchKey);
        return {
          watchKey,
          count,
        };
      });
      setItemsCount(mappedFilteredItems);
    }
  }, [selectedItems, schoolId]);

  return (
    <>
      <div className="inline-block relative text-left">
        <DropdownMenuPrimitive.Root onOpenChange={setOpen} open={open}>
          <DropdownMenuPrimitive.Trigger asChild className="mb-1">
            {isLegacy ? (
              <FilterButton isLegacy={isLegacy}>
                <Filter />
                <span className="font-bold">Filtrar</span>
              </FilterButton>
            ) : (
              <Button variant="solid-light" color="black" size="medium" leftIcon={<FilterIcon />}>
                Filtrar
              </Button>
            )}
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              id={`content-${schoolId}`}
              align="start"
              sideOffset={3}
              className="w-64 rounded-2xl shadow-md bg-white overflow-x-scroll max-h-[350px] pt-2 z-30"
              ref={scrollingContentRef}
              onScroll={handleContentScroll}
            >
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex flex-col justify-between h-full"
                ref={formRef}
                key={`form-${schoolId}-${itemsCount?.length}`}
              >
                <div
                  className={`w-full h-full max-h-[56px] bg-white flex items-center justify-between px-6 sticky top-0 py-4 ${
                    scrollingContentTop ? 'shadow-card' : ''
                  }`}
                >
                  <p className="text-base font-bold text-black">Filtrar por:</p>
                </div>
                {filteredItems.map(({ header, contents, watchKey, message }, index) => {
                  const shouldDisplaySearch =
                    (filterItems?.find((item) => item?.watchKey === watchKey)?.contents?.length ?? 0) > 5;
                  const count = itemsCount?.find((item) => item && item?.watchKey === watchKey)?.count || 0;
                  return (
                    <Popover key={`header-${schoolId}-${watchKey}-${index}`}>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full h-full max-h-[56px] bg-white flex items-center justify-between px-6 border-t border-[#919EAB3D] py-4"
                          type="button"
                          onClick={() => setSearch('')}
                          data-testid={`trigger-${schoolId}-${watchKey}`}
                        >
                          <div className="flex gap-2 items-center" data-testid={`${header}-filterBy`}>
                            <div className="flex gap-1 justify-center items-center">
                              <p>{header}</p>
                              {message && (
                                <Tooltip message={message} disableHover={!message}>
                                  <Exclamation className="text-[#637381] w-5 h-5" />
                                </Tooltip>
                              )}
                            </div>
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
                          className="w-72 max-h-[400px] overflow-scroll p-0 rounded-2xl"
                          side="right"
                          align="start"
                          sideOffset={9}
                          ref={scrollingRef}
                          onScroll={handleScroll}
                        >
                          {shouldDisplaySearch && (
                            <div
                              className={cn(
                                'flex sticky top-0 z-50 gap-2 justify-center items-center px-3 w-full h-full bg-white min-h-[56px]',
                                {
                                  'shadow-card': scrollingTop,
                                }
                              )}
                              key={`header-${schoolId}-${watchKey}-${index}`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M17.31 15.9L20.71 19.29C20.8993 19.4778 21.0058 19.7334 21.0058 20C21.0058 20.2666 20.8993 20.5222 20.71 20.71C20.5222 20.8993 20.2666 21.0058 20 21.0058C19.7334 21.0058 19.4778 20.8993 19.29 20.71L15.9 17.31C14.5025 18.407 12.7767 19.0022 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11C19.0022 12.7767 18.407 14.5025 17.31 15.9ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5Z"
                                  fill="#919EAB"
                                />
                              </svg>
                              <input
                                type="text"
                                className="w-full h-[56px] focus:ring-0 focus:outline-none focus:border-0 focus-within:border-0 border-none"
                                onChange={(e) => handleSearch(e.target.value)}
                                value={search}
                                data-testid="inputText"
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
                            className={cn('flex flex-col justify-between pt-2 min-h-[140px]', {
                              'min-h-[390px]': shouldDisplaySearch,
                            })}
                          >
                            <div className="px-2">
                              <div className="w-full h-full text-sm text-gray-700">
                                {(contents?.length || [].length) > 0 ? (
                                  <div
                                    className="flex flex-col"
                                    key={generateDeterministicId(schoolId, 'contents', watchKey)}
                                  >
                                    {contents?.map((item) => (
                                      <RowCheckBox
                                        key={generateDeterministicId(schoolId, 'rowcheck', watchKey, item.id)}
                                        id={item.id}
                                        name={item.name}
                                        watchKey={watchKey}
                                        methods={methods}
                                        description={item.description}
                                        postFixElement={postFixElement}
                                        schoolId={schoolId}
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
                              className={cn('flex sticky bottom-0 items-center py-4 w-full bg-white min-h-[56px]', {
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

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M9.00085 14C8.89263 14 8.78733 13.9649 8.70075 13.9L6.70011 12.4C6.63799 12.3534 6.58758 12.293 6.55285 12.2236C6.51813 12.1542 6.50005 12.0776 6.50005 12V9.19L2.99093 5.2435C2.74171 4.96244 2.57898 4.61541 2.52232 4.24412C2.46565 3.87283 2.51745 3.49308 2.67149 3.15051C2.82552 2.80794 3.07525 2.51713 3.39064 2.31303C3.70604 2.10894 4.07369 2.00024 4.44939 2H11.5517C11.9273 2.00044 12.2949 2.10932 12.6102 2.31355C12.9254 2.51779 13.175 2.80869 13.3289 3.15129C13.4827 3.4939 13.5344 3.87364 13.4776 4.24487C13.4208 4.61611 13.2579 4.96305 13.0086 5.244L9.50101 9.19V13.5C9.50101 13.6326 9.44831 13.7598 9.35451 13.8536C9.26072 13.9473 9.1335 14 9.00085 14V14ZM7.50037 11.75L8.50069 12.5V9C8.50079 8.87758 8.54581 8.75945 8.62723 8.668L12.2624 4.5795C12.3836 4.44254 12.4627 4.27352 12.4902 4.09273C12.5177 3.91193 12.4924 3.72705 12.4173 3.56028C12.3423 3.39351 12.2207 3.25193 12.0671 3.15254C11.9136 3.05316 11.7346 3.00019 11.5517 3H4.44939C4.26656 3.00028 4.08769 3.05327 3.93423 3.15263C3.78077 3.25199 3.65924 3.3935 3.58422 3.56018C3.5092 3.72685 3.48386 3.91163 3.51126 4.09234C3.53865 4.27305 3.61761 4.44203 3.73867 4.579L7.37433 8.668C7.45556 8.75952 7.50041 8.87764 7.50037 9V11.75Z"
        fill="#1C1C1D"
      />
    </svg>
  );
}

interface TooltipIconProps {
  message: string;
  children: React.ReactNode;
}

export const TooltipIcon: React.FC<TooltipIconProps> = ({ message, children }) => (
  <div className="flex gap-1.5 items-center">
    {children}
    <Tooltip message={message}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.99984 0.666626C4.39746 0.666626 0.666504 4.39759 0.666504 8.99996C0.666504 13.6023 4.39746 17.3333 8.99984 17.3333C13.6022 17.3333 17.3332 13.6023 17.3332 8.99996C17.3332 6.78982 16.4552 4.67021 14.8924 3.1074C13.3296 1.5446 11.21 0.666626 8.99984 0.666626ZM9.83317 12.3333C9.83317 12.7935 9.46007 13.1666 8.99984 13.1666C8.5396 13.1666 8.1665 12.7935 8.1665 12.3333V8.16663C8.1665 7.70639 8.5396 7.33329 8.99984 7.33329C9.46007 7.33329 9.83317 7.70639 9.83317 8.16663V12.3333ZM8.1665 5.66663C8.1665 6.12686 8.5396 6.49996 8.99984 6.49996C9.46007 6.49996 9.83317 6.12686 9.83317 5.66663C9.83317 5.20639 9.46007 4.83329 8.99984 4.83329C8.5396 4.83329 8.1665 5.20639 8.1665 5.66663Z"
          fill="#637381"
        />
      </svg>
    </Tooltip>
  </div>
);

interface MultipleFiltersChipsProps {
  onChange: (formFilterData: FormFilterData) => void;
  formFilterData: FormFilterData;
  setItemsCount: (items: { watchKey: string; count: number }[]) => void;
  itemsCount: { watchKey: string; count: number }[];
  className?: string;
  tableName?: string;
}
export const MultipleFiltersChips = ({
  onChange,
  formFilterData,
  setItemsCount,
  itemsCount,
  className,
  tableName,
}: MultipleFiltersChipsProps) => {
  const { shouldUseApi, upsertConfig } = useTableConfig<FilterFiltersConfig>({ tableName });

  const handleCleanFilters = () => {
    const newFormFilterData: FormFilterData = {};
    onChange(newFormFilterData);
    const prev = itemsCount.map((item) => ({ ...item, count: 0 }));
    setItemsCount(prev);

    if (shouldUseApi) {
      upsertConfig({
        filters: {},
      });
    }
  };

  const handleRemove = (keyToRemove: string) => {
    const newFormFilterData: FormFilterData = {
      ...formFilterData,
      [keyToRemove]: { ...formFilterData[keyToRemove], checked: false },
    };
    const keyForCount = keyToRemove.split('$')[0];
    const newItemsCount = itemsCount.map((item) => {
      if (item.watchKey === keyForCount) {
        return { ...item, count: item.count - 1 };
      }
      return item;
    });
    setItemsCount(newItemsCount);
    onChange(newFormFilterData);

    if (shouldUseApi) {
      upsertConfig({
        filters: newFormFilterData,
      });
    }
  };

  const formFilterDataChecked = useMemo(
    () => Object.entries(formFilterData || {}).filter(([_, value]) => value.checked),
    [formFilterData]
  );

  return (
    <div className={cn({ 'flex flex-wrap gap-4 px-6 py-2': formFilterDataChecked?.length > 0 }, className)}>
      {formFilterDataChecked.map(([key, value]) => (
        <button
          className="flex gap-2 items-center px-2 py-1 text-sm bg-white rounded-full border transition-colors duration-300 text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300"
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
    <div className={cn('flex gap-4 justify-between py-2 min-h-[20px]')}>
      <div className="flex gap-3">
        {formFilterDataChecked.map(
          ([key, value], index) =>
            visibleItems.includes(index) && (
              <button
                key={key}
                className="flex gap-2 items-center px-2 py-1 text-sm bg-white rounded-full border transition-colors duration-300 text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300"
                onClick={() => handleRemove(key)}
              >
                {value.name} <IcCircleClose />
              </button>
            )
        )}
        {overflowCount > 0 && (
          <button className="flex gap-2 items-center px-2 py-1 text-sm bg-white rounded-full border transition-colors duration-300 text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300">
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
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-slate-100', className)} {...props} />
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
      'overflow-hidden z-50 p-1 bg-white rounded-md border shadow-md animate-in slide-in-from-left-1 min-w-[8rem] border-slate-100 text-slate-700',
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

type IFilterButtonProps = Omit<React.ComponentProps<'button'>, 'className'> & {
  isLegacy?: boolean;
};

const FilterButton = React.forwardRef<HTMLButtonElement, IFilterButtonProps>(
  ({ children, isLegacy = true, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-lg p-2 w-[102px] gap-x-[10.5px] text-sm font-medium border border-blue-secondary-200 border-solid text-blue-secondary-200 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 bg-white h-[40px]',
        { 'bg-neutral-100 border-none rounded-full text-neutral-900': !isLegacy }
      )}
      data-testid="filterBtn"
    >
      {children}
    </button>
  )
);

FilterButton.displayName = 'FilterButton';

export { Popover, PopoverContent, PopoverTrigger };
export default MultipleFilters;
