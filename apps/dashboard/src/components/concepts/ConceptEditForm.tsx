import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '/src/utils/api';
import { Button, Input, Select, TextField } from '@cometa/recreo';
import {
  ConceptTypesEnum,
  DetailConcept,
  OfferingEnum,
  PaginatedSlimBankAccountList,
  StatusDc1Enum,
} from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import Alert from '../ui/Alert';
import { Tooltip } from '../atoms/Tooltip';
import { useState } from 'react';
import { SectionLayout } from './SectionLayout';
import { ConceptType } from '/src/server/api/routers/charge';
import SelectChip from '../atoms/SelectChip';
import UnsavedChangesDialog from '/src/components/concepts/UnsavedChangesDialog';
import { useFlagWithVariableMatching } from '/src/components/flags/FlagsProvider';

const editSchema = z.object({
  type: z.string().min(1, 'Falta completar este campo'),
  school_cycle: z.string().min(1, 'Falta completar este campo'),
  name: z.string().min(1, 'Falta completar este campo'),
  bank_account: z.string(),
  not_invoicing_bank_account: z.string(),
  payment_only_in_dashboard: z.boolean().optional(),
  early_bird_discounts: z.array(z.any()).optional(),
  interest_schema: z.array(z.any()).optional(),
  offering: z.nativeEnum(OfferingEnum).optional(),
});

export type ConceptEditFormValues = z.infer<typeof editSchema>;

export interface ConceptEditChanges extends Partial<ConceptEditFormValues> {
  school_cycle_id?: string;
  bank_account_id?: string;
  not_invoicing_bank_account_id?: string;
  offering?: OfferingEnum;
}

interface Props {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  concept: DetailConcept;
  conceptTypesList: ConceptType[] | undefined;
  schoolCycles: SchoolCycleEntity[] | undefined;
  bankAccounts: PaginatedSlimBankAccountList | undefined;
  updateConceptMutation: {
    isPending: boolean;
  };
  handleSaveEdit: (data: ConceptEditChanges) => void;
}

export default function ConceptEditForm({
  isEditing,
  setIsEditing,
  concept,
  conceptTypesList,
  schoolCycles,
  bankAccounts,
  updateConceptMutation,
  handleSaveEdit,
}: Props) {
  const school = useSelectedSchool();
  const { isEnabled: isOnlineStoreEnabled } = useFlagWithVariableMatching('enable_online_store_in_concepts');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const { data: fulfillments } = api.payments.listFulfillment.useQuery({
    schoolId: school?.id as string,
    query: {
      concepts: [concept.id],
    },
  });
  const { data: rootConcept } = api.concepts.getRootConcept.useQuery(
    {
      id: concept.root_concept_id,
      schoolId: school?.id as string,
    },
    { enabled: !!concept?.root_concept_id && !!school?.id }
  );
  const { data: studentsAssigned } = api.schools.schoolsConceptsStudentsAssignedList.useInfiniteQuery(
    {
      schoolId: school?.id as string,
      conceptId: concept.id,
      query: {
        page_size: 1,
      },
    },
    {
      enabled: !!concept?.id && !!school?.id,
      getNextPageParam: () => undefined,
    }
  );

  const hasAssignedStudents = (studentsAssigned?.pages[0]?.count ?? 0) > 0;
  const hasPaidOrders = fulfillments?.results?.some((fulfillment) => fulfillment.status === StatusDc1Enum.PAID);
  const isOptionalConcept = concept?.optional;
  const hasManyConcepts = (rootConcept?.concepts?.length ?? 0) > 1;
  const isNameDisabled = hasAssignedStudents || hasManyConcepts;
  const isTypeDisabled = hasAssignedStudents || hasPaidOrders || hasManyConcepts;
  const isSchoolCycleDisabled = hasAssignedStudents || hasPaidOrders || hasManyConcepts;

  const getFieldTooltip = (field: 'name' | 'type' | 'school_cycle') => {
    if (hasPaidOrders) {
      switch (field) {
        case 'name':
          return 'El nombre no puede cambiarse porque este concepto ya tiene pagos registrados.';
        case 'type':
          return 'El tipo de concepto no puede cambiarse porque este concepto ya tiene pagos registrados.';
        case 'school_cycle':
          return 'El ciclo escolar no puede cambiarse porque este concepto ya tiene pagos registrados.';
      }
    }
    if (hasAssignedStudents) {
      switch (field) {
        case 'name':
          return 'El nombre no puede cambiarse porque este concepto ya tiene estudiantes asignados.';
        case 'type':
          return 'El tipo de concepto no puede cambiarse porque este concepto ya tiene estudiantes asignados.';
        case 'school_cycle':
          return 'El ciclo escolar no puede cambiarse porque este concepto ya tiene estudiantes asignados.';
      }
    }
    if (field === 'type' && isOptionalConcept) {
      return 'No es posible cambiar el tipo porque es un concepto opcional';
    }
    return undefined;
  };

  const form = useForm<ConceptEditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: concept
      ? {
          type: concept.type || '',
          school_cycle: concept.school_cycle?.id || '',
          name: concept.name || '',
          bank_account: concept.bank_account?.id || '',
          not_invoicing_bank_account: concept.payout_config?.not_invoicing_bank_account?.id || '',
          payment_only_in_dashboard: concept.payment_only_in_dashboard || false,
          early_bird_discounts: concept.early_bird_discounts || [],
          interest_schema: concept.interest_schema || [],
          offering:
            concept.offering && Object.values(OfferingEnum).includes(concept.offering as OfferingEnum)
              ? (concept.offering as OfferingEnum)
              : undefined,
        }
      : {},
  });
  const onSubmit = async (data: ConceptEditFormValues) => {
    const changedValues: ConceptEditChanges = {};

    if (data.name !== concept.name) {
      changedValues.name = data.name;
    }
    if (data.type !== concept.type) {
      changedValues.type = data.type;
    }
    if (data.school_cycle !== concept.school_cycle?.id) {
      changedValues.school_cycle_id = data.school_cycle;
    }
    if (data.bank_account !== concept.bank_account?.id) {
      changedValues.bank_account_id = data.bank_account || undefined;
    }
    if (
      !school?.can_invoice_to_general_public &&
      data.not_invoicing_bank_account !== concept.payout_config?.not_invoicing_bank_account?.id
    ) {
      changedValues.not_invoicing_bank_account_id = data.not_invoicing_bank_account || undefined;
    }
    if (data.offering !== concept.offering) {
      changedValues.offering = data.offering;
    }

    await handleSaveEdit(changedValues);
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
          title="Datos generales"
          edit={
            isEditing ? (
              <div className="flex gap-2">
                <Button onClick={onCancel} variant="text" size="small" color="legacy">
                  Descartar
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  color="legacy"
                  size="small"
                  isLoading={updateConceptMutation.isPending}
                  disabled={!form.formState.isDirty || updateConceptMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            ) : null
          }
        >
          {hasPaidOrders && (
            <Alert
              className="mt-4"
              variant="warning"
              message="Los cambios no afectarán a los pagos que ya hayan sido realizados o se encuentren en proceso."
            />
          )}
          <div className="flex flex-col gap-4 mt-6">
            <Controller
              control={form.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Tooltip
                  className="w-full"
                  message={isNameDisabled ? getFieldTooltip('name') : undefined}
                  disableHover={!isNameDisabled}
                >
                  <TextField label="Nombre del concepto" error={form.formState.errors.name?.message} value={value}>
                    <Input
                      name="name"
                      value={value}
                      onChange={onChange}
                      placeholder="Nombre del concepto"
                      disabled={isNameDisabled}
                    />
                  </TextField>
                </Tooltip>
              )}
            />

            <Controller
              control={form.control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Tooltip
                  message={isTypeDisabled ? getFieldTooltip('type') : undefined}
                  disableHover={!isTypeDisabled}
                  className="w-full"
                >
                  <Select
                    placeholder="Tipo de concepto"
                    value={value}
                    onValueChange={onChange}
                    error={form.formState.errors.type?.message}
                    containerClassName="w-full"
                    className="w-full"
                    disabled={isTypeDisabled}
                  >
                    <Select.Content>
                      {conceptTypesList
                        ?.filter(
                          (conceptType) =>
                            !(
                              isOptionalConcept &&
                              [
                                ConceptTypesEnum.MONTHLY_FEE,
                                ConceptTypesEnum.INSCRIPTION,
                                ConceptTypesEnum.REINSCRIPTION,
                              ].includes(conceptType.id)
                            )
                        )
                        .map((conceptType) => (
                          <Select.Item key={conceptType.id} value={conceptType.id}>
                            {conceptType.name}
                          </Select.Item>
                        ))}
                    </Select.Content>
                  </Select>
                </Tooltip>
              )}
            />

            <Controller
              control={form.control}
              name="school_cycle"
              render={({ field: { onChange, value } }) => (
                <Tooltip
                  className="w-full"
                  message={isSchoolCycleDisabled ? getFieldTooltip('school_cycle') : undefined}
                  disableHover={!isSchoolCycleDisabled}
                >
                  <Select
                    placeholder="Ciclo escolar"
                    value={value}
                    onValueChange={onChange}
                    error={form.formState.errors.school_cycle?.message}
                    containerClassName="w-full"
                    className="w-full"
                    disabled={isSchoolCycleDisabled}
                  >
                    <Select.Content>
                      {schoolCycles?.map((cycle) => (
                        <Select.Item key={cycle.id as string} value={cycle.id as string}>
                          <div className="flex gap-2">
                            {cycle.name}
                            {cycle.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Tooltip>
              )}
            />

            {concept?.payment_only_in_dashboard === false && (
              <>
                <Controller
                  control={form.control}
                  name="bank_account"
                  render={({ field: { onChange, value } }) => (
                    <div className="w-full">
                      <label className="text-sm font-bold block mb-2">
                        Cuenta de abono para pagos <span className="underline">facturados</span> desde Cometa a un RFC
                      </label>
                      <Select
                        placeholder="Cuenta bancaria"
                        value={value}
                        onValueChange={onChange}
                        error={form.formState.errors.bank_account?.message}
                        containerClassName="w-full"
                        className="w-full"
                      >
                        <Select.Content>
                          {bankAccounts?.results?.map((account) => (
                            <Select.Item key={account.id} value={account.id}>
                              <div className="flex items-start text-sm">
                                <span>{account.public_summary}</span>
                                <span className="mx-1">-</span>
                                <span className="text-sm text-gray-500">{account.account_number}</span>
                              </div>
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  )}
                />

                {!school?.can_invoice_to_general_public && (
                  <Controller
                    control={form.control}
                    name="not_invoicing_bank_account"
                    render={({ field: { onChange, value } }) => (
                      <div className="w-full">
                        <label className="text-sm font-bold block mb-2">
                          Cuenta de abono para pagos <span className="underline">no facturados</span> desde Cometa a un
                          RFC
                        </label>
                        <Select
                          placeholder="Selecciona una cuenta bancaria"
                          value={value}
                          onValueChange={onChange}
                          error={form.formState.errors.not_invoicing_bank_account?.message}
                          containerClassName="w-full"
                          className="w-full"
                        >
                          <Select.Content>
                            {bankAccounts?.results?.map((account) => (
                              <Select.Item key={account.id} value={account.id}>
                                <div className="flex items-start text-sm">
                                  <span>{account.public_summary}</span>
                                  <span className="mx-1">-</span>
                                  <span className="text-sm text-gray-500">{account.account_number}</span>
                                </div>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>
                    )}
                  />
                )}
              </>
            )}

            {isOptionalConcept && isOnlineStoreEnabled && (
              <div className="space-y-2">
                <label className="text-sm font-bold">¿Estará disponible en la tienda en línea?</label>
                <p className="text-sm mb-4">
                  Al habilitar esta opción, el concepto estará disponible en la nueva tienda en línea y podrá ser
                  adquirido directamente por el padre o tutor, sin necesidad de haber sido asignado previamente a un
                  estudiante.
                </p>
                <Controller
                  control={form.control}
                  name="offering"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="offering"
                          value="OPEN_LOOP"
                          checked={value === 'OPEN_LOOP'}
                          onChange={() => onChange('OPEN_LOOP')}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="text-sm">Sí</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="offering"
                          value="SCHOLAR"
                          checked={value === 'SCHOLAR'}
                          onChange={() => onChange('SCHOLAR')}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  )}
                />
              </div>
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
