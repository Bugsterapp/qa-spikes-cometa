import { api } from '../utils/api';

const useLevels = (token: string | undefined, selectedSchool: string | undefined) =>
  api.levels.getLevels.useQuery({
    schoolId: selectedSchool || '',
  });

export default useLevels;
