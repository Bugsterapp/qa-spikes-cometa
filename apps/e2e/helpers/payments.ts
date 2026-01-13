import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { GuardianHomePage } from '/pages/portal/guardianHomePage';
import { closeHelperTourMessages, closePortalTour, delay } from './commons';

/** Completa el formulario de tarjeta Kushki */
async function completarFormularioKushki(page: Page) {
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('4456540000000063');
  await page.waitForResponse(/https:\/\/api-uat\.kushkipagos\.com\/deferred\/v2\/bin\/44565400$/);
  await page.getByTestId('undefined-input').nth(1).click();
  await page.getByTestId('undefined-input').nth(1).fill('prueba pago');
  await page.getByTestId('undefined-input').nth(2).click();
  await page.getByTestId('undefined-input').nth(2).fill('12/26');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123');
  await page.getByRole('button', { name: 'Confirmar' }).click();
}

/** Confirma el pago y completa el checkout con Kushki */
async function confirmarYCompletarPago(homePage: GuardianHomePage) {
  await closeHelperTourMessages(homePage.page);
  await closePortalTour(homePage);
  await homePage.page.getByRole('button', { name: 'PAGAR' }).click();
  await homePage.page.getByRole('button', { name: 'Si, continuar' }).click();

  // Seleccionar método de pago
  await expect(homePage.page.getByRole('radio', { name: 'Recomendada Tarjeta de débito' })).toBeVisible();
  await homePage.page.getByRole('radio', { name: 'Recomendada Tarjeta de débito' }).check();
  await delay(3000);
  await homePage.page.getByRole('button', { name: 'Continuar' }).click();

  await completarFormularioKushki(homePage.page);

  // Verificar éxito y volver
  await homePage.page.getByRole('button', { name: 'Omitir' }).click();
  await expect(homePage.page.getByRole('heading', { name: '¡Felicitaciones!' })).toBeVisible();
  await homePage.page.getByRole('button', { name: 'Volver al inicio' }).click();
}

export async function pagarOpcionalOrderConStock(homePage: GuardianHomePage, conceptName: string, variante: string) {
  const card = homePage.page.getByTestId(`card-footer-${conceptName} - ${variante}`);
  await card.getByRole('button', { name: 'SELECCIONAR' }).click();
  await homePage.page.getByRole('button', { name: 'Pagar' }).click();
  await expect(homePage.payBtnContainer).toBeVisible();

  await confirmarYCompletarPago(homePage);
}

export async function pagarOrdenConceptoObligatorio(homePage: GuardianHomePage, conceptName: string) {
  await homePage.page
    .getByTestId(`card-footer-${conceptName} - Agosto, 2023`)
    .getByRole('button', { name: 'SELECCIONAR' })
    .click({ timeout: 10000 });
  await expect(homePage.payBtnContainer).toBeVisible();
  await homePage.continueBtn.click();

  await confirmarYCompletarPago(homePage);
}
