import { test } from '../../helpers/testSetup';
import {
  closeHelperTourMessages,
  closePortalTour,
  completeOnboardingNewGuardian,
  delay,
  generarCURP,
  generateEmail,
  getActiveSchoolCycleBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
  getGuardianToken,
  getLevelIdBySchoolId,
  getSchoolIdByName,
  getSectionIdBySchoolId,
  gotoPortal,
  retryElementIsVisible,
} from '../../helpers/commons';
import {
  CreateConceptWithAttributes,
  OptionalConceptOrders,
  SchoolCycle,
  UpdateQuantityRequestActionEnum,
} from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import {
  createOtherConceptByApi,
  addOptionalOrdersToStudent,
  apiSchoolsStockChangeLimitPartialUpdate,
  apiGetSchoolsOptionalConceptsOrdersList,
  apiSchoolsStockUpdateQuantityPartialUpdate,
} from '/helpers/concepts';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  createStudentWithParams,
  assignGuardianAPI,
} from '/helpers/students';
import { GuardianHomePage } from '/pages/portal/guardianHomePage';
import { pagarOpcionalOrderConStock } from '/helpers/payments';

let firstName: string;
let lastName: string;
let matricula: string;
let guardianLastName: string;
let guardianFirstName: string;
let levelId: string;
let sectionId: string;
let cycle: SchoolCycle[];
let schoolID: string;
let student_id: string;
let fiscalEntity: string;
let banc: any;
let conceptName: string;
let concept: CreateConceptWithAttributes;
let response: OptionalConceptOrders[];
let homePage: GuardianHomePage;
let schoolName: string;

test('Pagar exitosamente una variante con stock infinito', async () => {
  test.setTimeout(120000);
  // Puedo realizar el pago con tarjeta al tener stock infinito
  await pagarOpcionalOrderConStock(homePage, conceptName, 'infito');
});

test('Se muestra SIN stock una orden opcional cuando el stock es = 0 @sanity', async ({ page }) => {
  test.setTimeout(120000);
  //Dado que la variante tiene stock = 0
  const id = response[1].stock?.id;
  if (id) {
    await apiSchoolsStockChangeLimitPartialUpdate(id, schoolID, true);
  }
  const element = page.getByRole('button', { name: 'SIN STOCK' });
  await retryElementIsVisible(page, element);
});

test('Pagar exitosamente una variante con stock disponible @sanity', async () => {
  test.setTimeout(120000);
  const id = response[1].stock?.id;
  if (id) {
    await apiSchoolsStockChangeLimitPartialUpdate(id, schoolID, true);
    await apiSchoolsStockUpdateQuantityPartialUpdate(id, schoolID, 1, UpdateQuantityRequestActionEnum.SUM);
  }
  //Puedo pagar lar oden con stock
  await pagarOpcionalOrderConStock(homePage, conceptName, 'x');
});

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  student_id = await createStudentWithParams(
    firstName,
    lastName,
    matricula,
    levelId,
    sectionId,
    schoolID,
    curp,
    undefined, //grade
    undefined, //group
    cycle?.[0].id
  );
  const guardianEmail = generateEmail(guardianFirstName, guardianLastName);
  await assignGuardianAPI(student_id, schoolID, guardianFirstName, guardianLastName, guardianEmail);
  // And el colegio ingreso en el dashboard
  await addOptionalOrdersToStudent(student_id, concept.id);
  response = await apiGetSchoolsOptionalConceptsOrdersList(concept.id, schoolID);
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, '@getcometa.com');
  /**
   * Ingreso en portal como tutor
   */
  await delay(2000);
  await gotoPortal(page, token);
  await completeOnboardingNewGuardian(page, schoolName);
  await closeHelperTourMessages(page);
  homePage = new GuardianHomePage(page);
  await closePortalTour(homePage);
  await delay(3000);
  await page.reload();
});

test.beforeAll(async () => {
  // Given Existe un estudiante creado
  schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  banc = await getBankAccountBySchoolName(schoolName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID, true);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  concept = await createOtherConceptByApi(conceptName, fiscalEntity, banc.id, cycle?.[0].id, schoolID, true);
});
