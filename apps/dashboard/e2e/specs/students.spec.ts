import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { StudentsPage } from '../../../e2e/pages/studentsPage';
import {
  delay,
  scrollToVisibleElement,
  generarCURP,
  realizarTransicionIssue,
  findTCSubstring,
  addCommentToJiraIssue,
  addLabelJiraIssue,
  goto,
} from '../../../e2e/helpers/commons';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  generateCellPhoneForFront,
} from '../../../e2e/helpers/students';
import { user1 } from '../../../e2e/data/data';

test('Usuario valida Layout, navega el paginado y existencia de los elementos de la sección. @test @TC-COM-2005', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
  await expect(studentsPage.totalStudentsTxt).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.totalWithDebtStudentsTxt).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.totalWithoutDebtStudentsTxt).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.highDelinquencyTxt).toBeVisible({ timeout: 10000 });
  await expect(studentsPage.newStudentBtn).toBeVisible({ timeout: 3000 });
  await expect(studentsPage.studentsListTxt).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.guardinFilterTxtBox).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.studentFilterTxtBox).toBeVisible({ timeout: 1000 });
  await studentsPage.downloadArrowBtn.scrollIntoViewIfNeeded();
  await expect(studentsPage.studenRowNameTxt).toBeVisible({ timeout: 1000 });
  await studentsPage.goToPageTxtLabel.scrollIntoViewIfNeeded();
  await expect(studentsPage.spinButtonBox).toHaveValue('1');
  await expect(studentsPage.xOfx).toBeVisible({ timeout: 1000 });
  let [numero1, numero2] = [0, 0];
  await expect(studentsPage.navigateOnePageBtn).toBeEnabled({ timeout: 8000 });
  const numeros = extraerNumeros(await studentsPage.xOfx.textContent());
  if (numeros) {
    [numero1, numero2] = numeros;
    expect(numero1).toBeLessThan(numero2);
  }
  await studentsPage.navigateOnePageBtn.click();
  await expect(studentsPage.xOfx.filter({ hasText: `2 de ${numero2}` })).toBeVisible({ timeout: 5000 });
  await studentsPage.navigateLastPageBtn.click();
  await expect(studentsPage.xOfx.filter({ hasText: `${numero2} de ${numero2}` })).toBeVisible({ timeout: 5000 });
  await studentsPage.navigateFirstPageBtn.click();
  expect(await studentsPage.xOfx.textContent()).toEqual(`1 de ${numero2}`);
});

test('Filtrar por nivel trae solo estudiantes del nivel seleccionado. @test @TC-COM-2006', async ({ page }) => {
  //se loguea el colegio
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  //valido que se cargo la pagina
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  //ingreso a seccion estudiantes
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  //presiono el boton filtrar
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
  await delay(2000);
  //selecciono el tipo de filtro Nivel
  await studentsPage.levelFilterSelector.click();
  //seleccion la opcion Primaria y aplico el filtro
  await studentsPage.optionPrimaria.click();
  await studentsPage.applyFilterBtn.click();
  //traigo de la tabla las celdas Nivel que tengan el texto Primera y valido que sean = 50
  await expect(studentsPage.rowLevelPrimaria).toHaveCount(50);
  await studentsPage.cleanAllFiltersBtn.click();
  await studentsPage.filterBtn.click();
  await studentsPage.levelFilterSelector.click();
  await studentsPage.optionSecundaria.click();
  await studentsPage.applyFilterBtn.click();
  await expect(studentsPage.rowLevelSecundaria).toHaveCount(50);
  //traigo de la tabla las celdas Nivel que tengan el texto Secundaria y valido que no exista nada distinto a Secundaria.
  const rows = await page.locator('xpath=//tbody//tr').count();
  const elements = page.locator('xpath=//tbody//tr');
  for (let index = 0; index < rows; index++) {
    const element = await elements.nth(index).locator('xpath=/td').nth(1).textContent();
    expect(element).toEqual('Secundaria');
  }
});

test('Filtrar por seccion trae solo estudiantes de la seccion seleccionada. @test @TC-COM-2007', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
  await delay(2000);
  await studentsPage.sectionFilterSelector.click();
  await page.getByLabel('Kinder 3 B').click();
  await studentsPage.applyFilterBtn.click();
  await expect(page.getByRole('cell', { name: 'Kinder 3 B' })).toHaveCount(27);
  const rows = await page.locator('xpath=//tbody//tr').count();
  const elements = page.locator('xpath=//tbody//tr');
  for (let index = 0; index < rows; index++) {
    const element = await elements.nth(index).locator('xpath=/td').nth(3).textContent();
    expect(element).toEqual('Kinder 3 B');
  }
});

test('Filtrar por colegiaturas vencidas trae solo estudiantes segun el filtro aplicado. @test @TC-COM-2008', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
  await delay(2000);
  await studentsPage.colegiturasVencidasFilterSelector.click();
  await studentsPage.optionCV1.click();
  await studentsPage.applyFilterBtn.click();
  let rows = await page.locator('xpath=//tbody//tr').count();
  let elements = page.locator('xpath=//tbody//tr');
  for (let index = 0; index < rows; index++) {
    const element = await elements.nth(index).locator('xpath=/td').nth(5).textContent();
    expect(element).toEqual('1');
  }
  await studentsPage.cleanAllFiltersBtn.click();
  await studentsPage.filterBtn.click();
  await studentsPage.colegiturasVencidasFilterSelector.click();
  await studentsPage.optionCV2.click();
  await studentsPage.applyFilterBtn.click();
  rows = await page.locator('xpath=//tbody//tr').count();
  elements = page.locator('xpath=//tbody//tr');
  for (let index = 0; index < rows; index++) {
    const element = await elements.nth(index).locator('xpath=/td').nth(5).textContent();
    expect(element).toEqual('2');
  }
});

test('Filtrar por tutor trae solo estudiantes segun el filtro aplicado. @test @TC-COM-2009', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await delay(2000);
  await studentsPage.tutorFilterTxt.fill('Gabriel Nicora');
  await studentsPage.optionFilteredByTutor.click();
  await page.locator('xpath=//tbody//tr').first().click();
  await expect(page.getByText('Gabriel Nicora')).toBeVisible({ timeout: 60000 });
});

test('Filtrar por estudiante trae solo estudiantes segun el filtro aplicado. @test @TC-COM-2010', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.studentFilterTxt.fill('pablo perez');
  await studentsPage.optionFilteredByStudent.click();
  await page.locator('xpath=//tbody//tr').first().click();
  await expect(page.getByText('Gabriel Nicora')).toBeVisible({ timeout: 60000 });
});

function extraerNumeros(texto: string | null): [number, number] | null {
  if (texto === null) {
    return null;
  }
  const regex = /^(\d{1,3}) de (\d{1,3})$/;
  const matches = texto.match(regex);

  if (matches && matches.length === 3) {
    const numero1 = parseInt(matches[1]);
    const numero2 = parseInt(matches[2]);
    return [numero1, numero2];
  } else {
    return null;
  }
}

test('Agregar nuevo estudiante registrando nuevo tutor y valido los datos en detalle del estudiante. @test @TC-COM-2271', async ({
  page,
}) => {
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
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  let box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
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
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.click();
  await expect(page.locator('xpath=//label[text()="Detalles del estudiante"]')).toBeVisible({ timeout: 5000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: PrimariaGrado: 1Secc`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Inactivo')).toBeVisible({ timeout: 1000 });
  await page.getByRole('heading', { name: 'Tutores asignados' }).scrollIntoViewIfNeeded();
  const element = page.getByRole('button', {
    name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@getcometa.com +52${guardianCellPhone}`,
  });
  //elimino el tutor del alumno
  box = await element.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
    await page.locator('div[class="w-fit"]').locator('button').nth(1).click();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
    await page.locator('div[class="w-fit"]').locator('button').nth(1).click();
  }
  await page.getByText('Sí, desasignar').click();
  //valido que se habilito el boton asignar nuevo tutor
  await expect(page.getByRole('button', { name: 'Asignar nuevo tutor' })).toBeVisible({ timeout: 3000 });
});

test('Agregar nuevo estudiante asociando tutor existente y luego de creado le des asgino el tutor. @test @TC-COM-2269', async ({
  page,
}) => {
  const studentFirstName = await generateFirstName();
  const studentLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  let box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
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
  //ASOCIO ESTUDIANTE A TUTOR EXISTENTE
  await studentsPage.findExistingGuardianChk.click();
  await page.getByPlaceholder('Nombre o apellido').fill('oswaldo pedroza');
  await expect(page.getByText('Oswaldo Pedroza')).toBeEnabled({ timeout: 10000 });
  await page.getByText('Oswaldo Pedroza').click();
  await expect(page.getByText('Oswaldo Pedroza riveraluis-manuel@example.org+525920291411')).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole('button', { name: 'Asignar' }).click();
  await expect(page.locator('xpath=//label[text()="Detalles del estudiante"]')).toBeVisible({ timeout: 5000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: PrimariaGrado: 1Secc`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Inactivo')).toBeVisible({ timeout: 1000 });
  await page.getByRole('heading', { name: 'Tutores asignados' }).scrollIntoViewIfNeeded();
  const element = page.getByTestId('arrow-button');
  //elimino el tutor del alumno
  box = await element.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
  }
  await page.getByTestId('unsuscribeGuardian-button').click();
  await page.getByText('Sí, desasignar').click();
  //valido que se habilito el boton asignar nuevo tutor
  await expect(page.getByRole('button', { name: 'Asignar nuevo tutor' })).toBeVisible({ timeout: 3000 });
});

test('Alta nuevo estudiante y tutor + asignacion de conceptos y beca y registro de pago de la orden. @test @TC-COM-2270', async ({
  page,
}) => {
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
  await loginPage.emailTxt.click();
  await loginPage.emailTxt.fill(user1.email);
  await loginPage.pass.click();
  await loginPage.pass.fill(user1.password);
  await loginPage.pass.press('Enter');
  await expect(loginPage.cobranzasHdg).toBeVisible({ timeout: 60000 });
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 60000 });
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
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.click();
  await expect(studentsPage.studentDetailsHead).toBeVisible({ timeout: 5000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: PrimariaGrado: 1Secc`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 8000 });
  await expect(studentsPage.inactiveStudentStatus).toBeVisible({ timeout: 1000 });
  await studentsPage.guardianAssignementHead.scrollIntoViewIfNeeded();
  await page
    .getByRole('button', {
      name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@getcometa.com +52${guardianCellPhone}`,
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
  //Scroll hasta los meses e itero los checkbox dandole click a cada uno
  await studentsPage.ordersToAssignOctChk.scrollIntoViewIfNeeded();
  await studentsPage.ordersToAssignOctChk.click();
  let count = await studentsPage.monthlyChk.count();
  let elements = studentsPage.monthlyChk;
  for (let index = 0; index < count; index++) {
    await elements.nth(index).click();
  }
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  await expect(page.getByText('¡Se asignó el concepto de manera exitosa!')).toBeVisible({ timeout: 3000 });
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
  await page.getByRole('heading', { name: 'Conceptos asignados' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('cell', { name: 'Colegiatura Primaria 23-24', exact: true })).toBeVisible({
    timeout: 6000,
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
