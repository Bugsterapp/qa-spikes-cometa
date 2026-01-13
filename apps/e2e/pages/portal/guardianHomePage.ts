import type { Locator, Page } from '@playwright/test';

export class GuardianHomePage {
  readonly page: Page;
  readonly unselectedCardBtn: Locator;
  readonly payBtnContainer: Locator;
  readonly tourPorAhoraNoBtn: Locator;
  readonly joyrideTooltip: Locator;
  readonly joyrideUnderstoodBtn: Locator;
  readonly emptyState: Locator;
  readonly continueBtn: Locator;
  constructor(page: Page) {
    this.page = page;
    this.unselectedCardBtn = page.getByRole('button', { name: 'SELECCIONAR' });
    //this.payBtnContainer = page.getByTestId('footer-total-amount');
    this.payBtnContainer = page.getByTestId('checkout-footer');
    this.tourPorAhoraNoBtn = page.getByRole('button', { name: 'Por ahora no' });
    this.joyrideTooltip = page.getByTestId('joyride-tooltip');
    this.joyrideUnderstoodBtn = page.getByTestId('btn-joyrdide-understood');
    this.emptyState = page.getByText('No hay nada que pagar por el momento');
    this.continueBtn = page.getByRole('button', { name: 'Pagar' });
  }

  getCardHeader(title: string) {
    return this.page.locator(`[data-testid^="card-title- ${title}"]`);
  }

  getCardFooter(title: string) {
    return this.page.getByTestId(`card-footer-${title}`);
  }
}
