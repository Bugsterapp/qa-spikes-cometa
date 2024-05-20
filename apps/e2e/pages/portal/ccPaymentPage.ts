import { Locator, Page } from '@playwright/test';

export class CcPaymentPage {
  readonly page: Page;
  readonly newDebitCreditCardOpt: Locator;
  readonly creditCardNumberInp: Locator;
  readonly creditCardHolderNameInp: Locator;
  readonly creditCardexpirationDateInp: Locator;
  readonly creditCardsecurityCodeInp: Locator;
  readonly continueBtn: Locator;
  readonly payBtn: Locator;
  readonly validateCreditCardNameTxt: Locator;
  readonly paymentBeenCreditedTxt: Locator;

  constructor(page: Page) {
    this.page = page;
    //SDK mercado pago
    this.newDebitCreditCardOpt = page
      .frameLocator('#mercadopago-checkout')
      .locator('div')
      .filter({ hasText: /^Nueva TarjetaDébito o crédito$/ })
      .first();
    this.creditCardNumberInp = page
      .frameLocator('#mercadopago-checkout')
      .frameLocator('iframe[name="cardNumber"]')
      .getByPlaceholder('1234 1234 1234 1234');
    this.creditCardHolderNameInp = page.frameLocator('#mercadopago-checkout').getByPlaceholder('Ej.: María López');
    this.creditCardexpirationDateInp = page
      .frameLocator('#mercadopago-checkout')
      .frameLocator('iframe[name="expirationDate"]')
      .getByPlaceholder('MM/AA');
    this.creditCardsecurityCodeInp = page
      .frameLocator('#mercadopago-checkout')
      .frameLocator('iframe[name="securityCode"]')
      .getByPlaceholder('123');
    this.continueBtn = page.frameLocator('#mercadopago-checkout').getByRole('button', { name: 'Continuar' });
    this.payBtn = page.frameLocator('#mercadopago-checkout').getByRole('button', { name: 'Pagar' });
    this.validateCreditCardNameTxt = page
      .frameLocator('#mercadopago-checkout')
      .getByText('Mastercard terminada en 0366');
    this.paymentBeenCreditedTxt = page
      .frameLocator('#mercadopago-checkout')
      .getByText('¡Listo! Tu pago ya se acreditó');
    //FIN SDK mercado pago
  }
}
