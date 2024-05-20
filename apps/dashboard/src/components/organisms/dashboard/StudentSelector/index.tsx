import { ChangeEvent, useEffect } from 'react';
import { Typography, ListItem } from '@mui/material';
import SearchAutocomplete from '../../../molecules/dashboard/SearchAutocomplete';
import PersonIcon from '@mui/icons-material/Person';

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
    <ListItem
      {...props}
      key={student.id}
      disablePadding
      data-testid={`${student.first_name} ${student.last_name}-listItem`}
    >
      <div className="ml-2 truncate">
        <Typography variant="subtitle1">
          {student.first_name} {student.last_name}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
          }}
        >
          {student.enrollment_code}
        </Typography>
      </div>
    </ListItem>
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
      placeholderTextField={placeholder || 'Buscar por alumno'}
      width={width}
      icon={<PersonIcon />}
      loading={loading}
    />
  );
}
