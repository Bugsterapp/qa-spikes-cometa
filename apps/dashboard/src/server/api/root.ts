import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { manualPaymentsRouter } from './routers/manual-payments';
import { studentsRouter } from './routers/students';
import { chargeRouter } from './routers/charge';
import { paymentsRouter } from './routers/payments';
import { incomeRouter } from './routers/income';
import { guardianRouter } from './routers/guardians';
import { delinquencyRouter } from './routers/delinquency';
import { scholarshipsRouter } from './routers/scholarships';
import { schoolsRouter } from './routers/schools';
import { conceptsRouter } from './routers/concepts';
import { collectionsRouter } from './routers/collections';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
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
});

// export type definition of API
export type AppRouter = typeof appRouter;
