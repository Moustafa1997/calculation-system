/*
  # Fix RLS policy for soft deletes
  
  1. Changes
    - Drop existing delete policy
    - Create new policy for soft deletes that allows updating deleted_at
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete access for all users" ON cards;

-- Create new policy for soft deletes
CREATE POLICY "Enable soft delete for all users" ON cards
  FOR UPDATE
  USING (true)
  WITH CHECK (
    CASE 
      WHEN NEW.deleted_at IS NOT NULL THEN true  -- Allow setting deleted_at
      WHEN OLD.deleted_at IS NULL THEN true      -- Allow normal updates for non-deleted records
      ELSE false                                 -- Prevent updates to deleted records
    END
  );