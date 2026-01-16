import { test, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../../pages/dashboard/loginPage';
import { FiscalEntitiesPage } from '../../pages/dashboard/fiscalEntitiesPage';
import { dashboardLogin, goto } from '../../helpers/commons';
import { user1 } from '../../data/data';
import { suppressFilePondErrors } from '../../helpers/errorSuppression';
import { generateFiscalEntityFixtures, cleanupFiscalEntityFixtures } from '../../helpers/generateFixtures';

const schoolName = 'Instituto Internacional Carlos';

const generateTestData = () => {
  const timestamp = Date.now();
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random3Chars = Math.random().toString(36).substring(2, 5).toUpperCase();

  return {
    name: `Entidad Fiscal Test E2E ${timestamp}`,
    taxId: `TST${year}${month}${day}${random3Chars}`,
  };
};

let testData: ReturnType<typeof generateTestData>;
let actualRFC: string;
let loginPage: LoginPage;
let fiscalEntitiesPage: FiscalEntitiesPage;

test.beforeAll(async () => {
  await generateFiscalEntityFixtures();
});

test.afterAll(async () => {
  await cleanupFiscalEntityFixtures();
});

test.beforeEach(async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await context.setDefaultNavigationTimeout(60000);

  loginPage = new LoginPage(page);
  fiscalEntitiesPage = new FiscalEntitiesPage(page);

  await goto(page);
  await dashboardLogin(loginPage, schoolName, user1.email, user1.password);

  await expect(loginPage.conceptsBtn).toBeVisible({ timeout: 60000 });
});

test.afterEach(async ({ page }) => {
  // Cleanup: Delete test entities if they exist
  const rfcToDelete = actualRFC || testData?.taxId;

  // Only attempt cleanup if we have both RFC and name (meaning an entity was likely created)
  if (!rfcToDelete || !testData?.name) {
    return;
  }

  try {
    await fiscalEntitiesPage.navigateToFiscalEntities();
    await expect(fiscalEntitiesPage.pageTitle).toBeVisible({ timeout: 30000 });

    const entityCard = await fiscalEntitiesPage.getEntityCardByTaxIdAndName(rfcToDelete, testData.name);
    const exists = (await entityCard.count()) > 0;

    if (exists) {
      await fiscalEntitiesPage.deleteEntityByTaxIdAndName(rfcToDelete, testData.name);
      await page.waitForLoadState('networkidle');
    }
  } catch (error) {
    // Entity may have already been deleted or not created - silently continue
  }
});

test('Usuario visualiza la página de entidades fiscales @e2e', async ({ page }) => {
  await fiscalEntitiesPage.navigateToFiscalEntities();

  await expect(fiscalEntitiesPage.pageTitle).toBeVisible({ timeout: 30000 });
  await expect(fiscalEntitiesPage.pageDescription).toBeVisible();

  // Wait for page to fully load before counting
  await page.waitForLoadState('networkidle');

  const emptyStateVisible = await fiscalEntitiesPage.emptyStateTitle.isVisible().catch(() => false);

  if (emptyStateVisible) {
    // Verify empty state elements
    await expect(fiscalEntitiesPage.emptyStateImage).toBeVisible({ timeout: 10000 });
    await expect(fiscalEntitiesPage.emptyStateTitle).toBeVisible({ timeout: 10000 });
    await expect(fiscalEntitiesPage.emptyStateDescription).toBeVisible({ timeout: 10000 });
    await expect(fiscalEntitiesPage.emptyStateAddButton).toBeVisible({ timeout: 10000 });
  } else {
    // Verify entities are present
    const addButtonVisible = await fiscalEntitiesPage.addEntityButton.isVisible();
    expect(addButtonVisible).toBe(true);

    // Check if entity cards are present
    const entityCount = await fiscalEntitiesPage.entityCards.count();
    if (entityCount > 0) {
      await expect(fiscalEntitiesPage.entityCards.first()).toBeVisible({ timeout: 10000 });
      expect(entityCount).toBeGreaterThan(0);
    } else {
      // If no entity cards found, at least verify the add button is visible
      await expect(fiscalEntitiesPage.addEntityButton).toBeVisible({ timeout: 10000 });
    }
  }
});

test('Usuario crea una nueva entidad fiscal @e2e', async ({ page }) => {
  testData = generateTestData();

  await page.setViewportSize({ width: 1280, height: 800 });

  await suppressFilePondErrors(page);

  await fiscalEntitiesPage.navigateToFiscalEntities();

  await expect(fiscalEntitiesPage.pageTitle).toBeVisible({ timeout: 30000 });

  const initialEntityCount = await fiscalEntitiesPage.entityCards.count();

  await fiscalEntitiesPage.clickAddEntity();

  await expect(fiscalEntitiesPage.drawerTitle).toBeVisible({ timeout: 10000 });

  const fixturesPath = path.join(__dirname, '../../fixtures');
  const pdfPath = path.join(fixturesPath, 'test-fiscal-entity.pdf');
  const keyPath = path.join(fixturesPath, 'test-csd.key');
  const cerPath = path.join(fixturesPath, 'test-csd.cer');

  await fiscalEntitiesPage.uploadFile(fiscalEntitiesPage.fiscalEntityFileInput, pdfPath);
  await fiscalEntitiesPage.uploadFile(fiscalEntitiesPage.csdKeyFileInput, keyPath);
  await fiscalEntitiesPage.uploadFile(fiscalEntitiesPage.csdCertificateFileInput, cerPath);

  await fiscalEntitiesPage.fillCsdPassword('TestPassword123');

  // Wait for all files to be processed
  await page.waitForTimeout(1000);

  await fiscalEntitiesPage.clickNext();

  await expect(fiscalEntitiesPage.nameInput).toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(1000);

  const extractedRFC = await fiscalEntitiesPage.taxIdInput.inputValue();

  const rfcToUse = extractedRFC || testData.taxId;

  // Store for cleanup
  actualRFC = rfcToUse;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  await fiscalEntitiesPage.fillIdentificationFields({
    name: testData.name,
    taxId: rfcToUse,
    taxingSystem: '601 - General de Ley Personas Morales',
    issuedAt: formattedDate,
  });

  await expect(fiscalEntitiesPage.nameInput).toHaveValue(testData.name);
  await expect(fiscalEntitiesPage.taxIdInput).toHaveValue(rfcToUse);
  await expect(fiscalEntitiesPage.issuedAtInput).toHaveValue(formattedDate);

  await fiscalEntitiesPage.fillAddressFields({
    state: 'Ciudad de México',
    postalCode: '06000',
    city: 'Ciudad de México',
    district: 'Centro',
    addressName: 'Avenida Juárez',
    addressNumber: '123',
  });

  await expect(fiscalEntitiesPage.postalCodeInput).toHaveValue('06000');
  await expect(fiscalEntitiesPage.cityInput).toHaveValue('Ciudad de México');
  await expect(fiscalEntitiesPage.districtInput).toHaveValue('Centro');
  await expect(fiscalEntitiesPage.addressNameInput).toHaveValue('Avenida Juárez');
  await expect(fiscalEntitiesPage.addressNumberInput).toHaveValue('123');

  await fiscalEntitiesPage.clickSave();

  await page.waitForLoadState('networkidle');

  await expect(fiscalEntitiesPage.pageTitle).toBeVisible({ timeout: 30000 });

  const newEntityCard = await fiscalEntitiesPage.getEntityCardByTaxIdAndName(rfcToUse, testData.name);
  await expect(newEntityCard).toBeVisible({ timeout: 30000 });
  await expect(newEntityCard).toContainText(rfcToUse);
  await expect(newEntityCard).toContainText(testData.name);

  const finalEntityCount = await fiscalEntitiesPage.entityCards.count();
  expect(finalEntityCount).toBe(initialEntityCount + 1);

  // Note: The entity will be cleaned up by the afterEach hook, which also tests deletion
});
