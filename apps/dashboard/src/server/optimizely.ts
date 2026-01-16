import optimizely from '@optimizely/optimizely-sdk';
import * as Sentry from '@sentry/node';

type OptimizelyClientInstance = NonNullable<ReturnType<typeof optimizely.createInstance>>;
let optimizelyInstance: OptimizelyClientInstance | null = null;

/**
 * Get or create a singleton Optimizely client instance for server-side operations
 */
export function getOptimizelyInstance(): OptimizelyClientInstance {
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

/**
 * Check if a feature flag is enabled for a given user
 * @param userId - User ID to evaluate the flag for
 * @param flagKey - Feature flag key in Optimizely
 * @param attributes - Optional user attributes for targeting
 * @returns Promise<boolean> - Whether the flag is enabled
 */
export async function checkFeatureFlag(
  userId: string,
  flagKey: string,
  attributes?: Record<string, unknown>
): Promise<boolean> {
  try {
    const client = getOptimizelyInstance();
    await client.onReady();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userContext = (client as any).createUserContext(userId, attributes || {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decision = userContext.decide(flagKey);

    return decision.enabled;
  } catch (error) {
    // If there's an error checking the flag, default to false (disabled)
    Sentry.captureException(error, {
      tags: { flagKey },
      extra: { userId, attributes },
    });
    return false;
  }
}
