import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
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
  getSchoolIdByName,
  getLevelIdBySchoolId,
  getSectionIdBySchoolId,
  generarCURP,
  getActiveSchoolCycleBySchoolId,
} from '../../../e2e/helpers/commons';
import { user1 } from '../../../e2e/data/data';

import { StudentsPage } from '../../../e2e/pages/studentsPage';
import { IncomePage } from '../../../e2e/pages/incomePage';
import { addOrdersToStudent, getConceptListBySchoolId } from '../../../e2e/helpers/concepts';
import { BaseConcept } from '@cometa/trpc/src/types';

let loginPage: LoginPage;
let studentsPage: StudentsPage;
let incomePage: IncomePage;
let firstName: string;
let lastName: string;
let data: BaseConcept[];
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;

test('Colegio agrega recargo a orden de pago mensual luego lo elimina. @e2e', async ({ page }) => {
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //selecciono orden
  await page.getByText(data?.[0].name).first().click();
  await page.locator('#add-overcharge').click();
  await studentsPage.specialOverchargeMotiveInp.fill('Test descuentos');
  await studentsPage.specialOverchargeAmountInp.fill('1000');
  await studentsPage.specialOverchargeAddBtn.click();
  //se agrega una linea de texto con la descripción y monto del recargo
  await page.getByTestId('Test descuentos-discountName').isVisible();
  await expect(page.getByTestId('Test descuentos-discountValue')).toHaveText('+$1000.00');
  await page.getByTestId('Test descuentos-trashIcon').click();
  await page.getByTestId('delete-button').click();
  await expect(page.getByTestId('Test descuentos-discountName')).not.toBeInViewport({ timeout: 10000 });
});

test('Colegio no puede eliminar recargo a orden de pago mensual con pago parcial registrado. @e2e', async ({
  page,
}) => {
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //selecciono orden
  await page.getByText(data?.[0].name).first().click();
  await page.locator('#add-overcharge').click();
  await studentsPage.specialOverchargeMotiveInp.fill('Test descuentos');
  await studentsPage.specialOverchargeAmountInp.fill('1000');
  await studentsPage.specialOverchargeAddBtn.click();
  //se agrega una linea de texto con la descripción y monto del recargo
  await page.getByTestId('Test descuentos-discountName').isVisible();
  await expect(page.getByTestId('Test descuentos-discountValue')).toHaveText('+$1000.00');
  await studentsPage.specialOverchargeCloseBtn.click();
  //And tiene un pago parcial

  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  await incomePage.registerPaymentBtn.click();
  const response = await incomePage.page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByTestId(`${firstName} ${lastName}-button`).click();
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
  await incomePage.page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  //activo pago parcial
  await incomePage.partialPaymentChk.click();
  await incomePage.partialPaymentUnderstoodBtn.click();
  await incomePage.partialPaymentAmountTxt.fill('1500');
  // And confirma el pago parcial donde el total adeudado se menor al recargo
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  //When ingresa al detalle de la orden
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  await page.getByText(data?.[0].name).first().click();
  //Then ve deshabilitado el tacho de basura para eliminar el concepto
  //And se muestra una leyenda explicando el motivo
  await page.getByTestId('Test descuentos-trashIcon').isDisabled();
  await page.getByTestId('Test descuentos-trashIcon').hover();
  await expect(
    page
      .getByText(
        'No puedes eliminar este recargo porque es mayor al monto pendiente a pagar. Ajusta el precio agregando otros recargos o descuentos.'
      )
      .first()
  ).toBeInViewport();
});

test('Colegio puede eliminar recargo a orden de pago mensual con pago parcial registrado si no supera monto original. @e2e', async ({
  page,
}) => {
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //selecciono orden
  await page.getByText(data?.[0].name).first().click();
  await page.locator('#add-overcharge').click();
  await studentsPage.specialOverchargeMotiveInp.fill('Test descuentos');
  await studentsPage.specialOverchargeAmountInp.fill('1000');
  await studentsPage.specialOverchargeAddBtn.click();
  //se agrega una linea de texto con la descripción y monto del recargo
  await page.getByTestId('Test descuentos-discountName').isVisible();
  await expect(page.getByTestId('Test descuentos-discountValue')).toHaveText('+$1000.00');
  await studentsPage.specialOverchargeCloseBtn.click();
  //And tiene un pago parcial

  await incomePage.incomeBtn.click();
  await expect(incomePage.registerIncomesBySchoolTableTitle).toBeVisible({ timeout: 30000 });
  await incomePage.registerPaymentBtn.click();
  const response = await incomePage.page.waitForResponse(/\/api\/trpc\/manualPayments\.bankAccountList+/);
  const jsonResponse = await response.json();
  const accountName = jsonResponse[0]?.result?.data?.json?.results[0].public_summary;
  await expect(incomePage.registerThePayerLbl).toBeVisible({ timeout: 30000 });
  await incomePage.nameOrTuitionNumberTxt.fill(`${firstName} ${lastName}`);
  await expect(incomePage.listBoxStudent).toHaveCount(1);
  await page.getByTestId(`${firstName} ${lastName}-button`).click();
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
  await incomePage.page.getByLabel(accountName).click();
  await incomePage.paymentChannelComboBox.click();
  await incomePage.paymentChannelComboBoxOption.click();
  //activo pago parcial
  await incomePage.partialPaymentChk.click();
  await incomePage.partialPaymentUnderstoodBtn.click();
  await incomePage.partialPaymentAmountTxt.fill('10');
  // And confirma el pago parcial donde el total adeudado se menor al recargo
  await incomePage.finalRegisterPaymentBtn.scrollIntoViewIfNeeded();
  await incomePage.finalRegisterPaymentBtn.click();
  // Then el colegio ve un popup con el mensaje de exito del pago
  await expect(incomePage.registeredPaymentMsg.first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('¡Pago registrado!').first()).toBeVisible({ timeout: 30000 });
  //When ingresa al detalle de la orden
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  await page.getByText(data?.[0].name).first().click();
  //Then ve deshabilitado el tacho de basura para eliminar el concepto
  //And se muestra una leyenda explicando el motivo
  await page.getByTestId('Test descuentos-trashIcon').click();
  await page.getByTestId('delete-button').click();
  await expect(page.getByTestId('Test descuentos-discountName')).not.toBeInViewport({ timeout: 10000 });
});

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
  levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
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
  const guardianEmail = `${guardianFirstName}${guardianLastName}@getcometa.com`;
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  //And tiene asignado un concepto de tipo colegiatura
  data = await getConceptListBySchoolId(schoolID, cycle?.[0].id);
  await addOrdersToStudent(student_id, data?.[0].id);
  // And el colegio ingreso en el dashboard
  loginPage = new LoginPage(page);
  studentsPage = new StudentsPage(page);
  incomePage = new IncomePage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });
  //ingreso a seccion estudiantes
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
});
