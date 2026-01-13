import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { dashboardLogin, delay, getActiveSchoolCycleBySchoolId, getSchoolIdByName, goto } from '../../helpers/commons';
import { user1 } from '../../data/data';
import { ScholarshipsPage } from '/pages/dashboard/scholarshipsPage';
import { ScholarshipsDetailPage } from '/pages/dashboard/scholarshipsDetailPage';
import { SchoolCycle } from '@cometa/trpc/src/types';

let schoolName: string;
let cycle: SchoolCycle[];
let schoolId: string;

test.beforeEach(async () => {
  // Given Existe un estudiante creado
  schoolName = 'School CAN';
  schoolId = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolId, true);
});

test('Desactivo Beca asignada a un estudiante con el impacto en Colegiatura / Mensualidad y pago realizado @sanity', async ({
  page,
}) => {
  // Configurar el viewport
  await page.setViewportSize({ width: 1200, height: 800 });

  // Instancias de las páginas
  const loginPage = new LoginPage(page);
  const scholarshipsPage = new ScholarshipsPage(page);
  const scholarshipsDetailPage = new ScholarshipsDetailPage(page);
  // Ir a la página principal y loguearse
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);

  // Hacer clic en el botón de becas
  await loginPage.scholarshipsBtn.click({ timeout: 15000 });
  await scholarshipsPage.resumeTab.click();
  const response = await page.waitForResponse(/\/api\/trpc\/schools\.schoolsScholarshipsList\?input.+/);
  const jsonResponse = await response.json();
  await scholarshipsPage.tableTab.click();
  const activeScholarships = jsonResponse.result.data.json.results.filter(
    (result: { name: string; students: { state: string }[] }) =>
      result.name === 'Beca 10%' && result.students.map((student) => student.state).includes('active')
  );
  await page.getByRole('cell', { name: 'Beca 10%' }).click();
  await scholarshipsDetailPage.studentsAssignedTab.click();
  await scholarshipsDetailPage.findStudentInput.fill(
    `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`
  );
  await page
    .getByRole('cell', {
      name: `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`,
    })
    .click();
  await delay(3000);
  await scholarshipsDetailPage.editBtn.click();
  await scholarshipsDetailPage.activateBtn.click();
  await expect(page.getByText('¿Quieres Desactivar la beca')).toBeVisible({ timeout: 10000 });
  const popUpDesactivar = scholarshipsDetailPage.getDeactivateSchollarshipCyclePopUp();
  await scholarshipsDetailPage.getdeactivateBtn(popUpDesactivar).click();
  await scholarshipsDetailPage.saveBtn.click();
  await delay(2000);
  const sections = scholarshipsDetailPage.getCycleSectionsElements(cycle);
  await expect(sections).toContainText('Desactivado', { timeout: 30000 });
  await scholarshipsDetailPage.closeBtn.click();
  await scholarshipsDetailPage.informationTab.click();
  await scholarshipsDetailPage.studentsAssignedTab.click();
  await scholarshipsDetailPage.findStudentInput.fill(
    `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`
  );
  await page
    .getByRole('cell', {
      name: `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`,
    })
    .click();
});

test('Usuario dashboard visualiza en lista de becas 1 beca % con el impacto en Colegiatura / Mensualidad @sanity', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const loginPage = new LoginPage(page);
  const scholarshipsPage = new ScholarshipsPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.scholarshipsBtn.click({ timeout: 15000 });
  await scholarshipsPage.findSchoolarshipTxt.fill('Beca 10%');
  await expect(page.getByText('Beca 10%')).toBeVisible();
  await delay(5000);
  // Acceder a la tabla
  const tabla = page.getByTestId('infinitScroll-table');

  // Acceder a la primera fila
  const primeraFila = tabla.locator('tbody tr').first();

  // Obtener los textos de las celdas
  const nombreTexto = await primeraFila.locator('td:nth-child(1)').innerText();
  const valorDescuentoTexto = await primeraFila.locator('td:nth-child(2)').innerText();
  const conceptosTexto = await primeraFila.locator('td:nth-child(3)').innerText();

  // Comparar los textos con los datos esperados
  const nombreEsperado = 'Beca 10%';
  const valorDescuentoEsperado = '10%';
  const conceptosEsperado = 'Colegiatura / Mensualidad';

  expect(nombreTexto).toBe(nombreEsperado);
  expect(valorDescuentoTexto).toBe(valorDescuentoEsperado);
  expect(conceptosTexto).toBe(conceptosEsperado);
});

test('Usuario ingresa en Resumen asignación con filtro por default del ciclo actual y visualiza el listado agrupado por beca @sanity', async ({
  page,
}) => {
  // Configurar el viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // Instancias de las páginas
  const loginPage = new LoginPage(page);
  const scholarshipsPage = new ScholarshipsPage(page);

  // Ir a la página principal y loguearse
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);

  // Hacer clic en el botón de becas
  await loginPage.scholarshipsBtn.click({ timeout: 15000 });

  // Hacer clic en la pestaña "Resumen"
  await scholarshipsPage.resumeTab.click();
  const response = await page.waitForResponse(/\/api\/trpc\/schools\.schoolsScholarshipsList\?input/);
  const jsonResponse = await response.json();

  // Obtener la lista de nombres del JSON
  const expectedNames = jsonResponse.result.data.json.results.map((result: { name: string }) => result.name);

  // Cerrar los colapsables de todas las becas
  await scholarshipsPage.collapsableIcon.click();

  // Esperar unos segundos para que la lista se cargue
  await delay(5000);

  // Obtener el contenedor de la lista con getByTestId
  const virtuosoItemList = page.getByTestId('virtuoso-item-list');

  // Obtener los nombres de becas visibles en la página y normalizar los textos
  const spanNombreBeca = (
    await virtuosoItemList.locator('[class="pr-4 h-[40px] flex items-center pl-2"]').allTextContents()
  ).map((text) => text.trim()); // Usar trim() para eliminar espacios extra

  // Validar que la longitud de expectedNames sea >= a la de spanNombreBeca
  expect(expectedNames.length).toBeGreaterThanOrEqual(spanNombreBeca.length);

  // Iterar sobre los nombres esperados y validar que estén presentes en el listado visible
  expectedNames.forEach((expectedName: string[]) => {
    // Validar que cada expectedName se encuentre dentro de spanNombreBeca
    expect(spanNombreBeca).toContain(expectedName);
  });
});

test('Usuario descarga un reporte de becas asignadas filtrando por nivel Primaria, beca "Beca 10%" y ciclo actual @sanity', async ({
  page,
}) => {
  // Configurar el viewport
  //await page.setViewportSize({ width: 1280, height: 800 });

  // Instancias de las páginas
  const loginPage = new LoginPage(page);
  const scholarshipsPage = new ScholarshipsPage(page);

  // Ir a la página principal y loguearse
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);

  // Hacer clic en el botón de becas
  await loginPage.scholarshipsBtn.click({ timeout: 15000 });

  await scholarshipsPage.resumeTab.click();
  const response = await page.waitForResponse(/\/api\/trpc\/schools\.schoolsScholarshipsList\?input.+/);
  const jsonResponse = await response.json();
  // Filtramos las becas que tienen el nombre "Beca 10%"
  const becasBeca10 = jsonResponse.result.data.json.results.filter(
    (beca: { name: string }) => beca.name === 'Beca 10%'
  );

  // Contamos el total de estudiantes en todas las becas filtradas
  const totalEstudiantes = becasBeca10.reduce(
    (count: number, beca: { students: string[] }) => count + beca.students.length,
    0
  );

  await scholarshipsPage.filterBtn.click();
  await scholarshipsPage.filterByLevelOpt.click();
  await scholarshipsPage.filterOptionPrimaria.click();
  await scholarshipsPage.filterByscholarshipDiscountOpt.click();
  await page.getByTestId('Beca 10%-filterOption').click();
  await scholarshipsPage.applyFilterBtn.click();
  const estudiantes = await page
    .getByRole('button')
    .locator('[class="text-[#637381] text-xs font-light"]')
    .textContent();
  expect(totalEstudiantes + ' estudiantes').toEqual(estudiantes);
});

test('Activo Beca previamente desactivada a un estudiante con el impacto en Colegiatura / Mensualidad y pago realizado @sanity', async ({
  page,
}) => {
  // Configurar el viewport
  await page.setViewportSize({ width: 1580, height: 800 });

  // Instancias de las páginas
  const loginPage = new LoginPage(page);
  const scholarshipsPage = new ScholarshipsPage(page);
  const scholarshipsDetailPage = new ScholarshipsDetailPage(page);
  // Ir a la página principal y loguearse
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);

  // Hacer clic en el botón de becas
  await loginPage.scholarshipsBtn.click({ timeout: 15000 });
  await scholarshipsPage.resumeTab.click();
  const response = await page.waitForResponse(/\/api\/trpc\/schools\.schoolsScholarshipsList\?input.+/);
  const jsonResponse = await response.json();
  await scholarshipsPage.tableTab.click();
  const activeScholarships = jsonResponse.result.data.json.results.filter(
    (result: { name: string; students: { state: string }[] }) =>
      result.name === 'Beca 10%' && result.students.map((student) => student.state).includes('active')
  );
  await page.getByRole('cell', { name: 'Beca 10%' }).click();
  await scholarshipsDetailPage.studentsAssignedTab.click();
  await scholarshipsDetailPage.findStudentInput.fill(
    `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`
  );
  await page
    .getByRole('cell', {
      name: `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`,
    })
    .click();
  await delay(2000);
  const sections = scholarshipsDetailPage.getCycleSectionsElements(cycle);
  await expect(sections).toContainText('Desactivado');
  await scholarshipsDetailPage.editBtn.click();
  await scholarshipsDetailPage.reactivateBtn.click();
  await scholarshipsDetailPage.saveBtn.click();
  await delay(2000);
  await scholarshipsDetailPage.closeBtn.click();
  await scholarshipsDetailPage.informationTab.click();
  await scholarshipsDetailPage.studentsAssignedTab.click();
  await scholarshipsDetailPage.findStudentInput.fill(
    `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`
  );
  await page
    .getByRole('cell', {
      name: `${activeScholarships[0].students[0].first_name} ${activeScholarships[0].students[0].last_name}`,
    })
    .click();
});
