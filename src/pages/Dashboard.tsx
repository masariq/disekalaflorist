import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Package, Flower, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah, formatDateShort, todayISO, getPastDate } from '@/lib/format';
import type { Transaction, InventoryItem, PurchaseOrder } from '@/lib/types';
import { BarChart } from '@/components/Charts';
import { Loading } from '@/components/UI';
import { useNav } from '@/lib/nav';

interface DayData {
  label: string;
  income: number;
  expense: number;
}

export function DashboardPage() {
  const { setPage } = useNav();
  const [loading, setLoading] = useState(true);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [chartData, setChartData] = useState<DayData[]>([]);

  useEffect(() => {
    async function load() {
      const today = todayISO();

      const [incomeRes, expenseRes, allTxRes, itemsRes, poRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .eq('transaction_date', today),
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'expense')
          .eq('transaction_date', today),
        supabase.from('transactions').select('type, amount, transaction_date'),
        supabase.from('inventory_items').select('*'),
        supabase.from('purchase_orders').select('*').eq('status', 'Dipesan'),
      ]);

      const income = (incomeRes.data ?? []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
      const expense = (expenseRes.data ?? []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
      setTodayIncome(income);
      setTodayExpense(expense);

      const allTx = (allTxRes.data ?? []) as Pick<Transaction, 'type' | 'amount' | 'transaction_date'>[];
      const balance = allTx.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
      setTotalBalance(balance);

      const items = (itemsRes.data ?? []) as InventoryItem[];
      setLowStockItems(items.filter((i) => i.stock_current <= i.stock_min && i.stock_min > 0));

      setPendingPOs((poRes.data ?? []) as PurchaseOrder[]);

      const days: DayData[] = [];
      for (let i = 6; i >= 0; i--) {
        const dateStr = getPastDate(i);
        const d = new Date(dateStr);
        const dayIncome = allTx
          .filter((t) => t.type === 'income' && t.transaction_date === dateStr)
          .reduce((s, t) => s + Number(t.amount), 0);
        const dayExpense = allTx
          .filter((t) => t.type === 'expense' && t.transaction_date === dateStr)
          .reduce((s, t) => s + Number(t.amount), 0);
        days.push({
          label: formatDateShort(d),
          income: dayIncome,
          expense: dayExpense,
        });
      }
      setChartData(days);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-4 sm:p-6"><Loading /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Selamat Datang</h2>
        <p className="text-sm text-gray-400 mt-0.5">Ringkasan bisnis toko bunga Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card bg-gradient-to-br from-sage-50 to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-100">
              <TrendingUp className="text-sage-600" size={18} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Pemasukan Hari Ini</p>
          <p className="text-base sm:text-lg font-bold text-sage-700 mt-0.5">{formatRupiah(todayIncome)}</p>
        </div>

        <div className="card bg-gradient-to-br from-florist-50 to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-florist-100">
              <TrendingDown className="text-florist-600" size={18} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Pengeluaran Hari Ini</p>
          <p className="text-base sm:text-lg font-bold text-florist-700 mt-0.5">{formatRupiah(todayExpense)}</p>
        </div>

        <div className="card bg-gradient-to-br from-cream-50 to-white col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-200">
              <Wallet className="text-cream-500" size={18} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Saldo / Kas Saat Ini</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 mt-0.5">{formatRupiah(totalBalance)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Pemasukan vs Pengeluaran (7 Hari)</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sage-400" />
              <span className="text-xs text-gray-500">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-florist-400" />
              <span className="text-xs text-gray-500">Pengeluaran</span>
            </div>
          </div>
          <BarChart data={chartData} />
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={18} />
                <h3 className="font-semibold text-gray-800">Stok Menipis</h3>
              </div>
              <button onClick={() => setPage('stok')} className="text-xs text-florist-500 font-medium flex items-center gap-1">
                Lihat <ArrowRight size={12} />
              </button>
            </div>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Semua stok aman</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Package className="text-amber-600" size={16} />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-amber-700">
                      {item.stock_current} {item.unit} / min {item.stock_min}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flower className="text-florist-500" size={18} />
                <h3 className="font-semibold text-gray-800">PO Belum Diterima</h3>
              </div>
              <button onClick={() => setPage('po')} className="text-xs text-florist-500 font-medium flex items-center gap-1">
                Lihat <ArrowRight size={12} />
              </button>
            </div>
            {pendingPOs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Tidak ada PO tertunda</p>
            ) : (
              <div className="space-y-2">
                {pendingPOs.slice(0, 5).map((po) => (
                  <div key={po.id} className="flex items-center justify-between rounded-lg bg-florist-50 px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-700">{po.supplier_name}</p>
                      <p className="text-xs text-gray-400">{po.flower_type} - {po.quantity} pcs</p>
                    </div>
                    <span className="badge bg-florist-100 text-florist-700">{po.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
