import { ProfilePage } from '../../pages/portal/profilePage';
import { expect } from '@playwright/test';
import { test } from '../../helpers/testSetup';

import {
  closeHelperTourMessages,
  closePortalTour,
  completeOnboardingNewGuardian,
  delay,
  generarCURP,
  generateEmail,
  getActiveSchoolCycleBySchoolId,
  getGuardianToken,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  gotoPortal,
} from '../../helpers/commons';
import { SchoolCycle } from '@cometa/trpc/src/types';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  createStudentWithParams,
  assignGuardianAPI,
} from '/helpers/students';
import { GuardianHomePage } from '/pages/portal/guardianHomePage';

let firstName: string;
let lastName: string;
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;
let cycle: SchoolCycle[];
let schoolID: string;
let student_id: string;
let guardianEmail: string;
let schoolName: string;

test('Usuario edita sus datos de perfil. @test @portal @sanity', async ({ page }) => {
  test.setTimeout(200000);
  const profilePage = new ProfilePage(page);
  //Me logueo en portal obteniendo token desde admin
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, '@getcometa.com');
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(2000);
  await gotoPortal(page, token);
  await completeOnboardingNewGuardian(page, schoolName);
  await closeHelperTourMessages(page);
  const homePage = new GuardianHomePage(page);
  await closePortalTour(homePage);
  await page.getByTestId('menu-btn').click({ timeout: 10000 });
  await expect(page.getByTestId('menu-drawer')).toBeVisible({ timeout: 7000 });
  const menuLinks = page.getByTestId('menu-linkList');
  await expect(menuLinks).toBeVisible({ timeout: 15000 });
  await menuLinks.getByTestId('profile-menuLink').click();
  await expect(profilePage.title).toBeVisible({ timeout: 10000 });
  await expect(profilePage.edit_button).toBeVisible({ timeout: 10000 });
  await profilePage.edit_button.click();
  await expect(profilePage.first_name).toBeEnabled();
  await expect(profilePage.last_name).toBeEnabled();
  await expect(profilePage.email).toBeEnabled();
  await expect(profilePage.gender_list).toBeEnabled();
  // Disabled button due to not dirty form
  await expect(profilePage.confirm_button).toBeDisabled();
  const originalFirstName = await profilePage.first_name.inputValue();
  const originalLastName = await profilePage.last_name.inputValue();
  const originalEmailName = await profilePage.email.inputValue();
  const originalGender = await profilePage.gender_value.textContent();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  await profilePage.first_name.fill(guardianFirstName);
  await profilePage.last_name.fill(guardianLastName);
  guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await profilePage.email.fill(guardianEmail);
  await profilePage.gender_list.click().then(async () => {
    await page
      .getByLabel(originalGender === 'Masculino' ? 'Femenino' : 'Masculino')
      .getByText(originalGender === 'Masculino' ? 'Femenino' : 'Masculino')
      .click();
  });

  await expect(profilePage.confirm_button).toBeEnabled();

  await profilePage.confirm_button.click({ timeout: 5000 });

  await expect(profilePage.confirm_button).not.toBeVisible({ timeout: 5000 });
  await page.reload({ timeout: 10000 });

  // Wait for the form to load actual data (not default "-" values)
  await expect(profilePage.first_name_text).not.toHaveText('-', { timeout: 10000 });

  // Verify values in read-only mode (fields are now <p> tags, not inputs)
  expect(await profilePage.first_name_text.textContent()).toBe(guardianFirstName);
  expect(await profilePage.last_name_text.textContent()).toBe(guardianLastName);
  expect(await profilePage.email_text.textContent()).toBe(guardianEmail);
  expect(await profilePage.gender_value_text.textContent()).toBe(
    originalGender === 'Masculino' ? 'Femenino' : 'Masculino'
  );

  await profilePage.edit_button.click({ timeout: 5000 });

  await profilePage.first_name.fill(originalFirstName);
  await profilePage.last_name.fill(originalLastName);
  await profilePage.email.fill(originalEmailName);
  await profilePage.gender_list.click().then(async () => {
    await page.getByLabel('Masculino').getByText('Masculino').click();
  });

  await expect(profilePage.confirm_button).toBeEnabled();

  await profilePage.confirm_button.click({ timeout: 5000 });
});

test.beforeAll(async () => {
  // Given Existe un estudiante creado
  schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID);
  levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID, true);
  student_id = await createStudentWithParams(
    firstName,
    lastName,
    matricula,
    levelId,
    sectionId,
    schoolID,
    curp,
    undefined, //grade
    undefined, //group
    cycle?.[0].id
  );
  guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
});
