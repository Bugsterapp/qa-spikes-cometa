import { Api } from '@cometa/trpc/src/integrations/types';

export const IntegrationsServiceClient = new Api({ baseUrl: process.env.NEXT_PUBLIC_INTEGRATIONS_URL });
