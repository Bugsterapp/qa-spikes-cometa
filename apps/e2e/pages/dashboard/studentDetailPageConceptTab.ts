import { Locator, Page } from '@playwright/test';

export class studentDetailPageConceptTab {
  readonly page: Page;
  readonly conceptTypeBtn: Locator;
  conceptTypeOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.conceptTypeBtn = page.getByPlaceholder('Selecciona el tipo de concepto');
    this.conceptTypeOption = page.getByRole('option', { name: 'Colegiatura / Mensualidad' });
  }

  setConceptType(conceptName: string) {
    this.conceptTypeOption = this.page.getByRole('option', { name: conceptName });
  }
}
