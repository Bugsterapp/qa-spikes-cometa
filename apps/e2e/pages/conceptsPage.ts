import { Locator, Page } from '@playwright/test';

export class ConceptsPage {
  readonly page: Page;
  readonly newConceptBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newConceptBtn = page.getByTestId('createConcept-button');
  }
}
