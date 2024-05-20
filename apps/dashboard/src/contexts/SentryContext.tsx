import React, { createContext, useContext, useState } from 'react';
import * as Sentry from '@sentry/react';

const SentryContext = createContext({});

export const useSentryContext = () => useContext(SentryContext);

interface SentryProviderProps {
  children: React.ReactNode;
}

export const SentryProvider = ({ children }: SentryProviderProps) => {
  const [transaction, setTransaction] = useState<Sentry.Transaction | null>(null);

  const startTransaction = (transactionName: string, context: Record<string, any> = {}) => {
    const transaction = Sentry.startTransaction({ name: transactionName, ...context });
    setTransaction(transaction);
  };
  const finishTransaction = () => {
    if (transaction) {
      transaction.finish();
      setTransaction(null);
    }
  };

  return <SentryContext.Provider value={{ startTransaction, finishTransaction }}>{children}</SentryContext.Provider>;
};
