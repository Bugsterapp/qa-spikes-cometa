import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface RouteContextType {
  previousRoute: string;
  setPreviousRoute: (route: string) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [previousRoute, setPreviousRoute] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setPreviousRoute(router.asPath);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return <RouteContext.Provider value={{ previousRoute, setPreviousRoute }}>{children}</RouteContext.Provider>;
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
};
