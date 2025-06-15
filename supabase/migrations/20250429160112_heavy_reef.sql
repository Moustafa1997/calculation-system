-- Drop existing table
DROP TABLE IF EXISTS public.cards;

-- Recreate cards table with proper constraints
CREATE TABLE public.cards (
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

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Enable read access for all users" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.cards
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.cards
  FOR DELETE USING (true);