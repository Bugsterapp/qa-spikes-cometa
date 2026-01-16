import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { ConceptDetailPage } from '../../pages/dashboard/conceptDetailPage';
import {
  goto,
  dashboardLogin,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getSchoolIdByName,
} from '../../helpers/commons';
import { user1 } from '../../data/data';
import { SchoolCycle } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import { createMandatoryConceptByApi } from '/helpers/concepts';

let schoolID: string;
let conceptName: string;
let conceptPrice: string;
let bancAccount: string;
let fiscalEntity: string;
let cycle: SchoolCycle[];
let schoolName: string;

test.beforeAll(async () => {
  // Given Existe un estudiante creado
  schoolName = 'School KCS';
  schoolID = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  conceptPrice = faker.number.int({ max: 9999 }).toString();
  bancAccount = (await getBankAccountBySchoolName(schoolName))?.id;
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  await createMandatoryConceptByApi(conceptName, conceptPrice, fiscalEntity, cycle?.[0].id, bancAccount, schoolID);
});

test('usuario desasigna masivamente concepto obligatorio exitosamente para todos los alumnos asignados', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: conceptName }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsBtn.click({ timeout: 10000 });
  await expect(page.getByText('1 de agosto de 2023')).toBeVisible({ timeout: 6000 });
  await conceptDetailPage.selectAllOrdersChk.click({ timeout: 5000 });
  await conceptDetailPage.nextBtn.click({ timeout: 20000 });
  await expect(page.getByText('Primaria')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('checkbox').check();
  await conceptDetailPage.nextBtn.click({ timeout: 2000 });
  await conceptDetailPage.assignConfirmBtn.click({ timeout: 20000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await page.getByTestId('generic-checkbox').first().click();
  //valido el copy en el footer de desasisnacion
  await expect(page.getByRole('heading', { name: 'estudiantes seleccionados' })).toHaveText(
    '6 estudiantes seleccionados',
    { timeout: 60000 }
  );
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await expect(page.getByText('No hay alumnos asignados.')).toBeVisible({ timeout: 5000 });
});

test('Usuario desasigna masivamente concepto obligatorio exitosamente para 1 alumno', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School KCS', user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: 'Asignacion Masiva Automatica' }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsBtn.click({ timeout: 10000 });
  await expect(page.getByText('5 de agosto de 2023')).toBeVisible({ timeout: 5000 });
  await conceptDetailPage.selectAllOrdersChk.click({ timeout: 5000 });
  await conceptDetailPage.nextBtn.click({ timeout: 20000 });
  await expect(page.getByText('Primaria')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('selectAllStudent-checkbox').getByTestId('checkbox').check();
  await conceptDetailPage.nextBtn.click({ timeout: 2000 });
  await conceptDetailPage.assignConfirmBtn.click({ timeout: 20000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await page.getByRole('row', { name: 'roberto caceres 3241 Primaria' }).getByTestId('generic-checkbox').check();
  //valido el copy en el footer de desasisnacion y los copy del alert
  //await expect(page.getByRole('heading', { name: 'estudiantes seleccionados' })).toHaveText('1 estudiante seleccionado');
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await expect(page.getByText('Este estudiante tiene órdenes vencidas que serán eliminadas.')).toBeVisible();
  await expect(
    page.getByText(
      'Se desasignarán sus conceptos y se eliminarán todas las órdenes que aún no han sido pagadas. Todos los pagos realizados se guardarán y mantendrán en la plataforma.'
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await expect(conceptDetailPage.assignStudentsTab).toHaveText('Estudiantes asignados (5)');
  await expect(page.getByRole('row', { name: 'roberto caceres 3241 Primaria' })).not.toBeVisible();
  //desasigno todos los estudiantes
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await expect(page.getByText('No hay alumnos asignados.')).toBeVisible({ timeout: 5000 });
});

test('usuario desasigna masivamente concepto Opcional exitosamente para todos los alumnos asignados', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School KCS', user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: 'Concepto Optional' }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsBtn.click({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Concepto Optional' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Concepto Optional' }).getByTestId('checkbox').click({ timeout: 5000 });
  await conceptDetailPage.nextBtn.click({ timeout: 20000 });
  await expect(page.getByText('Primaria')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('selectAllStudent-checkbox').getByTestId('checkbox').check();
  await conceptDetailPage.nextBtn.click({ timeout: 2000 });
  await conceptDetailPage.assignConfirmBtn.click({ timeout: 2000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await expect(
    page.getByText(
      'Se desasignarán sus conceptos y se eliminarán todas las órdenes que aún no han sido pagadas. Todos los pagos realizados se guardarán y mantendrán en la plataforma.'
    )
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await expect(page.getByText('No hay alumnos asignados.')).toBeVisible({ timeout: 5000 });
});

test('Usuario intenta desasignar concepto obligatorio con alumno que tiene pagos realizados', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School KCS', user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: 'Colegiatura Secundaria' }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsTab.click();
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await page.getByText('Mantener las órdenes vencidas').click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
});

test('Usuario desasigna masivamente concepto obligatorio exitosamente para todos los alumnos asignados dejando ordenes vencidas', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School KCS', user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: 'Desasignacion masiva ordenes vencidas' }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsBtn.click({ timeout: 10000 });
  await expect(page.getByText('6 de agosto de 2023')).toBeVisible({ timeout: 5000 });
  await conceptDetailPage.selectAllOrdersChk.click({ timeout: 5000 });
  await conceptDetailPage.nextBtn.click({ timeout: 20000 });
  await expect(page.getByText('Primaria')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('selectAllStudent-checkbox').getByTestId('checkbox').check();
  await conceptDetailPage.nextBtn.click({ timeout: 2000 });
  await conceptDetailPage.assignConfirmBtn.click({ timeout: 20000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  const payedOrdersTxt = await page.locator('.whitespace-nowrap > .flex > .text-left').first().textContent();
  await page.getByTestId('generic-checkbox').first().click();
  //valido el copy en el footer de desasisnacion
  await expect(page.getByRole('heading', { name: 'estudiantes seleccionados' })).toHaveText(
    '6 estudiantes seleccionados'
  );
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await expect(page.getByText('6 estudiantes tienen órdenes vencidas que serán eliminadas.')).toBeVisible();
  await page.getByText('Mantener las órdenes vencidas luego de desasignar.').click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  expect(payedOrdersTxt).not.toEqual(
    await page.locator('.whitespace-nowrap > .flex > .text-left').first().textContent()
  );
  //desasigno todos los estudiantes
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click();
  await expect(page.getByText('No hay alumnos asignados.')).toBeVisible({ timeout: 5000 });
});

test('Usuario desasigna masivamente concepto obligatorio para para alumno con pago en proceso y no se desasigna el mismo', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);
  const conceptDetailPage = new ConceptDetailPage(page);
  await goto(page);
  await dashboardLogin(loginPage, 'School KCS', user1.email, user1.password);
  await loginPage.conceptsBtn.click({ timeout: 5000 });
  await page.getByRole('cell', { name: 'Colegiatura Secundaria' }).click({ timeout: 10000 });
  await conceptDetailPage.assignStudentsTab.click();
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('row', { name: 'pruebadoskiplin comisiones' }).getByTestId('generic-checkbox').check();
  await expect(page.getByRole('cell', { name: 'de 1 1 en proceso' })).toBeVisible();
  await page.getByRole('button', { name: 'Desasignar' }).click();
  await page.getByRole('button', { name: 'Sí, desasignar' }).click();
  await expect(page.getByText('Se ha iniciado el proceso de')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await conceptDetailPage.assignStudentsTab.click({ timeout: 10000 });
  await expect(
    page.getByRole('row', { name: 'pruebadoskiplin comisiones' }).getByTestId('generic-checkbox')
  ).toBeEnabled();
});
