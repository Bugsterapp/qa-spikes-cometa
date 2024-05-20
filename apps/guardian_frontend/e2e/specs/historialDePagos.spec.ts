import { test, expect } from '@playwright/test';
import { getGuardianToken, gotoPortal } from '../../../e2e/helpers/commons';
import { PaymentDetailPage } from '../../../e2e/pages/portal/paymentDetailPage';

test('Tutor puede ver el detalle de un pago realizado exitosamente, @portal @history', async ({ page }) => {
  const guardianFirstName = 'Murphy';
  const guardianLastName = 'Jed';
  const domain = '@getcometa.com';
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, domain);

  /**
   * Ingreso en portal como tutor para el historial de pagos
   */
  await gotoPortal(page, token);
  await page.getByTestId('MenuIcon').click({ timeout: 5000 });
  const historyLink = page.getByTestId('history-menuLink');
  await historyLink.click({ timeout: 5000 });
  const card = page.getByTestId('payinFulfillmentId-BMTG00009354-card');
  await expect(card.getByTestId('payinDate-text')).toHaveText('Jueves, 21 de diciembre 2023');
  await expect(card.getByTestId('payinId-text')).toHaveText('ID de pago: BMTG00009354');
  await expect(card.getByTestId('payinTotalPaid-text')).toContainText('$1,002.90');
  await card.getByTestId('payinCollapsable-Btn').click();
  await expect(card.getByTestId('orderName-ropa - pantalon - xs')).toHaveText('ropa - pantalon - xs');
  await card.getByTestId('seeDetails-btn').click();
  const paymentDetailPage = new PaymentDetailPage(page);
  await expect(paymentDetailPage.payerNameTxt).toHaveText('Pagado por: Jed Murphy');
  await expect(paymentDetailPage.paymentDateTxt).toHaveText('Jueves, 21 de diciembre 2023');
  await expect(paymentDetailPage.paymentMethodTxt).toHaveText('Medio de pago:Transferencia bancaria');
  await expect(paymentDetailPage.paymentPlaceTxt).toHaveText('Lugar de pago:Portal de pagos Cometa');
  await expect(paymentDetailPage.totalPaymentTxt).toHaveText('Total pagado: $1,002.90');
  await expect(paymentDetailPage.payinFulfillmentTotalPaidTxt).toContainText('$1,002.90');
  await paymentDetailPage.invoiceDownloadBtn.click();

  /**
   * Retornar a la página de historial de pagos y hace scroll hasta el final de la card
   */
  await paymentDetailPage.backButton.click();
  const headingHistoryPage = page.getByRole('heading', { name: 'Historial de pago' });
  await expect(headingHistoryPage).toBeVisible({ timeout: 5000 });
  await expect(headingHistoryPage).not.toBeInViewport();
});
