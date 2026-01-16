/* eslint-disable no-console */
import { expect } from '@playwright/test';
import { StudentDetailPage } from '/pages/dashboard/studentDetailPage';
import { StudentsPage } from '/pages/dashboard/studentsPage';
import { studentDetailPageConceptTab } from '/pages/dashboard/studentDetailPageConceptTab';

export async function assignConceptToStudentFront(
  studentsDetailsPage: StudentDetailPage,
  studentsPage: StudentsPage,
  studentssDetailPageConceptTab: studentDetailPageConceptTab,
  conceptName: string
) {
  await studentsDetailsPage.conceptTab.click();
  await studentsPage.assignConcept.scrollIntoViewIfNeeded();
  await studentsPage.assignConcept.click();
  await studentsPage.schoolCicloInp.click();
  await studentsPage.page.getByText('Ciclo actual').click();
  await studentssDetailPageConceptTab.conceptTypeBtn.fill('Colegiatura');
  studentssDetailPageConceptTab.setConceptType('Colegiatura / Mensualidad');
  await studentssDetailPageConceptTab.conceptTypeOption.click();
  await studentsPage.conceptNameInp.fill(conceptName);
  await expect(studentsPage.page.getByRole('option', { name: conceptName })).toBeVisible({
    timeout: 3000,
  });
  await studentsPage.page.getByRole('option', { name: conceptName }).click();
  //Checkea todos los checkbox d cada mes del concepto.
  await studentsPage.monthlyChk.first().scrollIntoViewIfNeeded();
  const count = await studentsPage.monthlyChk.count();
  const checkboxes = await studentsPage.page.$$('[data-testid="generic-checkbox"]');
  for (const checkbox of checkboxes) {
    const estadoAriaChecked = await checkbox.getAttribute('aria-checked');
    const estadoDataState = await checkbox.getAttribute('data-state');
    if (estadoAriaChecked === 'false' && estadoDataState === 'unchecked') {
      await checkbox.click();
    }
  }
  await studentsPage.page.getByRole('button', { name: 'Asignar', exact: true }).click();
  await expect(studentsPage.page.getByText('¡Se asignó el concepto de manera exitosa!')).toBeVisible({ timeout: 6000 });
  return count;
}
