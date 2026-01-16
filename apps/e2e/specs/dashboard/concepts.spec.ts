import { test, expect, ElementHandle } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { faker } from '@faker-js/faker';
import {
  dashboardLogin,
  generarCURP,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  goto,
} from '../../helpers/commons';
import { ConceptsPage } from '../../pages/dashboard/conceptsPage';
import { NewConceptSteps } from '../../pages/dashboard/newConceptSteps';
import {
  addOrdersToStudent,
  createConcept,
  createMonthlyPaymentsConcept,
  createOtherConcept,
  createOtherConceptWithAttributes,
  deleteConceptByApi,
  destroyMonthlyFeeAssignmentByApi,
  getOrdersByConceptId,
  hasPaidOrdersRequiredProxy,
} from '../../helpers/concepts';
import { user1 } from '../../data/data';
import {
  createStudentWithParams,
  generateFirstName,
  generateLastName,
  generateMatricula,
} from '../../helpers/students';

// Primero, asegúrate de que estás usando la escuela correcta para el ambiente
const schoolName = 'Instituto Internacional Carlos';

let schoolID: string;

test.beforeEach(async () => {
  // Given Existe un estudiante creado
  schoolID = await getSchoolIdByName(schoolName);
});

test('Usuario crea concepto con pagos mensuales recurrentes con restriccion, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos @e2e @sanity', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const loginPage = new LoginPage(page);
  const conceptsPage = new ConceptsPage(page);
  const newConceptSteps = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  const restriction = true;
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.conceptsBtn).toBeVisible({ timeout: 60000 });
  const conceptId = await createMonthlyPaymentsConcept(
    page,
    loginPage,
    conceptsPage,
    newConceptSteps,
    conceptName,
    conceptPrice,
    false,
    bancAccount?.publicSummary,
    restriction
  );
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  const rows: ElementHandle[] = await page.$$('table tr');

  // Valida en la tabla nombre y precio del concepto para las primeras 10 filas.
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];

    // Encuentra la celda en la columna 1 (índice 0)
    const cell1: ElementHandle | null = await row.$('td:nth-child(1)');
    if (cell1) {
      const conceptoText: string = await cell1.innerText();

      // Comprueba si la celda en la columna 1 contiene "Concepto"
      if (conceptoText.trim() === conceptName) {
        // Encuentra la celda en la columna 5 (índice 4)
        const cell4: ElementHandle | null = await row.$('td:nth-child(4)');
        if (cell4) {
          const valueInColumnPrice: string = (await cell4.innerText()).replace(/[,.]/g, '');
          expect(valueInColumnPrice).toBe(`$${conceptPrice}00`);
        }
      }
    }
  }
  //Valido que se aplico la restriccion periodica al concepto correctamente.
  const data = await getOrdersByConceptId(conceptId);
  if (data.results?.[1].id) {
    expect(await hasPaidOrdersRequiredProxy(page, data.results[1].id, data)).toBeTruthy();
  } else {
    test.fail(true, 'No se pudo obtener el id de las ordenes');
  }
  //Elimino concepto post prueba
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario crea concepto con pagos mensuales recurrentes sin restriccion, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos @e2e', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  let bancAccount;
  try {
    bancAccount = await getBankAccountBySchoolName(schoolName);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log(`Error al obtener cuenta bancaria: ${error}`);
    /* eslint-disable-next-line turbo/no-undeclared-env-vars */
    const currentEnv = process.env.ENV_PLAYWRIGHT;
    test.fail(
      true,
      `No se pudo obtener la cuenta bancaria para la escuela ${schoolName}. Verifica que estás usando el ambiente correcto (actual: ${currentEnv})`
    );
    return;
  }
  const loginPage = new LoginPage(page);
  const conceptsPage = new ConceptsPage(page);
  const newConceptSteps = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  const restriction = false;
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await expect(loginPage.conceptsBtn).toBeVisible({ timeout: 60000 });
  const conceptId = await createMonthlyPaymentsConcept(
    page,
    loginPage,
    conceptsPage,
    newConceptSteps,
    conceptName,
    conceptPrice,
    false,
    bancAccount?.publicSummary,
    restriction
  );
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  const rows: ElementHandle[] = await page.$$('table tr');

  // Valida en la tabla nombre y precio del concepto para las primeras 10 filas.
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];

    // Encuentra la celda en la columna 1 (índice 0)
    const cell1: ElementHandle | null = await row.$('td:nth-child(1)');
    if (cell1) {
      const conceptoText: string = await cell1.innerText();

      // Comprueba si la celda en la columna 1 contiene "Concepto"
      if (conceptoText.trim() === conceptName) {
        // Encuentra la celda en la columna 5 (índice 4)
        const cell4: ElementHandle | null = await row.$('td:nth-child(4)');
        if (cell4) {
          const valueInColumnPrice: string = (await cell4.innerText()).replace(/[,.]/g, '');
          expect(valueInColumnPrice).toBe(`$${conceptPrice}00`);
        }
      }
    }
  }
  //Valido que se aplico la restriccion periodica al concepto correctamente.
  const data = await getOrdersByConceptId(conceptId);
  if (data.results?.[1].id) {
    expect(await hasPaidOrdersRequiredProxy(page, data.results[1].id, data)).toBeFalsy();
  } else {
    test.fail(true, 'No se pudo obtener el id de las ordenes');
  }
  //Elimino concepto post prueba
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario crea otros conceptos opcionales sin atributos, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos @e2e', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  let bancAccount;
  try {
    bancAccount = await getBankAccountBySchoolName(schoolName);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log(`Error al obtener cuenta bancaria: ${error}`);
    /* eslint-disable-next-line turbo/no-undeclared-env-vars */
    const currentEnv = process.env.ENV_PLAYWRIGHT;
    test.fail(
      true,
      `No se pudo obtener la cuenta bancaria para la escuela ${schoolName}. Verifica que estás usando el ambiente correcto (actual: ${currentEnv})`
    );
    return;
  }
  const loginPage = new LoginPage(page);
  const conceptPage = new ConceptsPage(page);
  const newConceptoStepsPage = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  const conceptId = await createOtherConcept(
    loginPage,
    conceptPage,
    newConceptoStepsPage,
    conceptName,
    conceptPrice,
    bancAccount?.publicSummary
  );
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 15000 });
  const rows: ElementHandle[] = await page.$$('table tr');

  // Valida en la tabla nombre y precio del concepto para las primeras 10 filas.
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];

    // Encuentra la celda en la columna 1 (índice 0)
    const cell1: ElementHandle | null = await row.$('td:nth-child(1)');
    if (cell1) {
      const conceptoText: string = await cell1.innerText();

      // Comprueba si la celda en la columna 1 contiene "Concepto"
      if (conceptoText.trim() === conceptName) {
        // Encuentra la celda en la columna 5 (índice 4)
        const cell4: ElementHandle | null = await row.$('td:nth-child(4)');
        if (cell4) {
          const valueInColumnPrice: string = (await cell4.innerText()).replace(/[,.]/g, '');
          expect(valueInColumnPrice).toBe(`$${conceptPrice}00`);
        }
      }
    }
  }
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario crea otros conceptos opcionales con atributos, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos. @e2e', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  let bancAccount;
  try {
    bancAccount = await getBankAccountBySchoolName(schoolName);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log(`Error al obtener cuenta bancaria: ${error}`);
    /* eslint-disable-next-line turbo/no-undeclared-env-vars */
    const currentEnv = process.env.ENV_PLAYWRIGHT;
    test.fail(
      true,
      `No se pudo obtener la cuenta bancaria para la escuela ${schoolName}. Verifica que estás usando el ambiente correcto (actual: ${currentEnv})`
    );
    return;
  }
  const loginPage = new LoginPage(page);
  const conceptPage = new ConceptsPage(page);
  const newConceptoStepsPage = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  const conceptId = await createOtherConceptWithAttributes(
    loginPage,
    conceptPage,
    newConceptoStepsPage,
    conceptName,
    conceptPrice,
    bancAccount?.publicSummary
  );
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 20000 });
  await page.getByRole('cell', { name: conceptName }).first().click({ timeout: 15000 });
  await expect(page.getByText(`${conceptName} / X / Pantalon`)).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(`${conceptName} / X / Remera`)).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(`${conceptName} / Xs / Pantalon`)).toBeVisible({ timeout: 3000 });
  await expect(page.getByText(`${conceptName} / Xs / Remera`)).toBeVisible({ timeout: 3000 });
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario elimina concepto y validar que no se visualiza en listado en la sección conceptos @e2e', async ({
  page,
}) => {
  const schoolID = await getSchoolIdByName(schoolName);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  await createConcept(conceptName, conceptPrice, fiscalEntity, cycle?.[0].id, bancAccount?.id, schoolID);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 30000 });
  //valido en la tabla que se creo el concepto.

  const rows: ElementHandle[] = await page.$$('table tr');

  // Valida en la tabla nombre y precio del concepto para las primeras 10 filas.
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];

    // Encuentra la celda en la columna 1 (índice 0)
    const cell1: ElementHandle | null = await row.$('td:nth-child(1)');
    if (cell1) {
      const conceptoText: string = await cell1.innerText();

      // Comprueba si la celda en la columna 1 contiene "Concepto"
      if (conceptoText.trim() === conceptName) {
        // Encuentra la celda en la columna 5 (índice 4)
        const cell4: ElementHandle | null = await row.$('td:nth-child(4)');
        if (cell4) {
          const valueInColumnPrice: string = (await cell4.innerText()).replace(/[,.]/g, '');
          expect(valueInColumnPrice).toBe(`$100000`);
          await cell4.click();
          await page.getByTestId('threeDotbutton').click();
          await page.getByTestId('Eliminar concepto-button').click();
          await page.getByTestId('yesDelete-Dialogbutton').click();
          await expect(page.getByText(`Se ha eliminado el concepto ${conceptName}`)).toBeVisible();
        }
      }
    }
  }
});

test('Usuario presiona Cancelar en mensaje de confirmación al intentar eliminar un concepto @e2e', async ({ page }) => {
  const schoolID = await getSchoolIdByName(schoolName);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const conceptId = await createConcept(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount?.id,
    schoolID
  );
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 30000 });
  await page.getByText(`${conceptName}`).click();
  await page.getByTestId('threeDotbutton').click();
  await page.getByTestId('Eliminar concepto-button').click();
  await page.getByTestId('cancel-Dialogbutton').click();
  await deleteConceptByApi(conceptId, schoolID);
});

test('Usuario no puede eliminar concepto por estar asignado a estudiantes @e2e', async ({ page }) => {
  //Adado que existe un concepto asignado al menos a 1 estudiante
  const schoolID = await getSchoolIdByName(schoolName);
  const bancAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  const cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  const levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  const sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const conceptId = await createConcept(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    bancAccount?.id,
    schoolID
  );
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
    undefined, // grade
    undefined, // group
    cycle?.[0].id
  );
  //intento eliminar concepto
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  const assignId = await addOrdersToStudent(studentId, conceptId);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 30000 });
  await page.getByText(`${conceptName}`).click();
  await page.getByTestId('threeDotbutton').click();
  const box = await page.getByTestId('Eliminar concepto-button').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
  }
  await expect(page.getByText('Este concepto no puede ser eliminado debido').first()).toBeVisible();
  await destroyMonthlyFeeAssignmentByApi(studentId, assignId?.id);
  await deleteConceptByApi(conceptId, schoolID);
});

// BUG reportado en filtro ordenes pagadas
/*
test('Usuario filtra tab estudiantes asignados por ordenes pagadas y sin pagar validando totales, @vercel', async ({
  page,
}) => {
  //Adado que existe un concepto asignado al menos a 1 estudiante
  const schoolName = schoolName;
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  const conceptName = 'Colegiatura Primaria';
  //intento eliminar concepto
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await page.waitForResponse(/\/api\/trpc\/schools\.schoolsConceptsFilters,schools\.schoolsConceptsList+/);
  await page.getByRole('cell', { name: 'Nombre' }).click();
  await scrollToVisibleElement(page, page.getByText(`${conceptName}`));
  await page.getByText(`${conceptName}`).click();
  await conceptDetailPage.assignStudentsTab.click();
  const response = await page.waitForResponse(
    /\/api\/trpc\/schools\.schoolsConceptsStudentsAssignedList,schools\.schoolsConceptsStudentsAssignedIdsList,students\.studentFilters+/
  );
  const jsonResponse = await response.json();
  const totalAssignedCount = jsonResponse[1]?.result?.data?.json?.count;
  await conceptDetailPage.filterBtn.click();
  await conceptDetailPage.payedOrdersListOpt.click();
  await conceptDetailPage.withPayedOrdersFilterOpt.click();
  await conceptDetailPage.withoutPayedOrdersFilterOpt.click();
  await conceptDetailPage.applyFilterBtn.click();
  await page.waitForResponse(
    /\/api\/trpc\/schools\.schoolsConceptsStudentsAssignedList,schools\.schoolsConceptsStudentsAssignedIdsList+/
  );
  const regex = /(\d+)/g;
  const studentsFilteredCount = (await conceptDetailPage.assignStudentsTab.textContent())?.match(regex);
  expect(totalAssignedCount).toEqual(studentsFilteredCount);
});
*/
