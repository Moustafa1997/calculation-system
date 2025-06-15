/*
  # Add additional_deductions column to invoices table
  
  1. Changes
    - Add additional_deductions column with default value and check constraint
*/

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS additional_deductions numeric DEFAULT 0 CHECK (additional_deductions >= 0);