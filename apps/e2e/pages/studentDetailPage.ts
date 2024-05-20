import { Locator, Page } from '@playwright/test';

export class StudentDetailPage {
  readonly page: Page;
  readonly studentDetailTxt: Locator;
  readonly levelPrimariaTxt: Locator;

  constructor(page: Page) {
    this.studentDetailTxt = page.getByText('Detalles del estudiante');
    this.page = page;
    this.levelPrimariaTxt = page.getByText('Nivel: Primaria');
  }
}
