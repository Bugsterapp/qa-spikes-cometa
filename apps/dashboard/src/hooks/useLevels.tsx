import { useQuery } from '@tanstack/react-query';
import ApiClient from '../services/ApiClient';

const useLevels = (token: string | undefined, selectedSchool: string | undefined) => {
  const fetchLevels = async () => {
    const levestQuery = await ApiClient.getLevels(token, selectedSchool);
    return levestQuery?.data;
  };
  return useQuery(['schoolLevels', { selectedSchool }], () => fetchLevels(), {
    enabled: !!selectedSchool,
  });
};

export default useLevels;
