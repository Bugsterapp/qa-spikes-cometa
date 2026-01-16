import { Locator, Page } from '@playwright/test';

export class StudentDetailPage {
  readonly page: Page;
  readonly studentDetailTxt: Locator;
  readonly levelPrimariaTxt: Locator;
  readonly scholarshipAssignBtn: Locator;
  readonly activeConceptosTab: Locator;
  readonly optionalConceptsTab: Locator;
  readonly conceptTab: Locator;
  readonly statementAccount: Locator;

  constructor(page: Page) {
    this.studentDetailTxt = page.getByText('Detalles del estudiante');
    this.page = page;
    this.levelPrimariaTxt = page.getByText('Nivel: Primaria');
    this.scholarshipAssignBtn = page.getByTestId('assignScholarship-btn');
    this.activeConceptosTab = page.getByTestId('active-tab');
    this.optionalConceptsTab = page.getByTestId('optionals-tab');
    this.conceptTab = page.getByTestId('concept-tab');
    this.statementAccount = page.getByTestId('account-tab');
  }
}
