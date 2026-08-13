export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'transfer' | 'qris';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  payment_method: PaymentMethod;
  note: string;
  transaction_date: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock_current: number;
  stock_min: number;
  created_at: string;
}

export type MovementType = 'in' | 'out';

export interface StockMovement {
  id: string;
  item_id: string;
  movement_type: MovementType;
  quantity: number;
  purchase_price: number;
  note: string;
  movement_date: string;
  created_at: string;
}

export interface StockOpname {
  id: string;
  item_id: string;
  system_stock: number;
  physical_stock: number;
  difference: number;
  reason: string;
  opname_date: string;
  created_at: string;
}

export type POStatus = 'Dipesan' | 'Diterima' | 'Digunakan';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  flower_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_date: string;
  needed_date: string | null;
  status: POStatus;
  customer_name: string;
  customer_order_ref: string;
  note: string;
  created_at: string;
}

export type DebtStatus = 'lunas' | 'belum';

export interface Receivable {
  id: string;
  customer_name: string;
  amount: number;
  due_date: string | null;
  status: DebtStatus;
  note: string;
  created_at: string;
}

export interface Payable {
  id: string;
  supplier_name: string;
  amount: number;
  due_date: string | null;
  status: DebtStatus;
  note: string;
  created_at: string;
}

export type ActivityStatus = 'Rencana' | 'Selesai';

export interface Activity {
  id: string;
  title: string;
  content: string;
  activity_date: string;
  status: ActivityStatus;
  completed_date: string | null;
  linked_type: string;
  linked_id: string;
  created_at: string;
}
