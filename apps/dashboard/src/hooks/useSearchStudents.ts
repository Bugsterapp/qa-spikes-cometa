import { useQuery } from '@tanstack/react-query';
import ApiClient from '../services/ApiClient';

const useSearchStudents = (token: string | undefined, selectedSchool: string | undefined, studentSearch?: string) => {
  const getStudentsOnSchool = async () => {
    const studentsOnSchool = await ApiClient.getStudentsOnSchool(
      token,
      selectedSchool,
      studentSearch ? studentSearch : undefined
    );
    const results = studentsOnSchool?.data?.results;
    return results;
  };
  return useQuery(['studentsOnSchool', selectedSchool, studentSearch], () => getStudentsOnSchool(), {
    enabled: !!selectedSchool,
    keepPreviousData: true,
    staleTime: 5000,
  });
};

export default useSearchStudents;
