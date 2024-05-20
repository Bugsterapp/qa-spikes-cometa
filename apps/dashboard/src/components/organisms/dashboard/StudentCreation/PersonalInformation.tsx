import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import SidebarActions from '/src/components/atoms/SidebarActions';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';
import { NumberFormatBase as NumericFormat } from 'react-number-format';
import ApiClient from '/src/services/ApiClient';
import { useSession } from 'next-auth/react';

const schema = z
  .object({
    first_name: z.string().min(1, 'Falta completar este campo'),
    last_name: z.string().min(1, 'Falta completar este campo'),
    identifier: z
      .string()
      .min(1, 'Falta completar este campo')
      .regex(
        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
        'El formato del CURP no es válido'
      ),
    gender: z.string().min(1, 'Falta completar este campo'),
    year: z
      .string()
      .regex(/^(19\d{2}|20[01]\d|202[0-3])$/, 'El año es inválido')
      .default(''),
    month: z
      .string()
      .regex(/^(0[1-9]|1[0-2])$/, 'El mes es inválido')
      .default(''),
    day: z
      .string()
      .regex(/^(0[1-9]|[12]\d|3[01])$/, 'El día es inválido')
      .default(''),
  })
  .refine(
    (data) => {
      const monthDayMapping = {
        '01': 31,
        '02': 29, // Assuming it's always a leap year
        '03': 31,
        '04': 30,
        '05': 31,
        '06': 30,
        '07': 31,
        '08': 31,
        '09': 30,
        '10': 31,
        '11': 30,
        '12': 31,
      };

      const maxDaysInMonth = monthDayMapping[data.month as keyof typeof monthDayMapping];
      return Number(data.day) <= maxDaysInMonth;
    },
    { message: 'Día invalido para el mes seleccionado', path: ['day'] }
  );

export type FormValues = z.infer<typeof schema>;

type CreateGuardianViewProps = {
  onSubmit: (formData: FormValues) => void;
  onCancel: (open: boolean) => void;
  student: Partial<StudentDetails.RootObject & { year: string; month: string; day: string }> | null;
  setIsFormDirty: (isDirty: boolean) => void;
  schoolId?: string;
};

const StudentPersonalDataView = forwardRef<HTMLFormElement, CreateGuardianViewProps>(
  ({ onSubmit, onCancel, student, setIsFormDirty, schoolId }, ref) => {
    const { data: session } = useSession();
    const {
      register,
      formState: { isValid, errors, isDirty },
      handleSubmit,
      watch,
      control,
      setError,
    } = useForm<FormValues>({
      defaultValues: { ...student },
      resolver: zodResolver(schema),
      mode: 'all',
      reValidateMode: 'onChange',
    });
    useEffect(() => {
      setIsFormDirty(isDirty);
    }, [isDirty, setIsFormDirty]);

    const handleValidate = async (data: FormValues) => {
      const identifier = watch('identifier');
      const isStudentCreated =
        isValid && (await ApiClient.getStudentsOnSchool(session?.token, schoolId, null, identifier));
      if (isStudentCreated?.data?.count > 0) {
        setError('identifier', {
          type: 'manual',
          message: 'El CURP ya ha sido registrado por otro estudiante.',
        });
        return;
      }
      onSubmit(data);
    };
    return (
      <div className="flex flex-col h-[100%] justify-between">
        <form className="flex flex-col justify-between h-full" ref={ref} onSubmit={handleSubmit(handleValidate)}>
          <div className="col-span-2 pb-8 space-y-8 px-9">
            <div className="flex flex-col mt-5 -mb-3">
              <span className="text-base font-semibold">Datos personales</span>
            </div>
            <TextField label="Nombre" error={errors.first_name?.message} value={watch('first_name')}>
              <CustomInput {...register('first_name')} type="text" />
            </TextField>
            <TextField label="Apellidos" error={errors.last_name?.message} value={watch('last_name')}>
              <CustomInput {...register('last_name')} type="text" />
            </TextField>
            <TextField label="CURP" error={errors.identifier?.message} value={watch('identifier')}>
              <CustomInput {...register('identifier')} type="text" />
            </TextField>
            <div className="flex flex-col space-y-5">
              <h5 className="text-xs font-bold">FECHA DE NACIMIENTO:</h5>
              <div className="flex space-x-5 max-h-[64px]">
                <TextField label="Dia" error={errors.day?.message} value={watch('day')}>
                  <Controller
                    control={control}
                    name="day"
                    render={({ field: { ...props } }) => (
                      <NumericFormat
                        {...props}
                        format={formatDay}
                        className="w-full text-[#1D2939] placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0"
                      />
                    )}
                  />
                </TextField>
                <TextField label="Mes" error={errors.month?.message} value={watch('month')}>
                  <Controller
                    control={control}
                    name="month"
                    render={({ field: { ...props } }) => (
                      <NumericFormat
                        {...props}
                        format={formatMonth}
                        className="w-full text-[#1D2939] placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0"
                      />
                    )}
                  />
                </TextField>
                <TextField label="Año" error={errors.year?.message} value={watch('year')}>
                  <Controller
                    control={control}
                    name="year"
                    render={({ field: { ...props } }) => (
                      <NumericFormat
                        type="tel"
                        {...props}
                        className="w-full text-[#1D2939] placeholder-gray-500 outline-none border-none text-base peer rounded-lg relative z-[2] bg-transparent focus:ring-0"
                        format={formatYear}
                      />
                    )}
                  />
                </TextField>
              </div>
            </div>

            <div className="relative flex flex-col space-y-5">
              <h5 className="text-sm font-bold">SEXO:</h5>
              {errors.gender?.message && (
                <div
                  id="gender_error"
                  className={twMerge('absolute flex items-center gap-1 text-xs font-thin text-red-500  max-h-4')}
                >
                  <span className="text-elipsis">Falta completar este campo</span>
                </div>
              )}
              <div className="flex ml-3">
                <label
                  className={twMerge(
                    'flex items-center text-sm',
                    cx({
                      'text-red-600': !!errors.gender?.message,
                    })
                  )}
                >
                  <input
                    {...register('gender')}
                    type="radio"
                    value="M"
                    className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                  />
                  Masculino
                </label>
                <label
                  className={twMerge(
                    'flex items-center text-sm ml-8',
                    cx({
                      'text-red-600': !!errors.gender?.message,
                    })
                  )}
                >
                  <input
                    {...register('gender')}
                    type="radio"
                    value="F"
                    className="mr-2 w-5 h-5 appearance-none rounded-full transition-colors p-0.5 border-[#212B36] border-2 checked:before:rounded-full checked:border-green checked:before:block checked:before:content-[''] checked:before:w-full checked:before:h-full checked:before:bg-green focus:ring-0"
                  />
                  Femenino
                </label>
              </div>
            </div>
          </div>
          <SidebarActions className="z-10">
            <button
              className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
              type="button"
              onClick={() => {
                onCancel(true);
              }}
            >
              Cancelar
            </button>
            <span>
              <button
                className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
                disabled={!isValid}
              >
                Siguiente
              </button>
            </span>
          </SidebarActions>
        </form>
      </div>
    );
  }
);

export default StudentPersonalDataView;

const formatDay = (val: string) => {
  let day = val.substring(0, 2);
  if (day.length === 1 && parseInt(day[0]) > 3) {
    day = `0${day[0]}`;
  } else if (day.length === 2) {
    // set the lower and upper boundary
    if (Number(day) === 0) {
      day = `01`;
    } else if (Number(day) > 31) {
      day = '31';
    }
  }
  return `${day}`;
};

const formatMonth = (val: string) => {
  let month = val.substring(0, 2);
  if (month.length === 1 && parseInt(month[0]) > 1) {
    month = `0${month[0]}`;
  } else if (month.length === 2) {
    // set the lower and upper boundary
    if (Number(month) === 0) {
      month = `01`;
    } else if (Number(month) > 12) {
      month = '12';
    }
  }
  return `${month}`;
};

const formatYear = (val: string) => {
  const year = val.substring(0, 4);
  return `${year}`;
};
