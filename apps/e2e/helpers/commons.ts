import { Page, Locator, expect, ElementHandle } from '@playwright/test';
import { dataConfig } from '../data/data';
import { LoginPage } from '../pages/loginPage';
import axios, { AxiosRequestConfig } from 'axios';

type Environment = 'local' | 'stage' | 'dev';

export async function goto(page: Page): Promise<void> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV as Environment | undefined;

    if (envVar && envVar in dataConfig) {
      if (dataConfig[envVar].DASHBOARD_URL) {
        const dashboardUrl = dataConfig[envVar].DASHBOARD_URL;
        await page.goto(dashboardUrl);
        const pageNotFound = page.getByText('¡Disculpa, página no encontrada!');
        //ejecutando LocalHost algunas ocasiones tira error al cargar la pagina.
        if (await pageNotFound.isVisible()) {
          page.reload();
        }
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

export async function gotoPortal(page: Page, token: string): Promise<Page> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV as Environment | undefined;

    if (envVar && envVar in dataConfig) {
      if (dataConfig[envVar].PORTAL_URL) {
        const url = dataConfig[envVar].PORTAL_URL;
        await page.goto(url + token);
        return page;
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
  return page;
}

export async function gotoAdmin(page: Page, urlPath: string): Promise<void> {
  try {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = process.env.ENV as Environment | undefined;

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

export async function scrollToVisibleElement(page: Page, locator: Locator, maxAttemps = 30): Promise<void> {
  let count = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const element = locator;
    const isVisible = await element.isVisible();
    // eslint-disable-next-line no-console
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

export const delay = (ms: number | undefined) => new Promise((resolve) => setTimeout(resolve, ms));

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

export async function getGuardianToken(
  page: Page,
  guardianFirstName: string,
  guardianLastName: string,
  domain: string,
  logged = false
) {
  await gotoAdmin(page, `cometa_admin/students/guardian/?q=${guardianFirstName}+${guardianLastName}`);
  if (!logged) {
    await expect(page.getByLabel('Email address:')).toBeVisible();
    await page.getByLabel('Email address:').fill('admin@getcometa.com');
    await page.getByLabel('Password:').fill('spiritbreaker');
    await page.getByRole('button', { name: 'Log in' }).click();
  }
  await expect(page.getByRole('cell', { name: `${guardianLastName}${guardianFirstName}${domain}` })).toBeVisible();
  await page.locator('input[name="_selected_action"]').click();
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
  return token; // Devolver el valor de token como resultado de la función
}

export async function retryExpectWithScroll(
  page: Page,
  locator: string,
  expectedValue: string,
  maxRetries = 10,
  delayBetweenRetries = 1000
) {
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      const element = page.locator(locator).first();
      await element.scrollIntoViewIfNeeded();
      const textContent = await element.textContent();
      if (textContent === expectedValue) {
        // La aserción fue exitosa, terminamos la función.
        return;
      }
    } catch (error) {
      throw new Error(
        `No se pudo encontrar el texto ${expectedValue} después de ${maxRetries} intentos. + error ` + error
      );
    }

    // Esperamos un breve período de tiempo antes de reintentar.
    await page.waitForTimeout(delayBetweenRetries);
    await page.reload();
    await page.waitForLoadState();
  }
}

export async function retryExpectUntilElementIsHide(
  page: Page,
  expectedElement: Locator,
  maxRetries = 5,
  delayBetweenRetries = 500
) {
  for (let retry = 0; retry < maxRetries; retry++) {
    const expected = expectedElement;
    try {
      if (!(await expected.isVisible())) {
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        // Accede a las propiedades del objeto de error para obtener más detalles
        const errorMessage = `El elemento no se oculta luego de ${retry + 1} intentos. ${error.message}`;
        throw new Error(errorMessage);
      } else {
        // Si no es un objeto Error, simplemente lanza el error como está
        throw error;
      }
    }
    await page.waitForTimeout(delayBetweenRetries);
  }
}

export async function retryExpectBeforeElementClick(
  page: Page,
  expectedElement: Locator,
  clickElement: Locator,
  maxRetries = 5,
  delayBetweenRetries = 5000
) {
  for (let retry = 0; retry < maxRetries; retry++) {
    const element = clickElement;
    const expected = expectedElement;
    try {
      if (!(await expected.isVisible())) {
        await element.click();
      } else {
        // La aserción fue exitosa, terminamos la función.
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        // Accede a las propiedades del objeto de error para obtener más detalles
        const errorMessage = `Error luego de ${retry + 1} intentos. ${error.message}`;
        throw new Error(errorMessage);
      } else {
        // Si no es un objeto Error, simplemente lanza el error como está
        throw error;
      }
    }
    await page.waitForTimeout(delayBetweenRetries);
  }
}

export async function findTCSubstring(input: string) {
  const regex = /TC-[^\s]{1,10}/i;
  const match = input.match(regex);
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const envVar = process.env.ENV;
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

export async function realizarTransicionIssue(jiraIssueKey: string) {
  try {
    const url = `https://cometa.atlassian.net/rest/api/3/issue/${jiraIssueKey}/transitions`;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization:
        'Basic Z2FicmllbC5uaWNvcmFAZ2V0Y29tZXRhLmNvbTpBVEFUVDN4RmZHRjBoMzJGc0JfWDZqMnZ1dHVqWFBHblF0NWl3Tm4yenB1Qk9mOGJqbnZFNU4ySU9JWWE3OEtOUDNfeU1rSjRhRlJsOEZOYjdVZzNEakdBaGRHWGpQcHNDWlJBdmNjbnlVQ0x2THVrdl93bUo1b29yOUpnRGdTbklDbWNuTlViM2dKRW03cXRfTzRReHVVX3paSGpjR3BKd3RRVmtlZHc2TERXOVNiaXlldWJCVFE9RTFCREM3MDc=',
    };

    const payload = {
      transition: {
        id: '31',
      },
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: url,
      headers: headers,
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
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization:
        'Basic Z2FicmllbC5uaWNvcmFAZ2V0Y29tZXRhLmNvbTpBVEFUVDN4RmZHRjBoMzJGc0JfWDZqMnZ1dHVqWFBHblF0NWl3Tm4yenB1Qk9mOGJqbnZFNU4ySU9JWWE3OEtOUDNfeU1rSjRhRlJsOEZOYjdVZzNEakdBaGRHWGpQcHNDWlJBdmNjbnlVQ0x2THVrdl93bUo1b29yOUpnRGdTbklDbWNuTlViM2dKRW03cXRfTzRReHVVX3paSGpjR3BKd3RRVmtlZHc2TERXOVNiaXlldWJCVFE9RTFCREM3MDc=',
    };

    const data = {
      update: {
        labels: [
          {
            add: label,
          },
        ],
      },
    };

    const requestOptions: AxiosRequestConfig = {
      method: 'put',
      url: url,
      headers: headers,
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
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization:
        'Basic Z2FicmllbC5uaWNvcmFAZ2V0Y29tZXRhLmNvbTpBVEFUVDN4RmZHRjBoMzJGc0JfWDZqMnZ1dHVqWFBHblF0NWl3Tm4yenB1Qk9mOGJqbnZFNU4ySU9JWWE3OEtOUDNfeU1rSjRhRlJsOEZOYjdVZzNEakdBaGRHWGpQcHNDWlJBdmNjbnlVQ0x2THVrdl93bUo1b29yOUpnRGdTbklDbWNuTlViM2dKRW03cXRfTzRReHVVX3paSGpjR3BKd3RRVmtlZHc2TERXOVNiaXlldWJCVFE9RTFCREM3MDc=',
    };

    const data = {
      body: {
        content: [
          {
            content: [
              {
                text: `${comment}`,
                type: 'text',
              },
            ],
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
      headers: headers,
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

export async function waitForDashboardNavSidePanelIsLoaded(page: LoginPage) {
  await expect(page.navSidePanelList).toHaveText(
    [`Cobranzas`, `Morosidad`, `Pagos recibidos`, `Ingresos`, `Estudiantes`, `Conceptos`],
    { timeout: 15000 }
  );
}

export async function closeHelperTourMessages(page: Page, maxRetries = 5) {
  for (let retry = 0; retry < maxRetries; retry++) {
    const element = page.getByLabel('Last');
    try {
      const isEnabled = await element.isEnabled({ timeout: 5000 });
      if (isEnabled) {
        await element.click();
      } else {
        // La aserción fue exitosa, terminamos la función.
        break; // Sale del bucle si isEnabled es false
      }
    } catch (error) {
      // Manejar cualquier error que ocurra al verificar la visibilidad del elemento
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
  const envVar = process.env.ENV as Environment | undefined;

  if (envVar && envVar in dataConfig) {
    if (dataConfig[envVar].ADMIN_URL) {
      const adminUrl = dataConfig[envVar].ADMIN_URL;

      await page.goto(`${adminUrl}cometa_admin/login/?next=/cometa_admin/features/portalfeaturetoggle/`);
    }
  }
  if (!logged) {
    await expect(page.getByLabel('Email address:')).toBeVisible();
    await page.getByLabel('Email address:').fill('admin@getcometa.com');
    await page.getByLabel('Password:').fill('spiritbreaker');
    await page.getByRole('button', { name: 'Log in' }).click();
  }
  await page.getByRole('link', { name: 'Portal feature toggles' }).click();
  await page.getByRole('link', { name: 'MERCADO_PAGO_CREDIT_CARD' }).click();
  await page.getByRole('searchbox').click();
  await page.getByRole('searchbox').fill(`${guardianFirstName} ${guardianLastName}`);
  await page.getByRole('option', { name: `${guardianFirstName} ${guardianLastName}` }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByText('The portal feature toggle “MERCADO_PAGO_CREDIT_CARD (Beta)” was changed succes')
  ).toBeVisible({ timeout: 3000 });
}

export async function dashboardLogin(loginPage: LoginPage, school: string, user: string, pass: string) {
  try {
    if (await loginPage.emailTxt.isEnabled({ timeout: 1000 })) {
      // La aserción fue exitosa, completamos el inicio de sesión
      await loginPage.emailTxt.click();
      await loginPage.emailTxt.fill(`${user}`);
      await loginPage.pass.click();
      await loginPage.pass.fill(`${pass}`);
      await loginPage.pass.press('Enter');

      // Esperar a que el botón de ingresos esté habilitado
      await expect(loginPage.incomeBtn).toBeEnabled({ timeout: 60000 });

      // Verificar la escuela actual
      const currentSchool = await loginPage.schoolBtn.textContent();

      // Si la escuela actual no coincide con la escuela proporcionada, seleccionar la escuela
      if (currentSchool !== school) {
        await loginPage.schoolBtn.click();
        await loginPage.page.getByTestId(`${school}-option`).click();
      }
    }
  } catch (error) {
    // Refactorizar para enviar mensaje correcto
    // eslint-disable-next-line no-console
    console.error('Se evita el login del dashboard al reingresar a la sitio en el mismo script de prueba');
  }
}

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

  // Verifica si todos los 'ordersId' existen en 'firstColumnTexts'
  const missingOrders = ordersId.filter((orderId) => !firstColumnTexts.includes(orderId));
  return missingOrders;
}

export async function closeVercelCommentsIFrame(page: Page) {
  const frameVercel = page.frame({ url: 'https://vercel.live/_next-live/feedback/feedback.html' });
  if (frameVercel) {
    await page.locator('css=vercel-live-feedback').evaluate((iframe) => iframe.remove());
  }
}
