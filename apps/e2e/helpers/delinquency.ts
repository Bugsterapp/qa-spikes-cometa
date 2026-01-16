import { getAdminToken } from './commons';
import { Api } from '@cometa/trpc/src/types';
import { dataConfig } from '../data/data';
import { Page, expect } from '@playwright/test';
import { DelinquencyPage } from '../pages/dashboard/delinquencyPage';

type Environment = 'local' | 'stage' | 'dev';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const envVar = process.env.ENV_PLAYWRIGHT as Environment;
const url = dataConfig[envVar].ADMIN_URL || 'https://api-cometa.dev.getcometa.com/';
const baseUrl = url.substring(0, url.length - 1);
const ServiceClient = new Api({ baseUrl: baseUrl }).api;

export interface DelinquencyParams {
  concepts?: string[];
  end_date?: string;
  start_date?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export async function getDelinquentStudents(schoolId: string, params: DelinquencyParams = {}) {
  const token = await getAdminToken();
  const defaultParams = {
    concepts: [],
    page: 1,
    page_size: 100,
    is_active: true,
    ...params,
  };

  const data = await ServiceClient.apiV1DashboardSchoolsDelinquencyStudentsList(schoolId, defaultParams, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return data.data;
}

export const FILTER_STATES = {
  INITIAL: '',
  ALL: 'Todos',
} as const;

export async function waitForDelinquencyResponses(page: Page) {
  // Esperar la respuesta inicial que carga la configuración
  const response = await page.waitForResponse(
    /\/api\/trpc\/students\.getTableConfig,delinquency\.retrieveInvoiceReportColumns,delinquency\.getDelinquencyFilters,delinquency\.getDelinquency+/
  );
  const jsonResponse = await response.json();

  // Obtener la configuración de filtros de la respuesta
  const selectedItems = jsonResponse?.[0]?.result?.data?.json?.[0]?.filters_config?.selected_items || [];
  return selectedItems;
}

export async function applyConceptFilter(
  page: Page,
  delinquencyPage: DelinquencyPage,
  initialFilters: any[],
  conceptType: string
) {
  // Caso 1: Si solo está seleccionado el concepto deseado
  const hasOnlyConcept = initialFilters.length === 1 && initialFilters[0]?.value === conceptType;

  if (hasOnlyConcept) {
    await page.waitForResponse(/\/api\/trpc\/delinquency\.getDelinquency+/);
    return;
  }

  // Abrir el combobox para todas las demás operaciones
  await delinquencyPage.conceptTypeDropBtn.click();
  await page.waitForSelector('[role="listbox"]', { state: 'visible' });

  // Caso 2: Si no hay filtros seleccionados
  if (initialFilters.length === 0) {
    await page.getByTestId(`${conceptType}-listOption`).click();
  }
  // Caso 3: Si están todos los filtros seleccionados (TODOS)
  else if (initialFilters.length === 8) {
    await delinquencyPage.selectAllBtn.click();
    await page.waitForTimeout(500);
    await page.getByTestId(`${conceptType}-listOption`).click();
  }
  // Caso 4: Cualquier otra combinación de filtros
  else {
    await delinquencyPage.selectAllBtn.click();
    await page.waitForTimeout(500);
    await page.getByTestId(`${conceptType}-listOption`).click();
  }

  // Cerrar el combobox
  await delinquencyPage.conceptTypeDropBtn.click();

  // Esperar la respuesta de la API
  await page.waitForResponse(/\/api\/trpc\/delinquency\.getDelinquency+/);
}

export async function verifyDelinquencyResults(
  page: Page,
  delinquencyPage: DelinquencyPage,
  expectedCount: number,
  expectedStudentName: string
) {
  await expect(page.getByText(expectedStudentName)).toBeVisible();
  const delinquentsNum = await delinquencyPage.footerTotalStudentsTxt.textContent();

  if (!delinquentsNum) {
    throw new Error('No se obtuvo el número de morosos. Probablemente no hay alumnos o no respondió a tiempo la api.');
  }

  expect(parseInt(delinquentsNum)).toEqual(expectedCount);
}
