import { ReactNode } from 'react';
import { LayoutDashboard, Wallet, Package, Flower, CheckSquare } from 'lucide-react';
import { NavProvider, useNav, PageId } from '@/lib/nav';

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'keuangan', label: 'Keuangan', icon: Wallet },
  { id: 'stok', label: 'Stok Opname', icon: Package },
  { id: 'po', label: 'PO Bunga Fresh', icon: Flower },
  { id: 'catatan', label: 'Catatan', icon: CheckSquare },
];

function Sidebar() {
  const { page, setPage } = useNav();
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-cream-200 bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-cream-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-florist-100">
          <Flower className="text-florist-500" size={22} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 leading-tight">Disekala</h1>
          <p className="text-xs text-gray-400">Florist Manager</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-florist-500 text-white shadow-soft'
                  : 'text-gray-500 hover:bg-florist-50 hover:text-florist-600'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function BottomNav() {
  const { page, setPage } = useNav();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-cream-200 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`nav-item flex-1 rounded-lg py-1.5 ${
                active ? 'text-florist-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader() {
  const { page } = useNav();
  const current = navItems.find((n) => n.id === page);
  return (
    <header className="lg:hidden flex items-center gap-3 px-4 py-4 border-b border-cream-200 bg-white/60 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-florist-100">
        <Flower className="text-florist-500" size={18} />
      </div>
      <h1 className="font-bold text-gray-800">{current?.label ?? 'Dashboard'}</h1>
    </header>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <NavProvider>
      <Layout>{children}</Layout>
    </NavProvider>
  );
}
