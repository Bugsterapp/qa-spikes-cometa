import { academicCoordinatorRouter } from './routers/academic-coordinator';
import { admissionsRouter } from './routers/admissions';
import { adjustmentRulesRouter } from './routers/adjustment-rules';
import { authRouter } from './routers/auth';
import { backofficeRouter } from './routers/backoffice';
import { bookKeeperRouter } from './routers/book-keeper';
import { botRouter } from './routers/bot';
import { chargeRouter } from './routers/charge';
import { collectionsRouter } from './routers/collections';
import { conceptsRouter } from './routers/concepts';
import { delinquencyRouter } from './routers/delinquency';
import { formsRouter } from './routers/forms';
import { guardianRouter } from './routers/guardians';
import { incomeRouter } from './routers/income';
import { invoiceSeriesRouter } from './routers/invoice-series';
import { invoicesRouter } from './routers/invoices';
import { levelsRouter } from './routers/levels';
import { locationRouter } from './routers/location';
import { manualPaymentsRouter } from './routers/manual-payments';
import { metabaseRouter } from './routers/metabase';
import { payinsRouter } from './routers/payins';
import { paymentsRouter } from './routers/payments';
import { payoutsRouter } from './routers/payouts';
import { scholarshipsRouter } from './routers/scholarships';
import { schoolsRouter } from './routers/schools';
import { sectionsRouter } from './routers/sections';
import { studentsRouter } from './routers/students';
import { usersRouter } from './routers/users';
import { createTRPCRouter } from './trpc';
import { tableLinksRouter } from './routers/table-links';
import { schoolCyclesRouter } from './routers/school-cycles';
import { announcementsRouter } from './routers/announcements';
import { integrationsRouter } from './routers/integrations';
import { optimizelyRouter } from './routers/optimizely';
import { credentialsRouter } from './routers/credentials';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  backoffice: backofficeRouter,
  bookKeeper: bookKeeperRouter,
  bot: botRouter,
  manualPayments: manualPaymentsRouter,
  students: studentsRouter,
  charge: chargeRouter,
  payments: paymentsRouter,
  income: incomeRouter,
  guardian: guardianRouter,
  delinquency: delinquencyRouter,
  scholarships: scholarshipsRouter,
  schools: schoolsRouter,
  concepts: conceptsRouter,
  collections: collectionsRouter,
  invoices: invoicesRouter,
  levels: levelsRouter,
  sections: sectionsRouter,
  payouts: payoutsRouter,
  payins: payinsRouter,
  series: invoiceSeriesRouter,
  academicCoordinator: academicCoordinatorRouter,
  admissions: admissionsRouter,
  adjustmentRules: adjustmentRulesRouter,
  location: locationRouter,
  forms: formsRouter,
  tableLinks: tableLinksRouter,
  metabase: metabaseRouter,
  users: usersRouter,
  schoolCycles: schoolCyclesRouter,
  announcements: announcementsRouter,
  integrations: integrationsRouter,
  optimizely: optimizelyRouter,
  credentials: credentialsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
