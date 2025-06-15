/*
  # Reset card IDs to start from 1
  
  1. Changes
    - Create temporary table to store cards
    - Drop and recreate cards table with fresh sequence
    - Reinsert cards with new sequential IDs
*/

-- Create temporary table
CREATE TEMP TABLE temp_cards AS 
SELECT * FROM cards ORDER BY id;

-- Drop existing table
DROP TABLE cards;

-- Recreate cards table
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

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Enable read access for all users" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON cards
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON cards
  FOR DELETE USING (true);

-- Reinsert data with new sequential IDs
INSERT INTO cards (date, farmer_name, gross_weight, discount_percentage, discount_amount, net_weight, vehicle_number, supplier_name, created_at)
SELECT date, farmer_name, gross_weight, discount_percentage, discount_amount, net_weight, vehicle_number, supplier_name, created_at
FROM temp_cards
ORDER BY id;

-- Drop temporary table
DROP TABLE temp_cards;