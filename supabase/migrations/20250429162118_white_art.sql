/*
  # Reset IDs for cards and invoices tables
  
  1. Changes
    - Create temporary tables to store existing data
    - Drop and recreate tables with fresh sequences
    - Reinsert data with new sequential IDs
*/

-- Create temporary tables
CREATE TEMP TABLE temp_cards AS 
SELECT * FROM cards ORDER BY id;

CREATE TEMP TABLE temp_invoices AS 
SELECT * FROM invoices ORDER BY id;

-- Drop existing tables
DROP TABLE cards;
DROP TABLE invoices;

-- Recreate cards table
CREATE TABLE cards (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL CHECK (date ~ '^\d{4}-\d{2}-\d{2}$'),
  farmer_name text NOT NULL CHECK (length(farmer_name) > 0),
  gross_weight numeric NOT NULL CHECK (gross_weight > 0),
  discount_percentage numeric NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount numeric NOT NULL CHECK (discount_amount >= 0),
  net_weight numeric NOT NULL CHECK (net_weight > 0),
  vehicle_number text NOT NULL CHECK (length(vehicle_number) > 0),
  supplier_name text,
  created_at timestamptz DEFAULT now()
);

-- Recreate invoices table
CREATE TABLE invoices (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL,
  farmer_name text NOT NULL,
  cards jsonb NOT NULL,
  contract_price numeric NOT NULL CHECK (contract_price > 0),
  free_price numeric CHECK (free_price IS NULL OR free_price >= 0),
  contract_quantity_per_bag numeric NOT NULL CHECK (contract_quantity_per_bag > 0),
  seed_bags numeric NOT NULL CHECK (seed_bags >= 0),
  seed_bag_price numeric NOT NULL CHECK (seed_bag_price >= 0),
  additional_seed_kilos numeric DEFAULT 0 CHECK (additional_seed_kilos >= 0),
  total_contract_quantity numeric NOT NULL CHECK (total_contract_quantity >= 0),
  free_quantity numeric CHECK (free_quantity IS NULL OR free_quantity >= 0),
  contract_amount numeric NOT NULL CHECK (contract_amount >= 0),
  free_amount numeric DEFAULT 0 CHECK (free_amount >= 0),
  seed_rights numeric NOT NULL CHECK (seed_rights >= 0),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  net_amount numeric NOT NULL CHECK (net_amount >= 0),
  additional_deductions numeric DEFAULT 0 CHECK (additional_deductions >= 0),
  final_amount numeric NOT NULL CHECK (final_amount >= 0),
  is_paid boolean DEFAULT false,
  remaining_amount numeric CHECK (remaining_amount IS NULL OR remaining_amount >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Recreate policies for cards
CREATE POLICY "Enable read access for all users" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON cards
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON cards
  FOR DELETE USING (true);

-- Recreate policies for invoices
CREATE POLICY "Enable read access for all users" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON invoices
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON invoices
  FOR DELETE USING (true);

-- Reinsert data with new sequential IDs
INSERT INTO cards (
  date, farmer_name, gross_weight, discount_percentage,
  discount_amount, net_weight, vehicle_number, supplier_name,
  created_at
)
SELECT 
  date, farmer_name, gross_weight, discount_percentage,
  discount_amount, net_weight, vehicle_number, supplier_name,
  created_at
FROM temp_cards
ORDER BY id;

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

-- Drop temporary tables
DROP TABLE temp_cards;
DROP TABLE temp_invoices;