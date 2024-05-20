import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { LevelsProps } from '/src/components/molecules/dashboard/StudentGeneralInformation/types';
import CAlert from '/src/components/atoms/CAlert';
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

const schema = z
  .object({
    enrollment_code: z.string().optional(),
    level: z.string().optional(),
    grade: z.string().optional(),
    group: z.string().optional(),
    entry_date: z.date().optional(),
    section: z.string().optional(),
  })
  .refine(
    (data) => {
      // if level is not empty, grade
      if (data.level) {
        return data.grade;
      }
      return true;
    },
    { message: 'Grado es requerido al tener un nivel', path: ['grade'] }
  )
  .refine(
    (data) => {
      // if level is not empty, group
      if (data.level) {
        return data.group;
      }
      return true;
    },
    { message: 'Grupo es requerido al tener un nivel', path: ['group'] }
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
    const {
      register,
      control,
      formState: { errors },
      handleSubmit,
      setValue,
      watch,
    } = useForm<FormValues>({
      defaultValues: {
        enrollment_code: student?.enrollment_code,
        level: '',
        grade: '',
        group: '',
        entry_date: student?.entry_date ?? new Date(),
        section: student?.section,
      },
      resolver: zodResolver(schema),
      mode: 'all',
      reValidateMode: 'onChange',
    });
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
        const grade =
          section.split` `.length <= 2 ? section.split` `[0] : `${section.split` `[0]} ${section.split` `[1]}`;

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
            const element = e.split` `;
            return element.lenght === 2 ? element[1] : element[element.length - 1];
          })
        : [];
    if (level && grade && group && sectionsWithId[levelSelected?.name]) {
      const section = sectionsWithId[levelSelected?.name].find((section: any) => section.name === `${grade} ${group}`);
      if (section) {
        setValue('section', section.id);
      }
    }

    return (
      <div className="flex flex-col h-[100%] justify-between">
        <form className="flex flex-col justify-between h-full" ref={ref} onSubmit={handleSubmit(onSubmit)}>
          <div className="col-span-2 pb-8 space-y-8 px-9">
            <div className="flex flex-col mt-5 -mb-3">
              <span className="text-base font-semibold">Datos de gestión escolar</span>
            </div>
            <TextField
              label="Número de matrícula"
              error={errors.enrollment_code?.message}
              value={watch('enrollment_code')}
            >
              <CustomInput {...register('enrollment_code')} type="text" />
            </TextField>
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <Select
                  placeholder="Nivel"
                  className="min-w-[164px] w-full outline-none h-full"
                  onValueChange={onChange}
                  disabled={levels.length === 0}
                  value={value || levelSelected?.id}
                >
                  <Select.Content className="w-full min-w-[164px] outline-none">
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
                  className="min-w-[164px] w-full outline-none h-full"
                  onValueChange={onChange}
                  disabled={!levelSelected}
                  value={value || grade}
                >
                  <Select.Content className="w-full min-w-[164px] outline-none">
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
                  className="min-w-[164px] w-full outline-none h-full"
                  onValueChange={onChange}
                  disabled={!levelSelected}
                  value={value || group}
                >
                  <Select.Content className="w-full min-w-[164px] outline-none">
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
                        'w-full relative justify-start text-left font-normal',
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
            <CAlert type="info" message="Recuerda que puedes completar estos datos en otro momento." />
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
                disabled={postStatus.isLoading}
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
