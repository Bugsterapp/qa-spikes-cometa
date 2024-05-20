/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import axios, { AxiosRequestConfig } from 'axios';
import { getAdminToken } from './commons';
import { Api } from '@cometa/trpc/src/types';
import { dataConfig } from '../data/data';

type Environment = 'local' | 'stage' | 'dev';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const envVar = process.env.ENV as Environment;
const url = dataConfig[envVar].ADMIN_URL || 'https://api-cometa.dev.getcometa.com/';

export async function assignGuardianAPI(
  student_id: string,
  schoolid: string,
  firstname?: string,
  lastname?: string,
  mail?: string
) {
  const phone = await generateCellPhone();
  const token = await getAdminToken();
  const first_name = firstname || (await generateFirstName());
  const last_name = lastname || generateLastName();
  const email = mail || `${first_name}${last_name}@getcometa.com`;

  try {
    const apiUrl = `${url}api/v1/dashboard/schools/${schoolid}/guardians/`;

    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      phone,
      first_name,
      last_name,
      email,
      gender: 'm',
      student_id,
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${apiUrl}`);
    }

    return first_name + ' ' + last_name;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar tutor: ${error.message}`);
    }
  }
}

export async function addOrders(studentId: string | null): Promise<void> {
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;

    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      orders_to_skip: [
        'f181d6b6-a6e8-493e-8c9b-64a7e169e830',
        'ca4d5fdd-001d-4ec7-8241-bf797f45dd85',
        '34e46317-6f22-495e-99fd-fd865fd397c8',
      ],
      concept: '7ffa6220-4d21-43df-885f-7563f53420ce',
      start_date: '2023-02-01',
      end_date: '2025-03-31',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${apiUrl}`);
    }

    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar ordenes: ${error.message}`);
    }
  }
}

export async function addOtherConceptosOrders(
  studentId: string | null,
  conceptId: string,
  ordersToSkip = []
): Promise<void> {
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;

    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      orders_to_skip: ordersToSkip,
      concept: conceptId,
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${apiUrl}`);
    }

    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar ordenes: ${error.message}`);
    }
  }
}

export async function generateFirstName(): Promise<string> {
  const firstName = faker.person.firstName().replace(/['-]/g, '');
  return `${firstName}`;
}

export async function generateLastName(): Promise<string> {
  const lastName = faker.person.lastName().replace(/['-]/g, '');
  return `${lastName}`;
}

export async function generateMatricula(): Promise<string> {
  const matricula = faker.number.int({ min: 1000000000, max: 9999999999 });
  return matricula.toString();
}

export async function generateCellPhone(): Promise<string> {
  const matricula = faker.number.int({ min: 1000000, max: 9999999 });
  return '+54116' + matricula.toString();
}

export async function generateCellPhoneForFront(): Promise<string> {
  const cell = faker.number.int({ min: 50000000, max: 99999999 });
  return '55' + cell.toString();
}

export async function createStudentWithParams(
  first_name: string,
  last_name: string,
  enrollment_code: string,
  level: string,
  section: string,
  schoolID: string,
  curp: string,
  grade?: string,
  group?: string,
  cycle?: string
) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/schools/${schoolID}/students/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };
    const payload = {
      first_name,
      last_name,
      identifier: curp,
      gender: 'M',
      year: '1996',
      month: '10',
      day: '02',
      enrollment_code,
      level,
      grade,
      group,
      section,
      birthdate: '1996-10-02',
      billing_guardian: '',
      school_cycle_id: cycle,
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };
    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${apiUrl}`);
    }

    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear estudiante: ${error.message}`);
    }
  }
}

export async function addOrdersWithParams(studentId: string, concept: string): Promise<void> {
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;

    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      orders_to_skip: [],
      concept,
      start_date: '2023-02-01',
      end_date: '2025-03-31',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${apiUrl}`);
    }

    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar ordenes: ${error.message}`);
    }
  }
}
const baseUrl = url.substring(0, url.length - 1);
const ServiceClient = new Api({ baseUrl: baseUrl }).api;

export async function getGuardiansBySchoolId(schoolId: string) {
  const token = await getAdminToken();
  const data = await ServiceClient.apiV1DashboardSchoolsGuardiansList(
    schoolId,
    {
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

export async function getStudentBySchoolId(schoolId: string, schoolcycle?: string) {
  const token = await getAdminToken();
  const school_cycle = schoolcycle;
  const data = await ServiceClient.apiV1DashboardSchoolsStudentsList(
    schoolId,
    {
      /** A page number within the paginated result set. */
      page: 1,
      school_cycle,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}
