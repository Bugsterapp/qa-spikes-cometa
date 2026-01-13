import { Locator, Page } from '@playwright/test';

export class ScholarshipsPage {
  readonly page: Page;
  readonly resumeTab: Locator;
  readonly findSchoolarshipTxt: Locator;
  readonly collapsableIcon: Locator;
  readonly filterBtn: Locator;
  readonly filterByLevelOpt: Locator;
  readonly filterOptionPrimaria: Locator;
  readonly applyFilterBtn: Locator;
  readonly filterByscholarshipDiscountOpt: Locator;
  readonly filterInputTxt: Locator;
  readonly tableTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resumeTab = page.getByTestId('resume-tab');
    this.tableTab = page.getByTestId('table-tab');
    this.findSchoolarshipTxt = page.getByPlaceholder('Buscar beca');
    this.collapsableIcon = page.getByTestId('collapsable-icon');
    this.filterBtn = page.getByTestId('filterBtn');
    this.filterByLevelOpt = page.getByTestId('Nivel-filterBy');
    this.filterOptionPrimaria = page.getByLabel('Primaria').first();
    this.applyFilterBtn = page.getByRole('button', { name: 'Aplicar' });
    this.filterByscholarshipDiscountOpt = page.getByTestId('Beca o descuento-filterBy');
    this.filterInputTxt = page.getByTestId('inputText');
  }
}
