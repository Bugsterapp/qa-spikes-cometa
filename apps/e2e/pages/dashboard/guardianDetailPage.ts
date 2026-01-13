import { Locator, Page } from '@playwright/test';

export class GuardianDetailPage {
  readonly page: Page;
  readonly guardianDetailTxt: Locator;
  readonly levelPrimariaTxt: Locator;

  constructor(page: Page) {
    this.guardianDetailTxt = page.getByText('Detalles del tutor');
    this.page = page;
    this.levelPrimariaTxt = page.getByText('Nivel: Primaria');
  }
}
