import { Locator, Page } from '@playwright/test';

export class WelcomePage {
  readonly page: Page;
  readonly nameTxt: Locator;
  readonly lastNameInput: Locator;
  readonly tAndC: Locator;
  readonly continueBtn: Locator;
  readonly notByNowBtn: Locator;
  readonly startBtn: Locator;
  readonly beginBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameTxt = page.getByTestId('first_name-input');
    this.lastNameInput = page.getByTestId('last_name-input');
    this.tAndC = page.getByLabel('Acepto los Términos & Condiciones y políticas de privacidad.');
    this.continueBtn = page.getByRole('button', { name: 'Continuar' });
    this.beginBtn = page.getByRole('button', { name: 'Comenzar' });
    this.notByNowBtn = page.getByRole('button', { name: 'Por ahora no' });
    this.startBtn = page.getByRole('button', { name: 'Empezar' });
  }

  getCardHeader(title: string) {
    return this.page.locator(`[data-testid^="card-title- ${title}"]`);
  }

  getCardFooter(title: string) {
    return this.page.getByTestId(`card-footer-${title}`);
  }
}
