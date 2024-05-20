import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { CcPaymentPage } from '../../../e2e/pages/portal/ccPaymentPage';
import { StudentsPage } from '../../../e2e/pages/studentsPage';
import {
  delay,
  scrollToVisibleElement,
  generarCURP,
  retryExpectWithScroll,
  getGuardianToken,
  retryExpectBeforeElementClick,
  findTCSubstring,
  realizarTransicionIssue,
  addCommentToJiraIssue,
  addLabelJiraIssue,
  goto,
  gotoPortal,
  closeHelperTourMessages,
  setGuardianAsMercadoPagoBetaTester,
  dashboardLogin,
  closeVercelCommentsIFrame,
} from '../../../e2e/helpers/commons';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  generateCellPhoneForFront,
} from '../../../e2e/helpers/students';
import { user1 } from '../../../e2e/data/data';

test('Alta estudiante + tutor + asignar concepto + beca + pago en portal con nueva TC en mercado pago y validacion de pago con factura emitida en dashboard. @E2E @TC-COM-2280 @skip', async ({
  page,
}) => {
  test.setTimeout(200000);
  //Dado que tengo los datos para generar estudiante y
  const studentFirstName = await generateFirstName();
  const studentLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const guardianCellPhone = await generateCellPhoneForFront();
  const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  const domain = '@getcometon.com';
  //Y estoy logueado en la seccion estudiantes
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
  //Cuando agrego un nuevo estudiante
  await studentsPage.newStudentBtn.click();
  //COMPLEETO FORMULARIO CON DATOS DEL ESTUDIANTE
  await studentsPage.studentFirstName.fill(studentFirstName);
  await studentsPage.studentLastName.fill(studentLastName);
  await studentsPage.studentCurp.fill(curp);
  await studentsPage.studentbirthday.fill('02');
  await studentsPage.studentbirthmonth.fill('02');
  await studentsPage.studentbirthyear.fill('2009');
  await studentsPage.genderM.click();
  await studentsPage.nextBtn.click();
  //COMPLETO FORMULARIO CON DATOS DE CURSO DEL ALUMNO
  await studentsPage.enrollmentCode.fill(matricula);
  await studentsPage.levelDD.click();
  await studentsPage.optionPrimaria.click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('1').click();
  await studentsPage.groupBtn.click();
  await page.getByText('NI', { exact: true }).nth(1).click();
  await studentsPage.nextBtn.click();
  //CArgo formulario para nuevo guardian
  await studentsPage.registerNewGuardianChk.isEnabled();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.isEnabled();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}${domain}`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.isEnabled();
  await studentsPage.createAndAssignBtn.click();
  await expect(page.locator('xpath=//label[text()="Detalles del estudiante"]')).toBeVisible({ timeout: 12000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: PrimariaGrado: 1Secc`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 5000 });
  await expect(studentsPage.inactiveStudentStatus).toBeVisible({ timeout: 1000 });
  await studentsPage.guardianAssignementHead.scrollIntoViewIfNeeded();
  await page
    .getByRole('button', {
      name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}${domain} +52${guardianCellPhone}`,
    })
    .isVisible();
  //Abro sidepanel para agregar conceptos
  await studentsPage.assignConcept.scrollIntoViewIfNeeded();
  await studentsPage.assignConcept.click();
  await studentsPage.schoolCicloInp.click();
  await page.getByText('Ciclo actual').click();
  await delay(2000);
  await studentsPage.conceptNameInp.fill('Colegiatura Primaria');
  await expect(page.getByRole('option', { name: 'Colegiatura Primaria 23-24' })).toBeVisible({ timeout: 3000 });
  await page.getByRole('option', { name: 'Colegiatura Primaria 23-24' }).click();
  await studentsPage.ordersToAssignOctChk.scrollIntoViewIfNeeded();
  await studentsPage.ordersToAssignOctChk.click();
  //Itero los checkbox de meses y hago click
  let count = await studentsPage.monthlyChk.count();
  let elements = studentsPage.monthlyChk;
  for (let index = 0; index < count; index++) {
    await elements.nth(index).click();
  }
  await page.getByRole('button', { name: 'Asignar', exact: true }).isEnabled();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  //Agrego una beca al estudiante
  await page.getByRole('button', { name: 'Asignar beca' }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Asignar beca' }).click();
  await expect(page.getByPlaceholder('Selecciona una beca')).toBeVisible();
  await page.getByPlaceholder('Selecciona una beca').click();
  await page.getByRole('option', { name: 'Descuento Hijo 4 50% de dscto' }).click();
  await studentsPage.assignBtn.click();
  await expect(studentsPage.assingSchollarshipSuccessMsg).toBeVisible();
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await page.reload();
  await page.getByRole('tab', { name: 'Vigentes' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('cell', { name: 'Colegiatura Primaria 23-24', exact: true })).toBeVisible({
    timeout: 2000,
  });
  await page.getByRole('cell', { name: 'Colegiatura Primaria 23-24', exact: true }).click();
  elements = page.getByRole('checkbox');
  await expect(elements.first()).toBeVisible();
  count = await elements.count();
  elements = page.getByRole('checkbox');
  let ordersToPay = 0;
  for (let index = 0; index < count; index++) {
    const isChecked = await elements.nth(index).isChecked();
    if (isChecked) {
      ordersToPay++;
    }
  }
  expect(ordersToPay).toEqual(10);
  //Obtengo token desde admin
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain);
  await setGuardianAsMercadoPagoBetaTester(page, guardianFirstName, guardianLastName, true);
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await gotoPortal(page, token);
  await expect(page.getByText('Bienvenido a la plataforma de pagos escolares de ')).toBeVisible({
    timeout: 120000,
  });
  await page.reload();
  const tAndC = page.getByLabel('Acepto los Términos & Condiciones y políticas de privacidad.');
  await tAndC.click({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Por ahora no' }).click();
  await closeVercelCommentsIFrame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await closeHelperTourMessages(page);
  //Dado que estoy logueado y tengo ordenes por pagar, puedo realizar un pago con tarjeta de credito
  const elementToPay = page.getByText(/^Colegiatura Primaria .+$/).first();
  await expect(elementToPay).toBeVisible({ timeout: 60000 });
  await elementToPay.click();
  await page.getByRole('button', { name: 'CONTINUAR' }).click();
  await page.getByLabel('Last').click({ timeout: 30000 });
  await page.getByTestId('PAGAR').click();
  await page.getByRole('button', { name: 'Si, continuar' }).click();
  await page.getByRole('radio', { name: 'Tarjeta de débito o crédito Visa, Mastercard, etc.' }).click();
  await delay(1000);
  await page.getByRole('button', { name: 'Continuar' }).click();
  const ccPaymentPage = new CcPaymentPage(page);
  await expect(ccPaymentPage.newDebitCreditCardOpt).toBeVisible({ timeout: 15000 });
  await ccPaymentPage.newDebitCreditCardOpt.click();
  await expect(ccPaymentPage.creditCardNumberInp).toBeVisible({ timeout: 6000 });
  await ccPaymentPage.creditCardNumberInp.click();
  await ccPaymentPage.creditCardNumberInp.fill('5474925432670366');
  await ccPaymentPage.creditCardHolderNameInp.click();
  await ccPaymentPage.creditCardHolderNameInp.fill('Test Play');
  await ccPaymentPage.creditCardexpirationDateInp.click();
  await ccPaymentPage.creditCardexpirationDateInp.fill('1125');
  await ccPaymentPage.creditCardsecurityCodeInp.click();
  await ccPaymentPage.creditCardsecurityCodeInp.fill('123');
  //HACK al click en boton continue porque tira error el automation aun ingresando bien los datos.
  await retryExpectBeforeElementClick(page, ccPaymentPage.validateCreditCardNameTxt, ccPaymentPage.continueBtn);
  await expect(
    page
      .frameLocator('#mercadopago-checkout')
      .locator('div')
      .filter({ hasText: /^Colegiatura Primaria 23-24 - Septiembre, 2023 .+$/ })
  ).toBeVisible();
  await expect(page.frameLocator('#mercadopago-checkout').getByText('$ 6,850').nth(1)).toBeVisible();
  await ccPaymentPage.payBtn.click();
  await expect(ccPaymentPage.paymentBeenCreditedTxt).toBeVisible({ timeout: 5000 });
  //El colegio puede validar el pago en pagos recibidos desde el dashboard.
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.paymentsBtn.click({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: `${guardianFirstName} ${guardianLastName}` })).toBeVisible({
    timeout: 30000,
  });
  await page.locator('td:nth-child(6)').first().scrollIntoViewIfNeeded();
  await page
    .getByRole('row', { name: /^Portal de Cometa .+$/ })
    .locator('label')
    .isVisible();
  //El colegio puede ingresar al sidepanel del pago y validar datos
  await page.getByRole('cell', { name: `${guardianFirstName} ${guardianLastName}` }).click();
  await expect(page.getByText('Pagado', { exact: true })).toBeVisible();
  await expect(page.locator('#order-data').getByText('Colegiatura Primaria 23-24 - Septiembre, 2023')).toBeVisible();
  await expect(page.getByRole('link', { name: `${guardianFirstName} ${guardianLastName}` })).toBeVisible();
  await page.getByText('Descuento Hijo 4').scrollIntoViewIfNeeded();
  await expect(page.getByText('-$6,850.00')).toBeVisible();
  await expect(page.getByText('Monto original:')).toBeVisible();
  await expect(page.getByText('$13,700.00')).toBeVisible();
  await expect(page.getByText('$685.00')).toBeVisible();
  await expect(page.getByText('Comisión + IVA:')).toBeVisible();
  await expect(page.locator('#payment_amount_detail').getByText('$7,535.00')).toBeVisible();
  await page.reload();
  await page.waitForLoadState();
  await page.locator('.w-fit > .text-sm').first().scrollIntoViewIfNeeded({ timeout: 50000 });
  //retry para eventos que dependen de colas y refrescan la UI. (page, string con el locator, valor esperado del assert)
  await retryExpectWithScroll(page, '.w-fit > .text-sm', 'Emitida', 15);
});

test('Alta estudiante + tutor + asignar concepto + beca + pago desde portal x kushky y validacion de pago con factura emitida en dashboard. @E2E @TC-COM-2281', async ({
  page,
}) => {
  test.setTimeout(200000);
  //Dado que tengo los datos para generar estudiante y
  const studentFirstName = await generateFirstName();
  const studentLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();
  const guardianCellPhone = await generateCellPhoneForFront();
  const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  //Y estoy logueado en la seccion estudiantes
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
  //Cuando agrego un nuevo estudiante
  await studentsPage.newStudentBtn.click();
  //COMPLEETO FORMULARIO CON DATOS DEL ESTUDIANTE
  await studentsPage.studentFirstName.fill(studentFirstName);
  await studentsPage.studentLastName.fill(studentLastName);
  await studentsPage.studentCurp.fill(curp);
  await studentsPage.studentbirthday.fill('02');
  await studentsPage.studentbirthmonth.fill('02');
  await studentsPage.studentbirthyear.fill('2009');
  await studentsPage.genderM.click();
  await studentsPage.nextBtn.click();
  //COMPLETO FORMULARIO CON DATOS DE CURSO DEL ALUMNO
  await studentsPage.enrollmentCode.fill(matricula);
  await studentsPage.levelDD.click();
  await studentsPage.optionPrimaria.click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('1').click();
  await studentsPage.groupBtn.click();
  await page.getByText('NI', { exact: true }).nth(1).click();
  await studentsPage.nextBtn.click();
  await studentsPage.registerNewGuardianChk.isEnabled();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometonestestttttttt.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.isEnabled();
  await studentsPage.createAndAssignBtn.click();
  await expect(page.locator('xpath=//label[text()="Detalles del estudiante"]')).toBeVisible({ timeout: 12000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: PrimariaGrado: 1Secc`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 5000 });
  await delay(5000);
  await expect(studentsPage.inactiveStudentStatus).toBeVisible({ timeout: 1000 });
  await studentsPage.guardianAssignementHead.scrollIntoViewIfNeeded();
  await page
    .getByRole('button', {
      name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@getcometonestestttttttt.com +52${guardianCellPhone}`,
    })
    .isVisible();
  await delay(3000);
  //Abro sidepanel para agregar conceptos
  await studentsPage.assignConcept.scrollIntoViewIfNeeded();
  await studentsPage.assignConcept.click();
  await studentsPage.schoolCicloInp.click();
  await page.getByText('Ciclo actual').click();
  await delay(2000);
  await studentsPage.conceptNameInp.fill('Colegiatura Primaria');
  await expect(page.getByRole('option', { name: 'Colegiatura Primaria 23-24' })).toBeVisible({ timeout: 3000 });
  await page.getByRole('option', { name: 'Colegiatura Primaria 23-24' }).click();
  await studentsPage.ordersToAssignOctChk.scrollIntoViewIfNeeded();
  await studentsPage.ordersToAssignOctChk.click();
  let count = await studentsPage.monthlyChk.count();
  let elements = studentsPage.monthlyChk;
  for (let index = 0; index < count; index++) {
    await elements.nth(index).click();
  }
  await page.getByRole('button', { name: 'Asignar', exact: true }).isEnabled();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  //Agrego una beca al estudiante
  await page.getByRole('button', { name: 'Asignar beca' }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Asignar beca' }).click();
  await expect(page.getByPlaceholder('Selecciona una beca')).toBeVisible();
  await page.getByPlaceholder('Selecciona una beca').click();
  await page.getByRole('option', { name: 'Descuento Hijo 4 50% de dscto' }).click();
  await studentsPage.assignBtn.click();
  await expect(studentsPage.assingSchollarshipSuccessMsg).toBeVisible();
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await page.reload();
  await page.getByRole('tab', { name: 'Vigentes' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('cell', { name: 'Colegiatura Primaria 23-24', exact: true })).toBeVisible({
    timeout: 2000,
  });
  await page.getByRole('cell', { name: 'Colegiatura Primaria 23-24', exact: true }).click();
  elements = page.getByRole('checkbox');
  await expect(elements.first()).toBeVisible();
  count = await elements.count();
  elements = page.getByRole('checkbox');
  let ordersToPay = 0;
  for (let index = 0; index < count; index++) {
    const isChecked = await elements.nth(index).isChecked();
    if (isChecked) {
      ordersToPay++;
    }
  }
  expect(ordersToPay).toEqual(10);
  //Me logueo en portal obteniendo token desde admin
  const domain = '@getcometonestestttttttt.com';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain);
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(5000);
  await gotoPortal(page, token);
  await expect(page.getByText('Bienvenido a la plataforma de pagos escolares de')).toBeVisible({
    timeout: 120000,
  });
  await page.reload();
  const tAndC = page.getByLabel('Acepto los Términos & Condiciones y políticas de privacidad.');
  await tAndC.click({ timeout: 5000 });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Por ahora no' }).click();
  await closeVercelCommentsIFrame(page);
  await page.getByRole('button', { name: 'Empezar' }).click();
  //await page.getByLabel('Last').click();
  await closeHelperTourMessages(page);
  //Dado que etoy logueado y tengo ordenes por pagar, puedo realizar un pago con tarjeta de credito
  const elementToPay = page.getByText(/^Colegiatura Primaria .+$/).first();
  await expect(elementToPay).toBeVisible({ timeout: 60000 });
  await elementToPay.click();
  await page.getByRole('button', { name: 'CONTINUAR' }).click();
  await page.getByLabel('Last').click({ timeout: 35000 });
  await page.getByTestId('PAGAR').click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Tarjeta de débito o crédito Visa, Mastercard, etc.' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Número de la tarjeta')).toBeVisible({ timeout: 10000 });
  await page.getByText('Número de la tarjeta').fill('5451951574925480');
  await page.getByText('Nombre en la tarjeta').fill('test pago');
  await page.getByText('Fecha Exp').fill('0224');
  await page.getByText('CVV').fill('123');
  await page.getByRole('button', { name: 'Pagar' }).click();
  await expect(page.getByRole('button', { name: 'Omitir' })).toBeVisible({ timeout: 90000 });
  await page.getByRole('button', { name: 'Omitir' }).click();
  await expect(page.getByRole('heading', { name: '¡Felicitaciones!' })).toBeVisible();
  //El colegio puede validar el pago en pagos recibidos desde el dashboard.
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.paymentsBtn.click();
  await expect(page.getByRole('cell', { name: `${guardianFirstName} ${guardianLastName}` })).toBeVisible({
    timeout: 30000,
  });
  await page.locator('td:nth-child(6)').first().scrollIntoViewIfNeeded();
  await page
    .getByRole('row', { name: /^Portal de Cometa .+$/ })
    .locator('label')
    .isVisible();
  //El colegio puede ingresar al sidepanel del pago y validar datos
  await page.getByRole('cell', { name: `${guardianFirstName} ${guardianLastName}` }).click();
  await expect(page.getByText('Pagado', { exact: true })).toBeVisible();
  await expect(page.locator('#order-data').getByText('Colegiatura Primaria 23-24 - Septiembre, 2023')).toBeVisible();
  await expect(page.getByRole('link', { name: `${guardianFirstName} ${guardianLastName}` })).toBeVisible();
  await page.getByText('Descuento Hijo 4').scrollIntoViewIfNeeded();
  await expect(page.getByText('-$6,850.00')).toBeVisible();
  await expect(page.getByText('Monto original:')).toBeVisible();
  await expect(page.getByText('$13,700.00')).toBeVisible();
  await expect(page.getByText('$685.00')).toBeVisible();
  await expect(page.getByText('Comisión + IVA:')).toBeVisible();
  await expect(page.locator('#payment_amount_detail').getByText('$7,535.00')).toBeVisible();
  await page.reload();
  await page.waitForLoadState();
  await page.getByTestId('botonFiltrar');
  await page.locator('.w-fit > .text-sm').first().scrollIntoViewIfNeeded({ timeout: 50000 });
  //retry para eventos que dependen de colas y refrescan la UI. (page, string con el locator, valor esperado del assert)
  await retryExpectWithScroll(page, '.w-fit > .text-sm', 'Emitida', 15);
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
