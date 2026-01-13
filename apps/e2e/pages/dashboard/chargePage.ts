import { Locator, Page } from '@playwright/test';

export class ChargePage {
  readonly page: Page;
  readonly multipleSelectorBtn: Locator;
  readonly onTimeCountTxt: Locator;
  readonly delinquentsCountTxt: Locator;
  readonly delinquentsPercentageTxt: Locator;
  readonly onTimePercentageTxt: Locator;
  readonly delinquentStudentsTableTxt: Locator;
  readonly tableMonthsSelectorBtn: Locator;
  readonly delilnquentTableDownloadBtn: Locator;
  readonly tableEmptyStateCpy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.multipleSelectorBtn = page.getByTestId('multiselect-dropButton');
    this.onTimeCountTxt = page.getByTestId('onTimeCount-text');
    this.delinquentsCountTxt = page.getByTestId('delinquentsCount-text');
    this.delinquentsPercentageTxt = page.getByTestId('delinquentsPercentage-text');
    this.onTimePercentageTxt = page.getByTestId('onTimePercentage-text');
    this.delinquentStudentsTableTxt = page.getByTestId('delinquentStudents-text');
    this.tableMonthsSelectorBtn = page.getByTestId('listbox-button');
    this.delilnquentTableDownloadBtn = page.getByTestId('delinquentTableDownload-button');
    this.tableEmptyStateCpy = page.getByTestId('tableEmptyState-copy');
  }
}
