import { Locator, Page } from '@playwright/test';

export class DelinquencyPage {
  readonly page: Page;
  readonly delinquencyBtn: Locator;
  readonly orderTxt: Locator;
  readonly student: Locator;
  readonly tableEle: Locator;
  readonly filterBtn: Locator;
  readonly levelFilterSelector: Locator;
  readonly applyFilterBtn: Locator;
  readonly optionSecundaria: Locator;
  readonly collapsableListBtn: Locator;
  readonly noMoreStudentsWithDelinquencyTxt: Locator;

  constructor(page: Page) {
    this.page = page;
    this.delinquencyBtn = page.getByRole('link', { name: 'Morosidad' });
    this.student = page.getByText('Benjamín Rivas Barreto');
    this.orderTxt = page.getByText('Orden');
    this.tableEle = page.locator('.text-sm > .relative > div > div');
    this.filterBtn = page.getByRole('button', { name: 'Filtrar' });
    this.levelFilterSelector = page.getByRole('button', { name: 'Nivel' });
    this.applyFilterBtn = page.getByRole('button', { name: 'Aplicar' });
    this.optionSecundaria = page.getByLabel('Secundaria', { exact: true });
    this.collapsableListBtn = page.getByRole('main').getByRole('button').nth(2);
    this.noMoreStudentsWithDelinquencyTxt = page.getByText('No hay más alumnos con morosidad');
  }
}
