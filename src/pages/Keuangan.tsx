import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Pencil, ArrowUpRight, ArrowDownRight, WalletCards, CreditCard, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah, formatDate, todayISO, getPastDate } from '@/lib/format';
import type { Transaction, TransactionType, PaymentMethod, Receivable, Payable } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { ConfirmDialog, EmptyState, Loading, useToast } from '@/components/UI';
import { DonutChart, LineChart } from '@/components/Charts';

const blankTransaction = { type: 'income' as TransactionType, category: '', amount: '', payment_method: 'cash' as PaymentMethod, note: '', transaction_date: todayISO() };

export function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'transaction' | 'receivable' | 'payable' | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(blankTransaction);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { showToast, toastEl } = useToast();

  async function load() {
    setLoading(true);
    const [tx, rec, pay] = await Promise.all([
      supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('receivables').select('*').order('created_at', { ascending: false }),
      supabase.from('payables').select('*').order('created_at', { ascending: false }),
    ]);
    setTransactions((tx.data ?? []) as Transaction[]);
    setReceivables((rec.data ?? []) as Receivable[]);
    setPayables((pay.data ?? []) as Payable[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => transactions.filter((t) => {
    const matchSearch = `${t.category} ${t.note}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const minDate = period === 'today' ? todayISO() : period === 'week' ? getPastDate(7) : period === 'month' ? getPastDate(30) : '';
    return matchSearch && matchType && (!minDate || t.transaction_date >= minDate);
  }), [transactions, search, typeFilter, period]);
  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const palette = ['#d65f87', '#7fa474', '#ddbf88', '#9e3558', '#a9c4a1', '#6b9bd4', '#e0976f', '#b084cc'];
  const expenseGroups = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter((t) => t.type === 'expense' && t.category).forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount)));
    return Array.from(map, ([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
  }, [filtered]);
  const trend = Array.from({ length: 7 }, (_, i) => { const d = getPastDate(6 - i); return { label: d.slice(5), value: transactions.filter((t) => t.transaction_date === d).reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0) }; });

  function openNew() { setEditing(null); setForm(blankTransaction); setModal('transaction'); }
  function openEdit(t: Transaction) { setEditing(t); setForm({ type: t.type, category: t.category ?? '', amount: String(t.amount), payment_method: t.payment_method, note: t.note, transaction_date: t.transaction_date }); setModal('transaction'); }
  async function saveTransaction(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    const result = editing ? await supabase.from('transactions').update(payload).eq('id', editing.id) : await supabase.from('transactions').insert(payload);
    if (result.error) { showToast('Gagal menyimpan transaksi', 'error'); return; }
    setModal(null); showToast(editing ? 'Transaksi diperbarui' : 'Transaksi ditambahkan'); load();
  }
  async function deleteTransaction() { if (!confirmId) return; const result = await supabase.from('transactions').delete().eq('id', confirmId); if (result.error) showToast('Gagal menghapus', 'error'); else { showToast('Transaksi dihapus'); load(); } setConfirmId(null); }

  async function saveDebt(e: React.FormEvent<HTMLFormElement>, table: 'receivables' | 'payables') { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); const result = await supabase.from(table).insert({ ...data, amount: Number(data.amount) }); if (result.error) showToast('Gagal menyimpan', 'error'); else { setModal(null); showToast('Catatan ditambahkan'); load(); } }
  async function toggleDebt(table: 'receivables' | 'payables', id: string, status: string) { await supabase.from(table).update({ status: status === 'belum' ? 'lunas' : 'belum' }).eq('id', id); load(); }

  if (loading) return <div className="p-6"><Loading /></div>;
  return <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">{toastEl}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><h2 className="text-xl sm:text-2xl font-bold text-gray-800">Keuangan</h2><p className="text-sm text-gray-400 mt-0.5">Kelola arus kas dan catatan keuangan</p></div><button className="btn-primary flex items-center justify-center gap-2" onClick={openNew}><Plus size={18} /> Transaksi Baru</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><div className="card"><p className="text-xs text-gray-400">Total Pemasukan</p><p className="text-lg font-bold text-sage-600 mt-1">{formatRupiah(income)}</p></div><div className="card"><p className="text-xs text-gray-400">Total Pengeluaran</p><p className="text-lg font-bold text-florist-600 mt-1">{formatRupiah(expense)}</p></div><div className="card"><p className="text-xs text-gray-400">Laba Bersih</p><p className={`text-lg font-bold mt-1 ${income - expense >= 0 ? 'text-sage-600' : 'text-red-600'}`}>{formatRupiah(income - expense)}</p></div><div className="card"><p className="text-xs text-gray-400">Piutang Belum Lunas</p><p className="text-lg font-bold text-amber-600 mt-1">{formatRupiah(receivables.filter(r => r.status === 'belum').reduce((s,r) => s + Number(r.amount),0))}</p></div></div>
    <div className="grid lg:grid-cols-5 gap-4"><div className="card lg:col-span-3"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><h3 className="font-semibold">Laporan Arus Kas</h3><div className="flex gap-1">{(['all','today','week','month'] as const).map(p => <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 rounded-lg text-xs ${period === p ? 'bg-florist-100 text-florist-700' : 'text-gray-400'}`}>{p === 'all' ? 'Semua' : p === 'today' ? 'Hari ini' : p === 'week' ? '7 hari' : '30 hari'}</button>)}</div></div><LineChart data={trend} /></div><div className="card lg:col-span-2"><h3 className="font-semibold mb-4">Pengeluaran per Kategori</h3><DonutChart data={expenseGroups} /></div></div>
    <div className="card"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h3 className="font-semibold text-gray-800">Riwayat Transaksi</h3><p className="text-xs text-gray-400 mt-1">{filtered.length} transaksi ditampilkan</p></div><div className="flex flex-col sm:flex-row gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={17}/><input className="input pl-9" placeholder="Cari kategori atau catatan..." value={search} onChange={e => setSearch(e.target.value)} /></div><select className="input sm:w-40" value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | TransactionType)}><option value="all">Semua jenis</option><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select><select className="input sm:w-32" value={period} onChange={e => setPeriod(e.target.value as 'all' | 'today' | 'week' | 'month')}><option value="all">Semua waktu</option><option value="today">Hari ini</option><option value="week">7 hari</option><option value="month">30 hari</option></select></div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100"><th className="pb-3">Tanggal</th><th className="pb-3">Jenis / Kategori</th><th className="pb-3">Metode</th><th className="pb-3 text-right">Jumlah</th><th className="pb-3"></th></tr></thead><tbody>{filtered.map(t => <tr key={t.id} className="border-b border-gray-50 last:border-0"><td className="py-3 whitespace-nowrap text-gray-500">{formatDate(t.transaction_date)}</td><td className="py-3"><div className="flex items-center gap-2"><span className={`p-1 rounded-md ${t.type === 'income' ? 'bg-sage-100 text-sage-600' : 'bg-florist-100 text-florist-600'}`}>{t.type === 'income' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}</span><div><p className="font-medium text-gray-700">{t.category}</p><p className="text-xs text-gray-400">{t.note || '-'}</p></div></div></td><td className="py-3 text-gray-500 capitalize">{t.payment_method}</td><td className={`py-3 text-right font-semibold ${t.type === 'income' ? 'text-sage-600' : 'text-florist-600'}`}>{t.type === 'income' ? '+' : '-'}{formatRupiah(Number(t.amount))}</td><td className="py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(t)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={15}/></button><button onClick={() => setConfirmId(t.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState icon={<Receipt size={40}/>} title={transactions.length === 0 ? 'Belum ada transaksi' : 'Transaksi tidak ditemukan'} description={transactions.length === 0 ? 'Tambahkan transaksi pertama Anda' : 'Coba ubah kata kunci atau filter riwayat'}/>}</div></div>
    <div className="grid lg:grid-cols-2 gap-4"><DebtCard title="Piutang Customer" icon={<WalletCards size={18}/>} nameLabel="Nama customer" rows={receivables} nameKey="customer_name" onAdd={() => setModal('receivable')} onToggle={(id,status) => toggleDebt('receivables',id,status)}/><DebtCard title="Utang Supplier" icon={<CreditCard size={18}/>} nameLabel="Nama supplier" rows={payables} nameKey="supplier_name" onAdd={() => setModal('payable')} onToggle={(id,status) => toggleDebt('payables',id,status)}/></div>
    <Modal open={modal === 'transaction'} onClose={() => setModal(null)} title={editing ? 'Edit Transaksi' : 'Transaksi Baru'}><form onSubmit={saveTransaction} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="label">Jenis</label><select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value as TransactionType})}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></div><div><label className="label">Tanggal</label><input className="input" type="date" value={form.transaction_date} onChange={e => setForm({...form, transaction_date: e.target.value})}/></div></div><div><label className="label">Kategori</label><input className="input" placeholder="Isi kategori sendiri..." value={form.category} onChange={e => setForm({...form, category: e.target.value})}/></div><div><label className="label">Jumlah (Rp)</label><input className="input" type="number" min="0" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/></div><div><label className="label">Metode Pembayaran</label><select className="input" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value as PaymentMethod})}><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select></div><div><label className="label">Catatan</label><textarea className="input" rows={2} value={form.note} onChange={e => setForm({...form, note: e.target.value})}/></div><button className="btn-primary w-full">Simpan Transaksi</button></form></Modal>
    <DebtModal open={modal === 'receivable'} onClose={() => setModal(null)} title="Tambah Piutang" nameLabel="Nama customer" table="receivables" onSave={saveDebt}/><DebtModal open={modal === 'payable'} onClose={() => setModal(null)} title="Tambah Utang" nameLabel="Nama supplier" table="payables" onSave={saveDebt}/><ConfirmDialog open={Boolean(confirmId)} title="Hapus transaksi?" message="Data transaksi ini akan dihapus permanen." onCancel={() => setConfirmId(null)} onConfirm={deleteTransaction}/>
  </div>;
}
function DebtCard({ title, icon, rows, nameKey, onAdd, onToggle }: { title: string; icon: React.ReactNode; rows: (Receivable | Payable)[]; nameKey: 'customer_name' | 'supplier_name'; onAdd: () => void; onToggle: (id: string, status: string) => void }) { return <div className="card"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2 text-gray-700">{icon}<h3 className="font-semibold">{title}</h3></div><button onClick={onAdd} className="p-1.5 rounded-lg bg-florist-50 text-florist-600"><Plus size={16}/></button></div>{rows.length === 0 ? <p className="py-4 text-sm text-gray-400 text-center">Belum ada catatan</p> : <div className="space-y-2">{rows.slice(0,4).map(r => <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><div><p className="text-sm font-medium text-gray-700">{r[nameKey]}</p><p className="text-xs text-gray-400">{formatRupiah(Number(r.amount))}</p></div><button onClick={() => onToggle(r.id, r.status)} className={`badge ${r.status === 'lunas' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'}`}>{r.status === 'lunas' ? 'Lunas' : 'Belum lunas'}</button></div>)}</div>}</div> }
function DebtModal({ open, onClose, title, nameLabel, table, onSave }: { open: boolean; onClose: () => void; title: string; nameLabel: string; table: 'receivables' | 'payables'; onSave: (e: React.FormEvent<HTMLFormElement>, table: 'receivables' | 'payables') => void }) { return <Modal open={open} onClose={onClose} title={title}><form onSubmit={e => onSave(e, table)} className="space-y-4"><div><label className="label">{nameLabel}</label><input className="input" name={table === 'receivables' ? 'customer_name' : 'supplier_name'} required/></div><div><label className="label">Jumlah (Rp)</label><input className="input" name="amount" type="number" min="0" required/></div><div><label className="label">Jatuh tempo</label><input className="input" name="due_date" type="date"/></div><div><label className="label">Catatan</label><textarea className="input" name="note" rows={2}/></div><button className="btn-primary w-full">Simpan</button></form></Modal> }
