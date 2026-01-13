import { Locator, Page } from '@playwright/test';

type Environment = 'local' | 'stage' | 'dev'; // Definimos los nombres de los entornos válidos

export class LoginPage {
  readonly page: Page;
  readonly emailTxt: Locator;
  readonly pass: Locator;
  readonly navSidePanelList: Locator;
  readonly schoolBtn: Locator;
  readonly delinquencyBtn: Locator;
  readonly incomeBtn: Locator;
  readonly studentsBtn: Locator;
  readonly cobranzasHdg: Locator;
  readonly paymentsBtn: Locator;
  private env: Environment;
  readonly conceptsBtn: Locator;
  readonly loginBtn: Locator;
  readonly remembermeChk: Locator;
  readonly chargeBtn: Locator;
  readonly scholarshipsBtn: Locator;
  readonly admissionsBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    //this.emailTxt = page.locator('input[name="email"]');
    this.emailTxt = page.getByTestId('email-input');
    //this.pass = page.locator('input[name="password"]');
    this.pass = page.getByTestId('password-input');
    this.navSidePanelList = page.locator('#__next > div > div > div > div.mb-2.space-y-2 > a');
    this.schoolBtn = page.getByTestId('schoolname-Collapsable');
    this.delinquencyBtn = page.getByRole('link', { name: 'Morosidad' });
    this.incomeBtn = page.getByRole('link', { name: 'Ingresos' });
    this.studentsBtn = page.getByRole('link', { name: 'Estudiantes' });
    this.cobranzasHdg = page.getByText('Cobranzas y morosidad');
    this.paymentsBtn = page.getByRole('link', { name: 'Pagos y Facturas' });
    this.env = 'local';
    this.conceptsBtn = page.getByRole('link', { name: 'Conceptos' });
    this.scholarshipsBtn = page.getByTestId('Becas y descuentos-link');
    this.loginBtn = page.getByTestId('login-button');
    this.remembermeChk = page.getByTestId('remember-checkbox');
    this.chargeBtn = page.getByTestId('Cobranzas-link');
    this.admissionsBtn = page.getByTestId('Admisiones-link');
  }
}
