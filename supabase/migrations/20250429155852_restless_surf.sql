/*
  # Fix database schema for cards and invoices
  
  1. Changes
    - Drop existing tables
    - Recreate tables with proper constraints
    - Enable RLS and create policies
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.invoices;
DROP TABLE IF EXISTS public.cards;

-- Create cards table
CREATE TABLE public.cards (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date text NOT NULL,
  farmer_name text NOT NULL,
  gross_weight numeric NOT NULL CHECK (gross_weight > 0),
  discount_percentage numeric NOT NULL CHECK (discount_percentage >= 0),
  discount_amount numeric NOT NULL CHECK (discount_amount >= 0),
  net_weight numeric NOT NULL CHECK (net_weight > 0),
  vehicle_number text NOT NULL,
  supplier_name text,
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
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