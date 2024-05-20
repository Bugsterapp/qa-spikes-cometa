import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { DelinquencyPage } from '../../../e2e/pages/delinquencyPage';
import {
  addCommentToJiraIssue,
  addLabelJiraIssue,
  findTCSubstring,
  goto,
  realizarTransicionIssue,
  scrollToVisibleElement,
} from '../../../e2e/helpers/commons';
import { user1 } from '../../../e2e/data/data';

test('Test that Page Delinquency render correctly.', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const delinquencyPage = new DelinquencyPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  await expect(loginPage.navSidePanelList).toHaveText([
    `Cobranzas`,
    `Morosidad`,
    `Pagos recibidos`,
    `Ingresos`,
    `Estudiantes`,
    `Conceptos`,
  ]);
  await delinquencyPage.delinquencyBtn.click();
});

test('Usuario hace scroll hasta llegar al final y visauliza el fin del scroll @TC-COM-2279', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const delinquencyPage = new DelinquencyPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill('automationdos@getcometa.com');
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  await expect(loginPage.navSidePanelList).toHaveText(
    [`Cobranzas`, `Morosidad`, `Pagos recibidos`, `Ingresos`, `Estudiantes`, `Conceptos`],
    { timeout: 15000 }
  );
  await delinquencyPage.delinquencyBtn.click();
  await delinquencyPage.orderTxt.click();
  await expect(delinquencyPage.collapsableListBtn).toBeEnabled();
  await delinquencyPage.collapsableListBtn.click();
  const box = await delinquencyPage.tableEle.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  }
  await page.waitForLoadState();
  await scrollToVisibleElement(page, delinquencyPage.noMoreStudentsWithDelinquencyTxt, 60);
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
