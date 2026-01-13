/* eslint-disable no-console */
import {
  ConceptTypesEnum,
  CreateConceptWithAttributes,
  OrderWithAttributes,
  PaginatedOrderList,
  PatchedChangeLimitRequest,
  PatchedUpdateQuantityRequest,
  UpdateQuantityRequestActionEnum,
} from '@cometa/trpc/src/types';
import { Page, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { ConceptsPage } from '../pages/dashboard/conceptsPage';
import { LoginPage } from '../pages/dashboard/loginPage';
import { NewConceptSteps } from '../pages/dashboard/newConceptSteps';
import { delay } from './retryUtils';
import { getAdminToken, ServiceClient, baseApiUrl, api } from './apiClient';

type Environment = 'local' | 'stage' | 'dev';

// ============================================================================
// PAYLOAD BUILDERS - Centralized payload construction to reduce duplication
// ============================================================================

/**
 * Base configuration for concept payloads
 */
interface ConceptPayloadConfig {
  conceptName: string;
  conceptPrice: string;
  entity: string;
  school_cycle: string;
  bank_account: string;
  optional?: boolean;
  subscription?: boolean;
  setup_periodic_restrictions?: boolean;
  type?: ConceptTypesEnum;
  months_to_pay?: number[];
  payday?: number;
}

/**
 * Build base concept payload with common fields
 */
function buildBaseConceptPayload(config: ConceptPayloadConfig) {
  return {
    entity: config.entity,
    type: config.type || ConceptTypesEnum.MONTHLY_FEE,
    school_cycle: config.school_cycle,
    name: config.conceptName,
    subscription: config.subscription ?? true,
    optional: config.optional ?? false,
    bank_account: config.bank_account,
    payment_only_in_dashboard: false,
    has_sales_tax: false,
    tax_code: '101010101',
    tax_unit: 'ACT',
    institutional_id: null,
    is_billable: true,
  };
}

/**
 * Build monthly fee orders for concept
 */
function buildMonthlyOrders(price: string) {
  return [
    {
      id: '7_2023',
      price: parseInt(price) || 1000,
      due: '2023-08-01',
      months_to_pay: 8,
      modified: false,
      monthName: 'Agosto 2023',
    },
    {
      id: '8_2023',
      price: parseInt(price) || 1000,
      due: '2023-09-01',
      months_to_pay: 9,
      modified: false,
      monthName: 'Septiembre 2023',
    },
    {
      id: '9_2023',
      price: parseInt(price) || 1000,
      due: '2023-10-01',
      months_to_pay: 10,
      modified: false,
      monthName: 'Octubre 2023',
    },
    {
      id: '10_2023',
      price: parseInt(price) || 1000,
      due: '2023-11-01',
      months_to_pay: 11,
      modified: false,
      monthName: 'Noviembre 2023',
    },
    {
      id: '11_2023',
      price: parseInt(price) || 1000,
      due: '2023-12-01',
      months_to_pay: 12,
      modified: false,
      monthName: 'Diciembre 2023',
    },
  ];
}

// ============================================================================
// API FUNCTIONS - Using centralized apiClient
// ============================================================================

export async function createConcept(
  conceptName: string,
  conceptPrice: string,
  entity: string,
  school_cycle: string,
  bank_account: string,
  schoolID?: string
) {
  const school = schoolID || '0ff7bba2-ac51-4108-bb76-2dad89f80875';

  const payload = {
    ...buildBaseConceptPayload({
      conceptName,
      conceptPrice,
      entity,
      school_cycle,
      bank_account,
    }),
    setup_periodic_restrictions: true,
    months_to_pay: [8, 9, 10, 11, 12],
    payday: 2,
    price: conceptPrice,
    interest_schema: [],
    early_bird_discounts: [],
    orders: buildMonthlyOrders(conceptPrice),
  };

  try {
    const response = await api.post<{ id: string }>(`api/v1/dashboard/schools/${school}/concepts/`, payload);
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
  schoolID: string,
  setup_periodic_restrictions = false
) {
  const payload = {
    ...buildBaseConceptPayload({
      conceptName,
      conceptPrice,
      entity,
      school_cycle,
      bank_account,
    }),
    setup_periodic_restrictions,
    months_to_pay: [8, 9, 10, 11, 12],
    payday: 2,
    price: conceptPrice,
    interest_schema: [],
    early_bird_discounts: [],
    orders: buildMonthlyOrders(conceptPrice),
  };

  try {
    const response = await api.post<{ id: string }>(`api/v1/dashboard/schools/${schoolID}/concepts/`, payload);
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
      { order_price: '1000', attributes: [{ name: 'x', type: 'talla' }] },
      { order_price: '1000', attributes: [{ name: 'xs', type: 'talla' }] },
      { order_price: '1000', attributes: [{ name: 'infito', type: 'talla' }] },
    ];
    price = '0';
  }

  const data: CreateConceptWithAttributes = {
    id: uuidv4(),
    entity,
    type: 'OTHER' as ConceptTypesEnum,
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

export async function addOtherConceptOrdersToStudent(studentId: string, concept: string, orders: string[]) {
  const payload = {
    concept,
    orders_ids: orders,
    is_optional: true,
  };

  try {
    const response = await api.post<{ id: string }>(`api/v1/dashboard/students/${studentId}/assignments/`, payload);
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
      id: uuidv4(),
      student_id: studentId,
      start_date: '2023-02-01',
      end_date: '2025-02-01',
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
    for (const resultado of orders.results) {
      ids.push(resultado.id);
    }
  }

  const payload = {
    concept,
    is_optional: true,
    orders_ids: ids,
  };

  try {
    const response = await api.post<{ id: string }>(
      `api/v1/dashboard/students/${studentId}/assignments/`,
      payload,
      token
    );
    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al asignar ordenes opcionales: ${error.message}`);
    }
  }
}

// ============================================================================
// FRONT-END CONCEPT CREATION FUNCTIONS
// ============================================================================

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
  await newConceptSteps.fiscalEntityList.click();
  await page.getByLabel('KERNEL INDUSTRIA JUGUETERA (').click();
  await newConceptSteps.conteptTypeList.click({ timeout: 5000 });
  notMonthly
    ? await newConceptSteps.monthlyReinscriptionOpt.click({ timeout: 10000 })
    : await newConceptSteps.monthlySchollarshipOpt.click({ timeout: 10000 });
  await newConceptSteps.schoolCicleList.click();
  await newConceptSteps.currentCycle.click();
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
  await page.getByRole('option', { name: 'Agosto 2024' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Octubre 2024' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Septiembre 2024' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Noviembre 2024' }).getByRole('checkbox').click();
  await page.getByRole('option', { name: 'Noviembre 2024' }).getByRole('checkbox').click();
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
  await page.locator('#tax_sales_true').first().click();
  await newConceptSteps.taxSalesFalseRadio.click();
  await page.getByPlaceholder('Busca por código o por nombre').click();
  await page.getByPlaceholder('Busca por código o por nombre').fill('10152007');
  await page.getByRole('option', { name: 'Semillas o yemas de algarrobo' }).click();
  await page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await page.getByText('E48', { exact: true }).click();
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
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.backBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await loginPage.page
    .getByText('¿A qué cuenta bancaria se deberán depositar los pagos?')
    .first()
    .scrollIntoViewIfNeeded();
  await newConceptSteps.optionalRadioBtn.click();
  await delay(2000);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.noAttributesRadioBtn.check();
  await newConceptSteps.priceInp.click();
  await newConceptSteps.priceInp.fill(`MXN ${conceptPrice}`);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.page.locator('#tax_sales_true').first().click();
  await newConceptSteps.page.getByPlaceholder('Busca por código o por nombre').click();
  await newConceptSteps.page.getByPlaceholder('Busca por código o por nombre').fill('10152007');
  await newConceptSteps.page.getByRole('option', { name: 'Semillas o yemas de algarrobo' }).click();
  await newConceptSteps.page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await newConceptSteps.page.getByText('E48', { exact: true }).click();
  await newConceptSteps.page.locator('#rvoe_opt_true').click();
  await newConceptSteps.page.getByRole('textbox').click();
  await newConceptSteps.page.getByRole('textbox').fill('123');
  await newConceptSteps.page.getByRole('button', { name: 'Crear concepto' }).click();
  await loginPage.page.waitForResponse(/\/api\/trpc\/schools\.schoolsConceptsWithAttributesCreate\?.+/);
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
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.backBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await loginPage.page
    .getByText('¿A qué cuenta bancaria se deberán depositar los pagos?')
    .first()
    .scrollIntoViewIfNeeded();
  await newConceptSteps.optionalRadioBtn.click();
  await delay(2000);
  await newConceptSteps.submitBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.yesAttributesRadioBtn.check();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').fill('talla');
  await newConceptSteps.page.getByRole('textbox').nth(1).click();
  await newConceptSteps.page.getByRole('textbox').nth(1).fill('x');
  await newConceptSteps.page.getByRole('button', { name: 'Agrega otra opción' }).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).fill('xs');
  await newConceptSteps.page.getByRole('button', { name: 'Guardar' }).click();
  await newConceptSteps.page.waitForTimeout(500);

  await newConceptSteps.page.getByRole('button', { name: 'Agregar más atributos' }).click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').click();
  await newConceptSteps.page.locator('input[name="attribute\\.type"]').fill('tipo');
  await newConceptSteps.page.getByRole('textbox').nth(1).click();
  await newConceptSteps.page.getByRole('textbox').nth(1).fill('pantalon');
  await newConceptSteps.page.getByRole('button', { name: 'Agrega otra opción' }).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).click();
  await newConceptSteps.page.getByRole('textbox').nth(2).fill('remera');
  await newConceptSteps.page.getByRole('button', { name: 'Guardar' }).click();
  await newConceptSteps.page.waitForTimeout(500);

  await newConceptSteps.submitBtn.click();
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.page.getByTestId('price-input').click();
  await newConceptSteps.priceInp.fill(`MXN ${conceptPrice}`);
  await newConceptSteps.page.getByRole('button', { name: 'Aplicar a todos' }).click();
  await newConceptSteps.page.waitForTimeout(500);

  await newConceptSteps.page.getByTestId('next-button').click();
  await newConceptSteps.page.waitForTimeout(1000);

  await newConceptSteps.page.locator('#tax_sales_true').first().click();
  await newConceptSteps.page.getByPlaceholder('Busca por código o por nombre').click();
  await newConceptSteps.page.getByPlaceholder('Busca por código o por nombre').fill('10152007');
  await newConceptSteps.page.getByRole('option', { name: 'Semillas o yemas de algarrobo' }).click();
  await newConceptSteps.page.getByPlaceholder('Selecciona un tipo de unidad').click();
  await newConceptSteps.page.getByText('E48', { exact: true }).click();
  await newConceptSteps.page.locator('#rvoe_opt_true').click();
  await newConceptSteps.page.getByRole('textbox').click();
  await newConceptSteps.page.getByRole('textbox').fill('123');
  await newConceptSteps.page.getByRole('button', { name: 'Crear concepto' }).click();
  await loginPage.page.waitForResponse(/\/api\/trpc\/schools\.schoolsConceptsWithAttributesCreate\?.+/);
  const response = await loginPage.page.waitForResponse(
    /\/api\/trpc\/schools\.schoolsConceptsWithAttributesCreate\?.+/
  );
  const jsonResponse = await response.json();
  const id = jsonResponse[0]?.result?.data?.json?.id;
  return id;
}

// ============================================================================
// DELETE / DESTROY FUNCTIONS
// ============================================================================

export async function deleteConceptByApi(conceptId: string, schoolId: string) {
  try {
    const response = await api.delete<{ id: string }>(`api/v1/dashboard/schools/${schoolId}/concepts/${conceptId}/`);
    return response.data.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }
}

export async function studentAssignmentsApi(studenId: string) {
  try {
    const response = await api.get<{ id: string }[]>(`api/v1/dashboard/students/${studenId}/assignments/`);

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id;
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener assignments: ${error.message}`);
    }
  }
}

export async function destroyOptionalAssignmentByApi(studenId: string, assignmentId?: string) {
  if (!assignmentId) return;

  try {
    await api.delete<void>(
      `api/v1/dashboard/students/${studenId}/assignments/${assignmentId}/destroy_optional_assignment/`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar assignment opcional: ${error.message}`);
    }
  }
}

export async function destroyMonthlyFeeAssignmentByApi(studentId: string, assignId: string) {
  try {
    await api.delete<void>(`api/v1/dashboard/students/${studentId}/assignments/${assignId}/`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al eliminar assignment: ${error.message}`);
    }
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function getConceptListBySchoolId(schoolId: string, school_cycle: string, type?: ConceptTypesEnum[]) {
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
      page: 1,
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
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV_PLAYWRIGHT as Environment | undefined;

    if (envVar && envVar === 'local') {
      await page.goto(`${baseApiUrl}admin/payins/order/${orderId}/change/`);
    } else {
      await page.goto(`${baseApiUrl}cometa_admin/payins/order/${orderId}/change/`);
    }

    if (!logged) {
      await expect(page.getByLabel('Email address:')).toBeVisible();
      await page.getByLabel('Email address:').fill('automationadmin@getcometa.com');
      await page.getByLabel('Password:').fill('barriletecosmico');
      await page.getByRole('button', { name: 'Log in' }).click();
    }
    const element = page.locator('//*[@id="id_paid_orders_required_proxy_to"]').first();
    const text = await element.textContent();
    return !!text;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// STOCK MANAGEMENT FUNCTIONS
// ============================================================================

export async function apiSchoolsStockChangeLimitPartialUpdate(id: string, schoolId: string, is_limited: boolean) {
  const token = await getAdminToken();
  const data: PatchedChangeLimitRequest = {
    is_limited,
    observations: 'test automation',
  };
  const response = await ServiceClient.apiV1DashboardSchoolsStockChangeLimitPartialUpdate(id, schoolId, data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
}

export async function apiGetSchoolsOptionalConceptsOrdersList(conceptId: string, schoolId: string) {
  const token = await getAdminToken();

  const response = await ServiceClient.apiV1DashboardSchoolsOptionalConceptsOrdersList(
    conceptId,
    schoolId,
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return response.data;
}

export async function apiSchoolsStockUpdateQuantityPartialUpdate(
  conceptId: string,
  schoolId: string,
  quantity: number,
  action: UpdateQuantityRequestActionEnum
) {
  const token = await getAdminToken();
  const data: PatchedUpdateQuantityRequest = { action, quantity: quantity, observations: 'test automation' };
  const response = await ServiceClient.apiV1DashboardSchoolsStockUpdateQuantityPartialUpdate(
    conceptId,
    schoolId,
    data,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return response.data;
}
