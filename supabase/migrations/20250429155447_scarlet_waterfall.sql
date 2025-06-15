/*
  # Initial Schema Setup
  
  1. Tables
    - cards: Store card entries
    - invoices: Store invoice data with embedded cards
  
  2. Security
    - Enable RLS on all tables
    - Create policies for basic CRUD operations
*/

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
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

-- Create invoices table with embedded cards
CREATE TABLE IF NOT EXISTS public.invoices (
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
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for cards
CREATE POLICY "Enable read access for all users" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.cards
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.cards
  FOR DELETE USING (true);

-- Create policies for invoices
CREATE POLICY "Enable read access for all users" ON public.invoices
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.invoices
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.invoices
  FOR DELETE USING (true);