import { UseMutationResult } from '@tanstack/react-query';

export type MutateResult<TData> = {
  success: boolean;
  error: string | null;
  data?: TData;
};

export function useHandleMutate<TData, T>(
  mutateFunction: UseMutationResult<TData, unknown, T, unknown>['mutateAsync']
) {
  return async (data: T): Promise<MutateResult<TData>> => {
    try {
      await mutateFunction(data);
      return { success: true, error: null };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return { success: false, error: errorMessage };
    }
  };
}
