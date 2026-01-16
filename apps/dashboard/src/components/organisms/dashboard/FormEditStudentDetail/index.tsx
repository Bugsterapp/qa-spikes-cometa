import { DatePicker, PhoneInput, Select, TextField } from '@cometa/recreo';
import { Country, State } from '@cometa/trpc/src/students/types';
import {
  DashboardSchoolSection,
  DashboardStudent,
  GenderEnum,
  InternalSchool,
  InternalSection,
} from '@cometa/trpc/src/types';
import { format, parse, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFormik } from 'formik';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useImperativeHandle, useState } from 'react';
import * as Yup from 'yup';

import { Checkbox } from '/src/components/atoms/RadixCheckbox';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextAreaGrow from '/src/components/atoms/TextAreaGrow/TextAreaGrow';
import { LevelsProps, SectionsProps } from '/src/components/molecules/dashboard/StudentGeneralInformation/types';
import { Button } from '/src/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '/src/components/ui/Popover';
import { Calendar } from '@cometa/recreo';
import Input from '/src/components/ui/Input';
import { TabsWrapper as Tabs, useTab } from '/src/components/ui/Tabs';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useIntegrationsBlockedFields } from '/src/hooks/useIntegrationsBlockedFields';
import { api } from '/src/utils/api';
import { cn } from '/src/utils/cn';
import { splitSection } from '/src/utils/section';
import { validateZodStringDate } from '/src/utils/zod';

import NRadioGroup from '../RadioGroup';
import { ListStudentLeadDTO } from '@cometa/trpc/src/admissions/types';

interface IFormEditStudentDetailProps {
  student?: DashboardStudent;
  levels: LevelsProps[] | InternalSchool[];
  sections: SectionsProps[] | DashboardSchoolSection[] | undefined;
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
  const [isBornOutsideMexico, setIsBornOutsideMexico] = useState(false);
  const { tab, handleChangeTab } = useTab('general');
  const selectedSchool = useSelectedSchool();
  const identifierRequired = selectedSchool?.config_dashboard?.student_identifier_is_required;
  const { data: countries } = api.location.retrieveCountries.useQuery();
  const { data: states } = api.location.retrieveStates.useQuery();

  const { isFieldBlocked } = useIntegrationsBlockedFields();

  const { data: studentExtended } = api.students.retrieveStudentAdditionalInfo.useQuery(
    {
      studentId: student?.id || '',
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retryOnMount: false,
    }
  );

  const { data: studentLeads } = api.admissions.getAdmissions.useQuery(
    {
      schoolId: selectedSchool?.id || '',
      query: {
        external_id: [student?.id || ''],
      },
    },
    {
      enabled: Boolean(student?.id && selectedSchool?.id),
    }
  );

  const studentLead = studentLeads?.results?.[0] as ListStudentLeadDTO | undefined;

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

  const handleRadioChange = (value: string) => formik.setFieldValue('gender', value === 'Masculino' ? 'M' : 'F');

  const handleSubmit = (values: any) => {
    values.medical_info.personal_history = values.medical_info.personal_history?.join(', ');
    values.medical_info.family_history = values.medical_info.family_history?.join(', ');

    if (values.birthdate) {
      const parsedDate = parse(values.birthdate, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        values.birthdate = format(parsedDate, 'yyyy-MM-dd');
      }
    }

    mutation.mutate(values);
  };

  const parseGenderFormat = (gender: DashboardStudent['gender'] | undefined) =>
    gender === GenderEnum.M ? 'Masculino' : 'Femenino';

  const baseValues = {
    first_name: student?.first_name,
    last_name: student?.last_name,
    identifier: student?.identifier,
    birthdate: student?.birthdate
      ? (() => {
          const date = parse(student.birthdate, 'yyyy-MM-dd', new Date());
          return isValid(date) ? format(date, 'dd/MM/yyyy') : '';
        })()
      : '',
    enrollment_code: student?.enrollment_code,
    section: studentSection?.id,
    entry_date: student?.entry_date,
    credential_expiration_date: student?.credential_expiration_date,
    gender: student?.gender,
  };

  const extraFields = {
    student_id: student?.id,
    school_id: selectedSchool?.id,
    address: {
      id: studentExtended?.address?.id || null,
      street: studentExtended?.address?.street || '',
      interior_number: studentExtended?.address?.interior_number || null,
      neighborhood: studentExtended?.address?.neighborhood || '',
      state_id: studentExtended?.address?.state?.id || null,
      zip_code: studentExtended?.address?.zip_code || '',
      municipality: studentExtended?.address?.municipality || '',
      home_phone: studentExtended?.address?.home_phone || '',
    },
    medical_info: {
      id: studentExtended?.medical_info?.id || null,
      personal_history: studentExtended?.medical_info?.personal_history?.split(', '),
      family_history: studentExtended?.medical_info?.family_history?.split(', '),
      food_allergies: studentExtended?.medical_info?.food_allergies || '',
      drug_allergies: studentExtended?.medical_info?.drug_allergies || '',
      plant_allergies: studentExtended?.medical_info?.plant_allergies || '',
      other_allergies: studentExtended?.medical_info?.other_allergies || '',
      blood_type_code: studentExtended?.medical_info?.blood_type_code || '',
    },
    permissions_agreements: {
      id: studentExtended?.permissions_agreements?.id || null,
      image_usage: studentExtended?.permissions_agreements?.image_usage || false,
      student_transport: studentExtended?.permissions_agreements?.student_transport || false,
      auth_external_care: studentExtended?.permissions_agreements?.auth_external_care || false,
      privacy_notice: studentExtended?.permissions_agreements?.privacy_notice || false,
      allow_solo_departure: studentExtended?.permissions_agreements?.allow_solo_departure || false,
      school_regulations: studentExtended?.permissions_agreements?.school_regulations || false,
      hospital_transfer: studentExtended?.permissions_agreements?.hospital_transfer || false,
    },
    nationality_code: studentExtended?.nationality_code,
    birth_place_id: studentExtended?.birth_place?.id || null,
    note: studentExtended?.note || '',
  };

  useEffect(() => {
    if (studentExtended && studentExtended.birth_place) {
      setIsBornOutsideMexico(false);
    }
  }, [studentExtended]);

  const initialValues = { ...baseValues, ...extraFields };
  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .required('Este campo es requerido')
      .max(50, 'El nombre no puede exceder 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s'\-.]+$/, 'Solo se permiten letras, espacios, apostrofes, guiones y puntos')
      .nullable(),
    last_name: Yup.string()
      .required('Este campo es requerido')
      .max(50, 'El apellido no puede exceder 50 caracteres')
      .matches(/^[a-zA-ZÀ-ÿ\s'\-.]+$/, 'Solo se permiten letras, espacios, apostrofes, guiones y puntos')
      .nullable(),
    identifier: identifierRequired
      ? Yup.string().nullable().required('Este campo es requerido')
      : Yup.string().nullable(),
    enrollment_code: Yup.string().nullable(),
    section: Yup.string().nullable(),
    entry_date: Yup.string()
      .nullable()
      .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Fecha inválida'),
    credential_expiration_date: Yup.string()
      .nullable()
      .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Fecha inválida'),
    birthdate: Yup.string()
      .nullable()
      .test('is-valid-date', 'Fecha inválida', (value) => {
        if (!value) return true;
        return validateZodStringDate(value, { disableFutureDates: true });
      }),
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

  const GENERAL_KEY_NAME = 'general';
  const NOTES_KEY_NAME = 'notes';

  const tabs = [
    {
      value: GENERAL_KEY_NAME,
      label: 'General',
    },
    {
      value: NOTES_KEY_NAME,
      label: 'Anotaciones',
    },
  ];

  return (
    <>
      <Tabs
        tabsListClassName="px-0"
        tabsTriggerClassName="text-xs"
        tabs={tabs}
        tab={tab}
        handleChangeTab={handleChangeTab}
        defaultValue="general"
      />
      <fieldset disabled={!ableToEdit}>
        <form onSubmit={formik.handleSubmit}>
          {tab == GENERAL_KEY_NAME && (
            <div className="py-5 pb-10">
              <div className="pb-6 ">
                <span className="text-l text-black">Información personal</span>
              </div>

              <div className="flex flex-col max-w-[504px]">
                <Input
                  name="first_name"
                  value={(formik.values['first_name'] as string) ?? ''}
                  label="Nombre"
                  onChange={formik.handleChange}
                  disabled={!ableToEdit || isFieldBlocked('student.first_name')}
                  onBlur={formik.handleBlur}
                  error={formik.errors['first_name']}
                />
                <Input
                  name="last_name"
                  value={formik.values['last_name'] ?? ''}
                  label="Apellidos"
                  onChange={formik.handleChange}
                  disabled={!ableToEdit || isFieldBlocked('student.last_name')}
                  onBlur={formik.handleBlur}
                  error={formik.errors['last_name']}
                />

                <Input
                  label="CURP"
                  name="identifier"
                  value={formik.values?.identifier ?? ''}
                  onChange={formik.handleChange}
                  disabled={!ableToEdit}
                  onBlur={formik.handleBlur}
                  error={formik.errors.identifier}
                />
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#637381] mb-2 block">FECHA DE NACIMIENTO</span>
                  <DatePicker
                    name="birthdate"
                    value={formik.values.birthdate || ''}
                    onChange={(value) => {
                      formik.setFieldValue('birthdate', value || '', true);
                    }}
                    error={formik.errors.birthdate}
                    disabled={!ableToEdit || isFieldBlocked('student.birthdate')}
                    showCalendarIcon={false}
                  />
                </div>
                <NRadioGroup
                  options={['Masculino', 'Femenino', 'No especificado']}
                  value={parseGenderFormat(formik.values.gender)}
                  label="Sexo"
                  className="p-2 mb-6"
                  onChange={handleRadioChange}
                  disabled={!ableToEdit || isFieldBlocked('student.gender')}
                />
                <Select
                  placeholder="Nacionalidad"
                  disabled={!ableToEdit}
                  onValueChange={(value) => formik.setFieldValue('nationality_code', value)}
                  name="nationality_code"
                  value={formik.values?.nationality_code ?? ''}
                  className="w-full outline-none min-h-[56px] h-full mb-1"
                >
                  <Select.Content className="w-full outline-none">
                    {countries?.map((country: Country) => (
                      <Select.Item
                        className="w-full bg-gray-200 outline-none"
                        key={country.code}
                        value={country.code || ''}
                      >
                        {country.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>

                <Select
                  placeholder="Lugar de nacimiento"
                  disabled={!ableToEdit || isBornOutsideMexico}
                  onValueChange={(value) => formik.setFieldValue('birth_place_id', value)}
                  name="birth_place_id"
                  value={formik.values?.birth_place_id ?? ''}
                  className="w-full outline-none min-h-[56px] h-full mt-3 mb-3"
                >
                  <Select.Content className="w-full outline-none">
                    {states?.map((state: State) => (
                      <Select.Item
                        className="w-full outline-none"
                        key={`birth_place_${state.id}`}
                        value={state.id || ''}
                      >
                        {state.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <div className="w-full h-6 mb-4">
                  <Checkbox
                    id="out-m"
                    checked={isBornOutsideMexico}
                    onClick={() => {
                      if (!isBornOutsideMexico) {
                        formik.setFieldValue('birth_place_id', null);
                      }

                      setIsBornOutsideMexico(!isBornOutsideMexico);
                    }}
                  />
                  <label htmlFor="out-m">
                    <span className="text-gray-500 select-none p-2">El estudiante nació fuera de México</span>
                  </label>
                </div>
                <span className="mb-2 text-l text-black">Domicilio</span>
                <div className="mb-5">
                  <PhoneInput
                    initialValue={formik.values?.address.home_phone ?? ''}
                    disabled={!ableToEdit || isFieldBlocked('student.phone')}
                    onChange={(value) => formik.setFieldValue('address.home_phone', value.number)}
                  />
                </div>
                <Input
                  label="Dirección"
                  name="address.street"
                  value={formik.values?.address?.street ?? ''}
                  onChange={formik.handleChange}
                  disabled={!ableToEdit}
                  onBlur={formik.handleBlur}
                />
                <div className="flex gap-4">
                  <div className="flex">
                    <Input
                      label="No. Interior"
                      name="address.interior_number"
                      value={formik.values?.address?.interior_number ?? ''}
                      onChange={formik.handleChange}
                      disabled={!ableToEdit}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <div className="flex">
                    <Input
                      label="Colonia"
                      name="address.neighborhood"
                      value={formik.values?.address?.neighborhood ?? ''}
                      onChange={formik.handleChange}
                      disabled={!ableToEdit}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex">
                    <Input
                      label="Municipio/Delegación"
                      name="address.municipality"
                      value={formik.values?.address?.municipality ?? ''}
                      onChange={formik.handleChange}
                      disabled={!ableToEdit}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      placeholder="Estado"
                      disabled={!ableToEdit}
                      onValueChange={(value) => formik.setFieldValue('address.state_id', value)}
                      name="address.state_id"
                      value={formik.values?.address?.state_id ?? ''}
                      className="w-full h-14 mb-4 disabled:text-[#637381] focus-within:border-2 hover:border-secondary disabled:hover:border-primary"
                    >
                      <Select.Content className="w-full outline-none">
                        {states?.map((state: State) => (
                          <Select.Item
                            className="w-full outline-none"
                            key={`state_id_${state.id}`}
                            value={state.id || ''}
                          >
                            {state.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>
                <Input
                  label="Código postal"
                  name="address.zip_code"
                  value={formik.values?.address?.zip_code ?? ''}
                  onChange={formik.handleChange}
                  disabled={!ableToEdit}
                  onBlur={formik.handleBlur}
                />
                <span className="mb-6 text-l text-black">Datos de gestión escolar</span>
                <Input
                  label="Numero de matricula"
                  name="enrollment_code"
                  value={formik.values?.enrollment_code ?? ''}
                  onChange={formik.handleChange}
                  disabled={!ableToEdit || isFieldBlocked('student.enrollment_code')}
                  onBlur={formik.handleBlur}
                  error={formik.touched.enrollment_code && formik.errors.enrollment_code}
                />
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
                <div className="mt-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full relative justify-start text-left font-normal',
                          !formik?.values?.credential_expiration_date && 'text-muted-foreground'
                        )}
                      >
                        <p className="absolute bottom-[45px] bg-white text-[#9DA9B4] text-xs">
                          Expiración de credenciales
                        </p>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formik.values?.credential_expiration_date ? (
                          format(parseISO(formik?.values?.credential_expiration_date), 'PPP', { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={formik.values?.credential_expiration_date as any}
                        onSelect={(date) =>
                          formik.setFieldValue('credential_expiration_date', format(date as Date, 'yyyy-MM-dd'))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mt-4">
                  <span className="mb-6 text-l text-black">Información adicional</span>
                  <div className="mt-4">
                    <AdmissionInfo studentLead={studentLead as ListStudentLeadDTO} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab == NOTES_KEY_NAME && (
            <div className="py-5 pb-10">
              <div className="pb-6">
                <span className="text-xs">
                  Aquí podrás ingresar cualquier anotación o comentario adicional que necesites acerca del estudiante
                  seleccionado:
                </span>
              </div>
              <fieldset disabled={!ableToEdit}>
                <TextField textareaGrow value={formik.values?.note} className="mb-2 mr-4">
                  <TextAreaGrow
                    value={formik.values?.note}
                    className="border-none max-h-[200px] min-h-[140px] overflow-y-auto transition-all"
                    onChange={formik.handleChange}
                    errors={false}
                    name="note"
                  />
                </TextField>
              </fieldset>
            </div>
          )}
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
        </form>
      </fieldset>
    </>
  );
};

export const parseDate = (date: Date) => date.toISOString().split('T')[0];

function AdmissionInfo({ studentLead }: { studentLead: ListStudentLeadDTO }) {
  return (
    <div className="border border-[#D0D8E9] rounded-lg overflow-hidden w-full">
      <div className="bg-[#F8F9FB] border-b border-[#D0D8E9] px-4 py-2.5">
        <p className="text-sm font-semibold text-[#22283A]">Admisiones</p>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div className="flex items-start justify-between w-full gap-4">
          <p className="w-[166px] text-sm leading-5 text-[#444C60] shrink-0">Colegio anterior:</p>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-5 text-[#444C60] break-words">{studentLead?.origin_school || '-'}</p>
          </div>
        </div>

        <div className="flex items-start justify-between w-full gap-4">
          <p className="w-[166px] text-sm leading-5 text-[#444C60] shrink-0">Comentario adicional:</p>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-5 text-[#444C60] break-words">{studentLead?.comment || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormEditStudentDetail;
