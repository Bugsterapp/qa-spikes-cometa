import { test, expect } from '@playwright/test';
import { closeVercelCommentsIFrame, getGuardianToken, gotoPortal } from '../../../e2e/helpers/commons';

test('Se muestra SIN stock una orden opcional cuando el stocl es = 0', async ({ page }) => {
  const guardianFirstName = 'Ballesteros';
  const guardianLastName = 'Bruno';
  const domain = '@example.org';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain, false, 'pporras@example.org');

  /**
   * Ingreso en portal como tutor para el historial de pagos
   */
  await gotoPortal(page, token);
  await page.getByRole('tab', { name: 'Conceptos opcionales' }).click({ timeout: 10000 });
  const card = page.getByTestId('card-footer-ROPA - xs - PANTALON');
  await expect(card.getByRole('button')).toHaveText('SIN STOCK');
});

test('Pagar exitosamente una variante con stock disponible', async ({ page }) => {
  const guardianFirstName = 'Ballesteros';
  const guardianLastName = 'Bruno';
  const domain = '@example.org';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain, false, 'pporras@example.org');

  /**
   * Ingreso en portal como tutor para el historial de pagos
   */
  await gotoPortal(page, token);
  await page.getByRole('tab', { name: 'Conceptos opcionales' }).click({ timeout: 10000 });
  await closeVercelCommentsIFrame(page);
  const card = page.getByTestId('card-footer-ROPA - x - POLO');
  await card.getByRole('button').click();
  await page.getByRole('button', { name: 'CONTINUAR' }).click();
  await page.getByTestId('PAGAR').click();
  await page.getByRole('button', { name: 'Si, continuar' }).click();
  await page.getByRole('radio', { name: 'Tarjeta de débito o crédito Visa, Mastercard, etc.' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Número de la tarjeta')).toBeVisible({ timeout: 10000 });
  await page.getByText('Número de la tarjeta').fill('5451951574925480');
  await page.getByText('Nombre en la tarjeta').fill('test pago');
  await page.getByText('Fecha Exp').fill('0224');
  await page.getByText('CVV').fill('123');
  await page.getByRole('button', { name: 'Pagar' }).click();
  await expect(page.getByRole('button', { name: 'Omitir' })).toBeVisible({ timeout: 90000 });
  await page.getByRole('button', { name: 'Omitir' }).click();
  await expect(page.getByRole('heading', { name: '¡Felicitaciones!' })).toBeVisible();
});

test('Pagar exitosamente una variante con stock infinito', async ({ page }) => {
  const guardianFirstName = 'Ballesteros';
  const guardianLastName = 'Bruno';
  const domain = '@example.org';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain, false, 'pporras@example.org');

  /**
   * Ingreso en portal como tutor para el historial de pagos
   */
  await gotoPortal(page, token);
  await page.getByRole('tab', { name: 'Conceptos opcionales' }).click({ timeout: 10000 });
  await closeVercelCommentsIFrame(page);
  const card = page.getByTestId('card-footer-ROPA - xl - PANTALON');
  await card.getByRole('button').click();
  await page.getByRole('button', { name: 'CONTINUAR' }).click();
  await page.getByTestId('PAGAR').click();
  await page.getByRole('button', { name: 'Si, continuar' }).click();
  await page.getByRole('radio', { name: 'Tarjeta de débito o crédito Visa, Mastercard, etc.' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Número de la tarjeta')).toBeVisible({ timeout: 10000 });
  await page.getByText('Número de la tarjeta').fill('5451951574925480');
  await page.getByText('Nombre en la tarjeta').fill('test pago');
  await page.getByText('Fecha Exp').fill('0224');
  await page.getByText('CVV').fill('123');
  await page.getByRole('button', { name: 'Pagar' }).click();
  await expect(page.getByRole('button', { name: 'Omitir' })).toBeVisible({ timeout: 90000 });
  await page.getByRole('button', { name: 'Omitir' }).click();
  await expect(page.getByRole('heading', { name: '¡Felicitaciones!' })).toBeVisible();
});
