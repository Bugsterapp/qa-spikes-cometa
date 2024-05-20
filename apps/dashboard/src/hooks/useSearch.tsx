import { useQuery } from '@tanstack/react-query';

const useSearch = (
  search: string,
  searchBy: 'Estudiante' | 'Pagador',
  searchByStudent: (arg0: string) => Promise<StudentQuery['results']>,
  searchByPayer: (arg0: string) => Promise<GuardianQuery['results']>
) => {
  search = search.toLowerCase();

  const searchMethod = searchBy === 'Estudiante' ? searchByStudent : searchByPayer;

  //eslint-disable-next-line
  return useQuery(['search', search], () => searchMethod(search) as any);
};

export default useSearch;

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dependents_count?: number;
}

export interface Result {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_code: string;
  level: string;
  section: string;
  guardians: Guardian[];
}

export interface StudentQuery {
  count: number;
  next: string;
  previous?: any;
  results: Result[];
}

export interface GuardianQuery {
  count: number;
  next: string;
  previous?: any;
  results: Guardian[];
}
