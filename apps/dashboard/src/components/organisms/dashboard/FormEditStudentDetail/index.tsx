import { useFormik } from 'formik';
import NRadioGroup from '../RadioGroup';
import DashboardInput from '../../common/DashboardInput';
import * as Yup from 'yup';
import { LevelsProps, SectionsProps } from '/src/components/molecules/dashboard/StudentGeneralInformation/types';
import DateInputsGroup from '../DateInputsGroup';
import SidebarActions from '/src/components/atoms/SidebarActions';
import { useEffect, useImperativeHandle, useState } from 'react';
import Select from '/src/components/Select';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { DashboardStudent, GenderEnum, InternalSection } from '@cometa/trpc/src/types';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { Button } from '/src/components/ui/Button';
import { cn } from '/src/utils/cn';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '/src/components/ui/Calendar';
import { splitSection } from '/src/utils/section';

interface IFormEditStudentDetailProps {
  student?: DashboardStudent;
  levels: LevelsProps[];
  sections: SectionsProps[] | undefined;
  setOpenDialog: (open: boolean) => void;
  studentSection?: InternalSection;
  ableToEdit?: boolean;
  setOpenConfirmDialog: (open: boolean) => void;
  formikRef: any;
  mutation: any;
}

const FormEditStudentDetail = ({
  formikRef,
  student,
  setOpenDialog,
  levels,
  sections,
  studentSection,
  ableToEdit,
  setOpenConfirmDialog,
  mutation,
}: IFormEditStudentDetailProps) => {
  const [level, setLevel] = useState(studentSection?.level_name);
  const [grade, setGrade] = useState(studentSection?.grade);
  const [group, setGroup] = useState(studentSection?.group ?? '');
  const selectedSchool = useSelectedSchool();
  const identifierRequired = selectedSchool?.config_dashboard?.student_identifier_is_required;
  const fieldsGroup = [
    { first_name: 'Nombre' },
    { last_name: 'Apellidos' },
    { identifier: 'CURP' },
    { birth_date: 'Fecha de nacimiento' },
    { enrollment_code: 'Número de matrícula' },
    { level: 'Nivel' },
    { grade: 'Grado' },
    { section: 'Grupo' },
    { entry_date: 'Fecha de ingreso' },
  ];

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
  const gradesPerLevel: Record<string, Record<string, any>> = {};
  for (const level in sectionsPerLevel) {
    gradesPerLevel[level] = {};
    for (const section of sectionsPerLevel[level]) {
      const [grade, _] = splitSection(section);
      if (gradesPerLevel[level][grade]) {
        gradesPerLevel[level][grade]?.push(section);
      } else {
        gradesPerLevel[level][grade] = [section];
      }
    }
  }

  useEffect(() => {
    if (level && grade && group && sectionsWithId[level]) {
      const section = sectionsWithId[level].find(
        (section: any) => section?.grade === `${grade}` && section?.group === `${group}`
      );
      section ? formik.setFieldValue('section', section.id) : formik.setFieldValue('section', studentSection?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, grade, group]);

  const levelsOptions = levels.map((level: any) => level.name);
  const gradesOptions = gradesPerLevel[level as string] ? Object.keys(gradesPerLevel[level as string]) : [];
  const sectionsOptions =
    gradesPerLevel[level as string] && gradesPerLevel[level as string][grade as string]
      ? gradesPerLevel[level as string][grade as string].map((e: any) => {
          const [_, group] = splitSection(e);
          return group;
        })
      : [];
  sectionsOptions.sort();
  const personal_data = fieldsGroup.slice(0, 2);
  const getKey = (object: any) => Object.keys(object)[0];
  const getValue = (object: any) => Object.values(object)[0];
  const handleRadioChange = (value: string) => formik.setFieldValue('gender', value === 'Masculino' ? 'M' : 'F');

  const handleSubmit = (values: any) => {
    mutation.mutate(values);
  };

  const parseGenderFormat = (gender: DashboardStudent['gender'] | undefined) =>
    gender === GenderEnum.M ? 'Masculino' : 'Femenino';

  const initialValues = {
    first_name: student?.first_name,
    last_name: student?.last_name,
    identifier: student?.identifier,
    birthdate: student?.birthdate,
    enrollment_code: student?.enrollment_code,
    section: studentSection?.id,
    entry_date: student?.entry_date,
    gender: student?.gender,
  };

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .required('Este campo es requerido')
      .matches(/^[a-zA-ZÀ-ÿ\s]{1,40}$/, 'No se permiten números ni caracteres especiales')
      .nullable(),
    last_name: Yup.string()
      .required('Este campo es requerido')
      .matches(/^[a-zA-ZÀ-ÿ\s]{1,40}$/, 'No se permiten números ni caracteres especiales')
      .nullable(),
    identifier: identifierRequired
      ? Yup.string().nullable().required('Este campo es requerido')
      : Yup.string().nullable(),
    enrollment_code: Yup.string().nullable(),
    section: Yup.string().nullable(),
    entry_date: Yup.string()
      .nullable()
      .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Fecha inválida'),
    birthdate: Yup.string()
      .nullable()
      .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Fecha inválida'),
  });

  const formik = useFormik({
    initialValues,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useImperativeHandle(formikRef, () => ({
    handleSubmit: () => formik.handleSubmit(),
    resetForm: () => formik.resetForm(),
  }));
  return (
    <>
      <fieldset disabled={!ableToEdit}>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col max-w-[504px]">
            <span className="mb-6 text-xl font-semibold text-secondary">Datos personales</span>
            {personal_data.map((field) => (
              <DashboardInput
                key={getKey(field)}
                name={getKey(field)}
                value={formik.values[getKey(field) as keyof typeof formik.values] ?? ''}
                label={String(getValue(field))}
                onChange={formik.handleChange}
                disabled={!ableToEdit}
                onBlur={formik.handleBlur}
                error={
                  formik.touched[getKey(field) as keyof typeof formik.values] &&
                  formik.errors[getKey(field) as keyof typeof formik.values]
                }
              />
            ))}
            <DashboardInput
              label="CURP"
              name="identifier"
              value={formik.values?.identifier ?? ''}
              onChange={formik.handleChange}
              disabled={!ableToEdit}
              onBlur={formik.handleBlur}
              error={formik.errors.identifier}
            />
            <DateInputsGroup
              label="Fecha de nacimiento"
              date={formik.values.birthdate?.split('-') ?? []}
              setFieldValue={formik.setFieldValue}
              disabled={!ableToEdit}
              onBlur={formik.handleBlur}
              errors={formik.errors.birthdate}
            />
            <NRadioGroup
              options={['Masculino', 'Femenino']}
              value={parseGenderFormat(formik.values.gender)}
              label="Sexo"
              className="p-4 mb-8"
              onChange={handleRadioChange}
              disabled={!ableToEdit}
            />
            <span className="mb-6 text-xl font-semibold text-secondary">Datos de gestión escolar</span>
            <DashboardInput
              label="Numero de matricula"
              name="enrollment_code"
              value={formik.values?.enrollment_code ?? ''}
              onChange={formik.handleChange}
              disabled={!ableToEdit}
              onBlur={formik.handleBlur}
              error={formik.touched.enrollment_code && formik.errors.enrollment_code}
            />
            <Select
              name="level"
              placeholder="Nivel"
              className="w-full h-14 mb-4 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
              value={level && level}
              onValueChange={setLevel}
              disabled={!ableToEdit}
            >
              <Select.Content className="outline-none z-[9999]">
                {levelsOptions.map((type) => (
                  <Select.Item className="outline-none" value={type} key={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Select
              placeholder="Grado"
              name="grade"
              className="w-full h-14 mb-4 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
              value={grade && grade}
              onValueChange={setGrade}
              disabled={!ableToEdit}
            >
              <Select.Content className="outline-none z-[9999]">
                {gradesOptions.map((type) => (
                  <Select.Item className="w-full outline-none" value={type} key={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Select
              name="section"
              placeholder="Grupo"
              className="w-full h-14 mb-4 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
              value={group && group}
              onValueChange={setGroup}
              disabled={!ableToEdit}
            >
              <Select.Content className="outline-none z-[9999]">
                {sectionsOptions.map((type: any) => (
                  <Select.Item className="w-full outline-none" value={type} key={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full relative justify-start text-left font-normal',
                    !formik?.values?.entry_date && 'text-muted-foreground'
                  )}
                >
                  <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">Fecha de ingreso</p>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formik.values?.entry_date ? (
                    format(parseISO(formik?.values?.entry_date), 'PPP', { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={formik.values?.entry_date as any}
                  onSelect={(date) => formik.setFieldValue('entry_date', format(date as Date, 'yyyy-MM-dd'))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <SidebarActions className="z-10">
              <button
                className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
                type="button"
                onClick={() => {
                  setOpenDialog(true);
                }}
              >
                Cancelar
              </button>
              <span>
                <button
                  className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
                  disabled={!ableToEdit || Object.keys(formik.errors).length > 0}
                  type="button"
                  onClick={() => {
                    setOpenConfirmDialog(true);
                  }}
                >
                  Guardar
                </button>
              </span>
            </SidebarActions>
          </div>
        </form>
      </fieldset>
    </>
  );
};

export const parseDate = (date: Date) => date.toISOString().split('T')[0];

export default FormEditStudentDetail;
