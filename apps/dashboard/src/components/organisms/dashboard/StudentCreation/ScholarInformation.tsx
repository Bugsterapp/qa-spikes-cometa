import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { LevelsProps } from '/src/components/molecules/dashboard/StudentGeneralInformation/types';
import { UseMutationResult } from '@tanstack/react-query';
import { create } from 'zustand';
import Select from '/src/components/Select';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { Button } from '/src/components/ui/Button';
import { CalendarIcon } from 'lucide-react';
import { format, isDate, parseISO } from 'date-fns';
import { cn } from '/src/utils/cn';
import { Calendar } from '/src/components/ui/Calendar';
import { es } from 'date-fns/locale';
import { ServiceClient, api } from '/src/utils/api';
import { useSelectedSchool, useSelectedSchoolId } from '/src/guards/AuthGuard';
import { useSession } from 'next-auth/react';
import SelectChip from '/src/components/atoms/SelectChip';
import { useFlags } from '/flags/client';
import { splitSection } from '/src/utils/section';

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

export const creationStudentStore = create<{
  step: number;
  student: Partial<StudentDetails.RootObject> | null;
  isFormDirty: boolean;
  setStep: (step: number) => void;
  setStudent: (student: Partial<StudentDetails.RootObject> | null) => void;
  setIsFormDirty: (isFormDirty: boolean) => void;
  updateStudentField: (field: keyof StudentDetails.RootObject, value: any) => void;
}>((set) => ({
  step: 1,
  student: null,
  isFormDirty: false,
  setStep: (step) => set({ step }),
  setStudent: (student) => set({ student }),
  setIsFormDirty: (isFormDirty) => set({ isFormDirty }),
  updateStudentField: (field, value) => set((state) => ({ student: { ...state.student, [field]: value } })),
}));

type CreateSchoolarDetailViewProps = {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  levels: LevelsProps[];
  sections: Partial<StudentDetails.Section>[];
  student?: any;
  postStatus: UseMutationResult<any, any, any>;
};

const ScholarDataView = forwardRef<HTMLFormElement, CreateSchoolarDetailViewProps>(
  ({ onSubmit, onCancel, levels, sections, student, postStatus }, ref) => {
    const selectedSchool = useSelectedSchool();
    const { data: session } = useSession();
    const flags = useFlags({ traits: { email: session?.user.email, schoolName: selectedSchool?.name } }).flags;
    const {
      register,
      control,
      formState: { errors },
      handleSubmit,
      setValue,
      watch,
      setError,
    } = useForm<FormValues>({
      defaultValues: {
        enrollment_code: student?.enrollment_code || '',
        level: student?.level || '',
        grade: student?.grade || '',
        group: student?.group || '',
        school_cycle_id: flags?.inscriptions ? student?.school_cycle_id || '' : 'null',
        entry_date: student?.entry_date ?? new Date(),
        section: student?.section,
      },
      resolver: zodResolver(schema),
      mode: 'all',
      reValidateMode: 'onChange',
    });
    const schoolId = useSelectedSchoolId();
    const enrollment_code = watch('enrollment_code');

    const { data: lastStudentEnrolled } = api.students.lastEnrolled.useQuery({ schoolId: schoolId || '' });
    const { data: schoolCycles } = api.schools.schoolsCycles.useQuery(
      {
        school_id: schoolId || '',
      },
      {
        enabled: Boolean(schoolId),
        staleTime: 60 * 1000 * 60,
      }
    );

    const sectionsPerLevel =
      sections?.reduce((acc: any, section: any) => {
        const levelName = levels.find((level: any) => level.id === section.level)?.name;
        if (acc[levelName]) {
          acc[levelName].add(section.name);
        } else {
          acc[levelName] = new Set([section.name]);
        }
        return acc;
      }, {}) || [];
    const sectionsWithId =
      sections?.reduce((acc: any, section: any) => {
        const levelName = levels.find((level: any) => level.id === section.level)?.name;
        if (acc[levelName]) {
          acc[levelName].push(section);
        } else {
          acc[levelName] = [section];
        }
        return acc;
      }, {}) || [];
    const gradesPerLevel: Record<string, any> = {};
    for (const level in sectionsPerLevel) {
      gradesPerLevel[level as keyof typeof gradesPerLevel] = {};
      for (const section of sectionsPerLevel[level]) {
        const [grade, _] = splitSection(section);
        if (gradesPerLevel[level][grade]) {
          gradesPerLevel[level][grade].push(section);
        } else {
          gradesPerLevel[level][grade] = [section];
        }
      }
    }
    const level = watch('level');
    const levelSelected = levels.find((e) => e.id === level) || levels.find((level) => level.id === student?.level);
    const grade = watch('grade');
    const group = watch('group');
    const gradesOptions = gradesPerLevel[levelSelected?.name] ? Object.keys(gradesPerLevel[levelSelected?.name]) : [];
    const groupOptions =
      gradesPerLevel[levelSelected?.name] && gradesPerLevel[levelSelected?.name][grade as string]
        ? gradesPerLevel[levelSelected?.name][grade as string].map((e: any) => {
            const [_, group] = splitSection(e);
            return group;
          })
        : [];
    groupOptions.sort();
    if (level && grade && group && sectionsWithId[levelSelected?.name]) {
      const section = sectionsWithId[levelSelected?.name].find(
        (section: any) => section.grade === `${grade}` && section.group === `${group}`
      );
      if (section) {
        setValue('section', section.id);
      }
    }

    const handleValidate = async (data: FormValues) => {
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
        onSubmit(data);
      }
    };

    return (
      <div className="flex flex-col h-full justify-between">
        <form className="flex flex-col justify-between h-full" ref={ref} onSubmit={handleSubmit(handleValidate)}>
          <div className="col-span-2 pb-8 space-y-6 px-9">
            <div className="flex flex-col mt-5 -mb-3">
              <span className="text-base font-semibold">Datos de gestión escolar</span>
            </div>
            <div>
              <TextField
                label="Número de matrícula"
                error={errors.enrollment_code?.message}
                value={watch('enrollment_code')}
              >
                <CustomInput {...register('enrollment_code')} type="text" />
              </TextField>
              {lastStudentEnrolled && (
                <p
                  className={cn('mt-2 ml-4 text-xs text-gray-600', {
                    'pt-4': errors.enrollment_code?.message,
                  })}
                >
                  Última matrícula registrada: {lastStudentEnrolled?.enrollment_code}
                </p>
              )}
            </div>
            {flags?.inscriptions && (
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
                        <Select.Item className="w-full bg-gray-200 outline-none" value={cycle.id} key={cycle.id}>
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
            )}
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Nivel"
                  className="w-full outline-none min-h-[56px] h-full"
                  onValueChange={onChange}
                  disabled={levels.length === 0}
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
          </div>
          <SidebarActions className="z-10">
            <button
              className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
              type="button"
              onClick={onCancel}
            >
              Atrás
            </button>
            <span>
              <button
                className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
                type="submit"
                disabled={postStatus.isLoading || !!errors.enrollment_code}
              >
                {postStatus.isLoading ? 'Creando...' : 'Siguiente'}
              </button>
            </span>
          </SidebarActions>
        </form>
      </div>
    );
  }
);

export default ScholarDataView;
