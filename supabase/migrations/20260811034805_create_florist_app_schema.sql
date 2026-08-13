/*
# Florist Shop Management - Database Schema

Single-tenant app (no auth, one owner). All tables use anon+authenticated policies.

## Tables
1. transactions - income/expense records
2. inventory_items - artificial flower master items
3. stock_movements - stock in/out mutations
4. stock_opnames - physical count records
5. purchase_orders - fresh flower PO tracking
6. receivables - customer debt (DP)
7. payables - supplier debt
8. activities - to-do list / activity log

## Security
RLS enabled on all tables. anon+authenticated CRUD since single-tenant no-auth.
*/

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'qris')),
  note text DEFAULT '',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_transactions_select" ON transactions;
CREATE POLICY "anon_crud_transactions_select" ON transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_transactions_insert" ON transactions;
CREATE POLICY "anon_crud_transactions_insert" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_transactions_update" ON transactions;
CREATE POLICY "anon_crud_transactions_update" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_transactions_delete" ON transactions;
CREATE POLICY "anon_crud_transactions_delete" ON transactions FOR DELETE TO anon, authenticated USING (true);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'bunga artificial',
  unit text NOT NULL DEFAULT 'pcs',
  purchase_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  stock_current numeric NOT NULL DEFAULT 0,
  stock_min numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_inventory_select" ON inventory_items;
CREATE POLICY "anon_crud_inventory_select" ON inventory_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_inventory_insert" ON inventory_items;
CREATE POLICY "anon_crud_inventory_insert" ON inventory_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_inventory_update" ON inventory_items;
CREATE POLICY "anon_crud_inventory_update" ON inventory_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_inventory_delete" ON inventory_items;
CREATE POLICY "anon_crud_inventory_delete" ON inventory_items FOR DELETE TO anon, authenticated USING (true);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity numeric NOT NULL DEFAULT 0,
  purchase_price numeric DEFAULT 0,
  note text DEFAULT '',
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_stock_movements_select" ON stock_movements;
CREATE POLICY "anon_crud_stock_movements_select" ON stock_movements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_stock_movements_insert" ON stock_movements;
CREATE POLICY "anon_crud_stock_movements_insert" ON stock_movements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_stock_movements_update" ON stock_movements;
CREATE POLICY "anon_crud_stock_movements_update" ON stock_movements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_stock_movements_delete" ON stock_movements;
CREATE POLICY "anon_crud_stock_movements_delete" ON stock_movements FOR DELETE TO anon, authenticated USING (true);

-- Stock Opnames (physical count)
CREATE TABLE IF NOT EXISTS stock_opnames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  system_stock numeric NOT NULL DEFAULT 0,
  physical_stock numeric NOT NULL DEFAULT 0,
  difference numeric NOT NULL DEFAULT 0,
  reason text DEFAULT '',
  opname_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_opnames ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_stock_opnames_select" ON stock_opnames;
CREATE POLICY "anon_crud_stock_opnames_select" ON stock_opnames FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_stock_opnames_insert" ON stock_opnames;
CREATE POLICY "anon_crud_stock_opnames_insert" ON stock_opnames FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_stock_opnames_delete" ON stock_opnames;
CREATE POLICY "anon_crud_stock_opnames_delete" ON stock_opnames FOR DELETE TO anon, authenticated USING (true);

-- Purchase Orders (fresh flowers)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text NOT NULL DEFAULT '',
  supplier_name text NOT NULL,
  flower_type text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  needed_date date,
  status text NOT NULL DEFAULT 'Dipesan' CHECK (status IN ('Dipesan', 'Diterima', 'Digunakan')),
  customer_name text DEFAULT '',
  customer_order_ref text DEFAULT '',
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_pos_select" ON purchase_orders;
CREATE POLICY "anon_crud_pos_select" ON purchase_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_pos_insert" ON purchase_orders;
CREATE POLICY "anon_crud_pos_insert" ON purchase_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pos_update" ON purchase_orders;
CREATE POLICY "anon_crud_pos_update" ON purchase_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pos_delete" ON purchase_orders;
CREATE POLICY "anon_crud_pos_delete" ON purchase_orders FOR DELETE TO anon, authenticated USING (true);

-- Receivables (piutang customer)
CREATE TABLE IF NOT EXISTS receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'belum')),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_receivables_select" ON receivables;
CREATE POLICY "anon_crud_receivables_select" ON receivables FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_receivables_insert" ON receivables;
CREATE POLICY "anon_crud_receivables_insert" ON receivables FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_receivables_update" ON receivables;
CREATE POLICY "anon_crud_receivables_update" ON receivables FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_receivables_delete" ON receivables;
CREATE POLICY "anon_crud_receivables_delete" ON receivables FOR DELETE TO anon, authenticated USING (true);

-- Payables (utang supplier)
CREATE TABLE IF NOT EXISTS payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'belum')),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_payables_select" ON payables;
CREATE POLICY "anon_crud_payables_select" ON payables FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_payables_insert" ON payables;
CREATE POLICY "anon_crud_payables_insert" ON payables FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_payables_update" ON payables;
CREATE POLICY "anon_crud_payables_update" ON payables FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_payables_delete" ON payables;
CREATE POLICY "anon_crud_payables_delete" ON payables FOR DELETE TO anon, authenticated USING (true);

-- Activities (catatan aktivitas)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Rencana' CHECK (status IN ('Rencana', 'Selesai')),
  completed_date date,
  linked_type text DEFAULT '' CHECK (linked_type IN ('', 'transaction', 'po')),
  linked_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_activities_select" ON activities;
CREATE POLICY "anon_crud_activities_select" ON activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_activities_insert" ON activities;
CREATE POLICY "anon_crud_activities_insert" ON activities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_activities_update" ON activities;
CREATE POLICY "anon_crud_activities_update" ON activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_activities_delete" ON activities;
CREATE POLICY "anon_crud_activities_delete" ON activities FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_pos_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_pos_supplier ON purchase_orders(supplier_name);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date);
