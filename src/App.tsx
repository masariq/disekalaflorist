import { AppLayout } from '@/components/Layout';
import { useNav } from '@/lib/nav';
import { DashboardPage } from '@/pages/Dashboard';
import { KeuanganPage } from '@/pages/Keuangan';
import { StokPage } from '@/pages/Stok';
import { POPage } from '@/pages/PO';
import { CatatanPage } from '@/pages/Catatan';

function AppContent() {
  const { page } = useNav();
  const pages = {
    dashboard: <DashboardPage />,
    keuangan: <KeuanganPage />,
    stok: <StokPage />,
    po: <POPage />,
    catatan: <CatatanPage />,
  };
  return pages[page];
}

function App() {
  return (
    <AppLayout>
      <AppContent />
    </AppLayout>
  );
}

export default App;
