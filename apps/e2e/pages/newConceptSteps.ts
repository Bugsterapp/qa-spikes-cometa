import { Locator, Page } from '@playwright/test';

export class NewConceptSteps {
  readonly page: Page;
  readonly conteptTypeList: Locator;
  readonly monthlySchollarshipOpt: Locator;
  readonly schoolCicleList: Locator;
  readonly twentyFourCicle: Locator;
  readonly conceptNameInp: Locator;
  readonly submitBtn: Locator;
  readonly monthToChargeList: Locator;
  readonly yesRadioBtn: Locator;
  readonly noRadioBtn: Locator;
  readonly optionalRadioBtn: Locator;
  readonly requiredRadioBtn: Locator;
  readonly yesAttributesRadioBtn: Locator;
  readonly noAttributesRadioBtn: Locator;
  readonly priceInp: Locator;
  readonly selectFiscalEntityCombo: Locator;
  readonly taxSalesTrueRadio: Locator;
  readonly taxSalesFalseRadio: Locator;
  readonly rvoeOptTrueRadio: Locator;
  readonly rvoeOptFalseRadio: Locator;
  readonly backBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.conteptTypeList = page.getByTestId('conceptType');
    this.monthlySchollarshipOpt = page.getByTestId('Colegiatura / Mensualidad');
    this.schoolCicleList = page.getByTestId('Selecciona un ciclo escolar');
    this.twentyFourCicle = page.getByTestId('Ciclo 2023/2024');
    this.conceptNameInp = page.getByTestId('Nombre del concepto input');
    this.submitBtn = page.getByTestId('next-button');
    this.backBtn = page.getByTestId('back-button');
    this.monthToChargeList = page.getByTestId('Meses a cobrar-list');
    this.yesRadioBtn = page.getByTestId('yes-radio');
    this.noRadioBtn = page.getByTestId('no-radio');
    this.optionalRadioBtn = page.getByTestId('optional-radio');
    this.requiredRadioBtn = page.getByTestId('required-radio');
    this.yesAttributesRadioBtn = page.getByTestId('Sí-radio');
    this.noAttributesRadioBtn = page.getByTestId('No-radio');
    this.priceInp = page.getByTestId('price-input');
    this.selectFiscalEntityCombo = page.getByTestId('selectFiscalEntity-Combo');
    this.taxSalesTrueRadio = page.getByTestId('taxSalesTrue-radio');
    this.taxSalesFalseRadio = page.getByTestId('taxSalesFalse-radio');
    this.rvoeOptTrueRadio = page.getByTestId('rvoeOptTrue-radio');
    this.rvoeOptFalseRadio = page.getByTestId('rvoeOptFalse-radio');
  }
}
