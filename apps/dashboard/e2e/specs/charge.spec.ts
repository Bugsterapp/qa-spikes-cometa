/* eslint-disable no-console */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import {
  dashboardLogin,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getSchoolIdByName,
  goto,
  obtenerCeldasFila1ConValor,
} from '../../../e2e/helpers/commons';
import { ChargePage } from '../../../e2e/pages/chargePage';
import { promises as fsPromises } from 'fs';

import { user1, xlsResumenCobranzas } from '../../../e2e/data/data';
import { CollectionsGraphic, CollectionsTable } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import { createConcept, deleteConceptByApi } from '../../../e2e/helpers/concepts';

test('Empty state grafico de cobranzas para un concepto sin alumnos asignados @sanity @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  const chargePage = new ChargePage(page);
  await chargePage.multipleSelectorBtn.click();
  await page.getByText('Seleccionar todo').click({ timeout: 4000 });
  await page.getByTestId('Colegiatura Secundaria-listOption').click({ timeout: 4000 });
  await chargePage.multipleSelectorBtn.click();
  await page.waitForResponse(
    /\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/graphic\/\?school_cycle=[a-f0-9-]+&concepts=[a-f0-9-]+/
  );
  await expect(page.locator('.flex-col [role="progressbar"]')).toHaveCount(10, { timeout: 10000 });
});

test('Copy columna de mes específico en el gráfico de cobranzas para un concepto con alumnos asignados se carga con datos correctos @e2e @sanity', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });

  const chargePage = new ChargePage(page);
  const response = await page.waitForResponse(
    /\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/graphic\/\?school_cycle=[a-f0-9-]+&concepts=[a-f0-9-]+/
  );
  const jsonResponse: CollectionsGraphic[] = await response.json();
  await expect(page.locator('.flex-col [role="progressbar"]')).toHaveCount(jsonResponse.length, { timeout: 10000 });

  for (const data of jsonResponse) {
    const { value: onTimeValue, percentage: onTimePercentage } = data.on_time_students;
    const { value: delinquentValue, percentage: delinquentPercentage } = data.delinquent_students;
    const { month, year } = data.period;

    await page.getByTestId(`${month}-${year}-column`).hover({ timeout: 15000 });
    //await expect(page.locator('.flex-col [role="progressbar"]')).toHaveCount(10);
    await expect(chargePage.delinquentsCountTxt.first()).toHaveText(`${delinquentValue}`);
    await expect(chargePage.onTimeCountTxt.first()).toHaveText(`${onTimeValue}`);
    await expect(chargePage.onTimePercentageTxt.first()).toHaveText(`${onTimePercentage}%`);
    await expect(chargePage.delinquentsPercentageTxt.first()).toHaveText(`${delinquentPercentage}%`);
  }
});

test('Se carga tabla de cobranzas para un concepto con alumnos asignados @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });

  //const chargePage = new ChargePage(page);

  const response = await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  const jsonResponse: CollectionsTable = await response.json();

  // Verificar que la respuesta tiene un array 'results'
  if (jsonResponse.results.length === 0) {
    // Si el array 'results' está vacío, el estado está vacío
    await expect(page.getByText('No hay alummos')).toBeVisible();
  } else {
    // Si hay elementos en el array 'results', verificar su contenido
    for (const data of jsonResponse.results) {
      const { first_name, last_name, level, section } = data;
      await expect(page.getByTestId(`${first_name}-${last_name}-delinquentStudent-card`)).toHaveText(
        `${first_name} ${last_name}${level} - ${section}`
      );
    }
  }
});

test('Empty state tabla de cobranzas para un concepto sin alumnos asignados @e2e', async ({ page }) => {
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const conceptId = await createConcept(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount?.id,
    schoolID
  );
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  const chargePage = new ChargePage(page);
  await page.waitForResponse(
    /\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/graphic\/\?school_cycle=[a-f0-9-]+&concepts=[a-f0-9-]+/
  );
  await chargePage.multipleSelectorBtn.click();
  await page.getByText('Seleccionar todo').click({ timeout: 4000 });
  await page.getByTestId(`${conceptName}-listOption`).click({ timeout: 4000 });
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await chargePage.multipleSelectorBtn.click();
  await expect(chargePage.tableEmptyStateCpy).toBeVisible({ timeout: 10000 });
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario Seleciona un mes de la tabla y se actualizan los mororos del mes @e2e', async ({ page }) => {
  const schoolName = 'School GVS';
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  const chargePage = new ChargePage(page);
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await chargePage.multipleSelectorBtn.click();
  await chargePage.tableMonthsSelectorBtn.click();
  await page.getByTestId('Septiembre 2023-option').click();
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await expect(page.getByRole('button', { name: 'Septiembre' })).toHaveText('Septiembre 2023');
});

test('Usuario selecciona un mes en el grafico y se actualizan el grafico y la tabla de morosos @e2e', async ({
  page,
}) => {
  const schoolName = 'School GVS';
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await page.getByTestId('10-2023-column').click();
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await expect(page.getByRole('button', { name: 'Octubre' })).toHaveText('Octubre 2023');
});

test('Boton Descarga reporte no se habilita si no hay alumnnos con deuda @e2e', async ({ page }) => {
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName('School GVS');
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const conceptId = await createConcept(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount?.id,
    schoolID
  );
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  const chargePage = new ChargePage(page);
  await page.waitForResponse(
    /\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/graphic\/\?school_cycle=[a-f0-9-]+&concepts=[a-f0-9-]+/
  );
  await chargePage.multipleSelectorBtn.click();
  await page.getByText('Seleccionar todo').click({ timeout: 4000 });
  await page.getByTestId(`${conceptName}-listOption`).click({ timeout: 4000 });
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/table\//);
  await chargePage.multipleSelectorBtn.click();
  await expect(chargePage.delilnquentTableDownloadBtn).toBeDisabled();
  await deleteConceptByApi(conceptId, schoolID);
});

test('Descarga reporte efectividad de cobranzas @e2e', async ({ page }) => {
  const schoolName = 'School CGH';
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  const chargePage = new ChargePage(page);
  await page.waitForResponse(
    /\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/collections\/graphic\/\?school_cycle=[a-f0-9-]+&concepts=[a-f0-9-]+/
  );
  const [download] = await Promise.all([page.waitForEvent('download'), chargePage.delilnquentTableDownloadBtn.click()]);
  // Espera a que se complete la descarga
  await download.saveAs('pruebaExcel.xlsx');
  // Cierra el navegador

  // Lee el archivo Excel descargado y obtiene los nombres de columnas
  const valorHeadersColumnas = await obtenerCeldasFila1ConValor('pruebaExcel.xlsx', 'Resumen', 5);
  // Realiza las validaciones necesarias en el contenido del archivo Excel
  expect(valorHeadersColumnas).toEqual(xlsResumenCobranzas);
  // Elimina el archivo Excel descargado después de realizar las validaciones

  await fsPromises.unlink('pruebaExcel.xlsx');
});
