import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { api } from '/src/utils/api';
import CAlert from '/src/components/atoms/CAlert';
import { RadioGroup, RadioGroupItem } from '../../ui/RadioGroup';
import { Label } from '../../ui/Label';
import { FormValues5, schemaStep5, StepProps } from './CreationConcepts';
import { cn } from '/src/utils/cn';
import ConceptButton from './ConceptButton';
import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { InvoiceSeries, ProductServiceCatalog } from '@cometa/trpc/src/types';
import useDebounce from '/src/hooks/useDebounce';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import SearchableComboBox from '../../ui/SearchableComboBox';
import { Tooltip } from '../../atoms/Tooltip';

export function Step5Form({
  setData,
  onNext,
  onBack,
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
      series: undefined,
      series_selector: 'false',
      does_invoice_as_general_public: 'false',
    },
  });
  const is_billable = formInvoiceStep.watch('is_billable');
  const need_rvoe = formInvoiceStep.watch('has_rvoe');
  const seriesSelected = formInvoiceStep.watch('series_selector');
  const productKeyValue = formInvoiceStep.watch('product_key');
  const unitTypeValue = formInvoiceStep.watch('unit_type');
  const seriesValue = formInvoiceStep.watch('series');

  const [searchProdServ, setSearchProdServ] = useState<string>();
  const debouncedQuery = String(useDebounce(searchProdServ, 200));

  const { data: schoolProductKeys, isFetching } = api.concepts.conceptsProductKeysList.useQuery(
    { search: debouncedQuery },
    {
      enabled: Boolean(debouncedQuery?.length && debouncedQuery.length > 3),
      initialData: [],
      staleTime: 1,
    }
  );

  const selectedSchool = useSelectedSchool();
  const { data: schoolTaxUnits } = api.concepts.conceptsTaxUnitsList.useQuery(undefined, {
    select: (data) =>
      (data ?? [])
        .map((u) => (typeof u === 'string' ? u.trim() : u))
        .filter((u): u is string => Boolean(u) && u !== ''),
  });
  const { data: invoiceSeriesResponse } = api.series.invoiceSeriesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    { initialData: [] }
  );
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

  useEffect(() => {
    if (seriesSelected === 'false') {
      formInvoiceStep.setValue('series', undefined);
      formInvoiceStep.clearErrors('series');
      formInvoiceStep.trigger('series');
    }
  }, [formInvoiceStep, seriesSelected]);

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
                <span className="text-base font-semibold">Es facturable</span>
                <div className="flex flex-row">
                  <div className="flex items-center mr-6 ml-2 space-x-2">
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

        {is_billable === 'true' && (
          <div className="flex flex-col gap-6 min-h-[62vh]">
            <Tooltip
              message="No puedes facturar únicamente a público general si el colegio no está configurado para hacerlo."
              disableHover={selectedSchool?.can_invoice_to_general_public}
            >
              <Controller
                control={formInvoiceStep.control}
                name="does_invoice_as_general_public"
                render={({ field: { onChange, value } }) => {
                  const isDisabled = !selectedSchool?.can_invoice_to_general_public;
                  return (
                    <RadioGroup defaultValue={value} onValueChange={onChange}>
                      <span className="text-base font-semibold">Facturar únicamente a público general</span>
                      <div className="flex flex-row mt-3">
                        <div className="flex items-center mr-6 ml-2 space-x-2">
                          <RadioGroupItem
                            value="true"
                            id="does_invoice_as_general_public_true"
                            data-testid="does_invoice_as_general_public_true-radio"
                            disabled={isDisabled}
                          />
                          <Label
                            htmlFor="does_invoice_as_general_public_true"
                            className={cn({
                              'opacity-50 cursor-not-allowed': isDisabled,
                            })}
                          >
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="false"
                            id="does_invoice_as_general_public_false"
                            data-testid="does_invoice_as_general_public_false-radio"
                            disabled={isDisabled}
                          />
                          <Label
                            htmlFor="does_invoice_as_general_public_false"
                            className={cn({
                              'opacity-50 cursor-not-allowed': isDisabled,
                            })}
                          >
                            No
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  );
                }}
              />
            </Tooltip>
            <Controller
              control={formInvoiceStep.control}
              name="has_sales_tax"
              render={({ field: { onChange, value } }) => (
                <RadioGroup value={value} onValueChange={onChange}>
                  <span className="text-base font-semibold">Sujeto a IVA</span>
                  <div className="flex flex-row mt-3">
                    <div className="flex items-center mr-6 ml-2 space-x-2">
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
            <Controller
              control={formInvoiceStep.control}
              name="product_key"
              render={({ field: { onChange } }) => (
                <SearchableComboBox<ProductServiceCatalog>
                  key={`product_key-${productKeyValue ?? 'empty'}`}
                  isLoading={isFetching}
                  items={schoolProductKeys || []}
                  label="Código de producto"
                  placeholder="Busca por código o por nombre (mínimo 4 caracteres)"
                  onSelectedItemChange={(selectedItem) => {
                    if (selectedItem) {
                      onChange(selectedItem.Value);
                    } else {
                      onChange(undefined);
                      formInvoiceStep.trigger('product_key');
                    }
                  }}
                  onInputValueChange={setSearchProdServ}
                  selectedValue={(schoolProductKeys || []).find((it) => it.Value === productKeyValue)}
                  itemToString={(item) => (item?.Name ? `${item?.Name} (${item?.Value})` : '')}
                  filterItems={(item, inputValue) => {
                    const sortedItems = matchSorter([item], inputValue, { keys: ['Name', 'Value'] });
                    return sortedItems.length > 0;
                  }}
                />
              )}
            />
            {schoolTaxUnits && (
              <Controller
                name="unit_type"
                control={formInvoiceStep.control}
                render={({ field: { onChange } }) => (
                  <SearchableComboBox<string>
                    key={`unit_type-${unitTypeValue ?? 'empty'}`}
                    items={(schoolTaxUnits as string[]) || []}
                    label="Tipo de unidad"
                    placeholder="Selecciona un tipo de unidad"
                    onSelectedItemChange={(selectedItem) => {
                      if (selectedItem) {
                        onChange(selectedItem);
                      } else {
                        onChange(undefined);
                        formInvoiceStep.trigger('unit_type');
                      }
                    }}
                    selectedValue={unitTypeValue || null}
                    itemToString={(item) => item || ''}
                    filterItems={(item, inputValue) => {
                      const sortedItems = matchSorter([item], inputValue, { keys: [(item) => item || ''] });
                      return sortedItems.length > 0;
                    }}
                  />
                )}
              />
            )}
            {invoiceSeriesResponse && invoiceSeriesResponse.length > 0 && (
              <Controller
                control={formInvoiceStep.control}
                name="series_selector"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup defaultValue={value} onValueChange={onChange}>
                    <span className="text-base font-semibold">¿Quieres configurar una Serie para tus facturas?</span>
                    <div className="flex flex-row mt-3">
                      <div className="flex items-center mr-6 ml-2 space-x-2">
                        <RadioGroupItem value="true" />
                        <Label htmlFor="series_true">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" />
                        <Label htmlFor="series_false">No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
            )}
            {invoiceSeriesResponse && invoiceSeriesResponse.length > 0 && seriesSelected === 'true' && (
              <Controller
                name="series"
                control={formInvoiceStep.control}
                render={({ field: { onChange } }) => (
                  <SearchableComboBox<string>
                    key={`series-${seriesValue?.code ?? 'empty'}`}
                    items={invoiceSeriesResponse.map((item: InvoiceSeries) => item.code)}
                    label=""
                    placeholder="Serie de factura"
                    onSelectedItemChange={(selectedItem) => {
                      if (selectedItem) {
                        onChange(invoiceSeriesResponse.find((item) => item.code === selectedItem));
                      } else {
                        onChange(undefined);
                        formInvoiceStep.trigger('series');
                      }
                    }}
                    selectedValue={seriesValue?.code || null}
                    itemToString={(item) => item || ''}
                    filterItems={(item, inputValue) => {
                      const sortedItems = matchSorter([item], inputValue, { keys: [(item) => item || ''] });
                      return sortedItems.length > 0;
                    }}
                  />
                )}
              />
            )}
            <Controller
              control={formInvoiceStep.control}
              name="has_rvoe"
              render={({ field: { onChange, value } }) => (
                <RadioGroup onValueChange={onChange} value={value}>
                  <span className="text-base font-semibold">Incluye complemento educativo</span>
                  <div className="flex flex-row mt-3">
                    <div className="flex items-center mr-6 ml-2 space-x-2">
                      <RadioGroupItem value="true" id="rvoe_opt_true" data-testid="rvoeOptTrue-radio" />
                      <Label htmlFor="rvoe_opt_true">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="rvoe_opt_false" data-testid="rvoeOptFalse-radio" />
                      <Label htmlFor="rvoe_opt_false">No</Label>
                    </div>
                  </div>
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
