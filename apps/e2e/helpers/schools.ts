/* eslint-disable no-console */
import { getAdminToken } from './commons';
import { Api } from '@cometa/trpc/src/types';
import { dataConfig } from '../data/data';

type Environment = 'local' | 'stage' | 'dev';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const envVar = process.env.ENV_PLAYWRIGHT as Environment;
const url = dataConfig[envVar].ADMIN_URL || 'https://api-cometa.dev.getcometa.com/';
const baseUrl = url.substring(0, url.length - 1);
const ServiceClient = new Api({ baseUrl: baseUrl }).api;

export async function getSchoolsDueOrdersStudentsList(
  schoolId: string,
  cycle: string,
  levels?: string[],
  concept_types?: (
    | 'BOOKS_AND_MATERIALS'
    | 'CAFETERIA'
    | 'DONATION'
    | 'EXAMS_AND_CERTIFICATES'
    | 'EXTRACURRICULAR'
    | 'INSCRIPTION'
    | 'MONTHLY_FEE'
    | 'OTHER'
    | 'PRE_DEBT'
    | 'REINSCRIPTION'
    | 'SPORTS'
    | 'TRANSPORT'
    | 'UNIFORMS_AND_MERCH'
  )[],
  scholarships?: string[]
) {
  const token = await getAdminToken();
  const data = await ServiceClient.apiV4DashboardSchoolsDueOrdersStudentsList(
    schoolId,
    {
      concept_types: concept_types,
      scholarship_school_cycle: `${cycle}`,
      scholarships: scholarships,
      levels: levels,
      /** A page number within the paginated result set. */
      page: 1,
      /** Number of results to return per page. */
      page_size: 1,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}
