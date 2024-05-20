import { test, expect, ElementHandle } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { PaymentsPage } from '../../../e2e/pages/paymentsPage';
import {
  addCommentToJiraIssue,
  addLabelJiraIssue,
  checkIfDataExistIntoXColumnOfTable,
  dashboardLogin,
  delay,
  findTCSubstring,
  goto,
  realizarTransicionIssue,
  retryExpectUntilElementIsHide,
  scrollToVisibleElement,
} from '../../../e2e/helpers/commons';
import { StudentDetailPage } from '../../../e2e/pages/studentDetailPage';
import { GuardianDetailPage } from '../../../e2e/pages/guardianDetailPage';
import { user1, user2 } from '../../../e2e/data/data';

test('Usuario valida Layout y existencia de los elementos de la sección. @test @TC-COM-2285', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentsPage = new PaymentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.paymentsBtn.click();
  await expect(paymentsPage.pagosRecibidosTxt).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellOrderId).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellpaymentDate).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellOrder).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellStudent).toBeVisible({ timeout: 50000 });
});

test('Filtrar por nivel pagos recibidos exitosamente y accede a seccion detalle del estudiante desde un pago. @test @TC-COM-2284', async ({
  page,
  context,
}) => {
  const loginPage = new LoginPage(page);
  const paymentsPage = new PaymentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.paymentsBtn.click();
  await paymentsPage.filterBtn.scrollIntoViewIfNeeded();
  await paymentsPage.filterBtn.click();
  await delay(2000);
  await scrollToVisibleElement(page, paymentsPage.levelFilterSelector);
  await paymentsPage.levelFilterSelector.click();
  await paymentsPage.optionPrimaria.click();
  await paymentsPage.applyFilterBtn.click();
  const elements = page.locator('xpath=//tbody//tr');
  await elements.nth(1).locator('xpath=/td').nth(3).click();
  await expect(page.getByText(/^Estudiante:.+$/)).toBeVisible({ timeout: 60000 });
  const element = page.getByText(/^Estudiante:.+$/);
  let studentName = '';
  if (element) {
    const text = await element.textContent();
    if (text) {
      const match = text.match(/^Estudiante:(.+)$/); // Aplicar la expresión regular para extraer el nombre

      if (match) {
        studentName = match[1].trim(); // Obtener el nombre del estudiante y eliminar espacios en blanco
      }
    }
  }
  //Ej Switch entre tabs, hay que crear un nuevo objeto page o hacer override de page con la nuevo, depende del caso
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    await page.getByRole('link', { name: `${studentName}` }).click(), // Opens a new tab
  ]);
  await newPage.waitForLoadState();
  const studentDetailPage = new StudentDetailPage(newPage);
  await expect(studentDetailPage.studentDetailTxt).toBeVisible({ timeout: 60000 });
  await expect(studentDetailPage.levelPrimariaTxt).toBeVisible({ timeout: 60000 });
});

test('Filtrar por nivel pagos recibidos exitosamente y accede a seccion detalle del tutor desde un pago. @test @TC-COM-2283', async ({
  page,
  context,
}) => {
  const loginPage = new LoginPage(page);
  const paymentsPage = new PaymentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.paymentsBtn.click();
  await paymentsPage.filterBtn.scrollIntoViewIfNeeded();
  await paymentsPage.filterBtn.click();
  await delay(2000);
  await scrollToVisibleElement(page, paymentsPage.levelFilterSelector);
  await paymentsPage.levelFilterSelector.click();
  await paymentsPage.optionPrimaria.click();
  await paymentsPage.applyFilterBtn.click();
  const elements = page.locator('xpath=//tbody//tr');
  await elements.nth(1).locator('xpath=/td').nth(4).click();
  await expect(page.getByText(/^Pagador:.+$/)).toBeVisible({ timeout: 60000 });
  const element = page.getByText(/^Pagador:.+$/);
  let nombreTutor = '';
  if (element) {
    const text = await element.textContent();
    if (text) {
      const match = text.match(/^Pagador:(.+)$/); // Aplicar la expresión regular para extraer el nombre

      if (match) {
        nombreTutor = match[1].trim(); // Obtener el nombre del estudiante y eliminar espacios en blanco
      }
    }
  }
  //Ej Switch entre tabs, hay que crear un nuevo objeto page o hacer overwrigth de page con la nuevo, depende del caso
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    await page.getByRole('link', { name: `${nombreTutor}` }).click(), // Opens a new tab
  ]);
  await newPage.waitForLoadState();
  const guardianDetailPage = new GuardianDetailPage(newPage);
  await expect(guardianDetailPage.guardianDetailTxt).toBeVisible({ timeout: 60000 });
  await expect(page.getByText(nombreTutor).first()).toBeVisible({ timeout: 60000 });
});

test('Dado que existen 19 pagos para el colegio IIT se muestra tabla con todos los pagos si no se aplica filtros.', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  //const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([]);
});

test('Aplicar filtro Concepto = Colegiatura primaria recarga la tabla mostrando los 5 pagos esperados', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  //const incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptFilterBy.click({ timeout: 5000 });
  await paymentsPage.colegiaturaPrimariaFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await retryExpectUntilElementIsHide(page, page.getByText('IITP00000050'));
  await expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual('$17,000.00');
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([
    'IITP00000581',
    'IITP00000050',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ]);
});

test('Aplicar filtro Medio de pago = Efectivo recarga la tabla mostrando los 6 pagos esperados', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.paymentMethodFilterBy.click({ timeout: 5000 });
  await paymentsPage.ticketFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await retryExpectUntilElementIsHide(page, page.getByText('IITP00000050'));
  await paymentsPage.footerTotalAmountTxt.scrollIntoViewIfNeeded();
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual('$23,072.00');
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([
    'IITP00000581',
    'IITP00000050',
    'IITP00000252',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ]);
});

test('Aplicar filtro compuesto Medio de pago + tipo concepto recarga la tabla mostrando los 6 pagos esperados', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptFilterBy.click({ timeout: 5000 });
  await paymentsPage.colegiaturaPrimariaFilterOption.click({ timeout: 5000 });
  await paymentsPage.inscripcionFilterOption.click();
  await paymentsPage.paymentMethodFilterBy.click({ timeout: 5000 });
  await paymentsPage.ticketFilterOption.click({ timeout: 5000 });
  await paymentsPage.bankTransferFilterOption.click();
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await retryExpectUntilElementIsHide(page, page.getByText('IITP00000008'));
  await paymentsPage.footerTotalAmountTxt.scrollIntoViewIfNeeded();
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual('$20,500.00');
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([
    'IITP00000581',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ]);
});

test('Aplicar filtro compuesto tipo concepto = Inscripcion y recarga la tabla mostrando los 2 pagos esperados', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptTypeFilterBy.click();
  await paymentsPage.conceptTypeInscriptionFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await retryExpectUntilElementIsHide(page, page.getByText('IITP00000008'));
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual('$7,000.00');
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ]);
});

test('Aplicar filtro compuesto Nivel + Sección recarga la tabla mostrando los 10 pagos esperados', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.levelFilterBy.click({ timeout: 5000 });
  await paymentsPage.preparatorioFilterOption.click({ timeout: 5000 });
  await paymentsPage.sectionFilterBy.click({ timeout: 5000 });
  await paymentsPage.sextoAFilterOption.click({ timeout: 5000 });
  await paymentsPage.cuartoAFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await retryExpectUntilElementIsHide(page, page.getByText('IITP00000008'));
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual('$44,788.00');
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000005',
    'IITP00000020',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  const expectedMissingOrdes = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000019',
    'IITP00000004',
    'IITP00000002',
    'IITP00000020',
  ];
  expect(expectedMissingOrdes).toStrictEqual(missingOrders);
  await page.getByTestId('download-button').click();
  await page.getByTestId('table-report-button').click();
  await expect(page.getByText('La descarga de tus archivos ha iniciado')).toBeVisible();
});

test('Aplicar filtro estado de la factura = Cancelada, sin ningun pago asociado y devuelve empty state', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.cancelledReceiptFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await expect(paymentsPage.filterEmptyStateTxt).toHaveText('No hay pagos recibidos');
});

test('Aplicar filtro estado de la factura = Emitida, y devuelve las 19 facturas en la tabla', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.emitedReceiptFilterOption.click({ timeout: 3000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  await page.getByText('IITP00000180').hover();
  await page.getByText('IITP00000050').scrollIntoViewIfNeeded({ timeout: 5000 });
  await page.getByRole('cell', { name: 'IITP00000020' }).scrollIntoViewIfNeeded();
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000020',
    'IITP00000005',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual([]);
  await page.getByTestId('download-button').click();
  await page.getByTestId('table-report-button').click();
  await expect(page.getByText('La descarga de tus archivos ha iniciado')).toBeVisible();
});

test('Aplicar filtro compuesto estado de la factura = Emitida + tipo de concepto = Colegiatura la busqueda devuelve las 17 facturas en la tabla', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptTypeFilterBy.click();
  await paymentsPage.conceptTypeMonthlySchollarshipFilterOption.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.emitedReceiptFilterOption.click({ timeout: 3000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  await page.getByText('IITP00000180').hover();
  const rows: ElementHandle[] = await page.$$('table tr');
  const ordersId = [
    'IITP00000581',
    'IITP00000178',
    'IITP00000187',
    'IITP00000183',
    'IITP00000180',
    'IITP00000050',
    'IITP00000252',
    'IITP00000019',
    'IITP00000008',
    'IITP00000001',
    'IITP00000013',
    'IITP00000010',
    'IITP00000003',
    'IITP00000009',
    'IITP00000012',
    'IITP00000004',
    'IITP00000002',
    'IITP00000020',
    'IITP00000005',
  ];
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, ordersId);
  expect(missingOrders).toStrictEqual(['IITP00000581', 'IITP00000050']);
  //await printTable(rows);
  await page.getByTestId('download-button').click();
  await page.getByTestId('table-report-button').click();
  await expect(page.getByText('La descarga de tus archivos ha iniciado')).toBeVisible();
});

test('Aplicar filtro nombre pagador sin ningun pago asociado y devuelve empty state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School IIT', user2.email, user2.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByText('IITP00000178')).toBeVisible({ timeout: 15000 });
  const paymentsPage = new PaymentsPage(page);
  await paymentsPage.searchByPayerInp.fill('Mariano Almonte');
  await page.getByRole('option', { name: 'Mariano Almonte Email: jlira@example.org' }).click();
  await expect(paymentsPage.filterEmptyStateTxt).toHaveText('No hay pagos recibidos');
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
