import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { payinsRouter } from './routers/payins';
import { studentRouter } from './routers/student';
import { guardianRouter } from './routers/guardian';
import { ordersRouter } from './routers/orders';
import { fulfillmentsRouter } from './routers/fulfillments';
import { schoolsRouter } from './routers/schools';
import { kushkiRouter } from './routers/kushki';
import { mercadopagoRouter } from './routers/mercadopago';
import { subscriptionsRouter } from './routers/subscriptions';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  payin: payinsRouter,
  student: studentRouter,
  guardian: guardianRouter,
  orders: ordersRouter,
  fulfillment: fulfillmentsRouter,
  schools: schoolsRouter,
  kushki: kushkiRouter,
  mercadopago: mercadopagoRouter,
  subscriptions: subscriptionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
