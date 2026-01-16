// import { GuardianHomePage } from './../../../e2e/pages/portal/guardianHomePage';
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
} from '../../helpers/commons';
import { SchoolCycle } from '@cometa/trpc/src/types';
import {
  generateFirstName,
  generateLastName,
  generateMatricula,
  createStudentWithParams,
  assignGuardianAPI,
} from '/helpers/students';
import { faker } from '@faker-js/faker';
import { addOrdersToStudent, createConcept } from '/helpers/concepts';
import { GuardianHomePage } from '/pages/portal/guardianHomePage';
import { pagarOrdenConceptoObligatorio } from '/helpers/payments';

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
let homePage: GuardianHomePage;

test('usuario paga una colegiatura con tarjeta credito mediante kushky con exito @portal @test @sanity', async () => {
  test.setTimeout(120000);
  await pagarOrdenConceptoObligatorio(homePage, conceptName);
});

test.beforeEach(async ({ page }) => {
  // Given Existe un estudiante creado
  const schoolName = 'Instituto Internacional Carlos';
  schoolID = await getSchoolIdByName(schoolName);
  fiscalEntity = await getFiscalEntityBySchoolId(schoolID);
  banc = await getBankAccountBySchoolName(schoolName);
  levelId = await getLevelIdBySchoolId(schoolID, 'Primaria');
  sectionId = await getSectionIdBySchoolId(schoolID, levelId);
  firstName = await generateFirstName();
  lastName = await generateLastName();
  guardianFirstName = await generateFirstName();
  guardianLastName = await generateLastName();
  const studentMotherLastName = await generateLastName();
  matricula = await generateMatricula();
  const curp = await generarCURP(lastName, studentMotherLastName, firstName);
  cycle = await getActiveSchoolCycleBySchoolId(schoolID, true);
  conceptName = 'Concepto ' + faker.word.sample() + ' ' + faker.number.int({ max: 99999 });
  const conceptPrice = faker.number.int({ max: 9999 }).toString();
  const conceptId = await createConcept(conceptName, conceptPrice, fiscalEntity, cycle?.[0].id, banc?.id, schoolID);
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
  await addOrdersToStudent(student_id, conceptId);
  const token = await getGuardianToken(page, guardianFirstName, guardianLastName, '@getcometa.com');
  //Ingreso en portal como tutor para realizar el pago
  // eslint-disable-next-line no-console
  await delay(2000);
  await gotoPortal(page, token);
  await completeOnboardingNewGuardian(page, schoolName);
  await closeHelperTourMessages(page);
  homePage = new GuardianHomePage(page);
  await closePortalTour(homePage);
  await page.reload();
});
