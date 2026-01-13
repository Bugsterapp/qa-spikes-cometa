import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { AdmissionPage } from '../../pages/dashboard/admissionPage';
import { StudentsPage } from '../../pages/dashboard/studentsPage';
import {
  dashboardLogin,
  goto,
  TIMEOUTS,
  generateRandom10DigitNumber,
  generateEmail,
  delay,
} from '../../helpers/commons';
import { user1 } from '../../data/data';
import { generateCellPhoneForFront, generateFirstName, generateLastName } from '../../helpers/students';
import { crearProspecto, asignarConcepto, finalizarProceso } from '../../helpers/admissions';

test('Alta nuevo prospecto y guardian, @e2e @sanity', async ({ page }) => {
  // ARRANGE: Preparar datos de prueba
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();

  const testData = {
    guardian: {
      firstName: guardianFirstName,
      lastName: guardianLastName,
      phone: await generateCellPhoneForFront(),
      email: generateEmail(guardianFirstName, guardianLastName),
    },
    prospect: {
      firstName: await generateFirstName(),
      lastName: await generateLastName(),
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    school: {
      name: 'Instituto Internacional Carlos',
      cycle: 'Ciclo 2024-2025',
    },
  };

  // SETUP: Inicializar páginas
  const pages = {
    login: new LoginPage(page),
    admission: new AdmissionPage(page),
    students: new StudentsPage(page),
  };

  // ACT & ASSERT:
  await goto(page);
  await dashboardLogin(pages.login, testData.school.name, user1.email, user1.password);
  await expect(pages.login.schoolBtn).toBeVisible({ timeout: TIMEOUTS.LONG });

  await crearProspecto(page, testData, pages);
  await asignarConcepto(page, testData, pages);

  // 5. Admitir prospecto
  await pages.admission.admitPropsectBtn.click();
  await pages.admission.curpTxt.fill('XEXX010101HNEXXXA4');
  await pages.admission.enrollmentCodeTxt.fill(generateRandom10DigitNumber());
  await pages.admission.groupCombobox.click();
  await page.getByLabel('A', { exact: true }).getByText('A').click();
  await pages.admission.confirmAdmitPropsectBtn.click();
  await expect(page.getByText('Admitido')).toBeVisible();

  // 6. Verificar en lista de estudiantes
  await pages.admission.backBtn.click();
  await pages.login.studentsBtn.click({ timeout: TIMEOUTS.SHORT });
  await page.getByTestId('studentsCountFooter-span').scrollIntoViewIfNeeded();

  // Limpiar filtros si existen
  const clearAllButton = page.getByRole('button', { name: 'Limpiar todo' });
  const isButtonPresent = await clearAllButton.isVisible().catch(() => false);
  if (isButtonPresent) {
    await clearAllButton.scrollIntoViewIfNeeded();
    await clearAllButton.click();
    await page.waitForResponse(/\/api\/trpc\/students\.dashboardSchoolDueOrdersStudents/);
  }

  // Buscar y verificar estudiante
  await delay(3000);
  await pages.students.studentFilterTxtBox.fill(testData.prospect.fullName);
  await page.getByTestId(`${testData.prospect.fullName}-listItem`).click({ timeout: TIMEOUTS.SHORT });
  await page.getByRole('cell', { name: `${testData.prospect.lastName}, ${testData.prospect.firstName}` }).click();

  // Verificar datos del guardián usando los nuevos data-testid dinámicos
  await expect(page.getByTestId(`${testData.guardian.firstName} ${testData.guardian.lastName}`)).toBeVisible();
  await expect(page.getByText(testData.guardian.email)).toBeVisible();
  const statusLabel = page.locator('header div[data-state="closed"] label');
  await expect(statusLabel).toHaveText('Activo');
});

test('Finalizar proceso con opcion Abandono el prospecto, @e2e @sanity', async ({ page }) => {
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();

  const testData = {
    guardian: {
      firstName: guardianFirstName,
      lastName: guardianLastName,
      phone: await generateCellPhoneForFront(),
      email: generateEmail(guardianFirstName, guardianLastName),
    },
    prospect: {
      firstName: await generateFirstName(),
      lastName: await generateLastName(),
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    school: {
      name: 'Instituto Internacional Carlos',
      cycle: 'Ciclo 2024-2025',
    },
  };
  const pages = {
    login: new LoginPage(page),
    admission: new AdmissionPage(page),
    students: new StudentsPage(page),
  };
  await goto(page);
  await dashboardLogin(pages.login, testData.school.name, user1.email, user1.password);
  await expect(pages.login.schoolBtn).toBeVisible({ timeout: TIMEOUTS.LONG });
  await crearProspecto(page, testData, pages);
  await asignarConcepto(page, testData, pages);
  await finalizarProceso(page, pages, { tipo: 'abandono', motivo: 'Motivo de abandono' });
  await expect(page.getByText('Abandono')).toBeVisible();
  await expect(pages.admission.admissionMenuBtn).toBeHidden();
});

test('Finalizar proceso con opcion rechazo aplicacion, @e2e @sanity', async ({ page }) => {
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();

  const testData = {
    guardian: {
      firstName: guardianFirstName,
      lastName: guardianLastName,
      phone: await generateCellPhoneForFront(),
      email: generateEmail(guardianFirstName, guardianLastName),
    },
    prospect: {
      firstName: await generateFirstName(),
      lastName: await generateLastName(),
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    school: {
      name: 'Instituto Internacional Carlos',
      cycle: 'Ciclo 2024-2025',
    },
  };
  const pages = {
    login: new LoginPage(page),
    admission: new AdmissionPage(page),
    students: new StudentsPage(page),
  };
  await goto(page);
  await dashboardLogin(pages.login, testData.school.name, user1.email, user1.password);
  await expect(pages.login.schoolBtn).toBeVisible({ timeout: TIMEOUTS.LONG });
  await crearProspecto(page, testData, pages);
  await asignarConcepto(page, testData, pages);
  await finalizarProceso(page, pages, { tipo: 'rechazo', motivo: 'Motivo de rechazo' });
  await expect(page.getByText('No admitido')).toBeVisible();
  await expect(pages.admission.admissionMenuBtn).toBeHidden();
});

test('Cancelar la accion Finalizar proceso del prospecto, @e2e @sanity', async ({ page }) => {
  const guardianFirstName = await generateFirstName();
  const guardianLastName = await generateLastName();

  const testData = {
    guardian: {
      firstName: guardianFirstName,
      lastName: guardianLastName,
      phone: await generateCellPhoneForFront(),
      email: generateEmail(guardianFirstName, guardianLastName),
    },
    prospect: {
      firstName: await generateFirstName(),
      lastName: await generateLastName(),
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    school: {
      name: 'Instituto Internacional Carlos',
      cycle: 'Ciclo 2024-2025',
    },
  };
  const pages = {
    login: new LoginPage(page),
    admission: new AdmissionPage(page),
    students: new StudentsPage(page),
  };
  await goto(page);
  await dashboardLogin(pages.login, testData.school.name, user1.email, user1.password);
  await expect(pages.login.schoolBtn).toBeVisible({ timeout: TIMEOUTS.LONG });
  await crearProspecto(page, testData, pages);
  await asignarConcepto(page, testData, pages);
  await finalizarProceso(page, pages, { tipo: 'abandono', motivo: 'Motivo de abandono', cancelar: true });
  await expect(page.getByText('Admitir prospecto')).toBeVisible();
});
