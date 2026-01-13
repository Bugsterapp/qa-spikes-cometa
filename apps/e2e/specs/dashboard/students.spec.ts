import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { StudentsPage } from '../../pages/dashboard/studentsPage';
import { DashboardStudentListDueOrderSerializerV4 } from '@cometa/trpc/src/types';
import {
  delay,
  generarCURP,
  goto,
  dashboardLogin,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  getLevelIdBySchoolId,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  generateEmail,
} from '../../helpers/commons';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  generateCellPhoneForFront,
  getGuardiansBySchoolId,
  createStudentWithParams,
  assignGuardianAPI,
  getStudentBySchoolId,
} from '../../helpers/students';
import { user1 } from '../../data/data';
import { StudentDetailPage } from '../../pages/dashboard/studentDetailPage';
import { createOtherConceptByApi, deleteConceptByApi, destroyOptionalAssignmentByApi } from '../../helpers/concepts';
import { StudentAssignment } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import { assignConceptToStudentFront } from '/helpers/studentsFront';
import { studentDetailPageConceptTab } from '/pages/dashboard/studentDetailPageConceptTab';

let schoolName: string;

test('Filtrar por nivel trae solo estudiantes del nivel seleccionado. @e2e @sanity', async ({ page }) => {
  // Se loguea el colegio
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  // Esperar que se cargue la sección con métricas
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();

  // Aplicar filtro de Primaria
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  if (await studentsPage.cleanAllFiltersBtn.isVisible()) {
    await studentsPage.cleanAllFiltersBtn.click();
  }
  await studentsPage.filterBtn.click();
  await delay(2000);
  await studentsPage.levelFilterSelector.click();
  await studentsPage.optionPrimaria.click();
  await studentsPage.applyFilterBtn.click();

  // Esperar y obtener la respuesta de la API
  const response = await (
    await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents\?.+/, { timeout: 90000 })
  ).json();

  // Obtener el conteo total de estudiantes filtrados
  const primariaCount = Array.isArray(response)
    ? response[0]?.result?.data?.json.count
    : response?.result?.data?.json.count;

  // Verificar el contador en la UI
  const uiCount = await page.getByTestId('studentsCountFooter-span').textContent();
  const uiCountNumber = uiCount ? parseInt(uiCount) : 0;
  expect(uiCountNumber).toBe(primariaCount);

  // Verificar que todas las filas muestren "Primaria" en la columna "Sección actual"
  const seccionActualCells = await page
    .locator('tbody tr')
    .locator('td')
    .filter({ hasText: /Primaria/ })
    .all();

  // Verificar que no hay celdas con otros niveles
  const otrosNiveles = await page
    .locator('tbody tr')
    .locator('td')
    .filter({
      hasText: /Secundaria|Preparatoria|Kinder/,
    })
    .count();
  expect(otrosNiveles).toBe(0);

  // Verificar el texto de cada celda de sección
  for (const cell of seccionActualCells) {
    const texto = await cell.textContent();
    expect(texto).toContain('Primaria');
  }
});

test('Filtrar por seccion trae solo estudiantes de la seccion seleccionada. @e2e @sanity', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  if (await studentsPage.cleanAllFiltersBtn.isVisible()) {
    await studentsPage.cleanAllFiltersBtn.click();
    await delay(2000);
  }
  await studentsPage.filterBtn.click();
  await studentsPage.sectionFilterSelector.click();
  await studentsPage.sectionFilterTxtBox.fill('1 A');

  // Seleccionar específicamente "1 A Primaria"
  await page.locator('label').filter({ hasText: '1 APrimaria' }).click();
  await studentsPage.applyFilterBtn.click();

  // Esperar y obtener la respuesta de la API
  const response = await (
    await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents\?.+/, { timeout: 90000 })
  ).json();

  // Verificar que todos los estudiantes en la respuesta son de sección 1 A y nivel Primaria
  const students = response[0].result.data.json.results;
  const totalStudents = response[0].result.data.json.count;

  // Verificar que el contador en la UI coincide con la respuesta de la API con reintentos
  let uiCountNumber = 0;
  for (let i = 0; i < 5; i++) {
    const uiCount = await page.getByTestId('studentsCountFooter-span').textContent();
    uiCountNumber = uiCount ? parseInt(uiCount) : 0;
    if (uiCountNumber === totalStudents) {
      break;
    }
    await delay(1000);
  }
  expect(uiCountNumber).toBe(totalStudents);

  // Verificar que cada estudiante en la respuesta tiene la sección y nivel correctos
  students.forEach((student: DashboardStudentListDueOrderSerializerV4) => {
    expect(student.section).toBe('1 A');
    expect(student.level).toBe('Primaria');
  });

  // Verificar las celdas en la tabla
  const rows = page.locator('tbody tr');
  const totalRows = await rows.count();

  // Verificar que el número de filas coincide con el total de estudiantes (máximo 50 por página)
  const expectedRows = Math.min(totalStudents, 50);
  expect(totalRows).toBe(expectedRows);

  // Verificar el contenido de cada fila
  for (let i = 0; i < totalRows; i++) {
    const row = rows.nth(i);

    // Verificar la columna de sección (asumiendo que es la cuarta columna, índice 3)
    const seccionCell = row.locator('td').nth(3);
    await expect(seccionCell).toHaveText('1 APrimaria');

    // Verificar que el estudiante existe en la respuesta de la API
    const studentName = await row.locator('td').first().textContent();
    const studentExists = students.some(
      (student: DashboardStudentListDueOrderSerializerV4) =>
        `${student.last_name}, ${student.first_name}` === studentName?.trim()
    );
    expect(studentExists).toBe(true);
  }
});

test('Filtrar por colegiaturas vencidas trae solo estudiantes segun el filtro aplicado. @e2e', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.filterBtn.scrollIntoViewIfNeeded();
  await studentsPage.filterBtn.click();
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
  const schoolID = await getSchoolIdByName(schoolName);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
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
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
  await studentsPage.schoolCycleBtn.first().click();
  await studentsPage.schoolCycleTodosOpt.click();
  await studentsPage.tutorFilterTxt.scrollIntoViewIfNeeded();
  await studentsPage.tutorFilterTxt.fill(`${guardianFirstName} ${guardianLastName}`);
  await page.getByRole('option', { name: `${guardianFirstName} ${guardianLastName} Email: ${guardianEmail}` }).click();
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  await expect(page.getByTestId(`${firstName} ${lastName}`)).toBeVisible({ timeout: 10000 });
});

test('Filtrar por estudiante trae solo estudiantes segun el filtro aplicado. @e2e', async ({ page }) => {
  //Given existe un alumno con tutor asignado
  const schoolID = await getSchoolIdByName(schoolName);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const data = await getStudentBySchoolId(schoolID, cycle?.[0].id);
  const student = data?.results?.find((student) => student.is_active);
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
  //Then valida que se carga la tabla con el estudiante filtradora
  await page.getByRole('heading', { name: `${student?.first_name} ${student?.last_name}` }).click();
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
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  await studentsPage.newStudentBtn.click();
  //COMPLEETO FORMULARIO CON DATOS DEL ESTUDIANTE
  await studentsPage.studentFirstName.fill(studentFirstName);
  await studentsPage.studentLastName.fill(studentLastName);
  await studentsPage.studentCurp.fill(curp);
  await studentsPage.studentBirthdate.fill('02/02/2009');
  await studentsPage.genderM.click();
  await studentsPage.nextBtn.click();
  //COMPLETO FORMULARIO CON DATOS DE CURSO DEL ALUMNO
  await studentsPage.enrollmentCode.fill(matricula);
  await page.getByTestId('schoolCycle-combobox').getByText('Ciclo de ingreso').first().click();
  const listBox = page.getByRole('listbox');
  await listBox.getByText('Ciclo actual').click();
  await studentsPage.levelSelector.click();
  await studentsPage.rowLevelPrimaria.click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('1ero').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await studentsPage.nextBtn.click();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.assignBtn.click();
  await expect(studentsPage.studentDetailsHead).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula:`,
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
  const schoolID = await getSchoolIdByName(schoolName);
  const data = await getGuardiansBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const studentsPage = new StudentsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  await studentsPage.newStudentBtn.click();
  //COMPLEETO FORMULARIO CON DATOS DEL ESTUDIANTE
  await studentsPage.studentFirstName.fill(studentFirstName);
  await studentsPage.studentLastName.fill(studentLastName);
  await studentsPage.studentCurp.fill(curp);
  await studentsPage.studentBirthdate.fill('02/02/2009');
  await studentsPage.genderM.click();
  await studentsPage.nextBtn.click();
  //COMPLETO FORMULARIO CON DATOS DE CURSO DEL ALUMNO
  await studentsPage.enrollmentCode.fill(matricula);
  await page.getByTestId('schoolCycle-combobox').getByText('Ciclo de ingreso').first().click();
  const listBox = page.getByRole('listbox');
  await listBox.getByText('Ciclo actual').click();
  await studentsPage.levelSelector.click();
  await studentsPage.rowLevelPrimaria.click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('1ero').click();
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
  await studentsPage.assignBtn.click();
  await expect(studentsPage.studentDetailsHead).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .getByRole('main')
      .locator('div')
      .filter({
        hasText: `${studentFirstName} ${studentLastName}Ver más infoMatrícula:`,
      })
      .nth(3)
  ).toBeVisible({ timeout: 10000 });
});

test('Alta nuevo estudiante y tutor + asignacion de conceptos y beca y registro de pago de la orden. @sanity @e2e', async ({
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
  const studentssDetailPageConceptTab = new studentDetailPageConceptTab(page);
  //Y estoy logueado en la seccion estudiantes
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.studentsBtn.click({ timeout: 5000 });
  await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });
  //Cuando agrego un nuevo estudiante
  await studentsPage.newStudentBtn.click();
  //COMPLEETO FORMULARIO CON DATOS DEL ESTUDIANTE
  await studentsPage.studentFirstName.fill(studentFirstName);
  await studentsPage.studentLastName.fill(studentLastName);
  await studentsPage.studentCurp.fill(curp);
  await studentsPage.studentBirthdate.fill('02/02/2009');
  await studentsPage.genderM.click();
  await studentsPage.nextBtn.click();
  //COMPLETO FORMULARIO CON DATOS DE CURSO DEL ALUMNO
  await studentsPage.enrollmentCode.fill(matricula);
  //estan mal los ID, hack para trear los ID de los selectores
  await page.getByTestId('schoolCycle-combobox').getByText('Ciclo de ingreso').first().click();
  const listBox = page.getByRole('listbox');
  await listBox.getByText('Ciclo actual').click();
  await studentsPage.levelSelector.click();
  await studentsPage.rowLevelPrimaria.click();
  await studentsPage.gradeBtn.click();
  await page.getByLabel('1').click();
  await studentsPage.groupBtn.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await studentsPage.nextBtn.click();
  await studentsPage.registerNewGuardianChk.click();
  await studentsPage.guardianFirstName.fill(guardianFirstName);
  await studentsPage.guardianLastName.fill(guardianLastName);
  await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
  await studentsPage.guardianCellPhone.fill(guardianCellPhone);
  await studentsPage.genderM.click();
  await studentsPage.studentParentRelationSelector.click();
  await page.getByRole('option', { name: 'Madre' }).click();
  await studentsPage.assignBtn.click();
  await studentsPage.guardianAssignementHead.scrollIntoViewIfNeeded();
  await page
    .getByRole('button', {
      name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@getcometa.com +52${guardianCellPhone}`,
    })
    .isVisible();
  //C
  const conceptName = 'Colegiatura Primaria X12 - 2024-2025';
  let count = await assignConceptToStudentFront(
    studentsDetailsPage,
    studentsPage,
    studentssDetailPageConceptTab,
    conceptName
  );
  //Agrego una beca al estudiante
  await studentsDetailsPage.scholarshipAssignBtn.scrollIntoViewIfNeeded();
  await studentsDetailsPage.scholarshipAssignBtn.click();
  await expect(page.getByPlaceholder('Selecciona una beca')).toBeVisible();
  await page.getByPlaceholder('Selecciona una beca').click();
  await page.getByPlaceholder('Selecciona una beca').fill('Apoyo 50%');
  await page.getByRole('option', { name: 'Apoyo 50%' }).first().click();
  await page.getByText('Ciclo escolarSelecciona un').click();
  await page.waitForSelector('role=listbox', { state: 'visible' });
  await page.getByRole('listbox').getByText('Ciclo actual').click();
  await studentsPage.continueBtn.click();
  await studentsPage.assignBtn.click();
  await expect(studentsPage.assingSchollarshipSuccessMsg).toBeVisible({ timeout: 20000 });
  //Ingreso en el concepto asignado y valido que tenga las opciones elegidas asociadas
  await page.getByRole('heading', { name: 'Conceptos asignados' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('cell', { name: conceptName, exact: true })).toBeVisible();
  await page.getByRole('cell', { name: conceptName, exact: true }).click();
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
  expect(ordersToPay).toEqual(count);
});

test('Colegio asigna concepto opcional con atriburtos a un alumno @e2e', async ({ page }) => {
  // Given existe un alumno para asignar el concepto con atributos
  const schoolID = await getSchoolIdByName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
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
  await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel para agregar conceptos
  const studentDetailPage = new StudentDetailPage(page);
  await studentDetailPage.conceptTab.click();
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
    timeout: 5000,
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
  const schoolID = await getSchoolIdByName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
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
  await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();
  //Busco alumno y seleciono orden para agregar recargo
  await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
  await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
  await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
  //Abro sidepanel para agregar conceptos
  const studentDetailPage = new StudentDetailPage(page);
  await studentDetailPage.conceptTab.click();
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

test.beforeEach(async () => {
  // Given Existe un estudiante creado
  schoolName = 'Instituto Internacional Carlos';
});
