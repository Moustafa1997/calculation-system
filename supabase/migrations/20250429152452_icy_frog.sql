/*
  # Add soft delete functionality
  
  1. Changes
    - Add deleted_at column to cards table
    - Update policies to exclude soft deleted records
*/

-- Add deleted_at column to cards table
ALTER TABLE cards 
ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Update select policy to exclude soft deleted records
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
CREATE POLICY "Enable read access for all users" ON cards
  FOR SELECT USING (deleted_at IS NULL);

-- Update delete policy to perform soft deletes
DROP POLICY IF EXISTS "Enable delete access for all users" ON cards;
CREATE POLICY "Enable delete access for all users" ON cards
  FOR UPDATE USING (true)
  WITH CHECK (true);