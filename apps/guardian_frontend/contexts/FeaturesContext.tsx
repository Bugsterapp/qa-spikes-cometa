import React, { createContext, useState } from 'react';
import ApiClient from '~/services/ApiClient';
import * as Sentry from '@sentry/nextjs';
interface FeatureContextState {
  features: { name: string }[];
  loading: boolean;
  getFeatures: (token?: string) => void;
}

const initialState = {
  features: [],
  loading: false,
};

const FeaturesContext = createContext<FeatureContextState>({
  ...initialState,
  getFeatures: () => void 0,
});

export const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
  const [features, setFeatures] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const getFeatures = async (token?: string) => {
    try {
      setLoading(true);
      const res = await ApiClient.getFeatures(token);
      setLoading(false);
      const features = res.data;
      setFeatures(features);
    } catch (err) {
      Sentry.captureException(err);
      setFeatures([]);
      setLoading(false);
    }
  };

  return (
    <FeaturesContext.Provider
      value={{
        features,
        getFeatures,
        loading,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
};

export default FeaturesContext;
