import React, { createContext } from 'react';
import { api } from '~/utils/api';
import { FeatureToggle } from '@cometa/trpc';
import { useSession } from 'next-auth/react';
interface FeatureContextState {
  features: FeatureToggle[];
  loading: boolean;
}

const initialState = {
  features: [],
  loading: false,
};

const FeaturesContext = createContext<FeatureContextState>({
  ...initialState,
});

export const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { data: features = [], isLoading: loading } = api.guardian.featuresToggle.useQuery(undefined, {
    enabled: !!session,
  });

  return (
    <FeaturesContext.Provider
      value={{
        features,
        loading,
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
};

export default FeaturesContext;
