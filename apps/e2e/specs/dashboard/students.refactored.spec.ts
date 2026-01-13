/**
 * REFACTORED STUDENTS SPEC
 * Este archivo es una versión refactorizada de students.spec.ts que usa:
 * - Fixtures de testSetup.ts (authenticatedDashboard, schoolContext)
 * - Funciones de retryUtils en lugar de las viejas
 * - apiClient centralizado
 * - Menos boilerplate
 */

import { expect } from '@playwright/test';
import { test, loginToDashboard, createSchoolContext, SchoolContext } from '../../helpers/testSetup';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { StudentsPage } from '../../pages/dashboard/studentsPage';
import { DashboardStudentListDueOrderSerializerV4 } from '@cometa/trpc/src/types';
import { generarCURP, generateEmail } from '../../helpers/commons';
import { delay, waitForElementVisible } from '../../helpers/retryUtils';
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

const SCHOOL_NAME = 'Instituto Internacional Carlos';

// ============================================================================
// TESTS USANDO NUEVOS FIXTURES Y HELPERS
// ============================================================================

test.describe('Students Refactored Tests', () => {
  /**
   * Test usando el fixture authenticatedDashboard
   * Ya no necesitamos hacer goto() + dashboardLogin() manualmente
   */
  test('Filtrar por nivel trae solo estudiantes del nivel seleccionado (REFACTORED). @e2e @sanity @refactored', async ({
    authenticatedDashboard,
  }) => {
    const { page, loginPage } = authenticatedDashboard;
    const studentsPage = new StudentsPage(page);

    // El fixture ya hizo login, solo navegamos a estudiantes
    await loginPage.studentsBtn.click({ timeout: 5000 });

    // Usamos waitForElementVisible de retryUtils en lugar de expect().toBeVisible()
    await waitForElementVisible(page, studentsPage.studentsTxt, {
      maxRetries: 10,
      delayBetweenRetries: 3000,
    });

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

    // Verificar que no hay celdas con otros niveles
    const otrosNiveles = await page
      .locator('tbody tr')
      .locator('td')
      .filter({
        hasText: /Secundaria|Preparatoria|Kinder/,
      })
      .count();
    expect(otrosNiveles).toBe(0);
  });

  /**
   * Test usando schoolContext fixture para obtener IDs pre-cargados
   */
  test('Filtrar por tutor trae solo estudiantes segun el filtro aplicado (REFACTORED). @e2e @refactored', async ({
    page,
    schoolContext,
  }) => {
    // schoolContext ya tiene todos los IDs pre-cargados
    const { schoolId, levelId, sectionId, cycleId } = schoolContext;

    // Generar datos de prueba
    const firstName = await generateFirstName();
    const lastName = await generateLastName();
    const guardianFirstName = await generateFirstName();
    const guardianLastName = await generateLastName();
    const studentMotherLastName = await generateLastName();
    const matricula = await generateMatricula();
    const curp = await generarCURP(lastName, studentMotherLastName, firstName);

    // Crear estudiante usando los IDs del contexto
    const student_id = await createStudentWithParams(
      firstName,
      lastName,
      matricula,
      levelId,
      sectionId,
      schoolId,
      curp,
      undefined,
      undefined,
      cycleId
    );

    // Asignar tutor
    const guardianEmail = generateEmail(guardianFirstName, guardianLastName);
    await assignGuardianAPI(student_id, schoolId, guardianFirstName, guardianLastName, guardianEmail);

    // Login usando helper simplificado
    const loginPage = await loginToDashboard(page, { schoolName: SCHOOL_NAME });
    const studentsPage = new StudentsPage(page);

    await loginPage.studentsBtn.click({ timeout: 5000 });
    await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
    await studentsPage.schoolCycleBtn.first().click();
    await studentsPage.schoolCycleTodosOpt.click();
    await studentsPage.tutorFilterTxt.scrollIntoViewIfNeeded();
    await studentsPage.tutorFilterTxt.fill(`${guardianFirstName} ${guardianLastName}`);
    await page
      .getByRole('option', { name: `${guardianFirstName} ${guardianLastName} Email: ${guardianEmail}` })
      .click();
    await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();
    await expect(page.getByTestId(`${firstName} ${lastName}`)).toBeVisible({ timeout: 10000 });
  });

  /**
   * Test combinando authenticatedDashboard + schoolContext
   */
  test('Filtrar por estudiante trae solo estudiantes segun el filtro aplicado (REFACTORED). @e2e @refactored', async ({
    authenticatedDashboard,
    schoolContext,
  }) => {
    const { page, loginPage } = authenticatedDashboard;
    const { schoolId, cycleId } = schoolContext;

    const studentsPage = new StudentsPage(page);

    // Obtener un estudiante existente
    const data = await getStudentBySchoolId(schoolId, cycleId);
    const student = data?.results?.find((s) => s.is_active);

    if (!student) {
      test.skip(true, 'No hay estudiantes activos para este test');
      return;
    }

    // Ya estamos logueados, navegar a estudiantes
    await loginPage.studentsBtn.click({ timeout: 5000 });
    await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });

    await studentsPage.schoolCycleBtn.first().click();
    await studentsPage.schoolCycleTodosOpt.click();

    await studentsPage.studentFilterTxt.scrollIntoViewIfNeeded();
    await studentsPage.studentFilterTxt.fill(`${student.first_name} ${student.last_name}`);

    await page.getByRole('heading', { name: `${student.first_name} ${student.last_name}` }).click();
  });

  /**
   * Test completo usando todos los nuevos helpers
   */
  test('Alta nuevo estudiante y tutor + asignacion de conceptos (REFACTORED). @sanity @e2e @refactored', async ({
    authenticatedDashboard,
  }) => {
    const { page, loginPage } = authenticatedDashboard;

    // Generar datos sintéticos
    const studentFirstName = await generateFirstName();
    const studentLastName = await generateLastName();
    const studentMotherLastName = await generateLastName();
    const matricula = await generateMatricula();
    const guardianFirstName = await generateFirstName();
    const guardianLastName = await generateLastName();
    const guardianCellPhone = await generateCellPhoneForFront();
    const curp = await generarCURP(studentLastName, studentMotherLastName, studentFirstName);

    const studentsPage = new StudentsPage(page);
    const studentsDetailsPage = new StudentDetailPage(page);
    const studentssDetailPageConceptTab = new studentDetailPageConceptTab(page);

    // Navegar a estudiantes (ya logueado por fixture)
    await loginPage.studentsBtn.click({ timeout: 5000 });
    await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 50000 });

    // Agregar nuevo estudiante
    await studentsPage.newStudentBtn.click();

    // Formulario datos del estudiante
    await studentsPage.studentFirstName.fill(studentFirstName);
    await studentsPage.studentLastName.fill(studentLastName);
    await studentsPage.studentCurp.fill(curp);
    await studentsPage.studentBirthdate.fill('02/02/2009');
    await studentsPage.genderM.click();
    await studentsPage.nextBtn.click();

    // Formulario datos de curso
    await studentsPage.enrollmentCode.fill(matricula);
    await page.getByTestId('schoolCycle-combobox').getByText('Ciclo de ingreso').first().click();
    await page.getByRole('listbox').getByText('Ciclo actual').click();
    await studentsPage.levelSelector.click();
    await studentsPage.rowLevelPrimaria.click();
    await studentsPage.gradeBtn.click();
    await page.getByLabel('1').click();
    await studentsPage.groupBtn.click();
    await page.getByLabel('A', { exact: true }).getByText('A').click();
    await studentsPage.nextBtn.click();

    // Registrar nuevo tutor
    await studentsPage.registerNewGuardianChk.click();
    await studentsPage.guardianFirstName.fill(guardianFirstName);
    await studentsPage.guardianLastName.fill(guardianLastName);
    await studentsPage.guardianEmail.fill(`${guardianLastName}${guardianFirstName}@getcometa.com`);
    await studentsPage.guardianCellPhone.fill(guardianCellPhone);
    await studentsPage.genderM.click();
    await studentsPage.studentParentRelationSelector.click();
    await page.getByRole('option', { name: 'Madre' }).click();
    await studentsPage.assignBtn.click();

    // Verificar asignación del tutor
    await studentsPage.guardianAssignementHead.scrollIntoViewIfNeeded();
    await page
      .getByRole('button', {
        name: `${guardianFirstName} ${guardianLastName} ${guardianLastName}${guardianFirstName}@getcometa.com +52${guardianCellPhone}`,
      })
      .isVisible();

    // Asignar concepto
    const conceptName = 'Colegiatura Primaria X12 - 2024-2025';
    let count = await assignConceptToStudentFront(
      studentsDetailsPage,
      studentsPage,
      studentssDetailPageConceptTab,
      conceptName
    );

    // Agregar beca
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

    // Verificar conceptos asignados
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

  /**
   * Test de concepto opcional usando schoolContext para IDs
   */
  test('Colegio asigna concepto opcional con atributos (REFACTORED). @e2e @refactored', async ({
    authenticatedDashboard,
    schoolContext,
  }) => {
    const { page, loginPage } = authenticatedDashboard;
    const { schoolId, levelId, sectionId, cycleId, cycleName, fiscalEntityId, bankAccountId } = schoolContext;

    // Crear concepto de prueba
    const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
    const conceptData = await createOtherConceptByApi(
      conceptName,
      fiscalEntityId,
      bankAccountId,
      cycleId,
      schoolId,
      true
    );
    const conceptId = conceptData.id;

    // Crear estudiante
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
      schoolId,
      curp,
      undefined,
      undefined,
      cycleId
    );

    const studentsPage = new StudentsPage(page);

    // Ya logueados, ir a estudiantes
    await loginPage.studentsBtn.click({ timeout: 60000 });
    await expect(studentsPage.studentsTxt).toBeVisible({ timeout: 30000 });
    await studentsPage.schoolCycleBtn.first().click();
    await studentsPage.schoolCycleTodosOpt.click();
    await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();

    // Buscar y seleccionar alumno
    await studentsPage.studentFilterTxtBox.fill(`${firstName} ${lastName}`);
    await page.getByTestId(`${firstName} ${lastName}-listItem`).click({ timeout: 5000 });
    await page.getByRole('cell', { name: `${lastName}, ${firstName}` }).click();

    // Asignar concepto
    const studentDetailPage = new StudentDetailPage(page);
    await studentDetailPage.conceptTab.click();
    await studentsPage.assignConcept.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Asignar concepto' }).click();
    await page.getByPlaceholder('Ciclo escolar').click();
    await page.getByRole('option').filter({ hasText: cycleName }).click();
    await studentsPage.conceptNameInp.fill(conceptName);
    await page.getByRole('option', { name: `${conceptName}` }).click({ timeout: 15000 });
    await page.getByTestId('generic-checkbox').first().click();
    await page.getByTestId('generic-checkbox').nth(1).click();
    await page.getByRole('button', { name: 'Asignar', exact: true }).click();

    const response = await page.waitForResponse(/\/api\/v1\/dashboard\/students\/[a-f0-9-]+\/assignments\//);
    const assignResponse: StudentAssignment = await response.json();
    await expect(page.getByText('Ocurrió un error inesperado')).not.toBeVisible({ timeout: 5000 });

    // Cleanup
    await destroyOptionalAssignmentByApi(studentId, assignResponse.id);
    await deleteConceptByApi(conceptId, schoolId);
  });
});

