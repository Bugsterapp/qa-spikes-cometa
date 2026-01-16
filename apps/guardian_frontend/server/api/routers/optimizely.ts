import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import * as Sentry from '@sentry/node';
import { TRPCError } from '@trpc/server';
import optimizely from '@optimizely/optimizely-sdk';

type OptimizelyClientInstance = NonNullable<ReturnType<typeof optimizely.createInstance>>;
let optimizelyInstance: OptimizelyClientInstance | null = null;

function getOptimizelyInstance(): OptimizelyClientInstance {
  if (!optimizelyInstance) {
    const sdkKey = process.env.OPTIMIZELY_SERVER_SDK_KEY;
    if (!sdkKey) {
      throw new Error('OPTIMIZELY_SERVER_SDK_KEY is not defined');
    }

    optimizelyInstance = optimizely.createInstance({
      sdkKey,
      logLevel:
        process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production'
          ? optimizely.enums.LOG_LEVEL.INFO
          : optimizely.enums.LOG_LEVEL.ERROR,
    });
  }

  if (!optimizelyInstance) {
    throw new Error('Failed to create Optimizely instance');
  }

  return optimizelyInstance;
}

export const optimizelyRouter = createTRPCRouter({
  getFlag: protectedProcedure
    .input(
      z.object({
        flagKey: z.string(),
        userId: z.string(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const client = getOptimizelyInstance();
        await client.onReady();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userContext = (client as any).createUserContext(input.userId, input.attributes || {});

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decision = userContext.decide(input.flagKey);

        return {
          enabled: decision.enabled,
          variables: decision.variables,
          variationKey: decision.variationKey,
          ruleKey: decision.ruleKey,
          flagKey: decision.flagKey,
          userContext: {
            userId: input.userId,
            attributes: input.attributes || {},
          },
        };
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get feature flag decision',
          cause: error,
        });
      }
    }),

  getFlags: protectedProcedure
    .input(
      z.object({
        flagKeys: z.array(z.string()),
        userId: z.string(),
        attributes: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const client = getOptimizelyInstance();
        await client.onReady();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userContext = (client as any).createUserContext(input.userId, input.attributes || {});

        const decisions: Record<string, any> = {};

        for (const flagKey of input.flagKeys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const decision = userContext.decide(flagKey);

          decisions[flagKey] = {
            enabled: decision.enabled,
            variables: decision.variables,
            variationKey: decision.variationKey,
            ruleKey: decision.ruleKey,
          };
        }

        return decisions;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get feature flags decisions',
          cause: error,
        });
      }
    }),

  archiveFlag: protectedProcedure
    .input(
      z.object({
        flag_name: z.string(),
        project_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const client = new OptimizelyClient(process.env.OPTIMIZELY_API_KEY ?? '');

        const resp = await client.archiveFlags(input.project_id, {
          keys: [input.flag_name],
        });

        return resp;
      } catch (error) {
        Sentry.captureException(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: JSON.stringify((error as any)?.error || {}),
          cause: (error as any)?.error,
        });
      }
    }),
});

interface OptimizelyApiResponse {
  [key: string]: any;
}

interface OptimizelyRequestOptions {
  [key: string]: any;
}

class OptimizelyClient {
  private token: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(token: string) {
    this.token = token;
    this.baseUrl = process.env.OPTIMIZELY_API_BASE_URL ?? '';
    this.headers = {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    };
  }

  public async archiveFlags(projectId: string, data: OptimizelyRequestOptions = {}): Promise<OptimizelyApiResponse> {
    return this._makeRequest(`/flags/v1/projects/${projectId}/flags/archived`, data);
  }

  public async unarchiveFlags(projectId: string, data: OptimizelyRequestOptions = {}): Promise<OptimizelyApiResponse> {
    return this._makeRequest(`/flags/v1/projects/${projectId}/flags/unarchived`, data);
  }

  private async _makeRequest(endpoint: string, data: OptimizelyRequestOptions): Promise<OptimizelyApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  }
}
