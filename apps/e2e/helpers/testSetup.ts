/**
 * Extended Test Setup with Fixtures
 * Provides common fixtures for E2E tests to reduce boilerplate
 */

import { test as baseTest, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/dashboard/loginPage';
import { dataConfig, user1 } from '../data/data';
import {
  getSchoolIdByName,
  getActiveSchoolCycleBySchoolId,
  getLevelIdBySchoolId,
  getSectionIdBySchoolId,
  getBankAccountBySchoolName,
  getFiscalEntityBySchoolId,
} from './commons';

type Environment = 'local' | 'stage' | 'dev' | 'demo' | 'qa';

// ============================================================================
// FIXTURE TYPES
// ============================================================================

export interface SchoolContext {
  schoolId: string;
  schoolName: string;
  cycleId: string;
  cycleName: string;
  levelId: string;
  sectionId: string;
  bankAccountId: string;
  bankAccountName: string;
  fiscalEntityId: string;
}

export interface AuthenticatedPage {
  page: Page;
  loginPage: LoginPage;
}

export interface TestFixtures {
  /** Pre-authenticated dashboard page */
  authenticatedDashboard: AuthenticatedPage;
  /** School context with all common IDs pre-fetched */
  schoolContext: SchoolContext;
  /** LoginPage instance */
  loginPage: LoginPage;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_SCHOOL_NAME = 'Instituto Internacional Carlos';

// ============================================================================
// EXTENDED TEST WITH FIXTURES
// ============================================================================

export const test = baseTest.extend<TestFixtures>({
  // Console log capture fixture
  page: async ({ page }, use) => {
    const consoleLogs: string[] = [];

    // Hook global: capture console logs
    page.on('console', (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    await use(page);

    // At end of test, attach console logs
    test.info().attach('Browser console logs', {
      body: consoleLogs.join('\n'),
      contentType: 'text/plain',
    });
  },

  // LoginPage fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Pre-authenticated dashboard fixture
  authenticatedDashboard: async ({ page }, use) => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const envVar = (process.env.ENV_PLAYWRIGHT as Environment) || 'demo';
    const dashboardUrl = dataConfig[envVar]?.DASHBOARD_URL;

    if (!dashboardUrl) {
      throw new Error(`No dashboard URL configured for environment: ${envVar}`);
    }

    // Navigate to dashboard
    await page.goto(dashboardUrl);

    // Handle "page not found" edge case for local development
    const pageNotFound = page.getByText('¡Disculpa, página no encontrada!');
    if (await pageNotFound.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.reload();
    }

    const loginPage = new LoginPage(page);

    // Perform login if login form is visible
    try {
      if (await loginPage.emailTxt.isEnabled({ timeout: 2000 })) {
        await loginPage.emailTxt.click();
        await loginPage.emailTxt.fill(user1.email);
        await loginPage.pass.click();
        await loginPage.pass.fill(user1.password);
        await loginPage.pass.press('Enter');

        // Wait for dashboard to load
        await expect(loginPage.incomeBtn).toBeEnabled({ timeout: 60000 });

        // Select default school if needed
        const currentSchool = await loginPage.schoolBtn.textContent();
        if (currentSchool !== DEFAULT_SCHOOL_NAME) {
          await loginPage.schoolBtn.click();
          await page.getByTestId(`${DEFAULT_SCHOOL_NAME}-option`).click();
        }
      }
    } catch (error) {
      // Already logged in, continue
    }

    await use({ page, loginPage });
  },

  // School context fixture with pre-fetched IDs
  // eslint-disable-next-line no-empty-pattern
  schoolContext: async ({}, use) => {
    const schoolName = DEFAULT_SCHOOL_NAME;

    try {
      const schoolId = await getSchoolIdByName(schoolName);
      const cycles = await getActiveSchoolCycleBySchoolId(schoolId, true);
      const cycleId = cycles?.[0]?.id || '';
      const cycleName = cycles?.[0]?.name || '';
      const levelId = await getLevelIdBySchoolId(schoolId, 'Primaria');
      const sectionId = await getSectionIdBySchoolId(schoolId, levelId);
      const bankAccount = await getBankAccountBySchoolName(schoolName);
      const fiscalEntityId = await getFiscalEntityBySchoolId(schoolId);

      await use({
        schoolId,
        schoolName,
        cycleId,
        cycleName,
        levelId,
        sectionId,
        bankAccountId: bankAccount?.id || '',
        bankAccountName: bankAccount?.publicSummary || '',
        fiscalEntityId,
      });
    } catch (error) {
      // Provide empty context if fetching fails (useful for tests that don't need it)
      await use({
        schoolId: '',
        schoolName,
        cycleId: '',
        cycleName: '',
        levelId: '',
        sectionId: '',
        bankAccountId: '',
        bankAccountName: '',
        fiscalEntityId: '',
      });
    }
  },
});

// ============================================================================
// HELPER FUNCTIONS FOR TESTS
// ============================================================================

/**
 * Navigate to dashboard and login with custom credentials
 */
export async function loginToDashboard(
  page: Page,
  options: {
    email?: string;
    password?: string;
    schoolName?: string;
  } = {}
): Promise<LoginPage> {
  const { email = user1.email, password = user1.password, schoolName = DEFAULT_SCHOOL_NAME } = options;

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const envVar = (process.env.ENV_PLAYWRIGHT as Environment) || 'demo';
  const dashboardUrl = dataConfig[envVar]?.DASHBOARD_URL;

  if (!dashboardUrl) {
    throw new Error(`No dashboard URL configured for environment: ${envVar}`);
  }

  await page.goto(dashboardUrl);

  const loginPage = new LoginPage(page);

  if (await loginPage.emailTxt.isEnabled({ timeout: 2000 }).catch(() => false)) {
    await loginPage.emailTxt.fill(email);
    await loginPage.pass.fill(password);
    await loginPage.pass.press('Enter');
    await expect(loginPage.incomeBtn).toBeEnabled({ timeout: 60000 });

    const currentSchool = await loginPage.schoolBtn.textContent();
    if (currentSchool !== schoolName) {
      await loginPage.schoolBtn.click();
      await page.getByTestId(`${schoolName}-option`).click();
    }
  }

  return loginPage;
}

/**
 * Create a school context for a specific school
 */
export async function createSchoolContext(schoolName: string): Promise<SchoolContext> {
  const schoolId = await getSchoolIdByName(schoolName);
  const cycles = await getActiveSchoolCycleBySchoolId(schoolId, true);
  const cycleId = cycles?.[0]?.id || '';
  const cycleName = cycles?.[0]?.name || '';
  const levelId = await getLevelIdBySchoolId(schoolId, 'Primaria');
  const sectionId = await getSectionIdBySchoolId(schoolId, levelId);
  const bankAccount = await getBankAccountBySchoolName(schoolName);
  const fiscalEntityId = await getFiscalEntityBySchoolId(schoolId);

  return {
    schoolId,
    schoolName,
    cycleId,
    cycleName,
    levelId,
    sectionId,
    bankAccountId: bankAccount?.id || '',
    bankAccountName: bankAccount?.publicSummary || '',
    fiscalEntityId,
  };
}

// Re-export expect for convenience
export { expect };
