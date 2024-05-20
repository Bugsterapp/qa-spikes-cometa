import { FormikProps } from 'formik';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { cn } from '~/lib/cn';

const FormFieldsDependents = ({
  formik,
  disabledAll = false,
  isOnboarding = false,
}: {
  formik: FormikProps<any>;
  disabledAll?: boolean;
  isOnboarding?: boolean;
}) => {
  const { data: session } = useSession();
  const [studentList, setStudentList] = useState<any[]>([]);

  const checkContainerClassNames = (itemDisabled: boolean) =>
    cn('p-5 rounded-2xl transition-colors', {
      'bg-white': !itemDisabled,
      'text-gray-50': disabledAll,
      'text-blue-800': !disabledAll,
      'bg-transparent': itemDisabled,
    });

  const labelClassNames = (itemDisabled: boolean) =>
    cn('flex items-center text-lg font-bold text-lg', {
      'text-blue-800': !itemDisabled,
      'text-[#909095] mb-2': itemDisabled,
    });

  useEffect(() => {
    const newStudents =
      session?.user?.dependents?.map((dependent) => {
        const {
          billing_guardian: billingGuardian,
          first_name: firstName,
          last_name: lastName,
          identifier,
          id,
        } = dependent;
        const billingGuardianName = billingGuardian?.first_name
          ? `${billingGuardian.first_name} ${billingGuardian.last_name}`
          : null;
        const disabled = billingGuardian?.id && billingGuardian.id !== session.user.id;
        return {
          name: `${firstName} ${lastName}`,
          curp: identifier,
          billingGuardianName,
          selected: isOnboarding ? !billingGuardian || disabled : !!billingGuardian,
          disabled,
          id,
        };
      }) || [];
    setStudentList(newStudents);
    const selectedId = getSelectedStudent(newStudents);
    formik.setFieldValue('billable_dependents', selectedId);
  }, []);

  const getSelectedStudent = (students: any) =>
    students.filter((student: any) => student.selected && !student.disabled).map((student: any) => student.id);

  const handleStudentChange = (e: any) => {
    const { value, checked } = e.target;
    const updatedList = studentList.map((student) => ({
      ...student,
      selected: student.id === value ? checked : student.selected,
    }));
    formik.setFieldValue('billable_dependents', getSelectedStudent(updatedList));
    setStudentList(updatedList);
  };
  return (
    <div className="mb-10">
      <h3 className="pr-24 mb-6 text-base font-medium text-gray-300">
        Aplicar mis datos de facturación a los pagos de:
      </h3>
      {studentList.map(({ id, selected, curp, name, disabled }, index) => (
        <div className={checkContainerClassNames(disabled || !selected)} key={`box-${id}`}>
          <label className={labelClassNames(disabled)} htmlFor={`dependent_${index}`}>
            <input
              id={`dependent_${index}`}
              type="checkbox"
              name={curp}
              onChange={handleStudentChange}
              disabled={disabled || disabledAll}
              className="w-6 h-6 mr-4 bg-center bg-no-repeat border-2 border-blue-100 border-solid rounded-md appearance-none disabled:bg-gray-50 disabled:border-gray-50 checked:bg-blue-100 checked:bg-checkbox-tick bg-origin-border"
              value={id}
              checked={selected}
            />
            {name}
          </label>
          {disabled && (
            <span className="block px-5 py-1 text-xs font-bold text-center text-white uppercase rounded-lg ml-9 bg-gray-50">
              Ya factura al otro RFC
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormFieldsDependents;
