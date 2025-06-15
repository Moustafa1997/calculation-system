/*
  # Initial database schema

  1. New Tables
    - `cards`
      - `id` (bigint, primary key)
      - `date` (text, not null)
      - `farmer_name` (text, not null) 
      - `gross_weight` (numeric, not null)
      - `discount_percentage` (numeric, not null)
      - `discount_amount` (numeric, not null)
      - `net_weight` (numeric, not null)
      - `vehicle_number` (text, not null)
      - `supplier_name` (text)
      - `created_at` (timestamptz, default now())

    - `invoices`
      - `id` (bigint, primary key)
      - `date` (text, not null)
      - `farmer_name` (text, not null)
      - `contract_price` (numeric, not null)
      - `free_price` (numeric)
      - `contract_quantity_per_bag` (numeric, not null)
      - `seed_bags` (numeric, not null)
      - `seed_bag_price` (numeric, not null)
      - `additional_seed_kilos` (numeric)
      - `total_contract_quantity` (numeric, not null)
      - `free_quantity` (numeric)
      - `contract_amount` (numeric, not null)
      - `free_amount` (numeric)
      - `seed_rights` (numeric, not null)
      - `total_amount` (numeric, not null)
      - `net_amount` (numeric, not null)
      - `additional_deductions` (numeric)
      - `final_amount` (numeric, not null)
      - `is_paid` (boolean, default false)
      - `remaining_amount` (numeric)
      - `created_at` (timestamptz, default now())

    - `invoice_cards`
      - `invoice_id` (bigint, references invoices)
      - `card_id` (bigint, references cards)
      - Primary key (invoice_id, card_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create cards table
CREATE TABLE cards (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL,
  farmer_name text NOT NULL,
  gross_weight numeric NOT NULL,
  discount_percentage numeric NOT NULL,
  discount_amount numeric NOT NULL,
  net_weight numeric NOT NULL,
  vehicle_number text NOT NULL,
  supplier_name text,
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE invoices (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL,
  farmer_name text NOT NULL,
  contract_price numeric NOT NULL,
  free_price numeric,
  contract_quantity_per_bag numeric NOT NULL,
  seed_bags numeric NOT NULL,
  seed_bag_price numeric NOT NULL,
  additional_seed_kilos numeric,
  total_contract_quantity numeric NOT NULL,
  free_quantity numeric,
  contract_amount numeric NOT NULL,
  free_amount numeric,
  seed_rights numeric NOT NULL,
  total_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  additional_deductions numeric,
  final_amount numeric NOT NULL,
  is_paid boolean DEFAULT false,
  remaining_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_cards junction table
CREATE TABLE invoice_cards (
  invoice_id bigint REFERENCES invoices ON DELETE CASCADE,
  card_id bigint REFERENCES cards ON DELETE CASCADE,
  PRIMARY KEY (invoice_id, card_id)
);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON cards
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON cards
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON invoices
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON invoices
  FOR DELETE USING (true);

CREATE POLICY "Enable all access for all users" ON invoice_cards
  FOR ALL USING (true);