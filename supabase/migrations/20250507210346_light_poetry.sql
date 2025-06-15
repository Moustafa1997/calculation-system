/*
  # Update supplier card numbers for existing data
  
  1. Changes
    - Create supplier_counters table if not exists
    - Add supplier_card_number column to cards if not exists
    - Update existing cards with supplier-specific numbering
*/

-- Create supplier_counters table if not exists
CREATE TABLE IF NOT EXISTS supplier_counters (
  supplier_name text PRIMARY KEY,
  card_count bigint DEFAULT 1
);

-- Add supplier_card_number column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cards' 
    AND column_name = 'supplier_card_number'
  ) THEN
    ALTER TABLE cards ADD COLUMN supplier_card_number bigint;
  END IF;
END $$;

-- Enable RLS on supplier_counters
ALTER TABLE supplier_counters ENABLE ROW LEVEL SECURITY;

-- Create policies for supplier_counters
CREATE POLICY "Enable read access for all users" ON supplier_counters
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON supplier_counters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON supplier_counters
  FOR UPDATE USING (true);

-- Update existing cards with supplier-specific numbering
WITH numbered_cards AS (
  SELECT 
    id,
    supplier_name,
    ROW_NUMBER() OVER (PARTITION BY supplier_name ORDER BY id) as supplier_number
  FROM cards
  WHERE supplier_name IS NOT NULL
)
UPDATE cards c
SET supplier_card_number = nc.supplier_number
FROM numbered_cards nc
WHERE c.id = nc.id;

-- Update supplier_counters with current counts
INSERT INTO supplier_counters (supplier_name, card_count)
SELECT 
  supplier_name,
  COUNT(*) as card_count
FROM cards
WHERE supplier_name IS NOT NULL
GROUP BY supplier_name
ON CONFLICT (supplier_name) 
DO UPDATE SET card_count = EXCLUDED.card_count;