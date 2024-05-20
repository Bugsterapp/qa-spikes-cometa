import { GuardianHomePage } from '../../../e2e/pages/portal/guardianHomePage';
import { test, expect } from '@playwright/test';

import { delay, getGuardianToken, gotoPortal } from '../../../e2e/helpers/commons';

const guardianFirstName = 'Elvia';
const guardianLastName = 'Linares';

test.beforeEach(async ({ page }) => {
  test.setTimeout(36000);
  //Me logueo en portal obteniendo token desde admin
  const domain = '@example.com';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain);
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(5000);
  await gotoPortal(page, token);
  await delay(5000);
});

test('Se dibujan las cards Correctamente @test @TC-PAD-173 @vercel', async ({ page }) => {
  const homePage = new GuardianHomePage(page);

  const cards = await homePage.getCardHeader('Prueba Enero').all();

  for (const card of cards) {
    await expect(card).toBeVisible({ timeout: 5000 });
  }

  const cardLocator = homePage.getCardFooter(`Prueba Bloqueo - Noviembre, 2023`);
  const selectButton = cardLocator.locator('button:has-text("SELECCIONAR")');

  await expect(selectButton).toBeEnabled();
});

test('Se dibujan una card disponible a seleccionar y bloqueda @test @TC-PAD-173 @vercel', async ({ page }) => {
  const homePage = new GuardianHomePage(page);

  const cards = await homePage.getCardHeader('Prueba Enero').all();

  for (const card of cards) {
    await expect(card).toBeVisible({ timeout: 5000 });
  }

  const enabledCardLocator = homePage.getCardFooter(`Prueba Bloqueo - Noviembre, 2023`);
  const selectButton = enabledCardLocator.locator('button:has-text("SELECCIONAR")');

  const disabledCardLocator = homePage.getCardFooter('Prueba Bloqueo - Diciembre, 2023');
  const disabledSelectButton = disabledCardLocator.locator('button:has-text("SELECCIONAR")');

  await expect(selectButton).toBeEnabled();
  await expect(disabledSelectButton).toBeDisabled();
});

test('Se dibuja card disponible y se selecciona la siguiente @test @TC-PAD-173 @vercel', async ({ page }) => {
  const homePage = new GuardianHomePage(page);

  const cards = await homePage.getCardHeader('Prueba Enero').all();

  for (const card of cards) {
    await expect(card).toBeVisible({ timeout: 5000 });
  }

  const enabledCardLocator = homePage.getCardFooter(`Prueba Bloqueo - Noviembre, 2023`);
  const selectButton = enabledCardLocator.locator('button:has-text("SELECCIONAR")');

  const disabledCardLocator = homePage.getCardFooter('Prueba Bloqueo - Diciembre, 2023');
  const disabledSelectButton = disabledCardLocator.locator('button:has-text("SELECCIONAR")');

  await expect(selectButton).toBeEnabled();
  await expect(disabledSelectButton).toBeDisabled();

  await selectButton.click();

  await expect(disabledSelectButton).toBeEnabled();
});

test('Se dibuja card disponible, se selecciona y se dibuja el botón de continuar @test @TC-PAD-173 @vercel', async ({
  page,
}) => {
  const homePage = new GuardianHomePage(page);

  const cards = await homePage.getCardHeader('Prueba Enero').all();

  for (const card of cards) {
    await expect(card).toBeVisible({ timeout: 5000 });
  }

  const enabledCardLocator = homePage.getCardFooter(`Prueba Bloqueo - Noviembre, 2023`);
  const selectButton = enabledCardLocator.locator('button:has-text("SELECCIONAR")');

  await expect(selectButton).toBeEnabled();
  await selectButton.click();

  await expect(homePage.payBtnContainer).toBeVisible();

  const payButton = homePage.payBtnContainer.locator('button:has-text("CONTINUAR")');

  payButton.click();

  await delay(2000);

  expect(page.url()).toContain('verify_rfc');
});
