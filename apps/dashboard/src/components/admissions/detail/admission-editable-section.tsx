'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useMemo } from 'react';
import { z } from 'zod';
import { CommonSectionProps, EditableSection, InfoItem } from './editable-section';
import { FormTextarea } from 'src/components/organisms/dashboard/AdmissionSections/Form';
import { api } from '/src/utils/api';
import { FormInput, FormSelect } from './form';
import { DashboardSchoolSection } from '@cometa/trpc/src/types';
import { useHandleMutate } from './api';
import { Chip } from '@cometa/recreo';

export type AdmissionInfoType = {
  section_id: string;
  school_cycle_id: string;
  origin_school: string | undefined;
  comment: string | undefined;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

export const admissionInfoSchema = z.object({
  section_id: z.string().min(1, REQUIRED_MESSAGE),
  school_cycle_id: z.string().min(1, REQUIRED_MESSAGE),
  origin_school: z.string().optional(),
  comment: z.string().optional(),
});

export type FormAdmissionInfoValues = z.infer<typeof admissionInfoSchema>;

export function AdmissionEditableSection({
  studentLeadId,
  schoolId,
  admissionInfo,
  form,
  defaultValues,
  isEditing,
  isLoading,
  setIsEditing,
  setIsLoading,
}: {
  studentLeadId: string;
  schoolId: string;
  admissionInfo: AdmissionInfoType;
  form: UseFormReturn<FormAdmissionInfoValues>;
  defaultValues: FormAdmissionInfoValues;
} & CommonSectionProps) {
  const utils = api.useUtils();
  const updateStudentLead = api.admissions.updateStudenLead.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmissionDetail.invalidate({ admissionId: studentLeadId });
    },
  });

  const handleUpdateStudentLead = useHandleMutate(updateStudentLead.mutateAsync);

  const { data: filters, isPending: isLoadingSectionsQuery } = api.admissions.getAdmissionFilters.useQuery<{
    sections: DashboardSchoolSection[];
  }>({ schoolId }, { enabled: !!schoolId });

  const memoizedFilters = useMemo(() => filters, [filters]);

  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: schoolId,
    },
    {
      enabled: Boolean(schoolId),
    }
  );

  const memoizedSchoolCycles = useMemo(() => schoolCycles, [schoolCycles]);

  const sections: DashboardSchoolSection[] = memoizedFilters?.sections || [];

  const items: InfoItem[] = [
    { label: 'Grado de postulación:', value: admissionInfo?.section_id || '-' },
    { label: 'Ciclo de ingreso:', value: admissionInfo?.school_cycle_id || '-' },
    { label: 'Escuela previa:', value: admissionInfo?.origin_school || '-', isItalic: !admissionInfo?.origin_school },
    { label: 'Comentarios:', value: admissionInfo?.comment || '-' },
  ];

  const {
    formState: { errors },
    control,
    register,
  } = form;

  async function handleSave(data: FormAdmissionInfoValues): Promise<boolean> {
    const { success } = await handleUpdateStudentLead({ ...data, student_lead_id: studentLeadId });
    return success;
  }

  return (
    <EditableSection
      title="Datos de admisión"
      items={items}
      form={form}
      onSave={handleSave}
      defaultValues={defaultValues}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    >
      <FormSelect
        label="Grado de postulación"
        name="section_id"
        control={control}
        errors={errors}
        options={
          sections?.map((section) => ({
            id: section.id,
            value: section.id,
            option: section.name,
          })) || []
        }
        isLoading={isLoadingSectionsQuery}
      />
      <FormSelect
        label="Ciclo de ingreso"
        name="school_cycle_id"
        control={control}
        errors={errors}
        options={
          memoizedSchoolCycles?.map((cycle) => ({
            id: cycle.id,
            value: cycle.id,
            option: cycle.name,
            mark: cycle.is_active ? <Chip variant="blue">Ciclo actual</Chip> : null,
          })) || []
        }
      />
      <FormInput label="Escuela previa" name="origin_school" register={register} errors={errors} />
      <FormTextarea label="Comentarios" name="comment" control={control} errors={errors} />
    </EditableSection>
  );
}
