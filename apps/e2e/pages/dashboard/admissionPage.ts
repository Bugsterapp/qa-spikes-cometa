import { Locator, Page } from '@playwright/test';

export class AdmissionPage {
  readonly page: Page;
  readonly pass: Locator;
  readonly emailTxt: Locator;
  readonly newProspectBtn: Locator;
  readonly guardianLastNameTxt: Locator;
  readonly guardianFirstNameTxt: Locator;
  readonly guardianEmailTxt: Locator;
  readonly guardianPhoneTxt: Locator;
  readonly guardianRelationshipSelector: Locator;
  readonly propsectLastNameTxt: Locator;
  readonly propsectFirstNameTxt: Locator;
  readonly changeReason: Locator;
  readonly postulationGradeCombobox: Locator;
  readonly schoolCycleCombobox: Locator;
  readonly admitPropsectBtn: Locator;
  readonly conceptTab: Locator;
  readonly assignConcept: Locator;
  readonly selectConceptCombobox: Locator;
  readonly backBtn: Locator;
  readonly curpTxt: Locator;
  readonly enrollmentCodeTxt: Locator;
  readonly confirmAdmitPropsectBtn: Locator;
  readonly groupCombobox: Locator;
  readonly admissionMenuBtn: Locator;
  readonly admissionFinishBtn: Locator;
  readonly admissionDeleteBtn: Locator;
  readonly radioDroppedOut: Locator;
  readonly radioRejectApplication: Locator;
  readonly cancelarBtn: Locator;
  readonly finalizarBtn: Locator;
  readonly droppedOutReasonTxt: Locator;
  readonly rejectApplicationReasonTxt: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailTxt = page.getByTestId('email-input');
    this.pass = page.locator('input[name="password"]');
    this.newProspectBtn = page.getByTestId('new-prospect-btn');
    this.guardianFirstNameTxt = page.getByTestId('guardian-first-name-txt');
    this.guardianLastNameTxt = page.getByTestId('guardian-last-name-txt');
    this.guardianEmailTxt = page.getByTestId('guardian-email-txt');
    this.guardianPhoneTxt = page.getByTestId('phone-input');
    this.propsectFirstNameTxt = page.getByTestId('prospect-first-name-txt');
    this.propsectLastNameTxt = page.getByTestId('prospect-last-name-txt');
    this.guardianRelationshipSelector = page.getByTestId('Parentesco con el prospecto');
    this.changeReason = page.getByTestId('Motivo de cambio o postulación');
    this.postulationGradeCombobox = page.getByTestId('Grado al que postula');
    this.schoolCycleCombobox = page.getByTestId('Ciclo escolar de ingreso');
    this.admitPropsectBtn = page.locator('button').filter({ hasText: 'Admitir prospecto' });
    this.conceptTab = page.getByTestId('concept-tab');
    this.assignConcept = page.locator('button').filter({ hasText: 'Asignar concepto' });
    this.selectConceptCombobox = page.getByPlaceholder('Selecciona un concepto');
    this.backBtn = page.getByRole('link', { name: 'Volver' });
    this.curpTxt = page.locator('input[name="identifier"]');
    this.enrollmentCodeTxt = page.locator('input[name="enrollment_code"]');
    this.confirmAdmitPropsectBtn = page.getByRole('button', { name: 'Admitir' });
    this.groupCombobox = page.locator('button').filter({ hasText: 'Grupo' });
    this.admissionMenuBtn = page.getByTestId('admission-menu-btn');
    this.admissionFinishBtn = page.getByTestId('admission-finish-btn');
    this.admissionDeleteBtn = page.getByTestId('admission-delete-btn');
    this.radioDroppedOut = page.getByTestId('radio-dropped-out');
    this.radioRejectApplication = page.getByTestId('radio-not-admitted');
    this.cancelarBtn = page.getByTestId('cancelar-btn');
    this.finalizarBtn = page.getByTestId('finalizar-btn');
    this.droppedOutReasonTxt = page.getByPlaceholder('Motivo de abandono');
    this.rejectApplicationReasonTxt = page.getByPlaceholder('Motivo de rechazo');
  }

  async selectFirstConceptOption() {
    await this.assignConcept.click();
    await this.selectConceptCombobox.click();
    // Wait for the options to be visible.  Adjust timeout if needed.
    await this.page.waitForTimeout(1000); // or use waitForSelector if you have a better selecto
    const firstOption = this.page.locator('ul[role="listbox"] li[role="option"]:not([aria-disabled="true"])').first();
    const firstOptionText = await firstOption.textContent();

    await this.selectConceptCombobox.fill(firstOptionText as string);
    await this.page.waitForTimeout(500); // Wait for the input to update visually
    await firstOption.click(); // Click the option
  }
}
