import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { IncomePage } from '../../../e2e/pages/incomePage';
import {
  createStudent,
  addOrders,
  generateLastName,
  generateFirstName,
  generateMatricula,
  assignGuardianAPI,
  addOtherConceptosOrders,
} from '../../../e2e/helpers/students';
import {
  findTCSubstring,
  realizarTransicionIssue,
  addCommentToJiraIssue,
  addLabelJiraIssue,
  goto,
  retryExpectUntilElementIsHide,
  dashboardLogin,
} from '../../../e2e/helpers/commons';
import { user1 } from '../../../e2e/data/data';
import { createOtherConceptByApi } from '../../../e2e/helpers/concepts';
import { faker } from '@faker-js/faker';

test('Colegio registra el pago de 2 ordenes. @TC-COM-2097 @test @soloeste', async ({ page }) => {
  // Given el alumno tiene 2 ordenes por pagar  await getToken();
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const matricula = await generateMatricula();
  const studentId = await createStudent(firstName, lastName, matricula);
  const guardianName = await assignGuardianAPI(studentId);
  await addOrders(studentId);
  // And el colegio ingreso en el dashboard
  const loginPage = new LoginPage(page);
  const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  await incomePage.registerPaymentBtn.click();
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByRole('button', { name: `${firstName} ${lastName} Secundaria - 7 NI ${matricula}` }).click();
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 7 N` })
    .click();
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.paymentAccountComboBoxOption.click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // await incomePage.createReceiptOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  //pendinggggg
  await incomePage.seePaymentReceiptBtn.click();
});

test('Colegio registra el pago parcial. @TC-COM-2096 @test', async ({ page }) => {
  // Given el alumno tiene 2 ordenes por pagar  await getToken();
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const matricula = await generateMatricula();
  const studentId = await createStudent(firstName, lastName, matricula);
  const guardianName = await assignGuardianAPI(studentId);
  await addOrders(studentId);
  // And el colegio ingreso en el dashboard
  const loginPage = new LoginPage(page);
  const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  await incomePage.registerPaymentBtn.click();
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByRole('button', { name: `${firstName} ${lastName} Secundaria - 7 NI ${matricula}` }).click();
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 7 N` })
    .click();
  // And selecciona orden por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.paymentAccountComboBoxOption.click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  //await incomePage.createReceiptOption.click();
  //activo pago parcial
  await incomePage.partialPaymentChk.click();
  await incomePage.partialPaymentUnderstoodBtn.click();
  await incomePage.partialPaymentAmountTxt.fill('2000');
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  const cadena = page.getByText(/^ID de pago:BMT.+$/);
  const id = await cadena.textContent();
  let idPago = '';
  //extraer id del pago del pop up de pago exitoso
  if (id) {
    const indiceCaracter = id.indexOf(':');
    // Usamos el método match para encontrar todas las coincidencias en la cadena
    if (indiceCaracter !== -1) {
      idPago = id.substring(indiceCaracter + 1).trim();
    }
  }
  //click boton ver para volver a ingresos
  await incomePage.seePaymentReceiptBtn.click();
  //verifico que el pago nuevo esta en la tabla y acceddo al sidepanel
  await expect(page.getByText(`${idPago}`).first()).toBeVisible({ timeout: 10000 });
  await page.getByRole('cell', { name: `${idPago}` }).scrollIntoViewIfNeeded();
  await page.getByText(`${idPago}`).first().click();
  //ingreso al fullfilment y valido que es un pago parcial
  const element = page.locator('#fulfillments').getByText(/\$.+$/);
  await element.scrollIntoViewIfNeeded();
  await element.click();
  await expect(page.getByText('Pago parcial', { exact: true })).toBeVisible({ timeout: 10000 });
});

test('Colegio registra el pago de 2 ordens de concepto opcional con 2 atributos', async ({ page }) => {
  // Given el alumno tiene 2 ordenes por pagar  await getToken();
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const matricula = await generateMatricula();
  const studentId = await createStudent(firstName, lastName, matricula);
  const guardianName = await assignGuardianAPI(studentId);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptId = await createOtherConceptByApi(conceptName);
  await addOtherConceptosOrders(studentId, conceptId);
  // And el colegio ingreso en el dashboard
  const loginPage = new LoginPage(page);
  const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  await incomePage.registerPaymentBtn.click();
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByRole('button', { name: `${firstName} ${lastName} Secundaria - 7 NI ${matricula}` }).click();
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianName}` })) {
      await li.click();
    }
  }
  //seleccion Otros conceptos
  await incomePage.optionalConceptsTabOption.click();
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 7 N` })
    .click();
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.paymentAccountComboBoxOption.click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // await incomePage.createReceiptOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  //pendinggggg
  await incomePage.seePaymentReceiptBtn.click();
});

//no funciona en local porque el chat tapa el boton y no de deja accionarlo. en otros ambientes no se muestra nada. Hay que refactorizar.
//Es posible que lance error el ultimo click, seguimos refactorizando el caso para hacerlo mas estable
test('Colegio comienza descarga sin filtros de orgenes registradas en income page view y cancela la descarga @TC-COM-2282', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await incomePage.incomeBtn.click();
  //hack para esperar mensaje de intercom y poder interactuar con bonton cancelar en footer detras corriendo localhost
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  await incomePage.downloadRegisteredPaymentsBtn.click();
  await incomePage.downloadPdfOption.click();
  await expect(incomePage.preparingFilesTxt).toHaveText('Preparando archivos');
  await expect(incomePage.cancellDownloadBtn).toBeEnabled();
  const box = await incomePage.cancellDownloadBtn.boundingBox();
  if (box) {
    await page.mouse.move(box.x, box.y + box.height / 2);
    await incomePage.cancellDownloadBtn.click();
  }
  await retryExpectUntilElementIsHide(page, incomePage.preparingFilesTxt);
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
