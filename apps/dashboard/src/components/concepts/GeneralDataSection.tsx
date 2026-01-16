import React from 'react';
import { SectionLayout } from './SectionLayout';
import { Button } from '@cometa/recreo';
import { Controller, UseFormReturn } from 'react-hook-form';
import { TextField, Input, Select } from '@cometa/recreo';
import { Tooltip } from '../atoms/Tooltip';
import Alert from '../ui/Alert';
import { ConceptEditFormValues } from './ConceptEditForm';
import { DetailConcept, SchoolCycle } from '@cometa/trpc/src/types';

interface GeneralDataSectionProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  concept: DetailConcept;
  categories: any;
  schoolCycles: SchoolCycle[] | undefined;
  form: UseFormReturn<ConceptEditFormValues>;
  onCancel: () => void;
  updateConceptMutation: any;
  hasAssignedStudents: boolean;
  hasPaidOrders: boolean;
  isOptionalConcept: boolean;
}

export const GeneralDataSection: React.FC<GeneralDataSectionProps> = ({
  isEditing,
  setIsEditing,
  concept,
  categories,
  schoolCycles,
  form,
  onCancel,
  updateConceptMutation,
  hasAssignedStudents,
  hasPaidOrders,
  isOptionalConcept,
}) => {
  const isNameDisabled = hasAssignedStudents;
  const isTypeDisabled = isOptionalConcept || hasAssignedStudents || hasPaidOrders;
  const isSchoolCycleDisabled = hasAssignedStudents || hasPaidOrders;

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

  return (
    <SectionLayout title="Datos generales" description="Información básica del concepto">
      <div className="flex justify-between items-center pb-2">
        {!isEditing && concept ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
            Editar
          </Button>
        ) : isEditing ? (
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline">
              Cancelar
            </Button>
            <Button type="submit" variant="solid" disabled={!form.formState.isDirty || updateConceptMutation.isPending}>
              {updateConceptMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        ) : null}
      </div>
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
                  {categories?.type?.map((category: { id: string; name: string }) => {
                    const isDisabled =
                      isOptionalConcept && ['MONTHLY_FEE', 'INSCRIPTION', 'REINSCRIPTION'].includes(category.id);
                    return (
                      <Select.Item key={category.id} value={category.id} disabled={isDisabled}>
                        {category.name}
                      </Select.Item>
                    );
                  })}
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
                    <Select.Item key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Tooltip>
          )}
        />
      </div>
    </SectionLayout>
  );
};
