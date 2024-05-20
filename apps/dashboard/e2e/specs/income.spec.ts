import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { IncomePage } from '../../../e2e/pages/incomePage';
import {
  generateLastName,
  generateFirstName,
  generateMatricula,
  assignGuardianAPI,
  createStudentWithParams,
} from '../../../e2e/helpers/students';
import {
  goto,
  dashboardLogin,
  generarCURP,
  obtenerCeldasFila1ConValor,
  getActiveSchoolCycleBySchoolId,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  getFiscalEntityBySchoolId,
  getBankAccountBySchoolName,
} from '../../../e2e/helpers/commons';
import { user1, excelPayoutsHeaders } from '../../../e2e/data/data';
import { promises as fsPromises } from 'fs';
import {
  getConceptListBySchoolId,
  addOrdersToStudent,
  addOptionalOrdersToStudent,
  createOtherConceptByApi,
} from '../../../e2e/helpers/concepts';
import { BaseConcept, SchoolCycle } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';

let loginPage: LoginPage;
let incomePage: IncomePage;
let firstName: string;
let lastName: string;
let data: BaseConcept[];
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;
let cycle: SchoolCycle[];
let schoolID: string;
let student_id: string;
let fiscalEntity: string;
let banc: any;
let conceptName: string;

test('Colegio registra el pago de 2 ordenes. @e2e @TC-COM-2097 @soloeste', async ({ page }) => {
  //And tiene asignado un concepto de tipo colegiatura
  data = await getConceptListBySchoolId(schoolID, cycle?.[0].id);
  await addOrdersToStudent(student_id, data?.[0].id);
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.registerPaymentBtn.click();
  const response = await page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByTestId(`${firstName} ${lastName}-button`).click({ timeout: 5000 });
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianFirstName} ${guardianLastName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 3 A` })
    .click();
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  await incomePage.seePaymentReceiptBtn.click();
});

test('Colegio registra el pago de 2 ordenes concepto opcional. @e2e', async ({ page }) => {
  const optionalConcept = await createOtherConceptByApi(
    conceptName,
    fiscalEntity,
    banc?.id,
    cycle?.[0].id,
    schoolID,
    true
  );
  //And tiene asignado un concepto de tipo colegiatura
  await addOptionalOrdersToStudent(student_id, optionalConcept.id);
  await incomePage.registerPaymentBtn.click();
  const response = await page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByTestId(`${firstName} ${lastName}-button`).click({ timeout: 5000 });
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianFirstName} ${guardianLastName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('label')
    .filter({ hasText: `${firstName} ${lastName}` })
    .click();
  await page.getByRole('tab', { name: 'Conceptos opcionales' }).click();
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  await incomePage.seePaymentReceiptBtn.click();
});

test('Colegio registra el pago parcial. @TC-COM-2096 @e2e', async ({ page }) => {
  //And tiene asignado un concepto de tipo colegiatura
  data = await getConceptListBySchoolId(schoolID, cycle?.[0].id);
  await addOrdersToStudent(student_id, data?.[0].id);
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.registerPaymentBtn.click();
  const response = await page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByTestId(`${firstName} ${lastName}-button`).click({ timeout: 5000 });
  await expect(page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianFirstName} ${guardianLastName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 3 A` })
    .click();
  // And selecciona orden por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  //activo pago parcial
  await incomePage.partialPaymentChk.click();
  await incomePage.partialPaymentUnderstoodBtn.click();
  await incomePage.partialPaymentAmountTxt.fill('500');
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  // And al regresar al estado de alumno las ordenes se visualizan en Ordenes pagadas
  const cadena = page.getByText(/^ID de pago:GVS.+$/);
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

test('El reporte de payouts descargado en excel tiene todas las columnas esperadas @e2e', async ({ page }) => {
  //hack para esperar mensaje de intercom y poder interactuar con bonton cancelar en footer detras corriendo localhost
  await incomePage.payoutsDownloadBtn.scrollIntoViewIfNeeded();
  await incomePage.payoutsDownloadBtn.click();
  // Descarga el archivo
  const downloadButton = await page.waitForSelector('[data-testid="table-report-button"]');
  const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
  // Espera a que se complete la descarga
  await download.saveAs('pruebaExcel.xlsx');
  // Cierra el navegador

  // Lee el archivo Excel descargado y obtiene los nombres de columnas
  const valorHeadersColumnas = await obtenerCeldasFila1ConValor('pruebaExcel.xlsx', 'Ordenes Asociadas');
  // Realiza las validaciones necesarias en el contenido del archivo Excel
  expect(valorHeadersColumnas).toEqual(excelPayoutsHeaders);
  // Elimina el archivo Excel descargado después de realizar las validaciones
  await fsPromises.unlink('pruebaExcel.xlsx');
});

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'School GVS';
  schoolID = await getSchoolIdByName(schoolName);
  levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID, true);
  student_id = await createStudentWithParams(
    firstName,
    lastName,
    matricula,
    levelId,
    sectionId,
    schoolID,
    curp,
    undefined, //grade
    undefined, //group
    cycle?.[0].id
  );
  const guardianEmail = `${guardianFirstName}${guardianLastName}@getcometa.com`;
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  // And el colegio ingreso en el dashboard
  loginPage = new LoginPage(page);
  incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  //ingreso a seccion pagos ingresos
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
});

test.beforeAll(async () => {
  // Given Existe un estudiante creado
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  banc = await getBankAccountBySchoolName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
});
