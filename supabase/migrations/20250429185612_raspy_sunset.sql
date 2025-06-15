/*
  # Add additional_deductions column to invoices table
  
  1. Changes
    - Add additional_deductions column with default value and check constraint
*/

-- Add additional_deductions column if it doesn't exist
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS additional_deductions numeric DEFAULT 0 CHECK (additional_deductions >= 0);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';