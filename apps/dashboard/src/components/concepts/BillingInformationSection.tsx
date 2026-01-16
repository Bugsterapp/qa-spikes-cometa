import React from 'react';
import { SectionLayout } from './SectionLayout';
import { DetailConcept } from '@cometa/trpc/src/types';
import IcCheck from '/public/assets/icons/ic_check_outline.svg';
import IcClose from '/public/assets/icons/ic_circle_error.svg';
import BillingDataEditForm, {
  BillingDataFormValues,
  billingDataSchema,
} from '/src/components/concepts/BillingDataEditForm';
import Button from '/src/components/organisms/dashboard/Button';
import IcEdit from 'public/assets/icons/ic_edit.svg';
import { api } from '/src/utils/api';
import useAlert from '/src/hooks/useAlert';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface BillingInformationSectionProps {
  concept: DetailConcept;
  isEditing: boolean;
  onEdit: () => void;
  onSaveSuccess: () => void;
}

export const BillingInformationSection: React.FC<BillingInformationSectionProps> = ({
  concept,
  isEditing,
  onEdit,
  onSaveSuccess,
}) => {
  const utils = api.useUtils();
  const { setAlertState } = useAlert();
  const [backendError, setBackendError] = React.useState<string | null>(null);

  const methods = useForm<BillingDataFormValues>({
    resolver: zodResolver(billingDataSchema),
    defaultValues: {
      is_billable: concept.is_billable,
      has_sales_tax: concept.has_sales_tax,
      tax_code: concept.tax_code,
      tax_unit: concept.tax_unit,
      use_education_complement: concept.use_education_complement,
      institutional_id: concept.institutional_id,
      does_invoice_as_general_public: concept.does_invoice_as_general_public ?? false,
    },
  });

  const updateConceptMutation = api.concepts.updateConcept.useMutation({
    onSuccess: async () => {
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Concepto actualizado exitosamente',
      });
      setBackendError(null);
      await utils.schools.schoolsConceptDetail.invalidate();
      onSaveSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Hubo un error al actualizar el concepto.';
      setBackendError(errorMessage);
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Hubo un error al actualizar el concepto',
      });
      methods.reset({
        is_billable: concept.is_billable,
        has_sales_tax: concept.has_sales_tax,
        tax_code: concept.tax_code,
        tax_unit: concept.tax_unit,
        use_education_complement: concept.use_education_complement,
        institutional_id: concept.institutional_id,
        does_invoice_as_general_public: concept.does_invoice_as_general_public ?? false,
      });
    },
  });

  const { data: productKeys } = api.concepts.conceptsProductKeysList.useQuery(
    { search: concept.tax_code || '' },
    { enabled: Boolean(concept.tax_code), staleTime: Infinity }
  );

  const currentProduct = productKeys?.find((item) => item.Value === concept.tax_code);

  const handleSaveEdit = async (data: Partial<BillingDataFormValues>) => {
    updateConceptMutation.mutate({ id: concept.id, updateFields: data });
  };

  if (isEditing) {
    return (
      <FormProvider {...methods}>
        <BillingDataEditForm
          isEditing={isEditing}
          setIsEditing={(value) => (value ? onEdit() : onSaveSuccess())}
          concept={concept}
          onSave={handleSaveEdit}
          backendError={backendError}
        />
      </FormProvider>
    );
  }

  return (
    <SectionLayout
      title="Información de facturación"
      edit={
        !isEditing &&
        concept && (
          <Button onClick={onEdit} variant="outline" className="gap-2 h-7 border-none text-green">
            <IcEdit className="w-5 h-5" />
            Editar
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Es facturable</p>
          {concept?.is_billable ? (
            <>
              <p className="mr-2 text-sm font-semibold">Sí</p>
              <IcCheck />
            </>
          ) : (
            <>
              <p className="mr-2 text-sm font-semibold">No</p>
              <IcClose />
            </>
          )}
        </div>
        <div className="flex items-center">
          <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Facturar únicamente a Público General</p>
          <div className="flex text-sm font-semibold">
            {concept?.does_invoice_as_general_public ? (
              <>
                <span className="mr-2 text-sm font-semibold">Sí</span>
                <IcCheck />
              </>
            ) : (
              <>
                <p className="mr-2 text-sm font-semibold">No</p>
                <IcClose />
              </>
            )}
          </div>
        </div>
        {concept?.is_billable && (
          <>
            <div className="flex items-center">
              <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Sujeto a IVA</p>
              {concept?.has_sales_tax ? (
                <>
                  <p className="mr-2 text-sm font-semibold">Sí</p>
                  <IcCheck />
                </>
              ) : (
                <>
                  <p className="mr-2 text-sm font-semibold">No</p>
                  <IcClose />
                </>
              )}
            </div>
            <div className="flex items-start">
              <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Código de producto:</p>
              <div className="text-sm">
                <p className="font-semibold">{concept?.tax_code || '-'}</p>
                {currentProduct && <p className="text-[#637381]">{currentProduct.Name}</p>}
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de unidad:</p>
              <p className="text-sm font-semibold">{concept?.tax_unit ? concept?.tax_unit : '-'}</p>
            </div>
            <div className="flex items-center">
              <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Incluye complemento educativo</p>
              <div className="flex text-sm font-semibold">
                {concept?.use_education_complement ? (
                  <>
                    <p className="mr-2 text-sm font-semibold">Sí</p>
                    <IcCheck />
                  </>
                ) : (
                  <>
                    <p className="mr-2 text-sm font-semibold">No</p>
                    <IcClose />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">RVOE:</p>
              <p className="text-sm font-semibold">{concept?.institutional_id ? concept?.institutional_id : '-'}</p>
            </div>
            {concept?.series && (
              <div className="flex items-center">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Serie de factura:</p>
                <p className="text-sm font-semibold">{concept?.series}</p>
              </div>
            )}
          </>
        )}
      </div>
    </SectionLayout>
  );
};
