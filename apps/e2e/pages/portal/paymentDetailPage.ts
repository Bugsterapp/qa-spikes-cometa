import { Locator, Page } from '@playwright/test';

export class PaymentDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly paymentDateTxt: Locator;
  readonly payerNameTxt: Locator;
  readonly paymentMethodTxt: Locator;
  readonly paymentPlaceTxt: Locator;
  readonly totalPaymentTxt: Locator;
  readonly payinFulfillmentTotalPaidTxt: Locator;
  readonly invoiceDownloadBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByTestId('back-btn');
    this.paymentDateTxt = page.getByTestId('paymentDate-text');
    this.payerNameTxt = page.getByTestId('payerName-text');
    this.paymentMethodTxt = page.getByTestId('paymentMethod-text');
    this.paymentPlaceTxt = page.getByTestId('paymentPlace-text');
    this.totalPaymentTxt = page.getByTestId('totalPayment-text');
    this.payinFulfillmentTotalPaidTxt = page.getByTestId('payinFulfillmentTotalPaid-txt');
    this.invoiceDownloadBtn = page.getByTestId('invoiceDownload-btn');
  }
}
