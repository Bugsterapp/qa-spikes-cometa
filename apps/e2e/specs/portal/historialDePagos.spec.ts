import { expect } from '@playwright/test';
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
import { PaymentDetailPage } from '../../pages/portal/paymentDetailPage';
import {
  SchoolCycle,
  CreateConceptWithAttributes,
  OptionalConceptOrders,
  UpdateQuantityRequestActionEnum,
} from '@cometa/trpc/src/types';
import { faker } from '@faker-js/faker';
import {
  addOptionalOrdersToStudent,
  apiGetSchoolsOptionalConceptsOrdersList,
  apiSchoolsStockChangeLimitPartialUpdate,
  apiSchoolsStockUpdateQuantityPartialUpdate,
  createOtherConceptByApi,
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

test('Tutor puede ver el detalle de un pago realizado exitosamente, @portal', async ({ page }) => {
  test.setTimeout(140000);
  const id = response[1].stock?.id;
  if (id) {
    await apiSchoolsStockChangeLimitPartialUpdate(id, schoolID, true);
    await apiSchoolsStockUpdateQuantityPartialUpdate(id, schoolID, 1, UpdateQuantityRequestActionEnum.SUM);
  }
  //Puedo pagar lar oden con stock
  await pagarOpcionalOrderConStock(homePage, conceptName, 'x');
  await page.getByTestId('MenuIcon').click({ timeout: 5000 });
  const historyLink = page.getByTestId('history-menuLink');
  await historyLink.click({ timeout: 5000 });
  const card = page.locator(`[data-testid^="payinFulfillmentId-"][data-testid$="-card"]`);
  //const card = page.getByTestId('payinFulfillmentId-BMTG00009354-card');

  // 1. Obtener la fecha del día y asignarla a una constante de tipo string
  const currentDate = new Date();

  // 2. Aplicar una máscara de fecha para formatearla
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const monthsOfYear = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  const dayName = daysOfWeek[currentDate.getDay()];
  const day = currentDate.getDate();
  const monthName = monthsOfYear[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const formattedDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${monthName} ${year}`;

  // 3. Usar esa constante en el expect

  await expect(card.getByTestId('payinDate-text')).toHaveText(formattedDate);
  await expect(card.getByTestId('payinTotalPaid-text')).toContainText('$1,000.00');
  if (concept.orders) {
    await expect(card.getByText(`${conceptName} - x`)).toBeVisible();
    await card.getByTestId('seeDetails-btn').click();
  }
  const paymentDetailPage = new PaymentDetailPage(page);
  await expect(paymentDetailPage.payerNameTxt).toHaveText(`Pagado por: ${guardianFirstName} ${guardianLastName}`);
  await expect(paymentDetailPage.paymentDateTxt).toHaveText(formattedDate);
  await expect(paymentDetailPage.paymentMethodTxt).toHaveText('Medio de pago:Tarjeta de crédito');
  await expect(paymentDetailPage.paymentPlaceTxt).toHaveText('Lugar de pago:Portal de pagos Cometa');
  await expect(paymentDetailPage.totalPaymentTxt).toHaveText('Total pagado: $1,000.00');
  await expect(paymentDetailPage.payinFulfillmentTotalPaidTxt).toContainText('$1,000.00');

  /**
   * Retornar a la página de historial de pagos y hace scroll hasta el final de la card
   */
  await paymentDetailPage.backButton.click();
  const headingHistoryPage = page.getByRole('heading', { name: 'Historial de pago' });
  await expect(headingHistoryPage).toBeVisible({ timeout: 5000 });
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
   * Ingreso en portal como tutor para el historial de pagos
   */
  await delay(2000);
  await gotoPortal(page, token);
  await completeOnboardingNewGuardian(page, schoolName);
  await closeHelperTourMessages(page);
  homePage = new GuardianHomePage(page);
  await closePortalTour(homePage);
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
