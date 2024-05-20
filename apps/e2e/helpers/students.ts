/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import axios, { AxiosRequestConfig } from 'axios';

export async function getToken(): Promise<void> {
  try {
    const apiUrl = 'https://api-cometa.dev.getcometa.com/api-token-auth/staff/'; // Reemplaza con la URL de tu API

    const headers = {
      'Content-Type': 'application/json',
    };

    const payload = {
      username: 'admin@getcometa.com',
      password: 'spiritbreaker',
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
      throw new Error(`Error al obtener token: ${error.message}`);
    }
  }
}

export async function createStudent(first_name: string, last_name: string, enrollment_code: string) {
  try {
    const apiUrl =
      //'https://api-cometa.dev.getcometa.com/api/v1/dashboard/schools/44510ed6-c9d8-437f-9288-12469a00f1db/students/';  //ALT
      'https://api-cometa.dev.getcometa.com/api/v1/dashboard/schools/0ff7bba2-ac51-4108-bb76-2dad89f80875/students/'; //BMT
    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      first_name,
      last_name,
      identifier: 'MKHK280603MSPRRV86',
      gender: 'M',
      year: '1996',
      month: '10',
      day: '02',
      enrollment_code,
      level: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      grade: 'Primer año',
      group: 'A',
      section: 'f64f0da8-a763-4bb0-8a26-84d63a5ee0aa',
      birthdate: '1996-10-02',
      billing_guardian: '',
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

export async function assignGuardianAPI(student_id: string | null) {
  const first_name = await generateFirstName();
  const last_name = await generateLastName();
  const phone = await generateCellPhone();

  try {
    const apiUrl =
      'https://api-cometa.dev.getcometa.com/api/v1/dashboard/schools/0ff7bba2-ac51-4108-bb76-2dad89f80875/guardians/';

    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      phone,
      first_name,
      last_name,
      email: `${first_name}${last_name}@getcometa.com`,
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
    const apiUrl = `https://api-cometa.dev.getcometa.com/api/v1/dashboard/students/${studentId}/assignments/`;

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
    const apiUrl = `https://api-cometa.dev.getcometa.com/api/v1/dashboard/students/${studentId}/assignments/`;

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
