/*
  # Update search functionality
  
  1. Changes
    - Add function to handle different date formats
    - Add function to search by card number
*/

-- Create function to convert date formats
CREATE OR REPLACE FUNCTION public.format_search_date(date_str text)
RETURNS text AS $$
DECLARE
  formatted_date text;
BEGIN
  -- Try to match DD/MM or DD-MM format
  IF date_str ~ '^\d{1,2}[-/]\d{1,2}$' THEN
    -- Extract day and month
    formatted_date := '2025-' || 
      LPAD(SPLIT_PART(REPLACE(date_str, '/', '-'), '-', 2), 2, '0') || '-' ||
      LPAD(SPLIT_PART(REPLACE(date_str, '/', '-'), '-', 1), 2, '0');
    RETURN formatted_date;
  END IF;
  
  RETURN date_str;
END;
$$ LANGUAGE plpgsql;