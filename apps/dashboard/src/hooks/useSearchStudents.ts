import { keepPreviousData, useQuery } from '@tanstack/react-query';
import ApiClient from '../services/ApiClient';

const useSearchStudents = (selectedSchool: string | undefined, studentSearch?: string) => {
  const getStudentsOnSchool = async () => {
    const studentsOnSchool = await ApiClient.getStudentsOnSchool(
      selectedSchool,
      studentSearch ? studentSearch : undefined
    );
    const results = studentsOnSchool?.results;
    return results || [];
  };
  return useQuery({
    queryKey: ['studentsOnSchool', selectedSchool, studentSearch],
    queryFn: () => getStudentsOnSchool(),
    enabled: !!selectedSchool,
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });
};

export default useSearchStudents;
