import { z } from 'zod';
import { Controller, useFormContext } from 'react-hook-form';
import { DetailConcept, ProductServiceCatalog } from '@cometa/trpc/src/types';
import { Button, Input, Select, TextField } from '@cometa/recreo';
import { SectionLayout } from './SectionLayout';
import { useState, useEffect } from 'react';
import Alert from '../ui/Alert';
import useDebounce from '/src/hooks/useDebounce';
import SearchableComboBox from '../ui/SearchableComboBox';
import { api } from '/src/utils/api';
import { matchSorter } from 'match-sorter';
import UnsavedChangesDialog from '/src/components/concepts/UnsavedChangesDialog';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { cn } from '/src/utils/cn';
import { Tooltip } from '../atoms/Tooltip';

export const billingDataSchema = z
  .object({
    is_billable: z.boolean(),
    has_sales_tax: z.boolean(),
    tax_code: z.string().max(30, 'Código de producto no puede exceder 30 caracteres').optional().nullable(),
    tax_unit: z.string().max(30, 'Tipo de unidad no puede exceder 30 caracteres').optional().nullable(),
    use_education_complement: z.boolean(),
    institutional_id: z.string().max(32, 'RVOE no puede exceder 32 caracteres').nullable().optional(),
    does_invoice_as_general_public: z.boolean().optional(),
  })
  .refine((data) => !(data.use_education_complement && !data.institutional_id), {
    message: 'RVOE es requerido cuando el complemento educativo está habilitado.',
    path: ['institutional_id'],
  })
  .refine((data) => !(data.is_billable && (!data.tax_code || data.tax_code.trim() === '')), {
    message: 'El código de producto es requerido para conceptos facturables.',
    path: ['tax_code'],
  })
  .refine((data) => !(data.is_billable && (!data.tax_unit || data.tax_unit.trim() === '')), {
    message: 'El tipo de unidad es requerido para conceptos facturables.',
    path: ['tax_unit'],
  });

export type BillingDataFormValues = z.infer<typeof billingDataSchema>;

interface Props {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  concept: DetailConcept;
  onSave: (data: Partial<BillingDataFormValues>) => void;
  backendError?: string | null;
}

export default function BillingDataEditForm({ isEditing, setIsEditing, concept, onSave, backendError }: Props) {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [searchProdServ, setSearchProdServ] = useState<string>();
  const debouncedQuery = String(useDebounce(searchProdServ, 200));
  const selectedSchool = useSelectedSchool();
  const [productKeysCache, setProductKeysCache] = useState<ProductServiceCatalog[]>([]);

  const { data: initialProductKeys } = api.concepts.conceptsProductKeysList.useQuery(
    { search: concept.tax_code || '' },
    { enabled: true, staleTime: Infinity }
  );

  const { data: searchedProductKeys, isFetching: isLoadingProductKeys } = api.concepts.conceptsProductKeysList.useQuery(
    { search: debouncedQuery },
    {
      enabled: Boolean(debouncedQuery?.length && debouncedQuery.length > 3),
      initialData: initialProductKeys,
      staleTime: 1,
    }
  );

  const productKeys = !debouncedQuery ? initialProductKeys : searchedProductKeys;

  useEffect(() => {
    if (initialProductKeys) {
      setProductKeysCache((prev) => {
        const newKeys = initialProductKeys.filter((k) => !prev.some((p) => p.Value === k.Value));
        return [...prev, ...newKeys];
      });
    }
  }, [initialProductKeys]);

  useEffect(() => {
    if (productKeys) {
      setProductKeysCache((prev) => {
        const newKeys = productKeys.filter((k) => !prev.some((p) => p.Value === k.Value));
        return [...prev, ...newKeys];
      });
    }
  }, [productKeys]);

  const { data: taxUnits } = api.concepts.conceptsTaxUnitsList.useQuery(undefined, {
    select: (data) =>
      (data ?? [])
        .map((u) => (typeof u === 'string' ? u.trim() : u))
        .filter((u): u is string => Boolean(u) && u !== ''),
  });

  const form = useFormContext<BillingDataFormValues>();

  const onSubmit = async (data: BillingDataFormValues) => {
    const changedValues: Partial<BillingDataFormValues> = {};

    if (data.is_billable !== concept.is_billable) {
      changedValues.is_billable = data.is_billable;
    }

    if (!data.is_billable) {
      if (Object.keys(changedValues).length === 0) {
        form.reset(data, { keepValues: true });
        setIsEditing(false);
        return;
      }
      onSave(changedValues);
      form.reset(data);
      return;
    }

    if (data.has_sales_tax !== concept.has_sales_tax) {
      changedValues.has_sales_tax = data.has_sales_tax;
    }
    if (data.tax_code !== concept.tax_code) {
      changedValues.tax_code = data.tax_code;
    }
    if (data.tax_unit !== concept.tax_unit) {
      changedValues.tax_unit = data.tax_unit;
    }
    if (data.use_education_complement !== concept.use_education_complement) {
      changedValues.use_education_complement = data.use_education_complement;
      if (!data.use_education_complement) {
        changedValues.institutional_id = null;
      }
    }
    if (data.institutional_id !== concept.institutional_id) {
      changedValues.institutional_id = data.institutional_id;
    }
    if (data.does_invoice_as_general_public !== (concept.does_invoice_as_general_public ?? false)) {
      changedValues.does_invoice_as_general_public = data.does_invoice_as_general_public;
    }

    if (Object.keys(changedValues).length === 0) {
      form.reset(data, { keepValues: true });
      setIsEditing(false);
      return;
    }

    onSave(changedValues);
    form.reset(data);
  };

  const onCancel = () => {
    if (form.formState.isDirty) {
      setShowConfirmationDialog(true);
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SectionLayout
          title="Información de facturación"
          edit={
            isEditing ? (
              <div className="flex gap-2">
                <Button onClick={onCancel} variant="text" size="small" color="legacy">
                  Descartar
                </Button>
                <Button type="submit" variant="solid" color="legacy" size="small">
                  Guardar
                </Button>
              </div>
            ) : null
          }
        >
          <Alert
            variant="warning"
            message="Los cambios solo afectarán a los pagos y facturas que se realicen a partir de ahora."
          />

          {backendError && <Alert variant="error" message={backendError} />}

          <div className="flex flex-col gap-4">
            <Controller
              control={form.control}
              name="is_billable"
              render={({ field: { onChange, value } }) => (
                <div className="space-y-2">
                  <p className="text-sm">Es facturable</p>
                  <div className="flex gap-4">
                    <label className="flex gap-2 items-center">
                      <input type="radio" checked={value === true} onChange={() => onChange(true)} />
                      Sí
                    </label>
                    <label className="flex gap-2 items-center">
                      <input type="radio" checked={value === false} onChange={() => onChange(false)} />
                      No
                    </label>
                  </div>
                </div>
              )}
            />
            <Tooltip
              message="No puedes facturar únicamente a público general si el colegio no está configurado para hacerlo."
              disableHover={selectedSchool?.can_invoice_to_general_public}
            >
              <Controller
                control={form.control}
                name="does_invoice_as_general_public"
                render={({ field: { onChange, value } }) => {
                  const isNotBillable = !form.watch('is_billable');
                  const isDisabled = !selectedSchool?.can_invoice_to_general_public || isNotBillable;
                  return (
                    <div className={cn('space-y-2', { 'opacity-50': isNotBillable })}>
                      <p className="text-sm">Facturar únicamente a público general</p>
                      <div className="flex gap-4" key={`${value}`}>
                        <label
                          className={cn('flex gap-2 items-center', {
                            'opacity-50 cursor-not-allowed': isDisabled,
                          })}
                        >
                          <input
                            type="radio"
                            checked={value === true}
                            onChange={() => onChange(true)}
                            disabled={isDisabled}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          Sí
                        </label>
                        <label
                          className={cn('flex gap-2 items-center', {
                            'opacity-50 cursor-not-allowed': isDisabled,
                          })}
                        >
                          <input
                            type="radio"
                            checked={value === false}
                            onChange={() => onChange(false)}
                            disabled={isDisabled}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          No
                        </label>
                      </div>
                    </div>
                  );
                }}
              />
            </Tooltip>

            <Controller
              control={form.control}
              name="has_sales_tax"
              render={({ field: { onChange, value } }) => (
                <div className={cn('space-y-2', { 'opacity-50': !form.watch('is_billable') })}>
                  <p className="text-sm">Sujeto a IVA</p>
                  <div className="flex gap-4">
                    <label className="flex gap-2 items-center">
                      <input
                        type="radio"
                        checked={value === true}
                        onChange={() => onChange(true)}
                        disabled={!form.watch('is_billable')}
                      />
                      Sí
                    </label>
                    <label className="flex gap-2 items-center">
                      <input
                        type="radio"
                        checked={value === false}
                        onChange={() => onChange(false)}
                        disabled={!form.watch('is_billable')}
                      />
                      No
                    </label>
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="tax_code"
              render={({ field: { onChange, value } }) => {
                const selectedValue =
                  productKeys?.find((item) => item.Value === value) ||
                  initialProductKeys?.find((item) => item.Value === value) ||
                  productKeysCache.find((item) => item.Value === value) ||
                  null;
                const isDisabled = !form.watch('is_billable');
                const error = form.formState.errors.tax_code?.message;
                const isCurrentValueInvalid = !value || (typeof value === 'string' && value.trim() === '');
                const showError = Boolean(error && form.formState.isSubmitted && isCurrentValueInvalid);
                return (
                  <div className={cn({ 'opacity-50 pointer-events-none': isDisabled })}>
                    <SearchableComboBox<ProductServiceCatalog>
                      isLoading={isLoadingProductKeys}
                      selectedValue={selectedValue}
                      items={productKeys || []}
                      label="Código de producto"
                      placeholder="Busca por código o por nombre (mínimo 4 caracteres)"
                      onSelectedItemChange={(selectedItem) => {
                        if (!isDisabled) {
                          onChange(selectedItem ? selectedItem.Value : null);
                        }
                      }}
                      onInputValueChange={setSearchProdServ}
                      itemToString={(item) => (item?.Name ? `${item.Name} (${item.Value})` : '')}
                      filterItems={(item, inputValue) => {
                        const sortedItems = matchSorter([item], inputValue, { keys: ['Name', 'Value'] });
                        return sortedItems.length > 0;
                      }}
                      hasError={showError}
                    />
                    {showError && <p className="text-sm text-red-500 mt-1">{error}</p>}
                  </div>
                );
              }}
            />

            <Controller
              control={form.control}
              name="tax_unit"
              render={({ field: { onChange, value } }) => {
                const isDisabled = !form.watch('is_billable');
                return (
                  <div className={cn({ 'opacity-50': isDisabled })}>
                    <Select
                      placeholder="Tipo de unidad"
                      value={value ?? undefined}
                      onValueChange={(v) => onChange(v === '' ? undefined : v)}
                      error={form.formState.errors.tax_unit?.message}
                      containerClassName="w-full"
                      className="w-full"
                      disabled={isDisabled}
                    >
                      <Select.Content>
                        {taxUnits?.map((unit) => (
                          <Select.Item key={unit} value={unit}>
                            {unit}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                );
              }}
            />

            <Controller
              control={form.control}
              name="use_education_complement"
              render={({ field: { onChange, value } }) => {
                const isDisabled = !form.watch('is_billable');
                return (
                  <div className={cn('space-y-2', { 'opacity-50': isDisabled })}>
                    <p className="text-sm">Incluye complemento educativo</p>
                    <div className="flex gap-4">
                      <label className="flex gap-2 items-center">
                        <input
                          type="radio"
                          checked={value === true}
                          onChange={() => onChange(true)}
                          disabled={isDisabled}
                        />
                        Sí
                      </label>
                      <label className="flex gap-2 items-center">
                        <input
                          type="radio"
                          checked={value === false}
                          onChange={() => onChange(false)}
                          disabled={isDisabled}
                        />
                        No
                      </label>
                    </div>
                  </div>
                );
              }}
            />

            {form.watch('use_education_complement') && (
              <Controller
                control={form.control}
                name="institutional_id"
                render={({ field: { onChange, value } }) => {
                  const isDisabled = !form.watch('is_billable');
                  return (
                    <div className={cn({ 'opacity-50': isDisabled })}>
                      <TextField
                        label="Clave del centro de trabajo (RVOE)"
                        error={form.formState.errors.institutional_id?.message}
                        value={value}
                      >
                        <Input value={value || ''} onChange={onChange} placeholder="RVOE" disabled={isDisabled} />
                      </TextField>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </SectionLayout>
      </form>

      <UnsavedChangesDialog
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={handleCancel}
      />
    </>
  );
}
