import { createNextApiHandler } from '@trpc/server/adapters/next';

import { env } from '../../../env/server.mjs';
import { createTRPCContext } from '../../../server/api/trpc';
import { appRouter } from '../../../server/api/root';
import { logErrorToSentry } from '/src/utils/trpcErrorHandler';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          // eslint-disable-next-line no-console
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${JSON.parse(error.cause?.message ?? '').error.error}`
          );
          logErrorToSentry(error);
        }
      : env.NODE_ENV === 'production'
      ? ({ error }) => {
          logErrorToSentry(error);
        }
      : undefined,
});
