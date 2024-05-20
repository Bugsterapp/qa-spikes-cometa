import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { StudentsPage } from '../../../e2e/pages/studentsPage';
import {
  delay,
  scrollToVisibleElement,
  generarCURP,
  goto,
  dashboardLogin,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  getLevelIdBySchoolId,
  getActiveSchoolCycleBySchoolId,
  sliceAreaCodeFromPhoneNumber,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
} from '../../../e2e/helpers/commons';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  generateCellPhoneForFront,
  getGuardiansBySchoolId,
  createStudentWithParams,
  assignGuardianAPI,
  getStudentBySchoolId,
} from '../../../e2e/helpers/students';
import { user1 } from '../../../e2e/data/data';
import { StudentDetailPage } from '../../../e2e/pages/studentDetailPage';
import {
  createOtherConceptByApi,
  deleteConceptByApi,
  destroyOptionalAssignmentByApi,
} from '../../../e2e/helpers/concepts';
import { StudentAssignment } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';

test('Usuario valida Layout, navega el paginado y existencia de los elementos de la sección @sanity', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
  if (box) {
    await page.mouse.wheel(box.x + box.width / 4, box.y + box.height / 4);
  }
  await studentsPage.delinquencyStatics.scrollIntoViewIfNeeded({ timeout: 50000 });
  await scrollToVisibleElement(page, studentsPage.delinquencyStatics);
  await expect(studentsPage.totalStudentsTxt).toBeVisible({ timeout: 1000 });
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeInViewport({ timeout: 20000 });
  const text = await studentsPage.highDelinquencyStudensCounterTxt.textContent();
  const estudiantes = text?.replace(/\sestudiantes$/, '') || '';
  const numEstudiantes = parseInt(estudiantes, 10);
  expect(numEstudiantes).toBeGreaterThanOrEqual(1);
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
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
  await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents+/);
  let [numero1, numero2] = [0, 0];
  await expect(studentsPage.navigateOnePageBtn).toBeEnabled({ timeout: 8000 });
  const numeros = extraerNumeros(await studentsPage.xOfx.textContent());
  if (numeros) {
    [numero1, numero2] = numeros;
    expect(numero1).toBeLessThan(numero2);
  }
  await studentsPage.navigateOnePageBtn.click();
  await studentsPage.xOfx.scrollIntoViewIfNeeded();
  await expect(studentsPage.xOfx.filter({ hasText: `2 de ${numero2}` })).toBeVisible({ timeout: 8000 });
  await studentsPage.navigateLastPageBtn.click();
  await expect(studentsPage.xOfx.filter({ hasText: `${numero2} de ${numero2}` })).toBeVisible({ timeout: 5000 });
  await studentsPage.navigateFirstPageBtn.click();
  expect(await studentsPage.xOfx.textContent()).toEqual(`1 de ${numero2}`);
});

test('Filtrar por nivel trae solo estudiantes del nivel seleccionado. @e2e', async ({ page }) => {
  //se loguea el colegio
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  //ingreso a seccion estudiantes
  await loginPage.studentsBtn.click();
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  const text = await studentsPage.highDelinquencyStudensCounterTxt.textContent();
  const estudiantes = text?.replace(/\sestudiantes$/, '') || '';
  const numEstudiantes = parseInt(estudiantes, 10);
  expect(numEstudiantes).toBeGreaterThanOrEqual(1);
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
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

test('Filtrar por seccion trae solo estudiantes de la seccion seleccionada. @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
  await delay(2000);
  await studentsPage.sectionFilterSelector.click();
  await page.locator('label').filter({ hasText: '6 APrimaria Alta' }).click();
  await studentsPage.applyFilterBtn.click();
  await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents+/);
  await expect(page.getByRole('cell', { name: '6 A' }).nth(1)).toBeVisible();
  const cantEstudiantes = await page.getByTestId('studentsCountFooter-span').textContent();
  const elements = page.locator('xpath=//tbody//tr');
  const rows = await elements.count();
  if (cantEstudiantes !== null) {
    const cantEstudiantesParsed = parseInt(cantEstudiantes, 10);
    expect(cantEstudiantesParsed).toBeGreaterThanOrEqual(rows);
  } else {
    // Maneja el caso en que no se pudo obtener el texto del elemento
    // eslint-disable-next-line no-console
    console.error('No se pudo obtener el texto del elemento "studentsCountFooter-span".');
  }
  for (let index = 0; index < rows; index++) {
    const element = await elements.nth(index).locator('xpath=/td').nth(5).textContent({ timeout: 8000 });
    expect(element).toEqual('6 A');
  }
});

test('Filtrar por colegiaturas vencidas trae solo estudiantes segun el filtro aplicado. @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //espero que se cargue la seccion con metricas de delinquency.
  await expect(studentsPage.highDelinquencyStudensCounterTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
  await delay(2000);
  await studentsPage.colegiturasVencidasFilterSelector.click();
  await studentsPage.optionCV1.click();
  await studentsPage.applyFilterBtn.click();
  await studentsPage.cleanAllFiltersBtn.click();
  await studentsPage.filterBtn.click();
  await studentsPage.colegiturasVencidasFilterSelector.click();
  await studentsPage.optionCV2.click();
  await studentsPage.applyFilterBtn.click();
  const cantEstudiantes = await page.getByTestId('studentsCountFooter-span').textContent();
  const rows = await page.locator('xpath=//tbody//tr').count();
  if (cantEstudiantes) {
    const cantEstudiantesParsed = parseInt(cantEstudiantes);
    expect(cantEstudiantesParsed).toBeGreaterThanOrEqual(rows);
  } else {
    // Maneja el caso en que no se pudo obtener el texto del elemento
    // eslint-disable-next-line no-console
    console.error('No se pudo obtener el texto del elemento "studentsCountFooter-span".');
  }
});

test('Filtrar por tutor trae solo estudiantes segun el filtro aplicado. @e2e', async ({ page }) => {
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
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
  const guardianEmail = `${guardianFirstName}${guardianLastName}@getcometa.com`;
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/due_orders\/resume\//);
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
  await page.waitForResponse(/\/api\/v1\/dashboard\/schools\/[a-f0-9-]+\/due_orders\/resume\//);
  await studentsPage.tutorFilterTxt.fill(`${guardianFirstName} ${guardianLastName}`);
  await page.getByRole('option', { name: `${guardianFirstName} ${guardianLastName} Email: ${guardianEmail}` }).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible({ timeout: 60000 });
});

test('Filtrar por estudiante trae solo estudiantes segun el filtro aplicado. @e2e', async ({ page }) => {
  //Given existe un alumno con tutor asignado
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const data = await getStudentBySchoolId(schoolID, cycle?.[0].id);
  const student = data?.results?.find((student) => student.guardians.length > 0);
  //And usuario esta logueado y en seccion estudiantes
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  //And selecciona filtro ciclo = todos
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
  //aplica filtro por nombre de estudiante
  await studentsPage.studentFilterTxt.scrollIntoViewIfNeeded();
  await studentsPage.studentFilterTxt.fill(`${student?.first_name} ${student?.last_name}`);
  //Then valida que se carga la tabla con el estudiante filtrado
  await page.getByRole('heading', { name: `${student?.first_name} ${student?.last_name}` }).click();
  //And puede ingresar al detalle de estudiante y validar el tutor asignado.
  await page.locator('xpath=//tbody//tr').first().click();
  await expect(
    page.getByText(`${student?.guardians?.[0].first_name} ${student?.guardians?.[0].last_name}`)
  ).toBeVisible({ timeout: 60000 });
});

test('Agregar nuevo estudiante registrando nuevo tutor y valido los datos en detalle del estudiante. @e2e', async ({
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
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
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
  await studentsPage.optionPrimaria.first().click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('2').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await studentsPage.nextBtn.click();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.click();
  await expect(studentsPage.studentDetailsHead).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: Primaria BajaGrado: 2Secció`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 10000 });
  await unsuscribeGuardian(loginPage, guardianFirstName, guardianLastName);
  //valido que se habilito el boton asignar nuevo tutor
  await expect(page.getByRole('button', { name: 'Asignar nuevo tutor' })).toBeVisible({ timeout: 3000 });
});

test('Agregar nuevo estudiante asociando tutor existente y luego de creado le des asigno el tutor.  @e2e', async ({
  page,
}) => {
  const studentFirstName = await generateFirstName();
  const studentLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);
  const schoolID = await getSchoolIdByName('School GVS');
  const data = await getGuardiansBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
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
  await studentsPage.optionPrimaria.first().click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('2').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await studentsPage.nextBtn.click();
  //ASOCIO ESTUDIANTE A TUTOR EXISTENTE
  await studentsPage.findExistingGuardianChk.click();
  await page
    .getByPlaceholder('Nombre o apellido')
    .fill(`${data?.results?.[0].first_name} ${data?.results?.[0].last_name}`);
  await page
    .getByText(`${data?.results?.[0].first_name} ${data?.results?.[0].last_name}`)
    .first()
    .click({ timeout: 10000 });
  await expect(
    page.getByText(`${data?.results?.[0].first_name} ${data?.results?.[0].last_name} ${data?.results?.[0].email}`)
  ).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole('button', { name: 'Asignar' }).click();
  await expect(page.locator('xpath=//label[text()="Detalles del estudiante"]')).toBeVisible({ timeout: 5000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: Primaria BajaGrado: 2Secció`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 5000 });
  //elimino el tutor del alumno
  await unsuscribeGuardian(loginPage);
  //valido que se habilito el boton asignar nuevo tutor
  await expect(page.getByRole('button', { name: 'Asignar nuevo tutor' })).toBeVisible({ timeout: 3000 });
});

test('Alta nuevo estudiante y tutor + asignacion de conceptos y beca y registro de pago de la orden.  @e2e', async ({
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
  const studentsDetailsPage = new StudentDetailPage(page);
  //Y estoy logueado en la seccion estudiantes
  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
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
  await studentsPage.optionPrimaria.first().click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('2').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).click();
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
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: Primaria BajaGrado: 2Secció`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 8000 });
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
  await studentsPage.conceptNameInp.fill('Primaria');
  await expect(page.getByRole('option', { name: 'Colegiatura Primaria' })).toBeVisible({ timeout: 3000 });
  await page.getByRole('option', { name: 'Colegiatura Primaria' }).click();
  //Scroll hasta los meses e itero los checkbox dandole click a cada uno
  await studentsPage.ordersToAssignOctChk.scrollIntoViewIfNeeded();
  await studentsPage.ordersToAssignOctChk.click();
  //Checkea todos los checkbox d cada mes del concepto.
  let count = await studentsPage.monthlyChk.count();
  const checkboxes = await page.$$('[data-testid="generic-checkbox"]');
  for (const checkbox of checkboxes) {
    const estadoAriaChecked = await checkbox.getAttribute('aria-checked');
    const estadoDataState = await checkbox.getAttribute('data-state');
    if (estadoAriaChecked === 'false' && estadoDataState === 'unchecked') {
      await checkbox.click();
    }
  }
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  await expect(page.getByText('¡Se asignó el concepto de manera exitosa!')).toBeVisible({ timeout: 6000 });
  //Agrego una beca al estudiante
  await studentsDetailsPage.scholarshipAssign.scrollIntoViewIfNeeded();
  await studentsDetailsPage.scholarshipAssign.click();
  await expect(page.getByPlaceholder('Selecciona una beca')).toBeVisible();
  await page.getByPlaceholder('Selecciona una beca').click();
  await page.getByRole('option', { name: 'Apoyo 90%' }).click();
  await studentsPage.assignBtn.click();
  await expect(studentsPage.assingSchollarshipSuccessMsg).toBeVisible();
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await page.reload();
  await page.getByRole('heading', { name: 'Conceptos asignados' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('cell', { name: 'Colegiatura Primaria', exact: true })).toBeVisible({
    timeout: 6000,
  });
  await page.getByRole('cell', { name: 'Colegiatura Primaria', exact: true }).click();
  let elements = page.getByRole('checkbox');
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

test('Puedo crear y asignar estudiante luego de mensaje tutor existente al intentar crear y asignar nuevo alumno y tutor. @e2e', async ({
  page,
}) => {
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName(schoolName);
  const studentFirstName = await generateFirstName();
  const studentLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);
  const data = await getGuardiansBySchoolId(schoolID);
  const guardianFirstName = data?.results?.[0].first_name || 'SIN DATA';
  const guardianLastName = data?.results?.[0].last_name || 'SIN DATA';
  let guardianCellPhone = data?.results?.[0].phone || 'SIN DATA';
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);

  await goto(page);
  await dashboardLogin(loginPage, 'School GVS', user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  const box = await studentsPage.delinquencyStatics.boundingBox();
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
  await studentsPage.optionPrimaria.first().click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('2').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await studentsPage.nextBtn.click();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${data?.results?.[0].email}`);
  await studentsPage.guardianCellPhone.fill(await sliceAreaCodeFromPhoneNumber(guardianCellPhone));
  await studentsPage.genderM.click();
  await studentsPage.createAndAssignBtn.click();
  await expect(page.getByText('¡Parece que ya existe un tutor con esos datos')).toBeVisible();
  await page.getByRole('button', { name: 'Atrás' }).click();
  guardianCellPhone = await generateCellPhoneForFront();
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.guardianEmail.fill(`${studentFirstName}${studentLastName}${matricula}@getcometa.com`);
  await studentsPage.createAndAssignBtn.click();
  await expect(studentsPage.studentDetailsHead).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula: ${matricula}Nivel: Primaria BajaGrado: 2Secció`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 10000 });
  await page.getByRole('heading', { name: 'Tutores asignados' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: `${guardianFirstName} ${guardianLastName}` })).toBeVisible();
});

test('Colegio asigna concepto opcional con atriburtos a un alumno @e2e', async ({ page }) => {
  // Given existe un alumno para asignar el concepto con atributos
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName('School GVS');
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptId = (
    await createOtherConceptByApi(conceptName, fiscalEntity, bancAccount?.id, cycle?.[0].id, schoolID, true)
  ).id;
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  const studentId = await createStudentWithParams(
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
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  //ingreso a seccion estudiantes y seleccion todos los ciclos
  await loginPage.studentsBtn.click({ timeout: 60000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
  //await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents,schools\.schoolsResume\?.+/);
  await expect(studentsPage.highDelinquencyTxt).toBeVisible({ timeout: 10000 });
  await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel para agregar conceptos
  await studentsPage.assignConcept.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Asignar concepto' }).click();
  await page.getByPlaceholder('Ciclo escolar').click();
  await page.getByRole('option').filter({ hasText: cycle?.[0].name }).click();
  await studentsPage.conceptNameInp.fill(conceptName);
  await page.getByRole('option', { name: `${conceptName}` }).click({ timeout: 15000 });
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByTestId('generic-checkbox').nth(1).click();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  const response = await page.waitForResponse(/\/api\/v1\/dashboard\/students\/[a-f0-9-]+\/assignments\//);
  const assignResponse: StudentAssignment = await response.json();
  await expect(page.getByText('Ocurrió un error inesperado')).not.toBeVisible({ timeout: 5000 });
  await loginPage.conceptsBtn.click();
  await page.goBack();
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await studentsPage.assignConcept.scrollIntoViewIfNeeded({ timeout: 5000 });
  await page.getByRole('tab', { name: 'Vigentes' }).scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'Vigentes' }).click();
  await page.getByRole('tab', { name: 'Opcionales' }).click();
  await expect(page.getByRole('cell', { name: conceptName, exact: true })).toBeVisible({
    timeout: 2000,
  });
  await page.getByRole('cell', { name: conceptName, exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('close-button').click();
    await page.getByRole('cell', { name: conceptName, exact: true }).click();
    await delay(1000);
    if (await page.getByTestId('generic-checkbox').first().isChecked()) {
      return;
    }
  }
  const elements = page.getByRole('checkbox');
  const count = await elements.count();
  await expect(page.getByRole('checkbox').first()).toBeChecked({ timeout: 20000 });
  await expect(page.getByRole('checkbox').nth(1)).toBeChecked({ timeout: 20000 });
  let ordersToPay = 0;
  for (let index = 0; index < count; index++) {
    const isChecked = await elements.nth(index).isChecked({ timeout: 3000 });
    if (isChecked) {
      ordersToPay++;
    }
  }
  expect(ordersToPay).toEqual(2);
  await destroyOptionalAssignmentByApi(studentId, assignResponse.id);
  await deleteConceptByApi(conceptId, schoolID);
});

test('Colegio asigna concepto opcional sin atriburtos a un alumno @e2e', async ({ page }) => {
  //Given existe alumno sin concepto Asignado
  // And el colegio ingreso en el dashboard
  const schoolName = 'School GVS';
  const schoolID = await getSchoolIdByName('School GVS');
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Secundaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  const conceptId = (
    await createOtherConceptByApi(conceptName, fiscalEntity, bancAccount?.id, cycle?.[0].id, schoolID, false)
  ).id;
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  const matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  const studentId = await createStudentWithParams(
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
  const studentsPage = new StudentsPage(page);
  //ingreso a seccion estudiantes y seleccion todos los ciclos
  await loginPage.studentsBtn.click({ timeout: 60000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
  await expect(studentsPage.highDelinquencyTxt).toBeVisible({ timeout: 10000 });
  await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel para agregar conceptos
  await studentsPage.assignConcept.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Asignar concepto' }).click();
  await page.getByPlaceholder('Ciclo escolar').click();
  await page.getByRole('option').filter({ hasText: cycle?.[0].name }).click();
  await studentsPage.conceptNameInp.fill(conceptName);
  await page.getByRole('option', { name: conceptName }).click({ timeout: 15000 });
  await page.getByTestId('generic-checkbox').click();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  const response = await page.waitForResponse(/\/api\/v1\/dashboard\/students\/[a-f0-9-]+\/assignments\//);
  const assignResponse: StudentAssignment = await response.json();
  await expect(page.getByText('Ocurrió un error inesperado')).not.toBeVisible({ timeout: 5000 });
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await page.getByRole('tab', { name: 'Vigentes' }).click();
  await page.getByRole('tab', { name: 'Opcionales' }).click();
  await expect(page.getByRole('cell', { name: conceptName, exact: true })).toBeVisible({
    timeout: 2000,
  });
  await page.getByRole('cell', { name: conceptName, exact: true }).click();
  for (let i = 0; i < 10; i++) {
    await page.getByTestId('close-button').click();
    await page.getByRole('cell', { name: conceptName, exact: true }).click();
    await delay(1000);
    if (await page.getByTestId('generic-checkbox').isChecked()) {
      return;
    }
  }
  await expect(page.locator('#concept-select-orders').getByText(conceptName)).toBeVisible({
    timeout: 5000,
  });
  const elements = page.getByTestId('generic-checkbox');
  const count = await elements.count();
  let ordersToPay = 0;
  for (let index = 0; index < count; index++) {
    const isChecked = await elements.nth(index).isChecked({ timeout: 3000 });
    if (isChecked) {
      ordersToPay++;
    }
  }
  expect(ordersToPay).toEqual(1);
  await destroyOptionalAssignmentByApi(studentId, assignResponse.id);
  await deleteConceptByApi(conceptId, schoolID);
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

async function unsuscribeGuardian(page: LoginPage, guardianFirstName?: string, guardianLastName?: string) {
  if (guardianFirstName || guardianLastName) {
    await page.page
      .getByRole('button', {
        name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@`,
      })
      .isVisible();
  }
  //elimino el tutor del alumno
  await page.page.getByTestId('arrow-button').hover();
  await delay(2000);
  await page.page.getByTestId('unsuscribeGuardian-button').hover();
  await delay(2000);
  await page.page.getByTestId('unsuscribeGuardian-button').click();
  await page.page.getByText('Sí, desasignar').click();
}
