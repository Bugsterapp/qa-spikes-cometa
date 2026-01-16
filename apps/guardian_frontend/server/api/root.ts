import { createTRPCRouter } from './trpc';
import { payinsRouter } from './routers/payins';
import { studentRouter } from './routers/student';
import { studentsRouter } from './routers/students';
import { guardianRouter } from './routers/guardian';
import { ordersRouter } from './routers/orders';
import { fulfillmentsRouter } from './routers/fulfillments';
import { schoolsRouter } from './routers/schools';
import { kushkiRouter } from './routers/kushki';
import { subscriptionsRouter } from './routers/subscriptions';
import { admissionsRouter } from './routers/admissions';
import { formsRouter } from './routers/forms';
import { checkoutRouter } from './routers/checkout';
import { optimizelyRouter } from './routers/optimizely';
import { integrationsRouter } from './routers/integrations';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  payin: payinsRouter,
  student: studentRouter,
  students: studentsRouter,
  guardian: guardianRouter,
  integrations: integrationsRouter,
  orders: ordersRouter,
  fulfillment: fulfillmentsRouter,
  schools: schoolsRouter,
  kushki: kushkiRouter,
  subscriptions: subscriptionsRouter,
  admissions: admissionsRouter,
  forms: formsRouter,
  checkout: checkoutRouter,
  optimizely: optimizelyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
