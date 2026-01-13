import { test, expect, ElementHandle } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { PaymentsPage } from '../../pages/dashboard/paymentsPage';
import {
  checkIfDataExistIntoXColumnOfTable,
  dashboardLogin,
  delay,
  generarCURP,
  generateEmail,
  getActiveSchoolCycleBySchoolId,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  goto,
  scrollToVisibleElement,
  selectMonthOnCalendarPicker,
} from '../../helpers/commons';
import { GuardianDetailPage } from '../../pages/dashboard/guardianDetailPage';
import { user1 } from '../../data/data';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  createStudentWithParams,
  assignGuardianAPI,
} from '../../helpers/students';

let loginPage: LoginPage;
let paymentsPage: PaymentsPage;
let schoolName: string;
let schoolID: string;

test('Usuario valida Layout y existencia de los elementos de la sección.', async () => {
  await expect(paymentsPage.pagosRecibidosTxt).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellOrderId).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellpaymentDate).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellOrder).toBeVisible({ timeout: 50000 });
  await expect(paymentsPage.headerCellStudent).toBeVisible({ timeout: 50000 });
});

test('Filtrar por nivel pagos y facturas exitosamente y accede a seccion detalle del estudiante desde un pago. @e2e', async ({
  page,
  context,
}) => {
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
  await expect(newPage.getByTestId(`${studentName}`)).toBeVisible({ timeout: 10000 });
});

test('Filtrar por nivel pagos y facturas exitosamente y accede a seccion detalle del tutor desde un pago. @e2e', async ({
  page,
  context,
}) => {
  await paymentsPage.filterBtn.scrollIntoViewIfNeeded();
  await paymentsPage.filterBtn.click();
  await delay(2000);
  await scrollToVisibleElement(page, paymentsPage.levelFilterSelector);
  await paymentsPage.levelFilterSelector.click();
  await paymentsPage.optionPrimaria.click();
  await paymentsPage.applyFilterBtn.click();
  const elements = page.locator('xpath=//tbody//tr');
  await elements.nth(1).locator('xpath=/td').nth(4).click();
  await page.getByTestId('payment-detail-card-button').click();
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

test('Aplicar filtro estado de la factura = Cancelada, sin ningun pago asociado y devuelve empty state @e2e', async ({
  page,
}) => {
  await paymentsPage.startDatePicker.click();
  await selectMonthOnCalendarPicker(page, paymentsPage.novemberMonthNameLbl);
  await page.getByRole('button', { name: '29' }).nth(1).click();
  await page.getByRole('button', { name: '29' }).nth(1).click();
  await paymentsPage.filterBtn.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.cancelledReceiptFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await expect(paymentsPage.filterEmptyStateTxt).toHaveText('No hay pagos recibidos');
});

test('Filtrar por fecha de pago para el colegio. @e2e', async ({ page }) => {
  await paymentsPage.startDatePicker.click();
  await selectMonthOnCalendarPicker(page, paymentsPage.novemberMonthNameLbl);
  await page.getByRole('button', { name: '06' }).first().click();
  //al demorar la pegada luego de seleccionar la fecha desde rompia
  //agrego wait para poder capturar el responso al completar la fecha hasta
  await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  await page.getByRole('button', { name: '06' }).first().click();
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const correlativeIds = extractCorrelativeIds(response);
  await expect(page.getByText(correlativeIds[correlativeIds.length - 1])).toBeVisible({ timeout: 10000 });
  await paymentsPage.footerTotalAmountTxt.scrollIntoViewIfNeeded();
  const rows: ElementHandle[] = await page.$$('table tr');

  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, correlativeIds);
  expect(missingOrders).toStrictEqual([]);
});

test('Aplicar filtro Concepto = Concepto when 6131 recarga la tabla mostrando los 3 pagos esperados @e2e', async ({
  page,
}) => {
  await paymentsPage.footerTotalAmountTxt.isEnabled();
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptFilterBy.click({ timeout: 5000 });
  await page.getByTestId('Colegiatura Preescolar 12M-filterOption').click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const correlativeIds = extractCorrelativeIds(response);
  const rows: ElementHandle[] = await page.$$('table tr');
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, correlativeIds);
  expect(missingOrders).toStrictEqual([]);
  //Valido el monto total del footer luego de aplicar filtro
  const expectAmount = formatCurrency(response?.[0].result.data.json.total_amount);
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual(expectAmount);
});

test('Aplicar filtro compuesto Medio de pago + tipo concepto recarga la tabla mostrando los 6 pagos esperados @e2e', async ({
  page,
}) => {
  await paymentsPage.footerTotalAmountTxt.isEnabled();
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptFilterBy.click({ timeout: 5000 });
  await page.getByTestId('Colegiatura Preescolar 12M-filterOption').click({ timeout: 5000 });
  await page.getByTestId('Colegiatura Primaria 12M-filterOption').click({ timeout: 1000 });
  await paymentsPage.paymentMethodFilterBy.click({ timeout: 5000 });
  await page.getByTestId('Tarjeta de crédito-filterOption').click();
  await page.getByTestId('Tarjeta de débito-filterOption').click();
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const expectAmount = formatCurrency(response?.[0].result.data.json.total_amount);
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual(expectAmount);
  const correlativeIds = extractCorrelativeIds(response);
  const rows: ElementHandle[] = await page.$$('table tr');
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, correlativeIds);
  expect(missingOrders).toStrictEqual([]);
});

test('Aplicar filtro compuesto tipo concepto = Inscripcion y recarga la tabla mostrando los 3 pagos esperados @e2e', async ({
  page,
}) => {
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptTypeFilterBy.click();
  await paymentsPage.conceptTypeInscriptionFilterOption.click({ timeout: 5000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  await paymentsPage.startDatePicker.click();
  await selectMonthOnCalendarPicker(page, paymentsPage.septemberMonthNameLbl);
  await page.getByRole('button', { name: '01' }).first().click();
  await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/);
  await page.getByRole('button', { name: '15' }).first().click();
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const expectAmount = formatCurrency(response?.[0].result.data.json.total_amount);
  expect(await paymentsPage.footerTotalAmountTxt.textContent()).toEqual(expectAmount);
  const correlativeIds = extractCorrelativeIds(response);
  const rows: ElementHandle[] = await page.$$('table tr');
  const missingOrders = await checkIfDataExistIntoXColumnOfTable(rows, correlativeIds);
  expect(missingOrders).toStrictEqual([]);
});

test('Aplicar filtro compuesto Nivel + Sección recarga la tabla mostrando los 10 pagos esperados @e2e', async ({
  page,
}) => {
  await paymentsPage.filterBtn.click();
  await paymentsPage.levelFilterBy.click({ timeout: 5000 });
  await paymentsPage.preSchoolFilterOption.click({ timeout: 5000 });
  await paymentsPage.sectionFilterBy.click({ timeout: 5000 });
  await paymentsPage.page.getByTestId('2 A-filterOption').first().click();
  await paymentsPage.page.getByTestId('3 A-filterOption').first().click();
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const correlativeIds = extractCorrelativeIds(response);
  await expect(page.getByText(correlativeIds[0])).toBeVisible({ timeout: 15000 });
  await page.getByTestId('download-button').click();
  await page.getByRole('button', { name: 'Descargar' }).first().click();
  await expect(page.getByText('La descarga de tus archivos ha iniciado')).toBeVisible({ timeout: 15000 });
});

test('Aplicar filtro estado de la factura = Emitida, y devuelve las 5 facturas en la tabla @e2e', async ({ page }) => {
  await paymentsPage.filterBtn.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.emitedReceiptFilterOption.click({ timeout: 3000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const correlativeIds = extractCorrelativeIds(response);
  await expect(page.getByText(correlativeIds[0])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[1])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[2])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[3])).toBeVisible({ timeout: 5000 });
});

test('Aplicar filtro compuesto estado de la factura = Emitida + tipo de concepto = Colegiatura la busqueda devuelve las 17 facturas en la tabla @e2e', async ({
  page,
}) => {
  await paymentsPage.startDatePicker.click();
  await selectMonthOnCalendarPicker(page, paymentsPage.novemberMonthNameLbl);
  await page.getByRole('button', { name: '01' }).first().click();
  await page.getByRole('button', { name: '15' }).first().click();
  await paymentsPage.filterBtn.click();
  await paymentsPage.conceptTypeFilterBy.click();
  await paymentsPage.conceptTypeMonthlySchollarshipFilterOption.click();
  await paymentsPage.receiptStateFilterBy.click({ timeout: 5000 });
  await paymentsPage.emitedReceiptFilterOption.click({ timeout: 3000 });
  await paymentsPage.applyFilterBtn.click({ timeout: 2000 });
  const response = await (await page.waitForResponse(/\/api\/trpc\/payments\.payinsFulfillment+/)).json();
  const correlativeIds = extractCorrelativeIds(response);
  await expect(page.getByText(correlativeIds[0])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[1])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[2])).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(correlativeIds[3])).toBeVisible({ timeout: 5000 });
});

test('Aplicar filtro nombre pagador sin ningun pago asociado y devuelve empty state @e2e', async ({ page }) => {
  //Existe alumno con tutor sin pagos realizados
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const student_id = await createStudentWithParams(
    firstName,
    lastName,
    matricula,
    levelId,
    sectionId,
    schoolID,
    curp,
    undefined,
    undefined,
    cycle?.[0].id
  );
  const guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  await paymentsPage.searchByPayerInp.fill(`${guardianFirstName} ${guardianLastName}`);
  await page.getByRole('option', { name: `${guardianFirstName} ${guardianLastName}` }).click();
  await expect(paymentsPage.filterEmptyStateTxt).toHaveText('No hay pagos recibidos');
});

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  //cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  //data = await getConceptListBySchoolId(schoolID, cycle?.[0].id, ['MONTHLY_FEE']);
  // And el colegio ingreso en el dashboard
  loginPage = new LoginPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  //ingreso a seccion estudiantes
  await loginPage.paymentsBtn.click();
  paymentsPage = new PaymentsPage(page);
  await paymentsPage.footerTotalAmountTxt.isEnabled();
});

//no esta tipada con TPRC y la imple de serviceCiente no esta implementada por eso el tipado
interface Fulfillment {
  correlative_id: string;
}

interface JSONData {
  result: {
    data: {
      json: {
        results: {
          fulfillment: Fulfillment;
        }[];
      };
    };
  };
}

function extractCorrelativeIds(jsonData: JSONData[]): string[] {
  const correlativeIds: string[] = [];

  jsonData.forEach((item) => {
    item.result.data.json.results.forEach((result) => {
      if (result.fulfillment && result.fulfillment.correlative_id && correlativeIds.length < 18) {
        correlativeIds.push(result.fulfillment.correlative_id);
      }
    });
  });

  return correlativeIds;
}

function formatCurrency(amount: string): string {
  const number = parseFloat(amount.replace(/,/g, ''));
  const formattedAmount = number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return formattedAmount;
}
