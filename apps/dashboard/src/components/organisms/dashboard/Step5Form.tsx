import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { api } from '../../../utils/api';
import CAlert from '/src/components/atoms/CAlert';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { StepProps, FormValues5, schemaStep5 } from './CreationConcepts';
import { cn } from '/src/utils/cn';
import ConceptButton from './ConceptButton';
import { useCombobox } from 'downshift';
import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { Check } from 'lucide-react';

export function Step5Form({
  setData,
  onNext,
  onBack,
  formData,
  isSubmitting,
}: StepProps<FormValues5> & { isSubmitting: boolean }) {
  const formInvoiceStep = useForm<FormValues5>({
    resolver: zodResolver(schemaStep5),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      is_billable: 'true',
      has_sales_tax: undefined,
      has_rvoe: undefined,
      product_key: undefined,
      rvoe: undefined,
    },
  });
  const is_dashboard_payment = formData?.payment_only_in_dashboard;
  const is_billable = formInvoiceStep.watch('is_billable');
  const need_rvoe = formInvoiceStep.watch('has_rvoe');

  const { data: schoolProductKeys } = api.concepts.conceptsProductKeysList.useQuery();

  const { data: schoolTaxUnits } = api.concepts.conceptsTaxUnitsList.useQuery();
  const onSubmit = (data: FormValues5) => {
    setData(data);
    onNext(data);
  };

  useEffect(() => {
    if (need_rvoe === 'false') {
      formInvoiceStep.setValue('rvoe', undefined);
      formInvoiceStep.clearErrors('rvoe');
      formInvoiceStep.trigger('rvoe'); // Trigger re-validation
    }
  }, [formInvoiceStep, need_rvoe]);

  return (
    <>
      <div className="pt-5 pb-6">
        <div className="sticky top-0 z-20 bg-white">
          <h1 className="text-xl font-bold text-black">Información de facturación</h1>
          <span className="text-sm text-[#637381] ">
            Registra la información fiscal, en caso corresponda, para tu concepto.
          </span>
        </div>

        <CAlert
          className="mt-6"
          type="warning"
          message="Es importante asegurarse que la informacion ingresada sea la correcta para evitar datos equivocados en las facturas"
        />
      </div>
      <form onSubmit={formInvoiceStep.handleSubmit(onSubmit)}>
        {is_dashboard_payment === 'true' && (
          <div
            className={cn('flex flex-col gap-5 mb-4', {
              'min-h-[62vh]': is_billable === 'false',
            })}
          >
            <Controller
              control={formInvoiceStep.control}
              name="is_billable"
              render={({ field: { onChange, value } }) => (
                <RadioGroup value={value} onValueChange={onChange}>
                  <span className="text-base font-semibold">¿El concepto a crear podrá ser facturable?</span>
                  <div className="flex flex-row">
                    <div className="flex items-center ml-2 mr-6 space-x-2">
                      <RadioGroupItem value="true" id="tax_sales_true" />
                      <Label htmlFor="tax_sales_true">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="tax_sales_false" />
                      <Label htmlFor="tax_sales_false">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        )}
        {(is_dashboard_payment === 'false' || is_billable === 'true') && (
          <div className="flex flex-col gap-6 min-h-[62vh]">
            <Controller
              control={formInvoiceStep.control}
              name="has_sales_tax"
              render={({ field: { onChange, value } }) => (
                <RadioGroup defaultValue={value} onValueChange={onChange}>
                  <span className="text-base font-semibold">¿Se debe cobrar IVA con este concepto?</span>
                  <div className="flex flex-row mt-3">
                    <div className="flex items-center ml-2 mr-6 space-x-2">
                      <RadioGroupItem value="true" id="tax_sales_true" data-testid="taxSalesTrue-radio" />
                      <Label htmlFor="tax_sales_true">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="tax_sales_false" data-testid="taxSalesFalse-radio" />
                      <Label htmlFor="tax_sales_false">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
            {schoolProductKeys && (
              <Controller
                name="product_key"
                control={formInvoiceStep.control}
                render={({ field: { onChange } }) => (
                  <ComboBox<string>
                    items={(schoolProductKeys as string[]) || []}
                    label="Clave de producto"
                    placeholder="Selecciona una clave de producto"
                    onSelectedItemChange={(selectedItem) => {
                      if (selectedItem) {
                        onChange(selectedItem);
                      }
                    }}
                    itemToString={(item) => item || ''}
                    filterItems={(item, inputValue) => {
                      const sortedItems = matchSorter([item], inputValue, { keys: [(item) => item || ''] });
                      return sortedItems.length > 0;
                    }}
                  />
                )}
              />
            )}
            {/* <div className="flex flex-row items-center mt-1">
                                <label className="ml-4 mr-2 mt-1 text-sm font-normal text-[#919EAB]">
                                  ¿Qué es la clave de producto?
                                </label>
                                <IcExclamation />
                              </div> */}
            {schoolTaxUnits && (
              <Controller
                name="unit_type"
                control={formInvoiceStep.control}
                render={({ field: { onChange } }) => (
                  <ComboBox<string>
                    items={(schoolTaxUnits as string[]) || []}
                    label="Tipo de unidad"
                    placeholder="Selecciona un tipo de unidad"
                    onSelectedItemChange={(selectedItem) => {
                      if (selectedItem) {
                        onChange(selectedItem);
                      }
                    }}
                    itemToString={(item) => item || ''}
                    filterItems={(item, inputValue) => {
                      const sortedItems = matchSorter([item], inputValue, { keys: [(item) => item || ''] });
                      return sortedItems.length > 0;
                    }}
                  />
                )}
              />
            )}

            {/* <div className="flex flex-row items-center mt-1">
                                <label className="ml-4 mr-2 mt-1 text-sm font-normal text-[#919EAB]">
                                  ¿Qué es el tipo de unidad y cuál elegir?
                                </label>
                                <IcExclamation />
                              </div> */}

            <Controller
              control={formInvoiceStep.control}
              name="has_rvoe"
              render={({ field: { onChange, value } }) => (
                <RadioGroup onValueChange={onChange} defaultValue={value}>
                  <span className="text-base font-semibold">
                    ¿Las facturas de este concepto deben incluir complemento educativo? (RVOE)
                  </span>
                  <div className="flex flex-row mt-3">
                    <div className="flex items-center ml-2 mr-6 space-x-2">
                      <RadioGroupItem value="true" id="rvoe_opt_true" data-testid="rvoeOptTrue-radio" />
                      <Label htmlFor="rvoe_opt_true">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="rvoe_opt_false" data-testid="rvoeOptFalse-radio" />
                      <Label htmlFor="rvoe_opt_false">No</Label>
                    </div>
                  </div>
                  {/* <div className="flex flex-row items-center mt-1">
                    <label className="ml-1 mr-2 mt-1 text-sm font-normal text-[#919EAB]">
                      ¿Qué es el complemento educativo?
                    </label>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_20014_2177)">
                        <path
                          d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0V0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.35361 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667Z"
                          fill="#98A2B3"
                        />
                        <path
                          d="M8.00017 3.33344C7.82335 3.33344 7.65378 3.40367 7.52876 3.5287C7.40373 3.65372 7.3335 3.82329 7.3335 4.0001V9.33343C7.3335 9.51025 7.40373 9.67981 7.52876 9.80484C7.65378 9.92986 7.82335 10.0001 8.00017 10.0001C8.17698 10.0001 8.34655 9.92986 8.47157 9.80484C8.5966 9.67981 8.66684 9.51025 8.66684 9.33343V4.0001C8.66684 3.82329 8.5966 3.65372 8.47157 3.5287C8.34655 3.40367 8.17698 3.33344 8.00017 3.33344Z"
                          fill="#98A2B3"
                        />
                        <path
                          d="M8.66684 12.0001C8.66684 11.6319 8.36836 11.3334 8.00017 11.3334C7.63197 11.3334 7.3335 11.6319 7.3335 12.0001C7.3335 12.3683 7.63197 12.6668 8.00017 12.6668C8.36836 12.6668 8.66684 12.3683 8.66684 12.0001Z"
                          fill="#98A2B3"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_20014_2177">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div> */}
                </RadioGroup>
              )}
            />
            {need_rvoe === 'true' && (
              <TextField
                label="Clave del centro de trabajo (RVOE)"
                error={formInvoiceStep.formState.errors.rvoe?.message}
                value={formInvoiceStep.watch('rvoe')}
                className={cn('focus-within:border-green', {
                  'focus-within:border-red-500': formInvoiceStep.formState.errors.rvoe,
                })}
              >
                <CustomInput
                  {...formInvoiceStep.register('rvoe')}
                  type="text"
                  className="group-focus-within:text-green"
                />
              </TextField>
            )}
          </div>
        )}
        <ConceptButton
          onBack={() => {
            onBack();
          }}
          textNext={isSubmitting ? 'Creando...' : 'Crear concepto'}
          disabledBack={isSubmitting}
          disabledNext={isSubmitting || !formInvoiceStep.formState.isValid}
        />
      </form>
    </>
  );
}

interface ComboBoxProps<T> {
  items: T[];
  label: string;
  placeholder: string;
  onSelectedItemChange: (selectedItem: T | null) => void;
  itemToString: (item: T | null) => string;
  filterItems: (item: T, inputValue: string) => boolean;
}

const ComboBox = <T,>({
  items,
  label,
  placeholder,
  onSelectedItemChange,
  itemToString,
  filterItems,
}: ComboBoxProps<T>) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    setInputValue,
    selectedItem,
    inputValue,
  } = useCombobox({
    items: filteredItems,
    onInputValueChange: ({ inputValue }) => {
      setFilteredItems(items.filter((item) => filterItems(item, inputValue || '')));
      setInputValue(inputValue || '');
    },
    itemToString,
    onSelectedItemChange: ({ selectedItem }) => {
      onSelectedItemChange(selectedItem as T | null);
    },
  });
  // i'm going to keep this just in case
  const _theTextInTheInputIsDifferentThanTheSelectedItem =
    inputValue && inputValue.length > 0 && !isOpen && selectedItem !== inputValue;
  return items && items.length > 0 ? (
    <div>
      <div className="relative flex flex-col w-full gap-1">
        <div className="flex rounded-lg px-4 pb-1 border border-[#C0C9D8] bg-white gap-0.5 focus-within:ring-green focus-within:hover:ring-green focus-within:ring-[1.5px] justify-between items-center">
          <div>
            <label className="w-fit text-xs px-1 text-[#717993]" {...getLabelProps()}>
              {label}
            </label>
            <input
              placeholder={placeholder}
              className="w-full px-1.5 focus-within:outline-none border-none outline-none focus:outline-none focus-within:ring-0"
              {...getInputProps()}
              onBlur={() => setInputValue(itemToString(selectedItem))}
            />
          </div>
          <button aria-label="toggle menu" className="px-2 pt-1" type="button" {...getToggleButtonProps()}>
            {isOpen ? (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.94116 7.18907L6.06568 3.06454L10.1902 7.18907C10.6048 7.60364 11.2745 7.60364 11.6891 7.18907C12.1036 6.77449 12.1036 6.10478 11.6891 5.69021L6.80979 0.810935C6.39522 0.396356 5.72551 0.396356 5.31093 0.810935L0.431664 5.69021C0.0170859 6.10478 0.017086 6.77449 0.431664 7.18907C0.846243 7.59302 1.52658 7.60365 1.94116 7.18907Z"
                  fill="#717993"
                />
              </svg>
            ) : (
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.1796 0.810934L6.05505 4.93546L1.93052 0.810934C1.51594 0.396355 0.84624 0.396355 0.431661 0.810934C0.0170829 1.22551 0.0170829 1.89522 0.431661 2.30979L5.31093 7.18907C5.72551 7.60364 6.39521 7.60364 6.80979 7.18907L11.6891 2.30979C12.1036 1.89522 12.1036 1.22551 11.6891 0.810934C11.2745 0.406986 10.5942 0.396355 10.1796 0.810934Z"
                  fill="#717993"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      <ul
        className={`absolute max-w-[500px] w-full rounded-md bg-white mt-1 max-h-72 overflow-scroll p-0 z-10 ${
          !isOpen && 'hidden'
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          (filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <li
                className={cn(
                  {
                    'bg-gray-200': highlightedIndex === index,
                    'font-bold': selectedItem === item,
                  },
                  'py-2 px-3 shadow-sm flex flex-col'
                )}
                key={itemToString(item)}
                {...getItemProps({ item, index })}
              >
                <span className="flex">
                  {selectedItem === item ? <Check /> : ''}
                  {itemToString(item)}
                </span>
              </li>
            ))
          ) : (
            <li className="flex flex-col px-3 py-2 shadow-sm">
              <span>No encontramos el elemento</span>
            </li>
          ))}
      </ul>
    </div>
  ) : (
    <></>
  );
};
