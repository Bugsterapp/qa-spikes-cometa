import { Locator, Page } from '@playwright/test';

export class StudentDetailPage {
  readonly page: Page;
  readonly studentDetailTxt: Locator;
  readonly levelPrimariaTxt: Locator;
  readonly scholarshipAssign: Locator;
  readonly activeConceptosTab: Locator;
  readonly optionalConceptsTab: Locator;

  constructor(page: Page) {
    this.studentDetailTxt = page.getByText('Detalles del estudiante');
    this.page = page;
    this.levelPrimariaTxt = page.getByText('Nivel: Primaria');
    this.scholarshipAssign = page.getByTestId('assignScholarship-button');
    this.activeConceptosTab = page.getByTestId('active-tab');
    this.optionalConceptsTab = page.getByTestId('optionals-tab');
  }
}
