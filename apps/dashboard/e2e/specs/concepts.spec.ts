import { test, expect, ElementHandle } from '@playwright/test';
import { LoginPage } from '../../../e2e/pages/loginPage';
import { faker } from '@faker-js/faker';
import {
  addCommentToJiraIssue,
  addLabelJiraIssue,
  dashboardLogin,
  findTCSubstring,
  goto,
  realizarTransicionIssue,
} from '../../../e2e/helpers/commons';
import { ConceptsPage } from '../../../e2e/pages/conceptsPage';
import { NewConceptSteps } from '../../../e2e/pages/newConceptSteps';
import {
  addOrdersToStudent,
  createConcept,
  createMonthlyPaymentsConcept,
  createOtherConcept,
} from '../../../e2e/helpers/concepts';
import {
  assignGuardianAPI,
  createStudent,
  generateFirstName,
  generateLastName,
  generateMatricula,
} from '../../../e2e/helpers/students';
import { user1 } from '../../../e2e/data/data';

test('Usuario crea concepto con pagos mensuales recurrentes, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos @TC-COM-2276', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptsPage = new ConceptsPage(page);
  const newConceptSteps = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await expect(loginPage.conceptsBtn).toBeVisible({ timeout: 60000 });
  await createMonthlyPaymentsConcept(page, loginPage, conceptsPage, newConceptSteps, conceptName, conceptPrice);
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  const rows: ElementHandle[] = await page.$$('table tr');

  for (const row of rows) {
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
});

test('Usuario crea otros conceptos opcionales sin atributos, complemento educativo que factura IVA y visualiza el concepto en la sección conceptos @TC-COM-2277', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptPage = new ConceptsPage(page);
  const newConceptoStepsPage = new NewConceptSteps(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 });
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await createOtherConcept(loginPage, conceptPage, newConceptoStepsPage, conceptName, conceptPrice);
  await expect(page.getByText('El concepto ha sido creado satisfactoriamente')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('cell', { name: conceptName }).first()).toBeVisible({ timeout: 10000 });
  const rows: ElementHandle[] = await page.$$('table tr');

  for (const row of rows) {
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
});

test('Usuario elimina concepto y validar que no se visualiza en listado en la sección conceptos, @TC-COM-2295', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  await createConcept(conceptName, conceptPrice);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 15000 });
  //valido en la tabla que se creo el concepto.
  const rows: ElementHandle[] = await page.$$('table tr');

  for (const row of rows) {
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
          await cell4.click();
          await page.getByTestId('Eliminar concepto-threeDotbutton').click();
          await page.getByTestId('Eliminar concepto-button').click();
          await page.getByTestId('yesDelete-Dialogbutton').click();
          await expect(page.getByText(`Se ha eliminado el concepto ${conceptName}`)).toBeVisible();
        }
      }
    }
  }
});

test('Usuario presiona Cancelar en mensaje de confirmación al intentar eliminar un concepto, @TC-COM-2296', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  await createConcept(conceptName, conceptPrice);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 15000 });
  await page.getByText(`${conceptName}`).click();
  await page.getByTestId('Eliminar concepto-threeDotbutton').click();
  await page.getByTestId('Eliminar concepto-button').click();
  await page.getByTestId('cancel-Dialogbutton').click();
});

test('Usuario no puede eliminar concepto por estar asignado a estudiantes, @TC-COM-2297', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const firstName = await generateFirstName();
  const lastName = await generateLastName();
  const matricula = await generateMatricula();
  const studentId = await createStudent(firstName, lastName, matricula);
  await assignGuardianAPI(studentId);
  const id = await createConcept(conceptName, conceptPrice);
  await addOrdersToStudent(studentId, id);
  await goto(page);
  await dashboardLogin(loginPage, 'School BMT', user1.email, user1.password);
  await loginPage.conceptsBtn.click();
  await expect(page.getByText(`${conceptName}`)).toBeVisible({ timeout: 15000 });
  await page.getByText(`${conceptName}`).click();
  await page.getByTestId('Eliminar concepto-threeDotbutton').click();
  const box = await page.getByTestId('Eliminar concepto-button').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
  }
  await expect(page.getByText('Este concepto no puede ser eliminado debido').first()).toBeVisible();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
test.afterEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
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
