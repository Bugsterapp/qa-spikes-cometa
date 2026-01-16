import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { IncomePage } from '../../pages/dashboard/incomePage';
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
import {
  addOrdersToStudent,
  addOtherConceptOrdersToStudent,
  createMandatoryConceptByApi,
  createOtherConceptByApi,
  deleteConceptByApi,
} from '../../helpers/concepts';
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
import { StudentsPage } from '../../pages/dashboard/studentsPage';
import { StudentDetailPage } from '../../pages/dashboard/studentDetailPage';

let loginPage: LoginPage;
let conceptPage: ConceptsPage;
let conceptDetailPage: ConceptDetailPage;
let schoolID: string;
let conceptName: string;
let conceptPrice: string;
let bancAccount: string;
let fiscalEntity: string;
let cycle: SchoolCycle[];
let firstName: string;
let lastName: string;
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;
let student_id: string;
let studentMotherLastName: string;
let concept: any;

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  if (conceptName.includes('-')) {
    conceptName.replaceAll('-', '');
  }
  conceptPrice = faker.number.int({ max: 9999 }).toString();
  bancAccount = (await getBankAccountBySchoolName(schoolName))?.id;
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  studentMotherLastName = await generateLastName();
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
    undefined,
    undefined,
    cycle?.[0].id
  );
  // And el colegio ingreso en el dashboard
  loginPage = new LoginPage(page);
  conceptPage = new ConceptsPage(page);
  conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
});

test('Editar precio de una orden de concepto tipo colegiatura y se actualizan los precios @e2e @sanity', async ({
  page,
}) => {
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
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
    expect(CobranzasColumnText).toBe('0 de 0 alumnos');
  }
  await conceptDetailPage.genericChk.nth(1).click();
  await page.getByRole('button', { name: 'Editar precios' }).click();
  await expect(page.getByText('Ingresa el nuevo precio que')).toBeVisible();
  await conceptDetailPage.modalPriceInp.fill('234');
  await conceptDetailPage.modalSaveBtn.click();
  await page.getByText('$234.00').isVisible();
  await conceptDetailPage.informationTab.click();
  await page.getByText('$234.00').isVisible();
  await deleteConceptByApi(concept.id, schoolID);
});

test('Editar precio de una orden de concepto tipo colegiatura en forma exitosa que tiene un pago realizado @e2e', async ({
  page,
}) => {
  const incomePage = new IncomePage(page);
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  const guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  await addOrdersToStudent(student_id, concept.id);
  await registerPayment(incomePage);
  await loginPage.conceptsBtn.click();
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
  await conceptDetailPage.genericChk.nth(1).click();
  await page.getByRole('button', { name: 'Editar precios' }).click();
  await expect(page.getByText('Ingresa el nuevo precio que')).toBeVisible();
  await conceptDetailPage.modalPriceInp.fill('234');
  await conceptDetailPage.modalSaveBtn.click();
  await page.getByText('$234.00').isVisible();
  await conceptDetailPage.informationTab.click();
  await page.getByText('$234.00').isVisible();
  const studentsPage = new StudentsPage(page);
  //ingreso a seccion estudiantes y seleccion todos los ciclos
  await loginPage.studentsBtn.click({ timeout: 60000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await expect(studentsPage.highDelinquencyTxt).toBeVisible({ timeout: 10000 });
  //await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel del concepto asignado
  const studentDetailPage = new StudentDetailPage(page);
  await studentDetailPage.activeConceptosTab.scrollIntoViewIfNeeded();
  await page.getByRole('cell', { name: conceptName, exact: true }).click();
  await expect(page.getByText('$234.00 MXN')).not.toBeVisible();
});

test('Editar precio de una variante de otros conceptos en forma exitosa que tiene un pago realizado @e2e', async ({
  page,
}) => {
  const incomePage = new IncomePage(page);
  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  const conceptMandatory = await createMandatoryConceptByApi(
    `${conceptName}Mandatory`,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount,
    schoolID
  );
  await addOrdersToStudent(student_id, conceptMandatory.id);
  concept = await createOtherConceptByApi(conceptName, fiscalEntity, bancAccount, cycle?.[0].id, schoolID, true);
  const orders = concept.orders.map((order: any) => order.id);
  const guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  await addOtherConceptOrdersToStudent(student_id, concept.id, orders);
  await registerPayment(incomePage, true);
  await loginPage.conceptsBtn.click();
  await page.getByPlaceholder('Buscar conceptos').fill(conceptName);
  await page
    .getByRole('cell', { name: `${conceptName}` })
    .locator('div')
    .first()
    .click();
  await conceptDetailPage.variantsTab.click();
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  // Traigo todas las filas de la tabla
  const rows = await page.$$('.text-sm.border-collapse.table-auto tbody tr');
  for (const row of rows) {
    const columns = await row.$$('td');
    const CobranzasColumnText = await columns[1].innerText();
    // Validamos columna cobranzas
    expect(CobranzasColumnText).toBe('0 de 0 alumnos');
  }
  await conceptDetailPage.genericChk.nth(1).click();
  await page.getByRole('button', { name: 'Editar precios' }).click();
  await expect(page.getByText('Ingresa el nuevo precio que')).toBeVisible();
  await conceptDetailPage.modalPriceInp.fill('234');
  await conceptDetailPage.modalSaveBtn.click();
  await page.getByText('$234.00').isVisible();
  await conceptDetailPage.informationTab.click();
  await page.getByText('$234.00').isVisible();
  const studentsPage = new StudentsPage(page);
  //ingreso a seccion estudiantes y seleccion todos los ciclos
  await loginPage.studentsBtn.click({ timeout: 60000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await expect(studentsPage.highDelinquencyTxt).toBeVisible({ timeout: 10000 });
  //await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.scrollIntoViewIfNeeded();
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel del concepto asignado
  const studentDetailPage = new StudentDetailPage(page);
  await studentDetailPage.activeConceptosTab.scrollIntoViewIfNeeded();
  await studentDetailPage.optionalConceptsTab.click();
  await page.getByRole('cell', { name: conceptName, exact: true }).click();
  await expect(page.getByText('$234.00 MXN')).toBeVisible();
});

async function registerPayment(incomePage: IncomePage, optional?: boolean) {
  // When el colegio ingreso al registrar pago del alumno
  await incomePage.registerPaymentBtn.click();
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
    .filter({ hasText: `${firstName} ${lastName}Matrícula: ${matricula}Sección:` })
    .click();
  if (optional) {
    await incomePage.page.getByTestId('optionals-tab').scrollIntoViewIfNeeded();
    await incomePage.page.getByTestId('optionals-tab').click();
  }
  // And selecciona ambas ordenes por pagar
  await incomePage.firstPendingPaymentOrder.scrollIntoViewIfNeeded();
  await incomePage.firstPendingPaymentOrder.click();
  await incomePage.secondPendingPaymentOrder.click();
  // And completa los datos de pagos y facturacion emitiendo factura
  await incomePage.paymentAccountComboBox.scrollIntoViewIfNeeded();
  await incomePage.paymentAccountComboBox.click();
  await incomePage.page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  // And confirma el pago
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(incomePage.page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
}
