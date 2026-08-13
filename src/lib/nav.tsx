import { createContext, useContext, useState, ReactNode } from 'react';

export type PageId = 'dashboard' | 'keuangan' | 'stok' | 'po' | 'catatan';

interface NavContextValue {
  page: PageId;
  setPage: (page: PageId) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageId>('dashboard');
  return <NavContext.Provider value={{ page, setPage }}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
