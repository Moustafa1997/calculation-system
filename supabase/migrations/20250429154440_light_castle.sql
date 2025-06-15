/*
  # Revert soft delete functionality
  
  1. Changes
    - Drop soft delete related policies
    - Remove deleted_at column
    - Restore original policies
*/

-- Drop soft delete related policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
DROP POLICY IF EXISTS "Enable soft delete for all users" ON cards;

-- Remove deleted_at column
ALTER TABLE cards 
DROP COLUMN IF EXISTS deleted_at;

-- Restore original policies
CREATE POLICY "Enable read access for all users" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Enable delete access for all users" ON cards
  FOR DELETE USING (true);