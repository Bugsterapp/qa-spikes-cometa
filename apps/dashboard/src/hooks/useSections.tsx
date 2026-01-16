import { api } from '../utils/api';

const useSections = (token: string | undefined, selectedSchool: string | undefined, joinByPipe = false) =>
  api.sections.getSections.useQuery(
    {
      schoolId: selectedSchool as string,
      joinByPipe,
    },
    {
      enabled: !!selectedSchool,
    }
  );

export default useSections;
