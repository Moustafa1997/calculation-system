/**
 * Format a number as currency with proper Arabic formatting
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export const formatCurrency = (value: number | string, decimals = 0): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return num.toLocaleString('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  });
};

/**
 * Format a date to dd/mm/yyyy format
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Parse a formatted number string back to a number
 * @param value - Formatted number string
 * @returns Number
 */
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove thousand separators and any non-numeric chars except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
};

/**
 * Format a price with 3 decimal places
 * @param value - The price to format
 * @returns Formatted price string
 */
export const formatPrice = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return num.toFixed(3);
};