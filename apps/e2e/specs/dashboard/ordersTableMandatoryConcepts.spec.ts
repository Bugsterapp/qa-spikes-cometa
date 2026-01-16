import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import {
  dashboardLogin,
  generarCURP,
  generateEmail,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  goto,
} from '../../helpers/commons';
import { ConceptsPage } from '../../pages/dashboard/conceptsPage';
import { addOrdersToStudent, createMandatoryConceptByApi, deleteConceptByApi } from '../../helpers/concepts';
import { user1 } from '../../data/data';

import { SchoolCycle } from '@cometa/trpc/src/types';
import { ConceptDetailPage } from '../../pages/dashboard/conceptDetailPage';
import { faker } from '@faker-js/faker';
import {
  assignGuardianAPI,
  createStudentWithParams,
  generateFirstName,
  generateLastName,
  generateMatricula,
} from '../../helpers/students';
import { IncomePage } from '../../pages/dashboard/incomePage';
import { validateRegisterPaymentError } from '../../helpers/commons';

let loginPage: LoginPage;
let conceptPage: ConceptsPage;
let conceptDetailPage: ConceptDetailPage;
let schoolID: string;
//let data: BaseConcept[];
let conceptName: string;
let conceptPrice: string;
let bancAccount: string;
let fiscalEntity: string;
let cycle: SchoolCycle[];
let incomePage: IncomePage;
let correlativeId: string;

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  conceptPrice = faker.number.int({ max: 9999 }).toString();
  bancAccount = (await getBankAccountBySchoolName(schoolName))?.id;
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  //data = await getConceptListBySchoolId(schoolID, cycle?.[0].id, ['MONTHLY_FEE']);
  // And el colegio ingreso en el dashboard
  loginPage = new LoginPage(page);
  conceptPage = new ConceptsPage(page);
  conceptDetailPage = new ConceptDetailPage(page);
  incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  //ingreso a seccion estudiantes
  await loginPage.conceptsBtn.click();
  await expect(conceptPage.newConceptBtn).toBeVisible({ timeout: 30000 });
});

test('Usuario visualiza toda la lista de ordenes sin pagos realizados @e2e', async ({ page }) => {
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla
  const rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const CobranzasColumnText = await columns[1].innerText();
    // Validamos columna cobranzas
    expect(CobranzasColumnText).toBe('0 de 0 alumnos');
  }
  await deleteConceptByApi(concept.id, schoolID);
});

test('Usuario visualiza toda la lista de ordenes con pagos realizados @e2e', async ({ page }) => {
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
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
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await addOrdersToStudent(student_id, concept.id);
  await registerPayment(incomePage, firstName, lastName, guardianFirstName, guardianLastName, matricula);
  await loginPage.conceptsBtn.click();
  await expect(conceptPage.newConceptBtn).toBeVisible({ timeout: 30000 });
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla
  const rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const CobranzasColumnText = await columns[1].innerText();
    // Validamos columna cobranzas
    expect(CobranzasColumnText).toBe('1 de 1 alumnos');
  }
});

test('Usuario ve actualizada las cobranzas luego de eliminar pago registrado por el colegio @e2e', async ({ page }) => {
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
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
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await addOrdersToStudent(student_id, concept.id);
  await registerPayment(incomePage, firstName, lastName, guardianFirstName, guardianLastName, matricula);
  await loginPage.conceptsBtn.click();
  await expect(conceptPage.newConceptBtn).toBeVisible({ timeout: 30000 });
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla
  let rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const CobranzasColumnText = await columns[1].innerText();
    // Validamos columna cobranzas
    expect(CobranzasColumnText).toBe('1 de 1 alumnos');
  }
  await deletePayment(loginPage, correlativeId);
  await loginPage.conceptsBtn.click();
  await expect(conceptPage.newConceptBtn).toBeVisible({ timeout: 30000 });
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla
  rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const CobranzasColumnText = await columns[1].innerText();
    // Validamos columna cobranzas
    expect(CobranzasColumnText).toBe('0 de 1 alumnos');
  }
});

test('Se carga nombre tooltip al hacer hover sobre orden con nombre muy largo', async ({ page }) => {
  conceptName =
    'concepto extremadamente largo para que se trunce y podamos visualizar el truncate de la tabla y se cargue el hover';
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .first()
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla y valido el truncate
  const rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    await columns[0].hover();
    await expect(page.getByText(conceptName).nth(1)).toBeInViewport({ ratio: 1 });
  }
  await deleteConceptByApi(concept.id, schoolID);
});

test('Usuario contabiliza los pagos parciales en la lista de ordenes @e2e', async ({ page }) => {
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
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
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await addOrdersToStudent(student_id, concept.id);
  await registerParcialPayment(incomePage, firstName, lastName, guardianFirstName, guardianLastName, matricula);
  await loginPage.conceptsBtn.click();
  await expect(conceptPage.newConceptBtn).toBeVisible({ timeout: 30000 });
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .click();
  await conceptDetailPage.ordersTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo la primer orden con el pago parcial
  const rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const cobranzasColumnText = await columns[1].innerText();
    const orderName = await columns[0].innerText();
    // Validamos columna cobranzas
    if (orderName == `${conceptName} / Agosto, 2023`) {
      expect(cobranzasColumnText).toBe('1 de 1 alumnos');
    } else {
      expect(cobranzasColumnText).toBe('0 de 1 alumnos');
    }
  }
});

async function registerPayment(
  incomePage: IncomePage,
  firstName: string,
  lastName: string,
  guardianFirstName: string,
  guardianLastName: string,
  matricula: string
) {
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.page.getByRole('button', { name: 'Registrar pago' }).click();
  const response = await incomePage.page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await incomePage.page.getByTestId(`${firstName} ${lastName}-button`).click({ timeout: 5000 });
  await expect(incomePage.page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await incomePage.page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianFirstName} ${guardianLastName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await incomePage.page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 3 A` })
    .click();
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  await incomePage.page.locator('tr:nth-child(3) > td').first().click();
  await incomePage.page.locator('tr:nth-child(4) > td').first().click();
  await incomePage.page.locator('tr:nth-child(5) > td').first().click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  const payin = await incomePage.page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/payins\//);
  const element = incomePage.page.getByText('Ocurrió un error inesperado, intenta nuevamente más tarde.');

  //Agreo esto para debug en vivo, necesito validar cuando pincha en en la linea 151 que me devuelve el back.

  await validateRegisterPaymentError(element, payin);
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(incomePage.page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  correlativeId = (await incomePage.page.getByTestId('correlativeId').textContent()) || 'SIN RESULTADO';
}

async function registerParcialPayment(
  incomePage: IncomePage,
  firstName: string,
  lastName: string,
  guardianFirstName: string,
  guardianLastName: string,
  matricula: string
) {
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.page.getByRole('button', { name: 'Registrar pago' }).click();
  const response = await incomePage.page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await incomePage.page.getByTestId(`${firstName} ${lastName}-button`).click({ timeout: 5000 });
  await expect(incomePage.page.getByText('Selecciona un pagador')).toBeVisible({ timeout: 30000 });
  for (const li of await incomePage.page.getByRole('menuitem').all()) {
    if (li.filter({ hasText: `${guardianFirstName} ${guardianLastName}` })) {
      await li.click();
    }
  }
  //seleccion pastilla de alumno para filtrar ordenes
  await incomePage.page
    .locator('section')
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección: 3 A` })
    .click();
  // And selecciona orden por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  //activo pago parcial
  await incomePage.partialPaymentChk.click();
  await incomePage.partialPaymentUnderstoodBtn.click();
  await incomePage.partialPaymentAmountTxt.fill('10');
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(incomePage.page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  correlativeId = (await incomePage.page.getByTestId('correlativeId').textContent()) || 'SIN RESULTADO';
}

export async function deletePayment(page: LoginPage, correlativeId: string) {
  await loginPage.incomeBtn.click();
  await loginPage.page.getByRole('cell', { name: `${correlativeId}` }).click();
  await loginPage.page.getByRole('button', { name: 'Eliminar pago' }).click();
  await loginPage.page.getByRole('button', { name: 'Eliminar' }).click();
  await expect(loginPage.page.getByText('se ha eliminado de manera exitosa')).toBeVisible({ timeout: 5000 });
  await loginPage.page.reload();
}
