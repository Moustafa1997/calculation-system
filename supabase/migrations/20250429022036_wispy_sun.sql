-- Verify tables exist
SELECT table_name, column_names
FROM (
  SELECT 
    t.table_name,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as column_names
  FROM information_schema.tables t
  JOIN information_schema.columns c ON t.table_name = c.table_name
  WHERE t.table_schema = 'public'
  AND t.table_name IN ('cards', 'invoices')
  GROUP BY t.table_name
) subq;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cards', 'invoices');

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('cards', 'invoices')
ORDER BY tablename, policyname;