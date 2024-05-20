import { ProfilePage } from '../../../e2e/pages/portal/profilePage';
// import { GuardianHomePage } from './../../../e2e/pages/portal/guardianHomePage';
import { test, expect } from '@playwright/test';

import { delay, getGuardianToken, gotoPortal } from '../../../e2e/helpers/commons';

const guardianFirstName = 'Elvia';
const guardianLastName = 'Linares';

test('Usuario edita sus datos de perfil. @test @TC-PAD-432 @vercel', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  test.setTimeout(36000);
  //Me logueo en portal obteniendo token desde admin
  const domain = '@example.com';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain);
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(5000);
  await gotoPortal(page, token);
  await delay(5000);

  await page.getByTestId('menu-btn').click();

  await expect(page.getByTestId('menu-drawer')).toBeVisible({ timeout: 5000 });

  const menuLinks = page.getByTestId('menu-linkList');

  await expect(menuLinks).toBeVisible({ timeout: 5000 });

  await menuLinks.getByTestId('profile-menuLink').click();

  await delay(5000);

  await expect(profilePage.title).toBeVisible({ timeout: 5000 });

  await expect(profilePage.edit_button).toBeVisible();

  await expect(profilePage.first_name).toBeVisible();
  await expect(profilePage.last_name).toBeVisible();
  await expect(profilePage.email).toBeVisible();
  await expect(profilePage.gender_list).toBeVisible();

  await expect(profilePage.first_name).toBeDisabled();
  await expect(profilePage.last_name).toBeDisabled();
  await expect(profilePage.email).toBeDisabled();
  await expect(profilePage.gender_list).toBeDisabled();

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

  await profilePage.first_name.fill('Test First Name');
  await profilePage.last_name.fill('Test Last Name');
  await profilePage.email.fill('testElvia@email.com');
  await profilePage.gender_list.click().then(async () => {
    await page
      .getByLabel(originalGender === 'Masculino' ? 'Femenino' : 'Masculino')
      .getByText(originalGender === 'Masculino' ? 'Femenino' : 'Masculino')
      .click();
  });

  await expect(profilePage.confirm_button).toBeEnabled();

  await profilePage.confirm_button.click({ timeout: 5000 });

  await expect(profilePage.confirm_button).not.toBeVisible({ timeout: 5000 });

  expect(await profilePage.first_name.inputValue()).toBe('Test First Name');
  expect(await profilePage.last_name.inputValue()).toBe('Test Last Name');
  expect(await profilePage.email.inputValue()).toBe('testElvia@email.com');
  expect(await profilePage.gender_value.textContent()).toBe(originalGender === 'Masculino' ? 'Femenino' : 'Masculino');

  await profilePage.edit_button.click({ timeout: 5000 });

  await profilePage.first_name.fill(originalFirstName);
  await profilePage.last_name.fill(originalLastName);
  await profilePage.email.fill(originalEmailName);
  await profilePage.gender_list.click().then(async () => {
    await page
      .getByLabel(originalGender as string)
      .getByText(originalGender as string)
      .click();
  });

  await expect(profilePage.confirm_button).toBeEnabled();

  await profilePage.confirm_button.click({ timeout: 5000 });
});

const disabledGuardianFirstName = 'Ivan';
const disabledGuardianLastName = 'Aviles';

test('Usuario no edita sus datos de perfil. @test @TC-PAD-432 @vercel', async ({ page }) => {
  const profilePage = new ProfilePage(page);
  test.setTimeout(36000);
  //Me logueo en portal obteniendo token desde admin
  const domain = '@example.com';
  const token = await getGuardianToken(page, disabledGuardianLastName, disabledGuardianFirstName, domain);
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(5000);
  await gotoPortal(page, token);
  await delay(5000);

  await page.getByTestId('menu-btn').click();

  await expect(page.getByTestId('menu-drawer')).toBeVisible({ timeout: 5000 });

  const menuLinks = page.getByTestId('menu-linkList');

  await expect(menuLinks).toBeVisible({ timeout: 5000 });

  await menuLinks.getByTestId('profile-menuLink').click();

  await delay(5000);

  await expect(profilePage.title).toBeVisible({ timeout: 5000 });

  await expect(profilePage.edit_button).not.toBeVisible();

  await expect(profilePage.first_name).toBeVisible();
  await expect(profilePage.last_name).toBeVisible();
  await expect(profilePage.email).toBeVisible();
  await expect(profilePage.gender_list).toBeVisible();

  await expect(profilePage.first_name).toBeDisabled();
  await expect(profilePage.last_name).toBeDisabled();
  await expect(profilePage.email).toBeDisabled();
  await expect(profilePage.gender_list).toBeDisabled();
});
