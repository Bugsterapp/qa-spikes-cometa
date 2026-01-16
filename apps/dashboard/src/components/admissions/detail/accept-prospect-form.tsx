import { z } from 'zod';
import CAlert from '/src/components/atoms/CAlert';
import SidebarActions from '/src/components/atoms/SidebarActions';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ServiceClient } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import SelectChip from '/src/components/atoms/SelectChip';
import { DashboardSchoolSection, DashboardStudentSearch, InternalSchool } from '@cometa/trpc/src/types';
import { SchoolCycleEntity } from '@cometa/trpc/src/students/types-mapping';
import { StudentLeadEntity } from '@cometa/trpc/src/admissions/types';
import useLevelOptions from '/src/hooks/useLevelOptions';
import useAlert from '/src/hooks/useAlert';
import {
  InputField,
  ContainerError,
  Label,
  Button,
  SelectInput,
  SelectInputTrigger,
  SelectInputValue,
  SelectInputContent,
  SelectInputItem,
} from '@cometa/recreo';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { InfoIcon, PencilIcon } from 'lucide-react';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useRouter } from 'next/router';

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const schema = z.object({
  identifier: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .regex(
      /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
      'El formato del CURP no es válido'
    ),
  enrollment_code: z.string().min(1, REQUIRED_MESSAGE),
  section_id: z.string().min(1, REQUIRED_MESSAGE),
  school_cycle_id: z.string({ required_error: REQUIRED_MESSAGE }),
  level_id: z.string({ required_error: REQUIRED_MESSAGE }),
  grade_id: z.string({ required_error: REQUIRED_MESSAGE }),
  group: z.string({ required_error: REQUIRED_MESSAGE }),
});

type FormValues = z.infer<typeof schema>;

export default function AcceptProspectForm({
  onClose,
  schoolCycles,
  studentLead,
  sections,
  levels,
  schoolId,
  admissionId,
}: {
  onClose: () => void;
  schoolCycles: SchoolCycleEntity[];
  studentLead?: StudentLeadEntity;
  sections: DashboardSchoolSection[];
  schoolId: string;
  levels: InternalSchool[];
  admissionId: string;
}) {
  const router = useRouter();
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    watch,
    setFocus,
  } = useForm<FormValues>({
    defaultValues: {
      identifier: studentLead?.curp ?? '',
      school_cycle_id: studentLead?.school_cycle_id ?? '',
      section_id: studentLead?.section_id ?? '',
    },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const { setAlertState } = useAlert();
  const utils = api.useUtils();
  const { data: session } = useSession();

  const { data: lastStudentEnrolled } = api.students.lastEnrolled.useQuery(
    { schoolId: schoolId as string },
    { enabled: !!schoolId }
  );

  const mutationAcceptProspect = api.admissions.acceptAdmission.useMutation({
    onSuccess: async () => {
      await utils.admissions.getAdmissionDetail.invalidate();
      onClose();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'Estudiante admitido exitosamente',
      });
      router.push(`/students/${studentLead?.external_id}?prev=/admissions`);
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message:
          'Ha ocurrido un error al admitir el prospecto. Intenta nuevamente o comunicate con nuestro equipo de soporte',
      });
    },
  });

  const level = watch('level_id');
  const grade = watch('grade_id');
  const group = watch('group');
  const schoolCycle = watch('school_cycle_id');
  const identifier = watch('identifier');

  const { gradesOptions, groupOptions, levelSelected, gradeSelected } = useLevelOptions(
    sections || [],
    levels || [],
    level,
    sections?.find((section) => section.id === studentLead?.section_id),
    grade
  );

  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: schoolId },
    { enabled: !!schoolId }
  );
  const [automaticEnrollmentCode, setAutomaticEnrollmentCode] = useState(true);
  const { mutateAsync: generateEnrollmentCodeMutation } = api.students.generateEnrollmentCode.useMutation();
  const { data: student } = api.students.dashboardSchoolDueOrdersStudentDetail.useQuery(
    { studentId: studentLead?.external_id as string, schoolId: schoolId },
    { enabled: !!studentLead?.external_id && !!schoolId }
  );

  const generateEnrollmentCode = useCallback(async () => {
    const isValid = automaticEnrollmentCode && !!student && !!schoolId && !!schoolCycle && !!level;
    if (!isValid || !schoolConfig?.enable_enrollment_code_generation) return;

    const result = await generateEnrollmentCodeMutation({
      school_id: schoolId,
      school_cycle_id: schoolCycle,
      level_id: level,
      student: {
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        identifier: identifier,
        gender: student?.gender || '',
        entry_date: new Date().toISOString().slice(0, 10),
      },
    });
    setValue('enrollment_code', result?.enrollment_code || '');
  }, [
    generateEnrollmentCodeMutation,
    schoolId,
    schoolCycle,
    level,
    student,
    identifier,
    setValue,
    automaticEnrollmentCode,
    schoolConfig?.enable_enrollment_code_generation,
  ]);

  useEffect(() => {
    if (automaticEnrollmentCode) {
      generateEnrollmentCode();
    }
  }, [level, grade, group, schoolCycle, identifier, automaticEnrollmentCode, generateEnrollmentCode]);

  const sectionsWithId =
    sections?.reduce((acc: Record<string, DashboardSchoolSection[]>, section: DashboardSchoolSection) => {
      const levelName = levels.find((level: InternalSchool) => level.id === section.level)?.name;
      if (levelName) {
        if (acc[levelName]) {
          acc[levelName].push(section);
        } else {
          acc[levelName] = [section];
        }
      }
      return acc;
    }, {}) || {};

  if (level && grade && group && levelSelected && sectionsWithId[levelSelected?.name]) {
    const section = sectionsWithId[levelSelected?.name].find(
      (section: DashboardSchoolSection) => section.grade === `${grade}` && section.group === `${group}`
    );
    if (section) {
      setValue('section_id', section.id);
    }
  }

  function studentHasConflict(students?: DashboardStudentSearch[] | null) {
    if (!students) {
      return false;
    }
    return students.some((s: DashboardStudentSearch) => s.id !== studentLead?.external_id);
  }

  async function onSubmit(data: FormValues) {
    const studentByIdentifierResults = await ApiClient.getStudentsOnSchool(schoolId, null, data.identifier);
    const studentExists = studentHasConflict(studentByIdentifierResults?.results);

    if (studentExists) {
      setError('identifier', {
        type: 'manual',
        message: 'El CURP ya ha sido registrado por otro estudiante.',
      });

      return;
    }

    const studentByEnrollmentCodeResults = await ServiceClient.apiV1DashboardSchoolsStudentsList(
      schoolId,
      { search: data.enrollment_code },
      { headers: { Authorization: `Token ${session?.token}` } }
    );
    const isEnrollmentCodeUsed = studentHasConflict(studentByEnrollmentCodeResults?.data?.results);
    if (isEnrollmentCodeUsed) {
      setError('enrollment_code', {
        type: 'manual',
        message: 'Ya existe un estudiante con este número de matrícula.',
      });

      return;
    }

    const payload = {
      ...data,
      school_id: schoolId,
      entry_date: new Date().toISOString().slice(0, 10),
    };
    mutationAcceptProspect.mutate({ data: payload, admissionId });
  }

  function handleToogleEditEnrollmentCode() {
    setAutomaticEnrollmentCode(!automaticEnrollmentCode);
    setTimeout(() => {
      setFocus('enrollment_code');
    });
  }

  function LastEnrolled() {
    return (
      <>
        {lastStudentEnrolled && !schoolConfig?.enable_enrollment_code_generation ? (
          <p
            className={cn('mt-2 ml-4 text-xs text-gray-600', {
              'mt-0': errors.enrollment_code?.message,
            })}
          >
            Última matrícula registrada: {lastStudentEnrolled?.enrollment_code}
          </p>
        ) : null}
      </>
    );
  }

  function AutoGeneratedEnrollmentLabel() {
    if (!schoolConfig?.enable_enrollment_code_generation) return null;

    if (automaticEnrollmentCode) {
      return (
        <div className="flex items-center gap-2">
          <InfoIcon className="w-4 h-4 text-gray-600" />
          <p className="text-sm text-gray-600">Matrícula generada automáticamente</p>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <InfoIcon className="w-4 h-4 text-gray-600" />
        <p className="text-sm text-gray-600">
          Vuelve a generar la matrícula automáticamente
          <span className="cursor-pointer text-galaxy ml-1 underline" onClick={handleToogleEditEnrollmentCode}>
            haciendo click aquí
          </span>
        </p>
      </div>
    );
  }

  return (
    <>
      <SidebarHeader title="Admitir prospecto" onClose={onClose} boxClassName="border-b border-neutral-200 px-8" />
      <div className="flex flex-col px-8 h-full overflow-y-auto pt-6">
        <CAlert
          type="info"
          message="Una vez admitido el estudiante, podrás asignarle becas o conceptos a cobrar y visualizar en tu lista de estudiantes."
        />
        <form className="mt-6 h-full justify-between flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-8 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold leading-5">Ciclo y grado de ingreso</span>
                <span className="text-base font-normal text-[#637381] leading-6">
                  Verifica que el ciclo de ingreso, nivel, grado y sección sean los correctos.
                </span>
              </div>
              <Controller
                control={control}
                name="school_cycle_id"
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col gap-2">
                    <Label isError={!!errors.school_cycle_id?.message}>Ciclo escolar de ingreso</Label>
                    <SelectInput onValueChange={onChange} value={value}>
                      <SelectInputTrigger isError={!!errors.school_cycle_id?.message}>
                        <SelectInputValue placeholder="Ciclo escolar de ingreso" />
                      </SelectInputTrigger>
                      <SelectInputContent>
                        {schoolCycles?.map((cycle) => (
                          <SelectInputItem value={cycle.id as string} key={cycle.id as string}>
                            <div className="flex gap-2">
                              {cycle.name}
                              {cycle.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                            </div>
                          </SelectInputItem>
                        ))}
                      </SelectInputContent>
                    </SelectInput>
                    <ContainerError error={errors.school_cycle_id?.message} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="level_id"
                defaultValue={levelSelected?.id}
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col gap-2">
                    <Label isError={!!errors.level_id?.message}>Nivel</Label>
                    <SelectInput
                      onValueChange={(e: string) => {
                        setValue('grade_id', '');
                        setValue('group', '');
                        onChange(e);
                      }}
                      value={value}
                    >
                      <SelectInputTrigger isError={!!errors.level_id?.message}>
                        <SelectInputValue placeholder="Nivel" />
                      </SelectInputTrigger>
                      <SelectInputContent>
                        {levels?.map((level) => (
                          <SelectInputItem value={level.id} key={level.id}>
                            {level.name}
                          </SelectInputItem>
                        ))}
                      </SelectInputContent>
                    </SelectInput>
                    <ContainerError error={errors.level_id?.message} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="grade_id"
                defaultValue={gradeSelected}
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col gap-2">
                    <Label isError={!!errors.grade_id?.message}>Grado</Label>
                    <SelectInput onValueChange={onChange} value={value} disabled={!gradesOptions?.length}>
                      <SelectInputTrigger isError={!!errors.grade_id?.message}>
                        <SelectInputValue placeholder="Grado" />
                      </SelectInputTrigger>
                      <SelectInputContent>
                        {gradesOptions?.map((grade) => (
                          <SelectInputItem value={grade} key={grade}>
                            {grade}
                          </SelectInputItem>
                        ))}
                      </SelectInputContent>
                    </SelectInput>
                    <ContainerError error={errors.grade_id?.message} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="group"
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col gap-2">
                    <Label isError={!!errors.group?.message}>Grupo</Label>
                    <SelectInput onValueChange={onChange} value={value} disabled={!groupOptions?.length}>
                      <SelectInputTrigger isError={!!errors.group?.message}>
                        <SelectInputValue placeholder="Grupo" />
                      </SelectInputTrigger>
                      <SelectInputContent>
                        {groupOptions?.map((group) => (
                          <SelectInputItem value={group} key={group}>
                            {group}
                          </SelectInputItem>
                        ))}
                      </SelectInputContent>
                    </SelectInput>
                    <ContainerError error={errors.group?.message} />
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold leading-5">CURP y Matricula</span>
                <span className="text-base font-normal text-[#637381] leading-6">
                  Registra el CURP y un número de matrícula para el nuevo estudiante.
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Label isError={!!errors.identifier?.message}>CURP</Label>
                <InputField
                  {...register('identifier')}
                  value={watch('identifier')}
                  isError={!!errors.identifier?.message}
                />
                <ContainerError error={errors.identifier?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label isError={!!errors.enrollment_code?.message}>Matrícula</Label>
                <div className="flex items-center gap-2">
                  <InputField
                    isError={!!errors.enrollment_code?.message}
                    value={watch('enrollment_code')}
                    disabled={automaticEnrollmentCode && schoolConfig?.enable_enrollment_code_generation}
                    {...register('enrollment_code')}
                    className="flex-1"
                  />
                  {schoolConfig?.enable_enrollment_code_generation && automaticEnrollmentCode ? (
                    <span
                      className="cursor-pointer rounded-full hover:bg-gray-100 flex items-center justify-center"
                      onClick={handleToogleEditEnrollmentCode}
                    >
                      <Tooltip message="Editar matrícula">
                        <PencilIcon className="w-4 h-4 m-3" />
                      </Tooltip>
                    </span>
                  ) : null}
                </div>
                <ContainerError error={errors.enrollment_code?.message} />
                <LastEnrolled />
                <AutoGeneratedEnrollmentLabel />
              </div>
            </div>
          </div>

          <SidebarActions className="justify-end px-0 shadow-none">
            <Button type="button" color="black" variant="text" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              color="black"
              variant="solid"
              disabled={mutationAcceptProspect.isPending || mutationAcceptProspect.isSuccess}
            >
              Admitir
            </Button>
          </SidebarActions>
        </form>
      </div>
    </>
  );
}
