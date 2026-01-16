import { ChangeEvent, useEffect } from 'react';
import SearchAutocomplete from '../../../molecules/dashboard/SearchAutocomplete';
import { User } from 'lucide-react';

interface StudentSelectorProps {
  autocompleteKey?: string;
  selectedStudent: any;
  setSelectedStudent: (student: any) => void;
  width?: string;
  placeholder?: string;
  students: any;
  setSearchStudent: (student: any) => void;
  searchStudent: string;
  getStudentsOnSchool: () => void;
  loading: boolean;
}

export default function StudentSelector(props: StudentSelectorProps) {
  const {
    autocompleteKey,
    selectedStudent,
    setSelectedStudent,
    width,
    placeholder,
    students,
    setSearchStudent,
    searchStudent,
    getStudentsOnSchool,
    loading,
  } = props;

  const onChangeSearchStudent = (event: ChangeEvent<HTMLInputElement>) => {
    const inputText = event?.target?.value;
    setSearchStudent(inputText);
  };

  const handleAutocomplete = (_event: any, value: string, reason: string) => {
    setSelectedStudent(value);
    if (reason === 'clear') {
      setSearchStudent('');
    }
  };

  const renderOptionStudent = (props: any, student: Record<string, any>) => (
    <li {...props} key={student.id} data-testid={`${student.first_name} ${student.last_name}-listItem`}>
      <div className="ml-2 truncate">
        <p className="text-base font-normal">
          {student.first_name} {student.last_name}
        </p>
        <p className="text-xs font-normal leading-[18px]">{student.enrollment_code}</p>
      </div>
    </li>
  );

  const optionLabel = (student: Record<string, any>) =>
    `${student?.first_name} ${student?.last_name} ${student?.enrollment_code ? student?.enrollment_code : ''}`;

  useEffect(() => {
    if (autocompleteKey) {
      setSearchStudent('');
      setSelectedStudent(null);
    }
  }, [autocompleteKey]);

  return (
    <SearchAutocomplete
      autocompleteKey={autocompleteKey}
      data={students}
      optionLabel={optionLabel}
      renderOption={renderOptionStudent}
      onChangeTextField={onChangeSearchStudent}
      onClickAutocomplete={getStudentsOnSchool}
      onChangeAutocomplete={handleAutocomplete}
      inputText={selectedStudent ? optionLabel(selectedStudent) : searchStudent}
      placeholderTextField={placeholder || 'Buscar por estudiante'}
      width={width}
      icon={<User />}
      loading={loading}
    />
  );
}
