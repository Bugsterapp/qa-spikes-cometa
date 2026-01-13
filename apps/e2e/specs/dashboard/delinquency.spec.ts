import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { DelinquencyPage } from '../../pages/dashboard/delinquencyPage';
import { dashboardLogin, goto, getSchoolIdByName, getActiveSchoolCycleBySchoolId } from '../../helpers/commons';
import { user1 } from '../../data/data';
import { getDelinquentStudents } from '/helpers/delinquency';
import { getConceptListBySchoolId } from '/helpers/concepts';
import { ConceptTypesEnum } from '@cometa/trpc/src/types';
import { waitForDelinquencyResponses, applyConceptFilter, verifyDelinquencyResults } from '../../helpers/delinquency';

test('Usuario filtra por tipo de concepto Inscripcion la tabla morosidad exitosamente e2e @sanity', async ({
  page,
}) => {
  // Setup
  const loginPage = new LoginPage(page);
  const delinquencyPage = new DelinquencyPage(page);
  const conceptType = ConceptTypesEnum.INSCRIPTION;

  // Preparar datos necesarios
  await goto(page);
  await dashboardLogin(loginPage, 'Instituto Internacional Carlos', user1.email, user1.password);
  const schoolId = await getSchoolIdByName('Instituto Internacional Carlos');
  const schoolCycle = await getActiveSchoolCycleBySchoolId(schoolId);
  const concepts = await getConceptListBySchoolId(schoolId, schoolCycle?.[0].id, [conceptType]);
  const delinquentStudents = await getDelinquentStudents(schoolId, { concepts: concepts.map((concept) => concept.id) });
  const firstStudent = delinquentStudents?.results?.[0];

  // Verificar que estamos en la página correcta
  await expect(loginPage.schoolBtn).toBeVisible({ timeout: 100000 });

  // Navegar a la sección de morosidad y esperar la carga inicial
  await delinquencyPage.delinquencyBtn.click();
  const initialFilters = await waitForDelinquencyResponses(page);

  // Aplicar el filtro de concepto según el estado inicial
  await applyConceptFilter(page, delinquencyPage, initialFilters, conceptType);

  // Expandir lista
  await delinquencyPage.collapsableListBtn.click();

  // Verificar resultados
  if (firstStudent && delinquentStudents.count !== undefined) {
    await verifyDelinquencyResults(
      page,
      delinquencyPage,
      delinquentStudents.count,
      `${firstStudent.first_name} ${firstStudent.last_name}`
    );
  } else {
    throw new Error(`No se encontraron estudiantes morosos para el filtro de ${conceptType}`);
  }
});
