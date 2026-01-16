import { DashboardSchoolSection, InternalSchool } from '@cometa/trpc/src/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isDate, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, InfoIcon, PencilIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { FC, useState, useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import SelectChip from '/src/components/atoms/SelectChip';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import Select from '/src/components/Select';
import { Button } from '/src/components/ui/Button';
import { Calendar } from '@cometa/recreo';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import useLevelOptions from '/src/hooks/useLevelOptions';
import useLevels from '/src/hooks/useLevels';
import useSections from '/src/hooks/useSections';
import { ServiceClient, api } from '/src/utils/api';
import { cn } from '/src/utils/cn';

import { StudentFormType } from '.';
import { StudentCreateType } from './types';

const schema = z
  .object({
    enrollment_code: z
      .string()
      .max(50, 'No se permite agregar mas de 50 caracteres')
      .min(1, 'Falta completar este campo'),
    level: z.string().min(1, 'Falta completar este campo'),
    grade: z.string().min(1, 'Falta completar este campo'),
    group: z.string().min(1, 'Falta completar este campo'),
    entry_date: z.date(),
    section: z.string().min(1, 'Falta completar este campo'),
    school_cycle_id: z.string().min(1, 'Falta completar este campo'),
    billing_guardian: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.school_cycle_id === 'null') {
        return true;
      } else if (data.school_cycle_id !== 'null' && data.school_cycle_id !== '') {
        return true;
      }
    },
    { message: 'Falta completar este campo', path: ['school_cycle_id'] }
  );

export type FormValues = z.infer<typeof schema>;

type ScholarInformationTabProps = {
  onCancel: () => void;
  student: StudentCreateType | null;
  handleCreate: (_: StudentFormType) => void;
};

const ScholarInformationTab: FC<ScholarInformationTabProps> = ({ onCancel, student, handleCreate }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const schoolId = useSelectedSchoolId();
  const { data: sections } = useSections(session?.token, schoolId || undefined, true);
  const { data: levels } = useLevels(session?.token, schoolId || undefined);
  const { data: lastStudent } = api.students.lastEnrolled.useQuery({ schoolId: schoolId || '' });
  const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
    {
      school_id: schoolId || '',
    },
    {
      enabled: Boolean(schoolId),
      staleTime: 60 * 1000 * 60,
    }
  );

  const { data: schoolConfig } = api.students.getSchoolConfig.useQuery(
    { school_id: schoolId as string },
    { enabled: !!schoolId }
  );
  const { mutateAsync: generateEnrollmentCodeMutation } = api.students.generateEnrollmentCode.useMutation();
  const [automaticEnrollmentCode, setAutomaticEnrollmentCode] = useState(true);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    setError,
    setFocus,
  } = useForm<FormValues>({
    defaultValues: {
      enrollment_code: student?.enrollment_code || '',
      level: student?.level || '',
      grade: student?.grade || '',
      group: student?.group || '',
      school_cycle_id: student?.school_cycle_id || '',
      entry_date: new Date(),
      section: student?.section as string,
    },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const enrollment_code = watch('enrollment_code');
  const level = watch('level');
  const grade = watch('grade');
  const group = watch('group');
  const entryDate = watch('entry_date');
  const schoolCycleId = watch('school_cycle_id');

  const { gradesOptions, groupOptions, levelSelected } = useLevelOptions(
    sections || [],
    levels || [],
    level,
    { level: student?.level },
    grade || student?.grade || ''
  );

  const getSectionsWithId = (sections: DashboardSchoolSection[] | undefined, levels: InternalSchool[] | undefined) => {
    if (!sections || !levels) return {};

    return sections.reduce<Record<string, DashboardSchoolSection[]>>((acc, section) => {
      const levelName = levels.find((level) => level.id === section.level)?.name;
      if (levelName) {
        (acc[levelName] = acc[levelName] || []).push(section);
      }
      return acc;
    }, {});
  };

  const sectionsWithId = getSectionsWithId(sections, levels);

  if (level && grade && group && levelSelected?.name) {
    const section = sectionsWithId[levelSelected.name]?.find((sec) => sec.grade === grade && sec.group === group);
    if (section) {
      setValue('section', section.id);
    }
  }

  const generateEnrollmentCode = useCallback(async () => {
    const canGenerate =
      automaticEnrollmentCode &&
      schoolConfig?.enable_enrollment_code_generation &&
      schoolId &&
      schoolCycleId &&
      entryDate &&
      level;

    if (!canGenerate) return;

    try {
      const result = await generateEnrollmentCodeMutation({
        school_id: schoolId,
        school_cycle_id: schoolCycleId,
        level_id: level,
        student: {
          first_name: student?.first_name || '',
          last_name: student?.last_name || '',
          identifier: student?.identifier || '',
          gender: student?.gender || '',
          entry_date: format(isDate(entryDate) ? entryDate : parseISO(String(entryDate)), 'yyyy-MM-dd'),
        },
      });

      setValue('enrollment_code', result?.enrollment_code ?? '');
    } catch (_error) {
      setError('enrollment_code', {
        type: 'manual',
        message: 'No se pudo generar el número de matrícula.',
      });
    }
  }, [
    automaticEnrollmentCode,
    schoolConfig?.enable_enrollment_code_generation,
    schoolId,
    schoolCycleId,
    level,
    student,
    generateEnrollmentCodeMutation,
    setValue,
    setError,
    entryDate,
  ]);

  useEffect(() => {
    if (automaticEnrollmentCode && schoolConfig?.enable_enrollment_code_generation) {
      generateEnrollmentCode();
    }
  }, [
    automaticEnrollmentCode,
    schoolConfig?.enable_enrollment_code_generation,
    generateEnrollmentCode,
    level,
    schoolCycleId,
    entryDate,
    student,
  ]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const validateEnrollmentCode = await ServiceClient.apiV1DashboardSchoolsStudentsList(
      schoolId || '',
      {
        search: enrollment_code,
      },
      {
        headers: {
          Authorization: `Token ${session?.token}`,
        },
      }
    );

    if (validateEnrollmentCode && (validateEnrollmentCode?.data?.count ?? 0) > 0) {
      setError('enrollment_code', {
        type: 'manual',
        message: 'Ya existe un estudiante con este número de matrícula.',
      });
    } else {
      await handleCreate({
        ...student,
        ...data,
        entry_date: data.entry_date.toISOString().split('T')[0],
      } as StudentFormType);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <form className="flex flex-col justify-between h-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-span-2 pb-8 space-y-6 px-9">
          <div className="flex flex-col mt-5 -mb-3">
            <span className="text-base font-semibold">Ciclo y grado de ingreso</span>
          </div>
          <Controller
            control={control}
            name="school_cycle_id"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Ciclo de ingreso"
                className="w-full outline-none min-h-[56px] h-full mb-1"
                onValueChange={onChange}
                value={value}
                error={errors.school_cycle_id?.message}
              >
                <Select.Content className="w-full outline-none">
                  {schoolCycles?.map((cycle) => (
                    <Select.Item
                      className="w-full bg-gray-200 outline-none"
                      value={cycle.id as string}
                      key={cycle.id as string}
                    >
                      <div className="flex gap-2">
                        {cycle.name}
                        {cycle.is_active && <SelectChip theme="blue">Ciclo actual</SelectChip>}
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Nivel"
                className="w-full outline-none min-h-[56px] h-full"
                onValueChange={onChange}
                disabled={levels && levels.length === 0}
                value={value || levelSelected?.id}
                error={errors.level?.message}
              >
                <Select.Content className="w-full outline-none">
                  {levels?.map((level) => (
                    <Select.Item className="w-full bg-gray-200 outline-none" value={level.id} key={level.id}>
                      {level.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="grade"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Grado"
                className="w-full outline-none min-h-[56px] h-full"
                onValueChange={onChange}
                disabled={!levelSelected}
                value={value || grade}
                error={errors.grade?.message}
              >
                <Select.Content className="w-full outline-none">
                  {gradesOptions?.map((grade) => (
                    <Select.Item className="w-full bg-gray-200 outline-none" value={grade} key={grade}>
                      {grade}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="group"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Grupo"
                className="w-full outline-none min-h-[56px] h-full"
                onValueChange={onChange}
                disabled={!levelSelected}
                value={value || group}
                error={errors.group?.message}
              >
                <Select.Content className="w-full outline-none">
                  {groupOptions?.map((group: any) => (
                    <Select.Item className="w-full bg-gray-200 outline-none" value={group} key={group}>
                      {group}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
          <Controller
            control={control}
            name="entry_date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full relative justify-start text-left font-normal text-[#9DA9B4]',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de ingreso</p>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {field.value ? (
                      format(isDate(field.value) ? field.value : parseISO(String(field.value)), 'PPP', { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />

          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold">Matrícula</span>
            <div className="flex items-center gap-2">
              <TextField
                label="Número de matrícula"
                error={errors.enrollment_code?.message}
                value={watch('enrollment_code')}
                className="flex-1"
              >
                <CustomInput
                  {...register('enrollment_code')}
                  type="text"
                  disabled={automaticEnrollmentCode && schoolConfig?.enable_enrollment_code_generation}
                />
              </TextField>
              {schoolConfig?.enable_enrollment_code_generation && automaticEnrollmentCode && (
                <span
                  className="cursor-pointer rounded-full hover:bg-gray-100 flex items-center justify-center"
                  onClick={() => {
                    setAutomaticEnrollmentCode(false);
                    setTimeout(() => setFocus('enrollment_code'), 0);
                  }}
                >
                  <Tooltip message="Editar matrícula">
                    <PencilIcon className="w-4 h-4 m-3" />
                  </Tooltip>
                </span>
              )}
            </div>
            {lastStudent && !schoolConfig?.enable_enrollment_code_generation && (
              <p
                className={cn('mt-2 ml-4 text-xs text-gray-600', {
                  'pt-4': errors.enrollment_code?.message,
                })}
              >
                Última matrícula registrada: {lastStudent?.enrollment_code}
              </p>
            )}
            {schoolConfig?.enable_enrollment_code_generation && (
              <div className="flex items-center gap-1 mt-1 ml-4 text-xs text-gray-600">
                <InfoIcon className="w-3.5 h-3.5" />
                {automaticEnrollmentCode ? (
                  <p>Matrícula generada automáticamente</p>
                ) : (
                  <p>
                    Vuelve a generar la matrícula automáticamente
                    <span
                      className="cursor-pointer text-galaxy ml-1 underline"
                      onClick={() => {
                        setAutomaticEnrollmentCode(true);
                      }}
                    >
                      haciendo click aquí
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <SidebarActions className="z-10">
          <Button
            className="bg-white px-20 py-3 text-green hover:bg-transparent hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
            type="button"
            onClick={onCancel}
          >
            Atrás
          </Button>
          <span>
            <Button
              className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
              type="submit"
              disabled={loading}
            >
              Siguiente
            </Button>
          </span>
        </SidebarActions>
      </form>
    </div>
  );
};

export default ScholarInformationTab;
