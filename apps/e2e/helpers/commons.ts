import test, { Page, Locator, expect, ElementHandle, Response } from '@playwright/test';
import { dataConfig } from '../data/data';
import { LoginPage } from '../pages/dashboard/loginPage';
import axios, { AxiosRequestConfig } from 'axios';
import * as excel from 'exceljs';
import { GuardianHomePage } from '/pages/portal/guardianHomePage';
import { WelcomePage } from '/pages/portal/welcomePage';

// Re-export from centralized modules for backward compatibility
export { getAdminToken, ServiceClient, baseApiUrl, api, getAuthHeaders, getUrls, getEnvironment } from './apiClient';
export {
  delay,
  retry,
  waitForElementVisible,
  waitForElementHidden,
  clickUntilVisible,
  waitForTextWithScroll,
  scrollToElement,
  retryUntil,
} from './retryUtils';

type Environment = 'local' | 'stage' | 'dev';

// ============================================================================
// NAVIGATION FUNCTIONS
// ============================================================================

export async function goto(page: Page): Promise<void> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV_PLAYWRIGHT as Environment;

    const vercelUrlWithQuotes: string | undefined = process.env.DASHBOARD_BASE_URL;
    let vercel_url: string | undefined;

    if (vercelUrlWithQuotes) {
      vercel_url = vercelUrlWithQuotes.replace(/["=]/g, '');
    }

    if (!vercel_url) {
      if (envVar && envVar in dataConfig && dataConfig[envVar].DASHBOARD_URL) {
        const dashboardUrl = dataConfig[envVar].DASHBOARD_URL;
        await page.goto(dashboardUrl);

        const pageNotFound = page.getByText('¡Disculpa, página no encontrada!');
        if (await pageNotFound.isVisible()) {
          page.reload();
        }
      } else {
        throw new Error(`No se encontró una configuración válida para el entorno "${envVar}".`);
      }
    } else {
      await page.goto('https://' + vercel_url);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error desconocido en la función goto.');
    }
  }
}

export async function gotoPortal(page: Page, token: string): Promise<Page> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV_PLAYWRIGHT as Environment | undefined;
    const vercelUrlWithQuotes: string | undefined = process.env.PORTAL_BASE_URL;

    const vercel_url = vercelUrlWithQuotes?.replace(/["=]/g, '');

    const url = vercel_url
      ? `https://${vercel_url}${token}`
      : envVar && envVar in dataConfig && dataConfig[envVar].PORTAL_URL
      ? `${dataConfig[envVar].PORTAL_URL}${token}`
      : undefined;

    if (!url) {
      throw new Error(`No se encontró una configuración válida para portal en el entorno "${envVar}".`);
    }

    await page.goto(url);
    await page.waitForResponse(/\/terms\?.+/);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error desconocido');
  }

  return page;
}

export async function gotoAdmin(page: Page, urlPath: string): Promise<void> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV_PLAYWRIGHT as Environment | undefined;

    if (envVar && envVar in dataConfig) {
      if (dataConfig[envVar].ADMIN_URL) {
        const url = dataConfig[envVar].ADMIN_URL;
        await page.goto(url + urlPath);
      } else {
        throw new Error(`No se encontró una configuración válida para la clave DASHBOARD_URL.`);
      }
    } else {
      throw new Error(`No se encontró una configuración válida para el entorno "${envVar}".`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}

// ============================================================================
// SCROLL AND ELEMENT UTILITIES
// ============================================================================

export async function scrollToVisibleElement(page: Page, locator: Locator, maxAttemps = 30): Promise<void> {
  let count = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const element = locator;
    const isVisible = await element.isVisible();
    if (isVisible) {
      break;
    } else {
      await page.mouse.wheel(0, 10000);
      count++;
    }
    if (count === maxAttemps) {
      throw new Error('Elemento no encontrado');
    }
    await page.waitForTimeout(1000);
  }
}

// ============================================================================
// CURP GENERATION
// ============================================================================

export async function generarCURP(apellidoPaterno: string, apellidoMaterno: string, nombre: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const curp = require('curp');
  const persona = curp.getPersona();
  persona.nombre = nombre;
  persona.apellidoPaterno = apellidoPaterno;
  persona.apellidoMaterno = apellidoMaterno;
  persona.genero = curp.GENERO.MASCULINO;
  persona.fechaNacimiento = '13-11-2010';
  persona.estado = curp.ESTADO.TABASCO;
  let cadena = curp.generar(persona);
  if (cadena.includes("'")) {
    cadena = curp.generar(persona);
  }
  return curp.generar(persona);
}

// ============================================================================
// GUARDIAN TOKEN AND AUTH
// ============================================================================

export async function getGuardianToken(
  page: Page,
  guardianFirstName: string,
  guardianLastName: string,
  domain: string,
  logged = false,
  email?: string
) {
  let tutorEmail: string;

  if (email) {
    tutorEmail = email;
  } else {
    tutorEmail = `${guardianFirstName}${guardianLastName}${domain}`;
  }
  if (process.env.ENV_PLAYWRIGHT == 'local') {
    await gotoAdmin(page, `admin/students/guardian/?q=${guardianFirstName}+${guardianLastName}`);
  } else {
    await gotoAdmin(page, `cometa_admin/students/guardian/?q=${guardianFirstName}+${guardianLastName}`);
  }
  if (!logged) {
    await expect(page.getByLabel('Email address:')).toBeVisible();
    await page.getByLabel('Email address:').fill('automationadmin@getcometa.com');
    await page.getByLabel('Password:').fill('barriletecosmico');
    await page.getByRole('button', { name: 'Log in' }).click();
  }
  await expect(page.getByRole('cell', { name: tutorEmail })).toBeVisible();
  await page
    .getByRole('row', { name: new RegExp(tutorEmail, 'i') })
    .locator('input[name="_selected_action"]')
    .first()
    .click();
  await page
    .getByLabel(
      'Action: \n  ---------\n\n  Delete selected guardians\n\n  Reset Onboarding\n\n  Validate Billing\n\n  Send 1st onboard message\n\n  Send 2.1 onboard message to guardians\n\n  Send 2.2 onboard message to guardians\n\n  Send 3rd onboard message\n\n  Send 4th onboard message\n\n  Send Guardian portal url whatsapp\n\n  Generate Auth URL'
    )
    .selectOption('generate_auth_url');
  await page.getByRole('button', { name: 'Go' }).click();
  await expect(page.getByText(/^Auth url for.+$/)).toBeVisible({
    timeout: 10000,
  });
  const cadena = page.getByText(/^Auth url for.+$/);
  const id = await cadena.textContent();
  let token = '';
  if (id) {
    const indiceCaracter = id.indexOf(':');
    if (indiceCaracter !== -1) {
      token = id.substring(indiceCaracter + 1).trim();
    }
  }
  return token;
}

// ============================================================================
// LEGACY RETRY FUNCTIONS - Deprecated, use retryUtils.ts instead
// These are kept for backward compatibility but delegate to new functions
// ============================================================================

import {
  delay as _delay,
  waitForElementVisible as newWaitForElementVisible,
  waitForElementHidden as newWaitForElementHidden,
  clickUntilVisible as newClickUntilVisible,
  waitForTextWithScroll as newWaitForTextWithScroll,
} from './retryUtils';

/** @deprecated Use waitForTextWithScroll from retryUtils instead */
export async function retryExpectWithScroll(
  page: Page,
  locator: string,
  expectedValue: string,
  maxRetries = 10,
  delayBetweenRetries = 1000
) {
  return newWaitForTextWithScroll(page, locator, expectedValue, { maxRetries, delayBetweenRetries });
}

/** @deprecated Use waitForElementVisible from retryUtils instead */
export async function retryElementIsVisible(page: Page, locator: Locator, maxRetries = 5, delayBetweenRetries = 2000) {
  return newWaitForElementVisible(page, locator, { maxRetries, delayBetweenRetries, reloadOnRetry: true });
}

/** @deprecated Use waitForElementHidden from retryUtils instead */
export async function retryExpectUntilElementIsHide(
  page: Page,
  expectedElement: Locator,
  maxRetries = 5,
  delayBetweenRetries = 500
) {
  return newWaitForElementHidden(page, expectedElement, { maxRetries, delayBetweenRetries });
}

/** @deprecated Use clickUntilVisible from retryUtils instead */
export async function retryExpectBeforeElementClick(
  page: Page,
  expectedElement: Locator,
  clickElement: Locator,
  maxRetries = 5,
  delayBetweenRetries = 5000
) {
  return newClickUntilVisible(page, clickElement, expectedElement, { maxRetries, delayBetweenRetries });
}

// ============================================================================
// JIRA INTEGRATION
// ============================================================================

export async function findTCSubstring(input: string) {
  const regex = /TC-[^\s]{1,10}/i;
  const match = input.match(regex);
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const envVar = process.env.ENV_PLAYWRIGHT;
  if (envVar && envVar !== 'local') {
    if (match) {
      return match[0].replace('TC-', '');
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// Jira API configuration
// TODO: Move to environment variables in the future
const JIRA_AUTH =
  'Basic Z2FicmllbC5uaWNvcmFAZ2V0Y29tZXRhLmNvbTpBVEFUVDN4RmZHRjBoMzJGc0JfWDZqMnZ1dHVqWFBHblF0NWl3Tm4yenB1Qk9mOGJqbnZFNU4ySU9JWWE3OEtOUDNfeU1rSjRhRlJsOEZOYjdVZzNEakdBaGRHWGpQcHNDWlJBdmNjbnlVQ0x2THVrdl93bUo1b29yOUpnRGdTbklDbWNuTlViM2dKRW03cXRfTzRReHVVX3paSGpjR3BKd3RRVmtlZHc2TERXOVNiaXlldWJCVFE9RTFCREM3MDc=';

const jiraHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: JIRA_AUTH,
};

export async function realizarTransicionIssue(jiraIssueKey: string) {
  try {
    const url = `https://cometa.atlassian.net/rest/api/3/issue/${jiraIssueKey}/transitions`;
    const payload = { transition: { id: '31' } };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: url,
      headers: jiraHeaders,
      data: payload,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(payload)}, URL: ${url}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al transicionar issue : ${error.message}`);
    }
  }
}

export async function addLabelJiraIssue(jiraIssueKey: string, label: string) {
  try {
    const url = `https://cometa.atlassian.net/rest/api/3/issue/${jiraIssueKey}`;
    const data = {
      update: {
        labels: [{ add: label }],
      },
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'put',
      url: url,
      headers: jiraHeaders,
      data: data,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(data)}, URL: ${url}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al agregar label a issue : ${error.message}`);
    }
  }
}

export async function addCommentToJiraIssue(jiraIssueKey: string, comment: string) {
  try {
    const url = `https://cometa.atlassian.net/rest/api/3/issue/${jiraIssueKey}/comment`;
    const data = {
      body: {
        content: [
          {
            content: [{ text: `${comment}`, type: 'text' }],
            type: 'paragraph',
          },
        ],
        type: 'doc',
        version: 1,
      },
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: url,
      headers: jiraHeaders,
      data: data,
    };

    const response = await axios(requestOptions);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`Status code: ${response.status}, Payload: ${JSON.stringify(data)}, URL: ${url}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al comentar jira issue : ${error.message}`);
    }
  }
}

// ============================================================================
// DASHBOARD HELPERS
// ============================================================================

export async function waitForDashboardNavSidePanelIsLoaded(page: LoginPage) {
  await expect(page.navSidePanelList).toHaveText(
    [`Cobranzas`, `Morosidad`, `Pagos y Facturas`, `Ingresos`, `Estudiantes`, `Conceptos`],
    { timeout: 15000 }
  );
}

export async function closeHelperTourMessages(page: Page, maxRetries = 5) {
  for (let retry = 0; retry < maxRetries; retry++) {
    const element = page.getByLabel('Last');
    try {
      const isEnabled = await element.isEnabled({ timeout: 1000 });
      if (isEnabled) {
        await element.click();
      } else {
        break;
      }
    } catch (error) {
      // Element not found, continue
    }
  }
}

export async function setGuardianAsMercadoPagoBetaTester(
  page: Page,
  guardianFirstName: string,
  guardianLastName: string,
  logged = false
) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const envVar = process.env.ENV_PLAYWRIGHT as Environment | undefined;

  if (envVar && envVar in dataConfig) {
    if (dataConfig[envVar].ADMIN_URL) {
      const adminUrl = dataConfig[envVar].ADMIN_URL;
      await page.goto(`${adminUrl}cometa_admin/login/?next=/cometa_admin/features/portalfeaturetoggle/`);
    }
  }
  if (!logged) {
    await expect(page.getByLabel('Email address:')).toBeVisible();
    await page.getByLabel('Email address:').fill('automationadmin@getcometa.com');
    await page.getByLabel('Password:').fill('barriletecosmico');
    await page.getByRole('button', { name: 'Log in' }).click();
  }
  await page.getByRole('link', { name: 'Portal feature toggles' }).click();
  await page.getByRole('link', { name: 'MERCADO_PAGO_CREDIT_CARD' }).click();
  await page.getByLabel('Status:').click();
  await page.getByLabel('Status:').selectOption('BETA');
  await page.getByRole('searchbox').click();
  await page.getByRole('searchbox').fill(`${guardianFirstName} ${guardianLastName}`);
  await page.getByRole('option', { name: `${guardianFirstName} ${guardianLastName}` }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByText('The portal feature toggle "MERCADO_PAGO_CREDIT_CARD (Beta)" was changed succes')
  ).toBeVisible({ timeout: 3000 });
}

export async function dashboardLogin(loginPage: LoginPage, school: string, user: string, pass: string) {
  try {
    if (await loginPage.emailTxt.isEnabled({ timeout: 1000 })) {
      await loginPage.emailTxt.click();
      await loginPage.emailTxt.fill(`${user}`);
      await loginPage.pass.click();
      await loginPage.pass.fill(`${pass}`);
      await loginPage.pass.press('Enter');

      await expect(loginPage.incomeBtn).toBeEnabled({ timeout: 60000 });

      const currentSchool = await loginPage.schoolBtn.textContent();

      if (currentSchool !== school) {
        await loginPage.schoolBtn.click();
        await loginPage.page.getByTestId(`${school}-option`).click();
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Se evita el login del dashboard al reingresar a la sitio en el mismo script de prueba');
  }
}

// ============================================================================
// TABLE AND DATA UTILITIES
// ============================================================================

export async function checkIfDataExistIntoXColumnOfTable(rows: ElementHandle[], ordersId: string[]) {
  const columnIdx = 0;

  const firstColumnTexts = await Promise.all(
    rows.map(async (row) => {
      const columns = await row.$$('td');
      if (columns.length > columnIdx) {
        const text = await columns[columnIdx].textContent();
        return text ? text.trim() : '';
      }
      return '';
    })
  );

  const missingOrders = ordersId.filter((orderId) => !firstColumnTexts.includes(orderId));
  return missingOrders;
}

export async function closeVercelCommentsIFrame(page: Page) {
  const frameVercel = page.frame({ url: 'https://vercel.live/_next-live/feedback/feedback.html' });
  if (frameVercel) {
    await page.locator('css=vercel-live-feedback').evaluate((iframe) => iframe.remove());
  }
}

export async function selectMonthOnCalendarPicker(
  page: Page,
  expectedMonth: Locator,
  maxRetries = 10,
  delayBetweenRetries = 1000
) {
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      const element = await expectedMonth.isVisible();
      if (!element) {
        await page.getByTestId('previusMonth-button').click();
      } else {
        return;
      }
    } catch (error) {
      throw new Error(`No se pudo encontrar el texto` + error);
    }
    await page.waitForTimeout(delayBetweenRetries);
  }
}

// ============================================================================
// EXCEL UTILITIES
// ============================================================================

export async function obtenerCeldasFila1ConValor(
  archivo: string,
  nombreHoja: string,
  filaHeader = 1
): Promise<string[]> {
  const workbook = new excel.Workbook();
  await workbook.xlsx.readFile(archivo);
  const worksheet = workbook.getWorksheet(nombreHoja);

  const celdasFila1ConValor: string[] = [];

  if (worksheet) {
    worksheet.getRow(filaHeader).eachCell((cell) => {
      const valor = cell.value;
      if (valor !== undefined && valor !== null && valor !== '') {
        celdasFila1ConValor.push(valor.toString());
      }
    });
  }

  return celdasFila1ConValor;
}

// ============================================================================
// SCHOOL DATA FUNCTIONS - Using centralized apiClient
// ============================================================================

import { getAdminToken as getToken, baseApiUrl, ServiceClient as Client } from './apiClient';

export async function getSchoolIdByName(schoolName: string) {
  const token = await getToken();
  try {
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: `${baseApiUrl}api/v1/dashboard/schools/`,
      headers: headers,
    };

    const response = await axios(requestOptions);
    const school = response.data.find((school: { name: string }) => school.name === schoolName);

    if (!school) {
      throw new Error(`No se encontró la escuela con el nombre ${schoolName}`);
    }

    return school.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error al obtener el ID de la escuela o usuario automationAdmin no tiene permisos para esa school: ${error.message}`
      );
    }
  }
}

export async function getBankAccountBySchoolName(schoolName: string) {
  const token = await getToken();
  const school_id = await getSchoolIdByName(schoolName);

  try {
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: `${baseApiUrl}api/v1/dashboard/schools/${school_id}/bank_accounts/`,
      headers: headers,
    };

    const response = await axios(requestOptions);

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`No se encontraron cuentas bancarias para la escuela ${schoolName}`);
    }

    const bankAccount = response.data.results[0];

    if (!bankAccount) {
      throw new Error(`No se encontraron cuentas bancarias para la escuela ${schoolName}.`);
    }

    return {
      id: bankAccount.id,
      bankName: bankAccount.bank_name,
      publicSummary: bankAccount.public_summary,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error al obtener la información de la escuela ${schoolName}: ${error.response?.status} - ${error.response?.statusText}`
      );
    }
    throw error;
  }
}

export async function getFiscalEntityBySchoolId(schoolId: string) {
  const token = await getToken();
  try {
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: `${baseApiUrl}api/v1/dashboard/schools/${schoolId}/fiscal_entities/`,
      headers: headers,
    };

    const response = await axios(requestOptions);
    const id = response.data[0].id;

    if (!id) {
      throw new Error(`No se encontró ninguna entidad para esa escuela escuela con el nombre ${schoolId}`);
    }

    return id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener la información de la escuela: ${error.message}`);
    }
  }
}

export async function getActiveSchoolCycleBySchoolId(schoolId: string, is_active?: boolean) {
  const token = await getToken();
  const data = await Client.apiV1DashboardSchoolsCyclesList(
    schoolId,
    {
      is_active: is_active || true,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return data.data;
}

export async function getLevelIdBySchoolId(schoolId: string, levelName?: string) {
  const token = await getToken();
  try {
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: `${baseApiUrl}api/v1/dashboard/schools/${schoolId}/levels/`,
      headers: headers,
    };

    const response = await axios(requestOptions);

    let level = [];
    if (levelName) {
      level = response.data.find((level: { name: string }) => level.name === levelName);
    } else {
      level = response.data[0];
    }

    if (!level) {
      throw new Error(`No se encontró ninguna entidad LEVEL para esta escuela ${schoolId}`);
    }

    return level.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener la información de la escuela: ${error.message}`);
    }
  }
}

export async function getSectionIdBySchoolId(schoolId: string, levelId: string) {
  const token = await getToken();
  try {
    const headers = {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'get',
      url: `${baseApiUrl}api/v1/dashboard/schools/${schoolId}/sections/`,
      headers: headers,
    };

    const response = await axios(requestOptions);

    const sections = response.data.find((section: { name: string; level: string }) => section.level === levelId);

    if (!sections) {
      throw new Error(`No se encontró ninguna entidad LEVEL para esta escuela ${schoolId}`);
    }

    return sections.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al obtener la información de la escuela: ${error.message}`);
    }
  }
}

// ============================================================================
// PHONE UTILITIES
// ============================================================================

export async function sliceAreaCodeFromPhoneNumber(phone: string) {
  const regex = /^\+(..)/;
  const match = phone.match(regex);

  if (match) {
    return phone.slice(3);
  }

  return phone;
}

// ============================================================================
// PAYMENT VALIDATION
// ============================================================================

export async function validateRegisterPaymentError(element: Locator, payin: Response) {
  for (let retry = 0; retry < 5; retry++) {
    try {
      const isVisible = await element.isVisible({ timeout: 1000 });
      if (isVisible) {
        const payinJson = await payin.json();
        test.info().annotations.push({
          type: 'Error al registrar pago',
          description: JSON.stringify(payinJson, null, 2),
        });
        break;
      }
    } catch (error) {
      // Element not visible, continue
    }
  }
}

// ============================================================================
// PORTAL HELPERS
// ============================================================================

export async function closePortalTour(homePage: GuardianHomePage) {
  const menuTour = homePage.page.locator('[data-test-id="spotlight"]');
  if (await menuTour.isVisible()) {
    await homePage.joyrideTooltip.getByTestId('btn-joyrdide-understood').click();
  }

  const pagosVencidos = homePage.page.getByRole('heading', { name: '¡Tienes pagos vencidos!' });

  if (await pagosVencidos.isVisible()) {
    await homePage.page.getByRole('button', { name: 'Por ahora no' }).click();
  }
}

export async function completeOnboardingNewGuardian(page: Page, schoolName: string) {
  const welcomePage = new WelcomePage(page);
  await page.getByText(schoolName).isVisible();
  await welcomePage.tAndC.click({ timeout: 10000 });

  await welcomePage.beginBtn.click();
  await page.getByText('Complete datos del tutor').isVisible();
  await welcomePage.continueBtn.click();
  await page.getByText('Datos de los estudiantes').isVisible();
  await welcomePage.continueBtn.click();
  await welcomePage.notByNowBtn.click();
  await page.getByText('¡Ya estas listo para realizar tu primer pago!').isVisible();
  await welcomePage.startBtn.click({ timeout: 10000 });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateEmail(firstName: string, lastName: string, domain = '@getcometa.com') {
  return `${firstName}${lastName}${domain}`.toLowerCase();
}

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 30000,
  LONG: 100000,
} as const;

export function generateRandom10DigitNumber(): string {
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}
