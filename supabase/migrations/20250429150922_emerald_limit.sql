-- Create temporary table
CREATE TEMP TABLE temp_invoices AS 
SELECT * FROM invoices ORDER BY id;

-- Drop existing table
DROP TABLE invoices;

-- Recreate invoices table
CREATE TABLE invoices (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL,
  farmer_name text NOT NULL,
  cards jsonb NOT NULL,
  contract_price numeric NOT NULL,
  free_price numeric,
  contract_quantity_per_bag numeric NOT NULL,
  seed_bags numeric NOT NULL,
  seed_bag_price numeric NOT NULL,
  additional_seed_kilos numeric DEFAULT 0,
  total_contract_quantity numeric NOT NULL,
  free_quantity numeric,
  contract_amount numeric NOT NULL,
  free_amount numeric DEFAULT 0,
  seed_rights numeric NOT NULL,
  total_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  additional_deductions numeric DEFAULT 0,
  final_amount numeric NOT NULL,
  is_paid boolean DEFAULT false,
  remaining_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Enable read access for all users" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON invoices
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON invoices
  FOR DELETE USING (true);

-- Reinsert data with new sequential IDs
INSERT INTO invoices (
  date, farmer_name, cards, contract_price, free_price, 
  contract_quantity_per_bag, seed_bags, seed_bag_price, 
  additional_seed_kilos, total_contract_quantity, free_quantity,
  contract_amount, free_amount, seed_rights, total_amount,
  net_amount, additional_deductions, final_amount, is_paid,
  remaining_amount, created_at
)
SELECT 
  date, farmer_name, cards, contract_price, free_price,
  contract_quantity_per_bag, seed_bags, seed_bag_price,
  additional_seed_kilos, total_contract_quantity, free_quantity,
  contract_amount, free_amount, seed_rights, total_amount,
  net_amount, additional_deductions, final_amount, is_paid,
  remaining_amount, created_at
FROM temp_invoices
ORDER BY id;

-- Drop temporary table
DROP TABLE temp_invoices;