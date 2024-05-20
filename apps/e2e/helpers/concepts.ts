/* eslint-disable no-console */
import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { ConceptsPage } from '../pages/conceptsPage';
import { NewConceptSteps } from '../pages/newConceptSteps';
import axios, { AxiosRequestConfig } from 'axios';
import { delay, getAdminToken } from './commons';
import {
  Api,
  CreateConceptWithAttributes,
  OrderWithAttributes,
  PaginatedOrderList,
  Type68EEnum,
} from '@cometa/trpc/src/types';
import { dataConfig } from '../data/data';
import { v4 as uuidv4 } from 'uuid';

type Environment = 'local' | 'stage' | 'dev';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const envVar = process.env.ENV as Environment;
const url = dataConfig[envVar].ADMIN_URL || 'https://api-cometa.dev.getcometa.com/';

export async function createConcept(
  conceptName: string,
  conceptPrice: string,
  entity: string,
  school_cycle: string,
  bank_account: string,
  schoolID?: string
) {
  const school = schoolID || '0ff7bba2-ac51-4108-bb76-2dad89f80875';
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/schools/${school}/concepts/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      entity: entity || '74d0b544-5b71-42cb-bedf-6ca3564c8b7b',
      type: 'MONTHLY_FEE',
      school_cycle: school_cycle || '65be80c9-2ca8-4131-b633-065ff6e6bdae',
      name: conceptName,
      subscription: true,
      optional: false,
      bank_account: bank_account || '987c1698-4b69-4513-b858-3c8e49135f3a',
      payment_only_in_dashboard: false,
      months_to_pay: [8, 9, 10, 11, 12],
      payday: 2,
      price: conceptPrice,
      interest_schema: [],
      early_bird_discounts: [],
      has_sales_tax: false,
      tax_code: '101010101',
      tax_unit: 'ACT',
      institutional_id: null,
      is_billable: true,
      orders: [
        {
          id: '7_2023',
          price: 1000,
          due: '2023-08-01',
          months_to_pay: 8,
          modified: false,
          monthName: 'Agosto 2023',
        },
        {
          id: '8_2023',
          price: 1000,
          due: '2023-09-01',
          months_to_pay: 9,
          modified: false,
          monthName: 'Septiembre 2023',
        },
        {
          id: '9_2023',
          price: 1000,
          due: '2023-10-01',
          months_to_pay: 10,
          modified: false,
          monthName: 'Octubre 2023',
        },
        {
          id: '10_2023',
          price: 1000,
          due: '2023-11-01',
          months_to_pay: 11,
          modified: false,
          monthName: 'Noviembre 2023',
        },
        {
          id: '11_2023',
          price: 1000,
          due: '2023-12-01',
          months_to_pay: 12,
          modified: false,
          monthName: 'Diciembre 2023',
        },
      ],
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
      throw new Error(`Error al crear concepto de pago x mes: ${error.message}`);
    }
  }
}

export async function createMandatoryConceptByApi(
  conceptName: string,
  conceptPrice: string,
  entity: string,
  school_cycle: string,
  bank_account: string,
  schoolID: string
) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/schools/${schoolID}/concepts/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      entity,
      type: 'MONTHLY_FEE',
      school_cycle,
      name: conceptName,
      subscription: true,
      optional: false,
      bank_account,
      payment_only_in_dashboard: false,
      months_to_pay: [8, 9, 10, 11, 12],
      payday: 2,
      price: conceptPrice,
      interest_schema: [],
      early_bird_discounts: [],
      has_sales_tax: false,
      tax_code: '101010101',
      tax_unit: 'ACT',
      institutional_id: null,
      is_billable: true,
      orders: [
        {
          id: '7_2023',
          price: 1000,
          due: '2023-08-01',
          months_to_pay: 8,
          modified: false,
          monthName: 'Agosto 2023',
        },
        {
          id: '8_2023',
          price: 1000,
          due: '2023-09-01',
          months_to_pay: 9,
          modified: false,
          monthName: 'Septiembre 2023',
        },
        {
          id: '9_2023',
          price: 1000,
          due: '2023-10-01',
          months_to_pay: 10,
          modified: false,
          monthName: 'Octubre 2023',
        },
        {
          id: '10_2023',
          price: 1000,
          due: '2023-11-01',
          months_to_pay: 11,
          modified: false,
          monthName: 'Noviembre 2023',
        },
        {
          id: '11_2023',
          price: 1000,
          due: '2023-12-01',
          months_to_pay: 12,
          modified: false,
          monthName: 'Diciembre 2023',
        },
      ],
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

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear concepto de pago x mes: ${error.message}`);
    }
  }
}

export async function createOtherConceptByApi(
  conceptName: string,
  entity: string,
  bank_account: string,
  school_cycle: string,
  schoolId: string,
  withAtt?: boolean
) {
  const token = await getAdminToken();
  let price = '100';

  let orders_attributes: OrderWithAttributes[] = [];
  if (withAtt) {
    orders_attributes = [
      {
        order_price: '1000',
        attributes: [
          {
            name: 'x',
            type: 'talla',
          },
        ],
      },
      {
        order_price: '1000',
        attributes: [
          {
            name: 'xs',
            type: 'talla',
          },
        ],
      },
    ];
    price = '0';
  }

  const data: CreateConceptWithAttributes = {
    id: uuidv4(),
    entity,
    type: 'OTHER' as Type68EEnum,
    school_cycle,
    name: `${conceptName}`,
    bank_account,
    payment_only_in_dashboard: false,
    subscription: false,
    has_sales_tax: true,
    optional: true,
    tax_code: '101010101',
    tax_unit: 'ACT',
    institutional_id: '1234',
    is_billable: true,
    price,
    orders_attributes,
  };

  const response = await ServiceClient.apiV1DashboardSchoolsConceptsCreateWithAttributesCreate(schoolId, data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
}

//    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;

export async function addOtherConceptOrdersToStudent(studentId: string, concept: string, orders: any) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      concept,
      orders_ids: orders,
      is_optional: true,
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

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar concepto opcional`);
    }
  }
}

export async function addOrdersToStudent(studentId: string, concept: string) {
  const token = await getAdminToken();

  const data = await ServiceClient.apiV1DashboardStudentsAssignmentsCreate(
    studentId,
    {
      /**
       * Unique identifier for the object.
       * @format uuid
       */
      id: uuidv4(),
      /**
       * Unique identifier for the object.
       * @format uuid
       */
      student_id: studentId,
      /** @format date */
      start_date: '2023-02-01',
      /** @format date */
      end_date: '2025-02-01',
      /**
       * Unique identifier for the object.
       * @format uuid
       */
      concept: concept,
      scholarships: [],
      orders_to_skip: [],
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}

export async function addOptionalOrdersToStudent(studentId: string, concept: string) {
  const token = await getAdminToken();
  const ids: string[] = [];
  const orders: PaginatedOrderList | undefined = await getOrdersByConceptId(concept);

  if (orders && orders.results) {
    // Verifica si orders existe y si tiene la propiedad results
    for (const resultado of orders.results) {
      ids.push(resultado.id);
    }
  }
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      concept,
      is_optional: true,
      orders_ids: ids,
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: apiUrl,
      headers: headers,
      data: payload,
    };

    const response = await axios(requestOptions);
    console.log(JSON.stringify(response.data));
    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar ordenes opcionales: ${error.message}`);
    }
  }
}

export async function createMonthlyPaymentsConcept(
  page: Page,
  loginPage: LoginPage,
  conceptsPage: ConceptsPage,
  newConceptSteps: NewConceptSteps,
  conceptName: string,
  conceptPrice: number,
  notMonthly: boolean,
  bankAccountName: string,
  restriction: boolean
) {
  await loginPage.conceptsBtn.click();
  await conceptsPage.newConceptBtn.click();
  await newConceptSteps.conteptTypeList.click({ timeout: 5000 });
  notMonthly
    ? await newConceptSteps.monthlyReinscriptionOpt.click({ timeout: 10000 })
    : await newConceptSteps.monthlySchollarshipOpt.click({ timeout: 10000 });
  await newConceptSteps.schoolCicleList.click();
  await newConceptSteps.twentyFourCicle.click();
  await newConceptSteps.conceptNameInp.click();
  await newConceptSteps.conceptNameInp.fill(conceptName);
  await page.waitForResponse(/\/api\/trpc\/schools\.schoolsConceptsList\?batch.+/);
  await newConceptSteps.yesRadioBtn.click();
  await newConceptSteps.yesRadioBtn.hover();
  await newConceptSteps.backBtn.scrollIntoViewIfNeeded();
  await newConceptSteps.yesRadioBtn.hover();
  await newConceptSteps.backBtn.scrollIntoViewIfNeeded();
  const bankAccount = await loginPage.page.getByTestId('selectBankAccount-list').textContent();
  if (bankAccount !== bankAccountName) {
    await newConceptSteps.page.getByTestId('selectBankAccount-list').click();
    await newConceptSteps.page.getByLabel(bankAccountName).getByText(bankAccountName).click();
  }
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.monthToChargeList.click();
  await page.getByRole('option', { name: 'Agosto 2023' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Octubre 2023' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Septiembre 2023' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Noviembre 2023' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Noviembre 2023' }).getByRole('checkbox').click();
  await page.getByText('Meses a cobrar').first().click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill(`MXN ${conceptPrice}`);
  await page.locator('input[name="price"]').click();
  await page.locator('xpath=//button/*[text()="Selecciona un dia de vencimiento"]').click();
  await page.locator('xpath=//div').getByRole('option', { name: '4 de cada mes' }).last().click();
  if (!restriction) {
    await newConceptSteps.setupPeriodicRestrictionsNoRadio.click();
  }
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Sí').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('1');
  await page.getByTestId('porcentual-radioButton').click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('2');
  await page.getByLabel('Cada mes').click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Agregar descuento' }).click();
  await page.locator('input[name="up_to_days"]').click();
  await page.locator('input[name="up_to_days"]').fill('2');
  await page.getByTestId('porcentual-radioButton').click();
  await page.locator('input[name="discount_value"]').click();
  await page.locator('input[name="discount_value"]').fill('2');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.locator('.flex.w-full.flex-col').last().hover({ timeout: 3000 });
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.locator('#tax_sales_true').click();
  await page.getByPlaceholder('Selecciona una clave de producto').click();
  await page.locator('.py-2.px-3.shadow-sm.flex.flex-col').first().click();
  await page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await page.getByText('ACT', { exact: true }).click();
  await page.locator('#rvoe_opt_true').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('123');
  await page.getByRole('button', { name: 'Crear concepto' }).click();
  const response = await loginPage.page.waitForResponse(/\/api\/trpc\/schools\.schoolsConceptsCreate\?.+/);
  const jsonResponse = await response.json();
  const id = jsonResponse[0]?.result?.data?.json?.id;
  return id;
}

export async function createOtherConcept(
  loginPage: LoginPage,
  conceptsPage: ConceptsPage,
  newConceptSteps: NewConceptSteps,
  conceptName: string,
  conceptPrice: number,
  bankAccountName: string
) {
  await loginPage.conceptsBtn.click();
  await conceptsPage.newConceptBtn.click();
  await newConceptSteps.conteptTypeList.click({ timeout: 8000 });
  await loginPage.page.getByTestId('Cafetería').click();
  await newConceptSteps.schoolCicleList.click();
  await loginPage.page.getByRole('option', { name: 'Ciclo 2023/2024' }).click();
  await newConceptSteps.conceptNameInp.click();
  await newConceptSteps.conceptNameInp.fill(conceptName);
  //aguardo que retorne la validacion que NO exista el concepto creado o pincha la creacion.
  await newConceptSteps.page.waitForRequest(/\/api\/trpc\/schools\.schoolsConceptsList\?.+/);
  await newConceptSteps.optionalRadioBtn.hover();
  await newConceptSteps.backBtn.scrollIntoViewIfNeeded();
  const bankAccount = await loginPage.page.getByTestId('selectBankAccount-list').textContent();
  if (bankAccount !== bankAccountName) {
    await newConceptSteps.page.getByTestId('selectBankAccount-list').click();
    await newConceptSteps.page.getByLabel(bankAccountName).getByText(bankAccountName).click();
  }
  await loginPage.page.getByText('¿A qué cuenta bancaria se deberán depositar los pagos?').scrollIntoViewIfNeeded();
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.backBtn.click();
  await loginPage.page
    .getByText('¿A qué cuenta bancaria se deberán depositar los pagos?')
    .first()
    .scrollIntoViewIfNeeded();
  await newConceptSteps.optionalRadioBtn.click();
  await delay(2000);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.noAttributesRadioBtn.check();
  await newConceptSteps.priceInp.click();
  await newConceptSteps.priceInp.fill(`MXN ${conceptPrice}`);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.taxSalesTrueRadio.click();
  await loginPage.page.getByPlaceholder('Selecciona una clave de producto').click({ timeout: 10000 });
  await loginPage.page.locator('.py-2.px-3.shadow-sm.flex.flex-col').first().click();
  await loginPage.page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await loginPage.page.getByText('ACT', { exact: true }).click();
  await newConceptSteps.rvoeOptTrueRadio.click();
  await loginPage.page.getByRole('textbox').click();
  await loginPage.page.getByRole('textbox').fill('123');
  await loginPage.page.getByRole('button', { name: 'Crear concepto' }).click();
  const response = await loginPage.page.waitForResponse(
    /\/api\/trpc\/schools\.schoolsConceptsWithAttributesCreate\?.+/
  );
  const jsonResponse = await response.json();
  const id = jsonResponse[0]?.result?.data?.json?.id;
  return id;
}

export async function createOtherConceptWithAttributes(
  loginPage: LoginPage,
  conceptsPage: ConceptsPage,
  newConceptSteps: NewConceptSteps,
  conceptName: string,
  conceptPrice: number,
  bankAccountName: string
) {
  await loginPage.conceptsBtn.click();
  await conceptsPage.newConceptBtn.click();
  await newConceptSteps.conteptTypeList.click({ timeout: 8000 });
  await loginPage.page.getByTestId('Cafetería').click();
  await newConceptSteps.schoolCicleList.click();
  await loginPage.page.getByRole('option', { name: 'Ciclo 2023/2024' }).click();
  await newConceptSteps.conceptNameInp.click();
  await newConceptSteps.conceptNameInp.fill(conceptName);
  //aguardo que retorne la validacion que NO exista el concepto creado o pincha la creacion.
  await newConceptSteps.page.waitForRequest(/\/api\/trpc\/schools\.schoolsConceptsList\?.+/);
  await newConceptSteps.optionalRadioBtn.hover();
  await newConceptSteps.backBtn.scrollIntoViewIfNeeded();
  const bankAccount = await loginPage.page.getByTestId('selectBankAccount-list').textContent();
  if (bankAccount !== bankAccountName) {
    await newConceptSteps.page.getByTestId('selectBankAccount-list').click();
    await newConceptSteps.page.getByLabel(bankAccountName).getByText(bankAccountName).click();
  }
  await loginPage.page.getByText('¿A qué cuenta bancaria se deberán depositar los pagos?').scrollIntoViewIfNeeded();
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.backBtn.click();
  await loginPage.page
    .getByText('¿A qué cuenta bancaria se deberán depositar los pagos?')
    .first()
    .scrollIntoViewIfNeeded();
  await newConceptSteps.optionalRadioBtn.click();
  await delay(2000);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.yesAttributesRadioBtn.check();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').fill('talla');
  await newConceptSteps.page.getByRole('textbox').nth(1).click();
  await newConceptSteps.page.getByRole('textbox').nth(1).fill('x');
  await newConceptSteps.page.getByRole('button', { name: 'Agrega otra opción' }).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).fill('xs');
  await newConceptSteps.page.getByRole('button', { name: 'Guardar' }).click();
  await newConceptSteps.page.getByRole('button', { name: 'Agregar más atributos' }).click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').fill('tipo');
  await newConceptSteps.page.getByRole('textbox').nth(1).click();
  await newConceptSteps.page.getByRole('textbox').nth(1).fill('pantalon');
  await newConceptSteps.page.getByRole('button', { name: 'Agrega otra opción' }).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).fill('remera');
  await newConceptSteps.page.getByRole('button', { name: 'Guardar' }).click();
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.page.getByTestId('price-input').click();
  await newConceptSteps.priceInp.fill(`MXN ${conceptPrice}`);
  await newConceptSteps.page.getByRole('button', { name: 'Aplicar a todos' }).click();
  await newConceptSteps.page.getByTestId('next-button').click();
  await newConceptSteps.taxSalesTrueRadio.click();
  await loginPage.page.getByPlaceholder('Selecciona una clave de producto').click({ timeout: 10000 });
  await loginPage.page.locator('.py-2.px-3.shadow-sm.flex.flex-col').first().click();
  await loginPage.page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await loginPage.page.getByText('ACT', { exact: true }).click();
  await newConceptSteps.rvoeOptTrueRadio.click();
  await loginPage.page.getByRole('textbox').click();
  await loginPage.page.getByRole('textbox').fill('123');
  await loginPage.page.getByRole('button', { name: 'Crear concepto' }).click();
  const response = await loginPage.page.waitForResponse(
    /\/api\/trpc\/schools\.schoolsConceptsWithAttributesCreate\?.+/
  );
  const jsonResponse = await response.json();
  const id = jsonResponse[0]?.result?.data?.json?.id;
  return id;
}

export async function deleteConceptByApi(conceptId: string, schoolId: string) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'delete',
      url: apiUrl,
      headers: headers,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, URL: ${apiUrl}`);
    }

    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }
}

export async function studentAssignmentsApi(studenId: string) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studenId}/assignments/`;
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: apiUrl,
      headers: headers,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, URL: ${apiUrl}`);
    }

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id;
    } else {
      // Puedes devolver null, lanzar una excepción o manejarlo de otra manera
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }
}

export async function destroyOptionalAssignmentByApi(studenId: string, assignmentId?: string) {
  const token = await getAdminToken();
  if (assignmentId) {
    try {
      const apiUrl = `${url}api/v1/dashboard/students/${studenId}/assignments/${assignmentId}/destroy_optional_assignment/`;
      const headers = {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      };

      const requestOptions: AxiosRequestConfig = {
        method: 'delete',
        url: apiUrl,
        headers: headers,
      };

      const response = await axios(requestOptions);

      if (!response.status.toString().startsWith('2')) {
        throw new Error(`Status code: ${response.status}, URL: ${apiUrl}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar concepto: ${error.message}`);
      }
    }
  }
}

export async function destroyMonthlyFeeAssignmentByApi(studentId: string, assignId: string) {
  const token = await getAdminToken();
  try {
    const apiUrl = `${url}api/v1/dashboard/students/${studentId}/assignments/${assignId}/`;
    const headers = {
      Authorization: `Token ${token}`,
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'delete',
      url: apiUrl,
      headers: headers,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, URL: ${apiUrl}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }
}

const baseUrl = url.substring(0, url.length - 1);
const ServiceClient = new Api({ baseUrl: baseUrl }).api;

export async function getConceptListBySchoolId(
  schoolId: string,
  school_cycle: string,
  type?:
    | (
        | 'BOOKS_AND_MATERIALS'
        | 'CAFETERIA'
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
      )[]
    | undefined
) {
  const token = await getAdminToken();
  const data = await ServiceClient.apiV1DashboardSchoolsConceptsList(
    schoolId,
    { school_cycles: [school_cycle], type: type || ['MONTHLY_FEE'] },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}

export async function getOrdersByConceptId(conceptId: string) {
  const token = await getAdminToken();
  const data = await ServiceClient.apiV1DashboardConceptsOrdersList(
    conceptId,
    {
      /** A page number within the paginated result set. */
      page: 1,
      /** Number of results to return per page. */
      page_size: 12,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}

export async function hasPaidOrdersRequiredProxy(
  page: Page,
  orderId: string,
  data: PaginatedOrderList,
  logged = false
) {
  //orderId = '8166ef4f-75da-4c77-af83-3e5f66771971';
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV as Environment | undefined;
    if (envVar && envVar in dataConfig) {
      if (dataConfig[envVar].ADMIN_URL) {
        const adminUrl = dataConfig[envVar].ADMIN_URL;

        await page.goto(`${adminUrl}cometa_admin/payins/order/${orderId}/change/`);
      }
    }
    if (!logged) {
      await expect(page.getByLabel('Email address:')).toBeVisible();
      await page.getByLabel('Email address:').fill('admin@getcometa.com');
      await page.getByLabel('Password:').fill('spiritbreaker');
      await page.getByRole('button', { name: 'Log in' }).click();
    }
    const element = page.locator('//*[@id="id_paid_orders_required_proxy_to"]').first();
    const text = await element.textContent();
    if (text) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}
