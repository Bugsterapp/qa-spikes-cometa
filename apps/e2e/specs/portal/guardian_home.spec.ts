import type { SchoolCycle } from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';
import { addOrdersToStudent, createMandatoryConceptByApi } from '/helpers/concepts';
import {
  assignGuardianAPI,
  createStudentWithParams,
  generateFirstName,
  generateLastName,
  generateMatricula,
} from '/helpers/students';
import {
  closeHelperTourMessages,
  closePortalTour,
  completeOnboardingNewGuardian,
  delay,
  generarCURP,
  generateEmail,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getGuardianToken,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  gotoPortal,
  retryElementIsVisible,
} from '../../helpers/commons';
import { test } from '../../helpers/testSetup';
import { GuardianHomePage } from '../../pages/portal/guardianHomePage';

let schoolID: string;
let conceptName: string;
let conceptPrice: string;
let fiscalEntity: string;
let cycle: SchoolCycle[];
let firstName: string;
let lastName: string;
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;
let student_id: string;
let studentMotherLastName: string;
let banc: any;

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  if (conceptName.includes('-')) {
    conceptName.replaceAll('-', '');
  }
  conceptPrice = faker.number.int({ max: 9999 }).toString();
  banc = await getBankAccountBySchoolName(schoolName);
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID, true);
  const concept = await createMandatoryConceptByApi(
    conceptName,
    conceptPrice,
    fiscalEntity,
    cycle?.[0].id,
    banc?.id,
    schoolID,
    true
  );
  student_id = await createStudentWithParams(
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
  // And el colegio ingreso en el dashboard
  await addOrdersToStudent(student_id, concept.id);
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, '@getcometa.com');
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(2000);
  await gotoPortal(page, token);
  await completeOnboardingNewGuardian(page, schoolName);
  await closeHelperTourMessages(page);
});

test('Se dibuja card disponible y se selecciona la siguiente siguiendo logica de candados @test @TC-PAD-173 @sanity', async ({
  page,
}) => {
  const homePage = new GuardianHomePage(page);

  await closePortalTour(homePage);

  // Wait for page to fully load before checking for cards
  await page.waitForLoadState('networkidle');

  // Wait for the cards to be present with increased timeout
  await retryElementIsVisible(page, homePage.getCardFooter(`${conceptName} - Agosto, 2023`), 10, 3000);

  const enabledCardLocator = homePage.getCardFooter(`${conceptName} - Agosto, 2023`);
  const selectButton = enabledCardLocator.locator('button:has-text("SELECCIONAR")');

  const disabledCardLocator = homePage.getCardFooter(`${conceptName} - Septiembre, 2023`);
  const disabledSelectButton = disabledCardLocator.locator('button:has-text("SELECCIONAR")');

  await expect(selectButton).toBeEnabled();
  await expect(disabledSelectButton).toBeDisabled();

  await selectButton.click();

  await expect(disabledSelectButton).toBeEnabled();

  await disabledSelectButton.click();

  await expect(homePage.payBtnContainer).toBeVisible();

  await homePage.payBtnContainer.getByRole('button', { name: 'Pagar' }).click();
});
