import { Page, expect } from '@playwright/test';

interface TestData {
  guardian: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  prospect: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  school: {
    name: string;
    cycle: string;
  };
}

interface Pages {
  login: any;
  admission: any;
  students: any;
}

export async function crearProspecto(page: Page, testData: TestData, pages: Pages) {
  await pages.login.admissionsBtn.click();
  // Wait for admissions page to load before clicking new prospect button
  await page.waitForLoadState('networkidle');
  await pages.admission.newProspectBtn.waitFor({ state: 'visible', timeout: 90000 });
  await pages.admission.newProspectBtn.waitFor({ state: 'attached', timeout: 90000 });
  await pages.admission.newProspectBtn.click();
  await pages.admission.guardianFirstNameTxt.fill(testData.guardian.firstName);
  await pages.admission.guardianLastNameTxt.fill(testData.guardian.lastName);
  await pages.admission.guardianEmailTxt.fill(testData.guardian.email);
  await pages.admission.guardianPhoneTxt.fill(testData.guardian.phone);
  await pages.admission.guardianRelationshipSelector.click();
  await page.getByLabel('Padre').click();
  await pages.admission.propsectFirstNameTxt.fill(testData.prospect.firstName);
  await pages.admission.propsectLastNameTxt.scrollIntoViewIfNeeded();
  await pages.admission.propsectLastNameTxt.fill(testData.prospect.lastName);
  await page.locator('input[name="birthdate"]').fill('01/01/2000');
  await page.getByLabel('Masculino').click();
  await pages.admission.postulationGradeCombobox.click();
  await page.getByLabel('1 - Pre escolar').click();
  await pages.admission.schoolCycleCombobox.click();
  await page.getByLabel(testData.school.cycle).click();
  await page.locator('input[name="origin_school"]').fill('School Test Admisiones');
  await pages.admission.changeReason.click();
  await page.getByTestId('Cambio de domicilio').click();
  await page.getByTestId('specialOverchargeMotive-input').fill('comentarioooo');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('El prospecto se ha creado exitosamente')).toBeVisible();
}

export async function asignarConcepto(page: Page, testData: TestData, pages: Pages) {
  await page.getByRole('cell', { name: testData.prospect.fullName }).click();
  await expect(pages.admission.admitPropsectBtn).toBeVisible();
  await pages.admission.conceptTab.click();
  await pages.admission.selectFirstConceptOption();
  await page.getByTestId('generic-checkbox').first().click();
  await page.getByRole('button', { name: 'Asignar', exact: true }).click();
  await expect(page.getByText('¡Se asignó el concepto de manera exitosa!')).toBeVisible();
}

export async function finalizarProceso(
  page: Page,
  pages: Pages,
  { tipo, motivo, cancelar }: { tipo: 'abandono' | 'rechazo'; motivo: string; cancelar?: boolean }
) {
  await pages.admission.admissionMenuBtn.click();
  await pages.admission.admissionFinishBtn.click();
  if (tipo === 'abandono') {
    await pages.admission.radioDroppedOut.click();
    await pages.admission.droppedOutReasonTxt.fill(motivo);
  } else {
    await pages.admission.radioRejectApplication.click();
    await pages.admission.rejectApplicationReasonTxt.fill(motivo);
  }
  if (cancelar) {
    await page.getByTestId('cancelar-btn').click();
  } else {
    await pages.admission.finalizarBtn.click();
  }
}
