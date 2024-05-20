/* eslint-disable no-console */
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { ConceptsPage } from '../pages/conceptsPage';
import { NewConceptSteps } from '../pages/newConceptSteps';
import { delay } from './commons';
import axios, { AxiosRequestConfig } from 'axios';

export async function createConcept(conceptName: string, conceptPrice: string) {
  try {
    const apiUrl =
      'https://api-cometa.dev.getcometa.com/api/v1/dashboard/schools/0ff7bba2-ac51-4108-bb76-2dad89f80875/concepts/'; //BMT
    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      entity: '74d0b544-5b71-42cb-bedf-6ca3564c8b7b',
      type: 'MONTHLY_FEE',
      school_cycle: '65be80c9-2ca8-4131-b633-065ff6e6bdae',
      name: conceptName,
      subscription: true,
      optional: false,
      bank_account: '987c1698-4b69-4513-b858-3c8e49135f3a',
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

export async function createOtherConceptByApi(conceptName: string) {
  try {
    const apiUrl =
      'https://api-cometa.dev.getcometa.com/api/v1/dashboard/schools/0ff7bba2-ac51-4108-bb76-2dad89f80875/concepts/create_with_attributes/'; //BMT
    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      entity: '74d0b544-5b71-42cb-bedf-6ca3564c8b7b',
      root_concept: 'optional',
      type: 'OTHER',
      school_cycle: '65be80c9-2ca8-4131-b633-065ff6e6bdae',
      name: `${conceptName}`,
      bank_account: '987c1698-4b69-4513-b858-3c8e49135f3a',
      payment_only_in_dashboard: false,
      subscription: false,
      has_sales_tax: true,
      optional: true,
      tax_code: '101010101',
      tax_unit: 'ACT',
      institutional_id: '1234',
      is_billable: true,
      price: 0,
      orders_attributes: [
        {
          order_price: 1000,
          attributes: [
            {
              name: 'x',
              type: 'talla',
            },
          ],
        },
        {
          order_price: 1000,
          attributes: [
            {
              name: 'xs',
              type: 'talla',
            },
          ],
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
      throw new Error(`Error al crear otro concepto: ${error.message}`);
    }
  }
}

export async function addOrdersToStudent(studentId: string | null, conceptId: string): Promise<void> {
  try {
    const apiUrl = `https://api-cometa.dev.getcometa.com/api/v1/dashboard/students/${studentId}/assignments/`;

    const headers = {
      Authorization: 'Token 6ebdd8cb8432abce1a62b935cc24030e823b6c28',
      'Content-Type': 'application/json',
    };

    const payload = {
      orders_to_skip: [],
      concept: conceptId,
      start_date: '2023-02-01',
      end_date: '2025-12-31',
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

export async function createMonthlyPaymentsConcept(
  page: Page,
  loginPage: LoginPage,
  conceptsPage: ConceptsPage,
  newConceptSteps: NewConceptSteps,
  conceptName: string,
  conceptPrice: number
) {
  await loginPage.conceptsBtn.click();
  await conceptsPage.newConceptBtn.click();
  await newConceptSteps.conteptTypeList.click({ timeout: 5000 });
  await newConceptSteps.monthlySchollarshipOpt.click({ timeout: 10000 });
  await newConceptSteps.schoolCicleList.click();
  await newConceptSteps.twentyFourCicle.click();
  await newConceptSteps.conceptNameInp.click();
  await newConceptSteps.conceptNameInp.fill(conceptName);
  await newConceptSteps.page.waitForRequest(/\/api\/trpc\/schools\.schoolsConceptsList\?.+/);
  await newConceptSteps.yesRadioBtn.click();
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
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Sí').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('1');
  await page.getByLabel('Porcentual(%)').click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('2');
  await page.getByLabel('Cada mes').click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Agregar descuento' }).click();
  await page.locator('input[name="up_to_days"]').click();
  await page.locator('input[name="up_to_days"]').fill('2');
  await page.getByLabel('Porcentual(%)').click();
  await page.locator('input[name="discount_value"]').click();
  await page.locator('input[name="discount_value"]').fill('2');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.locator('.flex.w-full.flex-col').last().hover({ timeout: 3000 });
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.locator('#tax_sales_true').click();
  await page.getByPlaceholder('Selecciona una clave de producto').click();
  await page.getByText('101010101').click();
  await page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await page.getByText('ACT', { exact: true }).click();
  await page.locator('#rvoe_opt_true').click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('123');
  await page.getByRole('button', { name: 'Crear concepto' }).click();
}

export async function createOtherConcept(
  loginPage: LoginPage,
  conceptsPage: ConceptsPage,
  newConceptSteps: NewConceptSteps,
  conceptName: string,
  conceptPrice: number
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
  await loginPage.page.getByPlaceholder('Selecciona una clave de producto').click();
  await loginPage.page.getByText('101010101').click();
  await loginPage.page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await loginPage.page.getByText('ACT', { exact: true }).click();
  await newConceptSteps.rvoeOptTrueRadio.click();
  await loginPage.page.getByRole('textbox').click();
  await loginPage.page.getByRole('textbox').fill('123');
  await loginPage.page.getByRole('button', { name: 'Crear concepto' }).click();
}
