import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { DelinquencyPage } from '../../../e2e/pages/delinquencyPage';
import {
  addCommentToJiraIssue,
  addLabelJiraIssue,
  dashboardLogin,
  findTCSubstring,
  goto,
  realizarTransicionIssue,
} from '../../../e2e/helpers/commons';
import { user1 } from '../../../e2e/data/data';

test('Usuario despliega detalle de alumno moroso desde boton ver mas detalles @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const delinquencyPage = new DelinquencyPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  await delinquencyPage.delinquencyBtn.click();
  const response = await page.waitForResponse(/\/api\/trpc\/delinquency\.getDelinquencyFilters,delinquency\.+/);
  const jsonResponse = await response.json();
  const count = JSON.stringify(jsonResponse[1]?.result?.data?.json?.count);
  await delinquencyPage.orderTxt.click();
  await expect(delinquencyPage.collapsableListBtn).toBeEnabled();
  await expect(delinquencyPage.footerTotalStudentsTxt).toContainText(count, { timeout: 10000 });
  await delinquencyPage.collapsableListBtn.click();
  await page.getByTestId('student-details-expand-button').first().click();
  await expect(page.getByRole('heading', { name: 'Detalle de morosidad' })).toBeVisible({ timeout: 8000 });
  const first_name = jsonResponse[1]?.result?.data?.json?.results[0]?.first_name;
  const last_name = jsonResponse[1]?.result?.data?.json?.results[0]?.last_name;
  await expect(page.getByRole('link', { name: `${first_name} ${last_name}` })).toBeVisible({ timeout: 8000 });
});

test('Usuario filtra por tipo de concepto Inscripcion la tabla morosidad exitosamente e2e @sanity', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const delinquencyPage = new DelinquencyPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  await delinquencyPage.delinquencyBtn.click();
  await page.waitForResponse(/\/api\/trpc\/delinquency\.getDelinquencyFilters,delinquency\.+/);
  await delinquencyPage.orderTxt.click();
  await expect(delinquencyPage.collapsableListBtn).toBeEnabled();
  await delinquencyPage.conceptTypeDropBtn.click();
  await page.getByTestId('INSCRIPTION-listOption').click();
  const response = await page.waitForResponse(/\/api\/trpc\/delinquency\.getDelinquency+/);
  const jsonResponse = await response.json();
  const estudiante1 = jsonResponse[0]?.result?.data?.json?.results[0];
  await delinquencyPage.conceptTypeDropBtn.click();
  await delinquencyPage.collapsableListBtn.click();
  await expect(
    page.getByText(
      `${estudiante1.first_name} ${estudiante1.last_name}${estudiante1.enrollment_code} | ${estudiante1.level} - ${estudiante1.section}${estudiante1.number_of_past_due_orders}`
    )
  ).toBeVisible();
  const delinquentsNum = await delinquencyPage.footerTotalStudentsTxt.textContent();
  if (delinquentsNum) {
    expect(parseInt(delinquentsNum)).toEqual(jsonResponse[0]?.result?.data?.json?.count);
  } else {
    // Informamos un error si no ingresamos en la condición
    throw new Error('No se obtuvo el número de morosos. Proablemente no hay alumnos o no respondio a tiempo la api.');
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
test.afterEach(async ({ page }, testInfo) => {
  const jiraKey = await findTCSubstring(testInfo.title);
  const fechaActual = new Date();
  const date = fechaActual.toString();
  if (jiraKey !== null) {
    if (testInfo.status !== 'failed') {
      await realizarTransicionIssue(jiraKey);
      await addCommentToJiraIssue(jiraKey, `${date} TEST OK`);
      await addLabelJiraIssue(jiraKey, 'AUT_REGRESION');
    } else {
      await realizarTransicionIssue(jiraKey);
      await addCommentToJiraIssue(jiraKey, `${date} TEST FAILED`);
      await addLabelJiraIssue(jiraKey, 'AUT_REGRESION');
    }
  }
});
