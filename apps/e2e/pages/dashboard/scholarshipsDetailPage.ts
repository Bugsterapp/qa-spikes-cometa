import { SchoolCycle } from '@cometa/trpc/src/types';
import { Locator, Page } from '@playwright/test';

export class ScholarshipsDetailPage {
  readonly page: Page;
  readonly informationTab: Locator;
  readonly massiveAssignmentBtn: Locator;
  readonly studentsAssignedTab: Locator;
  readonly schoolCycleCombobox: Locator;
  readonly scholarshipNextBtn: Locator;
  readonly findSchoolarshipTxt: Locator;
  readonly virtuosoScroller: Locator;
  readonly virtuosoItemList: Locator;
  readonly genericCheckbox: Locator;
  readonly backBtn: Locator;
  readonly saveBtn: Locator;
  readonly closeBtn: Locator;
  readonly reactivateBtn: Locator;
  readonly editBtn: Locator;
  readonly findStudentInput: Locator;
  readonly activateBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.informationTab = page.getByTestId('information-tab');
    this.massiveAssignmentBtn = page.getByTestId('massiveAssignment-btn');
    this.studentsAssignedTab = page.getByTestId('students-assigned-tab');
    this.schoolCycleCombobox = page.getByTestId('schoolCycle-combobox');
    this.scholarshipNextBtn = page.getByTestId('scholarship-next-button');
    this.findSchoolarshipTxt = page.getByPlaceholder('Buscar estudiantes');
    this.virtuosoScroller = page.getByTestId('virtuoso-scroller');
    this.virtuosoItemList = page.getByTestId('virtuoso-item-list');
    this.genericCheckbox = page.locator('#generic-checkbox');
    this.backBtn = page.getByRole('button', { name: 'Volver' });
    this.saveBtn = page.getByRole('button', { name: 'Guardar' });
    this.closeBtn = page.getByTestId('close-button');
    this.reactivateBtn = page.locator('form').getByRole('button');
    this.activateBtn = page.locator('form').getByRole('button');
    this.editBtn = page.locator('button').filter({ hasText: 'Editar' });
    this.findStudentInput = page.getByPlaceholder('Buscar estudiante');
  }

  getCicleOption(cicleNameOption: string) {
    return this.page.getByRole('option', { name: cicleNameOption });
  }

  getDeactivateSchollarshipCyclePopUp() {
    return this.page.getByText('Desactivar ciclo escolarNo se');
  }

  getdeactivateBtn(card: Locator) {
    return card.locator('button').filter({ hasText: 'Desactivar' });
  }

  getCycleSectionsElements(cycle: SchoolCycle[]) {
    return this.page.locator('section').filter({ hasText: `${cycle[0].name}` });
  }
}
