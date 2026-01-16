import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { api } from '/src/utils/api';
import CAlert from '/src/components/atoms/CAlert';
import { RadioGroup, RadioGroupItem } from '../../../ui/RadioGroup';
import { Label } from '../../../ui/Label';
import { FormValues, FormValues5, schemaStep5, StepProps } from '../CreateConcept';
import { cn } from '/src/utils/cn';
import ConceptButton from '../../../organisms/dashboard/ConceptButton';
import { useEffect, useState } from 'react';
import { matchSorter } from 'match-sorter';
import { ProductServiceCatalog } from '@cometa/trpc/src/types';
import useDebounce from '/src/hooks/useDebounce';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import SearchableComboBox from '/src/components/ui/SearchableComboBox';
import { Select } from '@cometa/recreo';
import { Tooltip } from '/src/components/atoms/Tooltip';

export function Step5Form({
  setData,
  onNext,
  onBack,
  isSubmitting,
  formData,
}: StepProps<FormValues5> & { isSubmitting: boolean; formData: Partial<FormValues> }) {
  const formInvoiceStep = useForm<FormValues5>({
    resolver: zodResolver(schemaStep5),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      is_billable: formData?.is_billable ?? 'true',
      has_sales_tax: formData?.has_sales_tax || undefined,
      has_rvoe: formData?.has_rvoe || undefined,
      product_key: formData?.product_key || undefined,
      unit_type: formData?.unit_type || undefined,
      rvoe: formData?.rvoe || undefined,
      series: formData?.series || undefined,
      series_selector: formData?.series ? 'true' : formData?.series_selector || 'false',
      does_invoice_as_general_public: formData?.does_invoice_as_general_public || 'false',
    },
  });
  const is_billable = formInvoiceStep.watch('is_billable');
  const need_rvoe = formInvoiceStep.watch('has_rvoe');
  const seriesSelected = formInvoiceStep.watch('series_selector');

  const [searchProdServ, setSearchProdServ] = useState<string>();
  const [seriesInitialized, setSeriesInitialized] = useState(false);
  const [productKeysCache, setProductKeysCache] = useState<ProductServiceCatalog[]>([]);
  const debouncedQuery = String(useDebounce(searchProdServ, 200));

  const { data: initialProductKeys } = api.concepts.conceptsProductKeysList.useQuery(
    { search: formData?.product_key || '' },
    {
      enabled: Boolean(formData?.is_billable === 'true' && formData?.product_key),
      staleTime: Infinity,
    }
  );

  const { data: searchedProductKeys, isFetching } = api.concepts.conceptsProductKeysList.useQuery(
    { search: debouncedQuery },
    {
      enabled: Boolean(is_billable === 'true' && debouncedQuery?.length && debouncedQuery.length > 3),
      initialData: initialProductKeys,
      staleTime: 1,
    }
  );

  const schoolProductKeys = !debouncedQuery ? initialProductKeys : searchedProductKeys;

  useEffect(() => {
    if (initialProductKeys) {
      setProductKeysCache((prev) => {
        const newKeys = initialProductKeys.filter((k) => !prev.some((p) => p.Value === k.Value));
        return [...prev, ...newKeys];
      });
    }
  }, [initialProductKeys]);

  useEffect(() => {
    if (schoolProductKeys) {
      setProductKeysCache((prev) => {
        const newKeys = schoolProductKeys.filter((k) => !prev.some((p) => p.Value === k.Value));
        return [...prev, ...newKeys];
      });
    }
  }, [schoolProductKeys]);

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
    if (data.is_billable === 'false') {
      const cleanData: FormValues5 = {
        is_billable: 'false',
        series_selector: 'false',
        has_sales_tax: undefined,
        product_key: undefined,
        unit_type: undefined,
        has_rvoe: undefined,
        rvoe: undefined,
        series: undefined,
        does_invoice_as_general_public: 'false',
      };
      setData(cleanData);
      onNext(cleanData);
    } else {
      const submittedData = { ...data };

      if (data.series_selector === 'false') {
        submittedData.series = undefined;
      } else if (typeof data.series === 'string' && invoiceSeriesResponse?.length) {
        const seriesObj = invoiceSeriesResponse.find((s) => s.code === data.series);
        if (seriesObj) {
          submittedData.series = seriesObj;
        }
      }

      setData(submittedData);
      onNext(submittedData);
    }
  };

  useEffect(() => {
    if (seriesSelected === 'false') {
      formInvoiceStep.setValue('series', undefined);
    } else if (seriesSelected === 'true') {
      const currentSeries = formInvoiceStep.getValues('series');
      if (typeof currentSeries === 'string' && invoiceSeriesResponse?.length) {
        const seriesObj = invoiceSeriesResponse.find((s) => s.code === currentSeries);
        if (seriesObj) {
          formInvoiceStep.setValue('series', seriesObj);
        }
      }
    }
  }, [seriesSelected, formInvoiceStep, invoiceSeriesResponse]);

  useEffect(() => {
    if (need_rvoe === 'false') {
      formInvoiceStep.setValue('rvoe', undefined);
      formInvoiceStep.clearErrors('rvoe');
      formInvoiceStep.trigger('rvoe');
    }
  }, [formInvoiceStep, need_rvoe]);

  useEffect(() => {
    if (is_billable === 'false') {
      formInvoiceStep.setValue('has_sales_tax', undefined);
      formInvoiceStep.setValue('product_key', undefined);
      formInvoiceStep.setValue('unit_type', undefined);
      formInvoiceStep.setValue('has_rvoe', undefined);
      formInvoiceStep.setValue('rvoe', undefined);
      formInvoiceStep.setValue('series', undefined);
      formInvoiceStep.setValue('series_selector', 'false');
      formInvoiceStep.setValue('does_invoice_as_general_public', 'false');

      formInvoiceStep.clearErrors();
    }
  }, [is_billable]);

  useEffect(() => {
    if (
      !seriesInitialized &&
      invoiceSeriesResponse?.length &&
      formData?.series &&
      typeof formData.series === 'string'
    ) {
      const seriesObj = invoiceSeriesResponse.find((s) => s.code === formData.series);
      if (seriesObj) {
        formInvoiceStep.setValue('series', seriesObj);
        setSeriesInitialized(true);
      }
    }
  }, [invoiceSeriesResponse, formData?.series, seriesInitialized, formInvoiceStep]);

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
                        <div className="flex items-center ml-2 mr-6 space-x-2">
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
            {is_billable === 'true' && (
              <Controller
                control={formInvoiceStep.control}
                name="product_key"
                render={({ field: { onChange, value } }) => {
                  const selectedValue =
                    schoolProductKeys?.find((item) => item.Value === value) ||
                    initialProductKeys?.find((item) => item.Value === value) ||
                    productKeysCache.find((item) => item.Value === value) ||
                    null;

                  return (
                    <SearchableComboBox<ProductServiceCatalog>
                      isLoading={isFetching}
                      selectedValue={selectedValue}
                      items={schoolProductKeys || []}
                      label="Código de producto"
                      placeholder="Busca por código o por nombre (mínimo 4 caracteres)"
                      onSelectedItemChange={(selectedItem) => {
                        onChange(selectedItem ? selectedItem.Value : null);
                        if (selectedItem) {
                          setProductKeysCache((prev) => {
                            if (prev.some((p) => p.Value === selectedItem.Value)) {
                              return prev;
                            }
                            return [...prev, selectedItem];
                          });
                        }
                      }}
                      onInputValueChange={setSearchProdServ}
                      itemToString={(item) => (item?.Name ? `${item.Name} (${item.Value})` : '')}
                      filterItems={(item, inputValue) => {
                        const sortedItems = matchSorter([item], inputValue, { keys: ['Name', 'Value'] });
                        return sortedItems.length > 0;
                      }}
                    />
                  );
                }}
              />
            )}
            {schoolTaxUnits && (
              <Controller
                name="unit_type"
                control={formInvoiceStep.control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="Tipo de unidad"
                    value={value ?? undefined}
                    onValueChange={(v) => onChange(v === '' ? undefined : v)}
                    error={formInvoiceStep.formState.errors.unit_type?.message}
                    containerClassName="w-full"
                    className="w-full"
                  >
                    <Select.Content>
                      {schoolTaxUnits.map((unit) => (
                        <Select.Item key={unit} value={unit}>
                          {unit}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
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
                      <div className="flex items-center ml-2 mr-6 space-x-2">
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
                render={({ field: { onChange, value } }) => (
                  <Select
                    placeholder="Serie de factura"
                    value={typeof value === 'string' ? value : value?.code || ''}
                    onValueChange={(selectedCode) => {
                      const selectedSeries = invoiceSeriesResponse.find((series) => series.code === selectedCode);
                      onChange(selectedSeries);
                    }}
                    error={formInvoiceStep.formState.errors.series?.message}
                    containerClassName="w-full"
                    className="w-full"
                  >
                    <Select.Content>
                      {invoiceSeriesResponse.map((series) => (
                        <Select.Item key={series.code} value={series.code}>
                          {series.code}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
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
                    <div className="flex items-center ml-2 mr-6 space-x-2">
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
            const currentValues = formInvoiceStep.getValues();
            setData(currentValues);
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
