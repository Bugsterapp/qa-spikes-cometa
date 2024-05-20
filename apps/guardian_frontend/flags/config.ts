import type { Configuration } from '@happykit/flags/config';

export type AppFlags = {
  lock_dialog: boolean;
  subscriptions: boolean;
};

export const config: Configuration<AppFlags> = {
  envKey: process.env.NEXT_PUBLIC_FLAGS_ENV_KEY as string,

  // You can provide defaults flag values here
  defaultFlags: {
    lock_dialog: false,
    subscriptions: false,
  },
};
