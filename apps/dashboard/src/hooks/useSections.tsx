import { useQuery } from '@tanstack/react-query';
import ApiClient from '../services/ApiClient';

const useSections = (token: string | undefined, selectedSchool: string | undefined) => {
  const fetchSections = async () => {
    const sectionsQuery = await ApiClient.getSections(token, selectedSchool);
    return sectionsQuery?.data;
  };
  return useQuery(['schoolSections', { selectedSchool }], () => fetchSections(), {
    enabled: !!selectedSchool,
  });
};

export default useSections;
