import { Locator, Page } from '@playwright/test';

export class GuardianHomePage {
  readonly page: Page;
  readonly unselectedCardBtn: Locator;
  readonly payBtnContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.unselectedCardBtn = page.getByRole('button', { name: 'SELECCIONAR' });
    this.payBtnContainer = page.getByTestId('footer-total-amount');
  }

  getCardHeader(title: string) {
    return this.page.getByTestId(`card-title-${title}`);
  }

  getCardFooter(title: string) {
    return this.page.getByTestId(`card-footer-${title}`);
  }
}
