import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LocationState {
  pathname: string;
  search: string;
  hash: string;
}

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  location: LocationState;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const useRouter = (): RouterContextType => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a SimpleRouter');
  }
  return ctx;
};

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = (): LocationState => {
  const { location } = useRouter();
  return location;
};

export const SimpleRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const cleanPath = to.split('?')[0] || '/';
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setCurrentPath(cleanPath);
  }, []);

  const location: LocationState = {
    pathname: currentPath,
    search: window.location.search || '',
    hash: window.location.hash || '',
  };

  return (
    <RouterContext.Provider value={{ path: currentPath, navigate, location }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace = false }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
};
