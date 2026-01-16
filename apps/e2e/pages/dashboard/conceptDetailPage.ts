import { Locator, Page } from '@playwright/test';

export class ConceptDetailPage {
  readonly page: Page;
  readonly assignStudentsTab: Locator;
  readonly assignStudentsBtn: Locator;
  readonly selectAllOrdersChk: Locator;
  readonly nextBtn: Locator;
  readonly selectAllStudentsChk: Locator;
  readonly assignConfirmBtn: Locator;
  readonly applyFilterBtn: Locator;
  readonly withoutPayedOrdersFilterOpt: Locator;
  readonly filterBtn: Locator;
  readonly withPayedOrdersFilterOpt: Locator;
  readonly payedOrdersListOpt: Locator;
  readonly ordersTab: Locator;
  readonly genericChk: Locator;
  readonly modalPriceInp: Locator;
  readonly modalSaveBtn: Locator;
  readonly informationTab: Locator;
  readonly variantsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.assignStudentsTab = page.getByRole('tab', { name: 'Estudiantes asignados' });
    this.assignStudentsBtn = page.getByTestId('assignStudent-btn');
    this.selectAllOrdersChk = page.getByTestId('allMonthsCheckbox-text');
    this.nextBtn = page.getByTestId('next-button');
    this.selectAllStudentsChk = page.getByTestId('selectAllStudent-checkbox');
    this.assignConfirmBtn = page.getByTestId('assignConfirm-button');
    this.applyFilterBtn = page.getByTestId('apply-button');
    this.filterBtn = page.getByTestId('filterBtn');
    this.payedOrdersListOpt = page.getByRole('button', { name: 'Órdenes pagadas' });
    this.withPayedOrdersFilterOpt = page.getByTestId('Con órdenes pagadas-filterOption');
    this.withoutPayedOrdersFilterOpt = page.getByTestId('Sin órdenes pagadas-filterOption');
    this.ordersTab = page.getByTestId('orders-tab');
    this.informationTab = page.getByTestId('information-tab');
    this.variantsTab = page.getByTestId('variants-tab');
    //ORDER TAB
    this.genericChk = page.getByTestId('generic-checkbox');
    this.modalPriceInp = page.getByTestId('price-input');
    this.modalSaveBtn = page.getByRole('button', { name: 'Guardar' });
  }
}
