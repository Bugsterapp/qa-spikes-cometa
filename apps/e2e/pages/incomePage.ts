import { Locator, Page } from '@playwright/test';

export class IncomePage {
  readonly page: Page;
  readonly incomeBtn: Locator;
  readonly registerIncomesBySchoolTableTitle: Locator;
  readonly registerPaymentBtn: Locator;
  readonly registerThePayerLbl: Locator;
  readonly nameOrTuitionNumberTxt: Locator;
  readonly studentAnelAguilarAguilarSelector: Locator;
  readonly studentGetByRolPickSelector: Locator;
  readonly payerDiegoRasconSelector: Locator;
  readonly payerNicolasPalomoSelector: Locator;
  readonly tuitionAnelAguilarAguilarInfo: Locator;
  readonly paymentAccountComboBox: Locator;
  readonly paymentAccountComboBoxOption: Locator;
  readonly paymentChannelComboBox: Locator;
  readonly paymentChannelComboBoxOption: Locator;
  readonly createReceiptOption: Locator;
  readonly firstPendingPaymentOrder: Locator;
  readonly secondPendingPaymentOrder: Locator;
  readonly finalRegisterPaymentBtn: Locator;
  readonly registeredPaymentMsg: Locator;
  readonly printReceiptBtn: Locator;
  readonly seePaymentReceiptBtn: Locator;
  readonly downloadRegisteredPaymentsBtn: Locator;
  readonly downloadPdfOption: Locator;
  readonly preparingFilesTxt: Locator;
  readonly cancellDownloadBtn: Locator;
  readonly filterBtn: Locator;
  readonly listBoxStudent: Locator;
  readonly partialPaymentChk: Locator;
  readonly partialPaymentUnderstoodBtn: Locator;
  readonly partialPaymentAmountTxt: Locator;
  readonly cometaDepositsToSchoolTxt: Locator;
  readonly downloadCometaDepositsToSchoolbtn: Locator;
  readonly cometaDepositsPageNavigatorBox: Locator;
  readonly optionalConceptsTabOption: Locator;

  constructor(page: Page) {
    this.cometaDepositsToSchoolTxt = page.getByText('Depósitos de Cometa al colegio');
    this.page = page;
    this.partialPaymentChk = page.getByLabel('Pago parcial');
    this.partialPaymentUnderstoodBtn = page.getByRole('button', { name: 'Entendido' });
    this.partialPaymentAmountTxt = page.getByRole('spinbutton');
    this.incomeBtn = page.getByRole('link', { name: 'Ingresos' });
    this.registerIncomesBySchoolTableTitle = page.getByText('Pagos registrados por el colegio');
    this.registerPaymentBtn = page.getByRole('main').getByRole('button', { name: 'Registrar pago' });
    this.registerThePayerLbl = page.getByRole('heading', { name: 'Identificar al pagador' });
    this.nameOrTuitionNumberTxt = page.getByPlaceholder('Nombre o nro. de matrícula');
    this.studentAnelAguilarAguilarSelector = page.getByRole('button', {
      name: 'Anel Aguilar Aguilar Primaria - 3 B 4294',
    });
    this.listBoxStudent = page.getByRole('listbox', { name: 'Nombre o nro. de matrícula' });
    this.studentGetByRolPickSelector = page.getByRole('button').filter({ hasText: 'Secundaria - 7 NI' });
    //    this.payerDiegoRasconSelector = page.getByRole('menuitem', { name: 'Diego Rascón cabrerarebeca@example.net 2' });

    this.payerDiegoRasconSelector = page.locator('li');
    this.payerNicolasPalomoSelector = page
      .getByRole('menuitem')
      .filter({ hasText: 'Nicolás Palomo bcaldera@example.net' });
    //Vista para elegir cuenta y medio de pago y confirmarlo
    this.tuitionAnelAguilarAguilarInfo = page
      .locator('section')
      .filter({ hasText: 'Anel Aguilar AguilarMatrícula: 4294Sección: 3 BFacturación: Socorro Acuña' });
    this.paymentAccountComboBox = page.getByRole('combobox', { name: 'Cuenta de abono' });
    this.paymentAccountComboBoxOption = page.getByRole('option', {
      name: 'BANORTE (Account School BMT 1)',
    });
    this.paymentChannelComboBox = page.getByRole('combobox', { name: 'Medio de pago' });
    this.paymentChannelComboBoxOption = page.getByRole('option', { name: 'Crédito', exact: true });
    this.createReceiptOption = page.getByLabel('', { exact: true });
    this.firstPendingPaymentOrder = page.locator('td').first();
    this.secondPendingPaymentOrder = page.locator('tr:nth-child(2) > td').first();
    this.finalRegisterPaymentBtn = page.getByRole('button', { name: 'Registrar Pago' });
    this.registeredPaymentMsg = page.getByText('¡Pago registrado!');
    this.printReceiptBtn = page.getByRole('link', { name: 'Imprimir recibo' });
    this.seePaymentReceiptBtn = page.getByRole('button', { name: 'Ver' });
    this.downloadRegisteredPaymentsBtn = page.locator(
      '//body/div[1]/div/main/div/div/div[3]/div/div[1]/div/div[2]/div[1]/button[contains(@id,"radix-")]'
    );
    this.downloadCometaDepositsToSchoolbtn = page.locator(
      '//body/div[1]/div/main/div/div/div[3]/div/div[2]/div[1]/div[2]/div/button[contains(@id,"radix-")]'
    );
    this.downloadPdfOption = page.getByText('Descargar facturas PDF');
    this.preparingFilesTxt = page.getByText('Preparando archivos');
    this.cancellDownloadBtn = page.getByRole('button', { name: 'Cancelar' });
    this.filterBtn = page.getByTestId('filterBtn');
    this.cometaDepositsPageNavigatorBox = page.getByText('Ir a la página:').nth(1);
    this.optionalConceptsTabOption = page.getByTestId('optionalConcepts-tabOption');
  }
}
