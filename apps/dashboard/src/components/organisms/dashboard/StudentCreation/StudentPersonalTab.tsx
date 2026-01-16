import { Button, DatePicker } from '@cometa/recreo';
import { zodResolver } from '@hookform/resolvers/zod';
import cx from 'classnames';
import { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import SidebarActions from '/src/components/atoms/SidebarActions';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import ApiClient from '/src/services/ApiClient';
import { validateZodStringDate } from '/src/utils/zod';

import { StudentCreateType } from './types';

const schema = z.object({
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
  birthdate: z
    .string()
    .min(1, 'Falta completar este campo')
    .refine((value) => validateZodStringDate(value, { disableFutureDates: true }), { message: 'Fecha inválida' }),
});

export type FormValues = z.infer<typeof schema>;

type StudentPersonalTabProps = {
  onCancel: (open: boolean) => void;
  student: StudentCreateType | null;
  setStudent: (_: StudentCreateType) => void;
  handleNext: () => void;
};

const StudentPersonalTab: FC<StudentPersonalTabProps> = ({ handleNext, onCancel, student, setStudent }) => {
  const schoolId = useSelectedSchoolId();
  const {
    register,
    formState: { isValid, errors },
    handleSubmit,
    watch,
    control,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      ...student,
      birthdate:
        student?.day && student?.month && student?.year ? `${student.day}/${student.month}/${student.year}` : '',
    },
    resolver: zodResolver(schema),
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: FormValues) => {
    const isStudentCreated = isValid && (await ApiClient.getStudentsOnSchool(schoolId, null, data.identifier));
    if (isStudentCreated?.count > 0) {
      setError('identifier', {
        type: 'manual',
        message: 'El CURP ya ha sido registrado por otro estudiante.',
      });
      return;
    }

    const [day, month, year] = data.birthdate.split('/');

    const studentData: StudentCreateType = {
      ...student,
      ...data,
      day,
      month,
      year,
    } as StudentCreateType;

    setStudent(studentData);
    handleNext();
  };

  return (
    <div className="flex flex-col h-[100%] justify-between">
      <form className="flex flex-col justify-between h-full" onSubmit={handleSubmit(onSubmit)}>
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
            <Controller
              control={control}
              name="birthdate"
              render={({ field }) => (
                <DatePicker {...field} error={errors.birthdate?.message} showCalendarIcon={false} />
              )}
            />
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
          <Button
            className="bg-white px-20 py-3 text-green hover:text-green-800 text-base font-bold disabled:text-[#919EABCC] rounded-lg outline-none"
            type="button"
            onClick={() => {
              onCancel(true);
            }}
          >
            Cancelar
          </Button>
          <span>
            <Button
              type="submit"
              className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-800 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap outline-none"
              disabled={!isValid}
            >
              Siguiente
            </Button>
          </span>
        </SidebarActions>
      </form>
    </div>
  );
};

export default StudentPersonalTab;
