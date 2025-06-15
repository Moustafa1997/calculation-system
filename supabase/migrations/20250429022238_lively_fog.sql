-- Insert test card
INSERT INTO public.cards (
  date,
  farmer_name,
  gross_weight,
  discount_percentage,
  discount_amount,
  net_weight,
  vehicle_number,
  supplier_name
) VALUES (
  '2025-04-29',
  'Test Farmer',
  1000,
  10,
  100,
  900,
  'ABC123',
  'Test Supplier'
) RETURNING *;

-- Query cards
SELECT * FROM public.cards;

-- Insert test invoice
INSERT INTO public.invoices (
  date,
  farmer_name,
  cards,
  contract_price,
  contract_quantity_per_bag,
  seed_bags,
  seed_bag_price,
  total_contract_quantity,
  contract_amount,
  seed_rights,
  total_amount,
  net_amount,
  final_amount
) VALUES (
  '2025-04-29',
  'Test Farmer',
  '[{"id": 1, "date": "2025-04-29", "farmer_name": "Test Farmer", "gross_weight": 1000, "discount_percentage": 10, "discount_amount": 100, "net_weight": 900, "vehicle_number": "ABC123", "supplier_name": "Test Supplier"}]',
  12.9,
  500,
  2,
  100,
  1000,
  12900,
  200,
  12900,
  12700,
  12700
) RETURNING *;

-- Query invoices
SELECT * FROM public.invoices;