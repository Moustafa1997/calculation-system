/*
  # Add done status to cards
  
  1. Changes
    - Add is_done column to cards table with default false
    - Update existing cards to have is_done = false
*/

-- Add is_done column to cards table
ALTER TABLE cards 
ADD COLUMN is_done boolean DEFAULT false;

-- Update existing cards to have is_done = false
UPDATE cards SET is_done = false WHERE is_done IS NULL;
