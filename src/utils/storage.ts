import { supabase } from './db';
import { Card, Invoice } from '../types';

// Comprehensive Arabic text normalization function for maximum search flexibility
const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  
  return text
    // Convert to lowercase first
    .toLowerCase()
    // Normalize different forms of Alif
    .replace(/[أإآا]/g, 'ا')
    // Convert Ta Marbuta to Ha for matching (بصارة = بصاره)
    .replace(/ة/g, 'ه')
    // Handle ya variations
    .replace(/[يى]/g, 'ي')
    // Handle common letter combination variations
    .replace(/ام/g, 'م')           // الغامري = الغمري
    .replace(/اه/g, 'ه')           // بصاره = بصره
    .replace(/او/g, 'و')           // فاروق = فروق  
    .replace(/اي/g, 'ي')           // خايل = خيل
    .replace(/ال/g, 'ل')           // سالم = سلم
    .replace(/اب/g, 'ب')           // عابد = عبد
    .replace(/اد/g, 'د')           // عادل = عدل
    .replace(/اس/g, 'س')           // عباس = عبس، ناصر = نصر
    .replace(/ات/g, 'ت')           // فاتح = فتح
    .replace(/اك/g, 'ك')           // باكر = بكر
    .replace(/ان/g, 'ن')           // عانس = عنس
    .replace(/اج/g, 'ج')           // فاجر = فجر
    .replace(/اع/g, 'ع')           // قاعد = قعد
    .replace(/اف/g, 'ف')           // عافية = عفيه
    .replace(/اق/g, 'ق')           // فاقد = فقد
    .replace(/اط/g, 'ط')           // فاطم = فطم
    .replace(/اض/g, 'ض')           // عاضد = عضد
    .replace(/اص/g, 'ص')           // عاصم = عصم
    .replace(/اخ/g, 'خ')           // عاخر = عخر
    .replace(/اذ/g, 'ذ')           // عاذر = عذر
    .replace(/اش/g, 'ش')           // عاشق = عشق
    .replace(/اث/g, 'ث')           // عاثر = عثر
    .replace(/اظ/g, 'ظ')           // عاظم = عظم
    .replace(/اغ/g, 'غ')           // باغي = بغي
    .replace(/اح/g, 'ح')           // صاحب = صحب
    .replace(/اج/g, 'ج')           // خاجة = خجه
    .replace(/از/g, 'ز')           // عازب = عزب
    .replace(/ار/g, 'ر')           // عارف = عرف
    // Handle doubled letters that might be single
    .replace(/([بتثجحخدذرزسشصضطظعغفقكلمنهوي])\1/g, '$1') // Remove doubled letters
    // Remove common diacritics
    .replace(/[ًٌٍَُِّْ]/g, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Enhanced search function that handles Arabic text variations
const searchArabicText = (searchTerm: string, targetText: string): boolean => {
  if (!searchTerm || !targetText) return false;
  
  const normalizedSearch = normalizeArabicText(searchTerm);
  const normalizedTarget = normalizeArabicText(targetText);
  
  // Split search term into words
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
  
  // Check if all search words are present in target text
  return searchWords.every(word => normalizedTarget.includes(word));
};

// Get all cards
export const getCards = async (): Promise<Card[]> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) throw error;
    
    return data?.map(record => ({
      id: record.id,
      date: record.date,
      farmerName: record.farmer_name,
      grossWeight: Number(record.gross_weight),
      discountPercentage: Number(record.discount_percentage),
      discountAmount: Number(record.discount_amount),
      netWeight: Number(record.net_weight),
      vehicleNumber: record.vehicle_number,
      supplierName: record.supplier_name,
      supplierCardNumber: record.supplier_card_number,
      is_done: Boolean(record.is_done)
    })) || [];
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};

// Save new card
export const saveCard = async (card: Omit<Card, 'id' | 'supplierCardNumber'>): Promise<Card> => {
  try {
    // Start a transaction
    const { data: supplierData, error: supplierError } = await supabase
      .from('supplier_counters')
      .select('card_count')
      .eq('supplier_name', card.supplierName)
      .single();

    if (supplierError && supplierError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw supplierError;
    }

    let supplierCardNumber = 1;
    
    if (supplierData) {
      // Increment existing supplier's counter
      const { data: updateData, error: updateError } = await supabase
        .from('supplier_counters')
        .update({ card_count: supplierData.card_count + 1 })
        .eq('supplier_name', card.supplierName)
        .select()
        .single();
        
      if (updateError) throw updateError;
      supplierCardNumber = updateData.card_count;
    } else {
      // Create new supplier counter
      const { data: insertData, error: insertError } = await supabase
        .from('supplier_counters')
        .insert([{ supplier_name: card.supplierName, card_count: 1 }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      supplierCardNumber = 1;
    }

    // Save the card with supplier card number
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        date: card.date,
        farmer_name: card.farmerName,
        gross_weight: card.grossWeight,
        discount_percentage: card.discountPercentage,
        discount_amount: card.discountAmount,
        net_weight: card.netWeight,
        vehicle_number: card.vehicleNumber,
        supplier_name: card.supplierName,
        supplier_card_number: supplierCardNumber,
        is_done: card.is_done || false
      }])
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('No data returned after saving card');
    
    return {
      id: data.id,
      date: data.date,
      farmerName: data.farmer_name,
      grossWeight: Number(data.gross_weight),
      discountPercentage: Number(data.discount_percentage),
      discountAmount: Number(data.discount_amount),
      netWeight: Number(data.net_weight),
      vehicleNumber: data.vehicle_number,
      supplierName: data.supplier_name,
      supplierCardNumber: data.supplier_card_number,
      is_done: Boolean(data.is_done)
    };
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
};

// Update existing card
export const updateCard = async (card: Card): Promise<Card> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update({
        date: card.date,
        farmer_name: card.farmerName,
        gross_weight: card.grossWeight,
        discount_percentage: card.discountPercentage,
        discount_amount: card.discountAmount,
        net_weight: card.netWeight,
        vehicle_number: card.vehicleNumber,
        supplier_name: card.supplierName,
        supplier_card_number: card.supplierCardNumber,
        is_done: card.is_done || false
      })
      .eq('id', card.id)
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('No data returned after updating card');
    
    return {
      id: data.id,
      date: data.date,
      farmerName: data.farmer_name,
      grossWeight: Number(data.gross_weight),
      discountPercentage: Number(data.discount_percentage),
      discountAmount: Number(data.discount_amount),
      netWeight: Number(data.net_weight),
      vehicleNumber: data.vehicle_number,
      supplierName: data.supplier_name,
      supplierCardNumber: data.supplier_card_number,
      is_done: Boolean(data.is_done)
    };
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

// Toggle card done status
export const toggleCardDoneStatus = async (id: number, is_done: boolean): Promise<Card> => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .update({ is_done })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('No data returned after updating card status');
    
    return {
      id: data.id,
      date: data.date,
      farmerName: data.farmer_name,
      grossWeight: Number(data.gross_weight),
      discountPercentage: Number(data.discount_percentage),
      discountAmount: Number(data.discount_amount),
      netWeight: Number(data.net_weight),
      vehicleNumber: data.vehicle_number,
      supplierName: data.supplier_name,
      supplierCardNumber: data.supplier_card_number,
      is_done: Boolean(data.is_done)
    };
  } catch (error) {
    console.error('Error toggling card status:', error);
    throw error;
  }
};

// Delete card
export const deleteCard = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

// Delete all cards
export const deleteAllCards = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .neq('id', 0);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting all cards:', error);
    throw error;
  }
};

// Enhanced search cards - Flexible name matching with Arabic text normalization
export const searchCards = async (query: string): Promise<Card[]> => {
  try {
    let queryBuilder = supabase
      .from('cards')
      .select('*');
    
    if (query && query.trim()) {
      const searchTerm = query.trim();
      
      // Try to parse as card ID or supplier card number first
      const cardId = parseInt(searchTerm);
      
      if (!isNaN(cardId)) {
        // Search by ID or supplier card number
        queryBuilder = queryBuilder.or(`id.eq.${cardId},supplier_card_number.eq.${cardId}`);
      } else {
        // For Arabic name search, we'll get all cards and filter client-side for better normalization
        // This ensures we catch all variations like ابراهيم = أبراهيم = إبراهيم
        queryBuilder = queryBuilder.select('*');
      }
    }
    
    const { data, error } = await queryBuilder.order('id', { ascending: true });
    
    if (error) throw error;
    
    let results = data ? data.map(record => ({
      id: record.id,
      date: record.date,
      farmerName: record.farmer_name,
      grossWeight: Number(record.gross_weight),
      discountPercentage: Number(record.discount_percentage),
      discountAmount: Number(record.discount_amount),
      netWeight: Number(record.net_weight),
      vehicleNumber: record.vehicle_number,
      supplierName: record.supplier_name,
      supplierCardNumber: record.supplier_card_number,
      is_done: Boolean(record.is_done)
    })) : [];
    
    // Apply Arabic text normalization filtering if searching by name
    if (query && query.trim() && isNaN(parseInt(query.trim()))) {
      results = results.filter(card => searchArabicText(query, card.farmerName));
    }
    
    return results;
  } catch (error) {
    console.error('Error searching cards:', error);
    throw error;
  }
};

// Get all invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) throw error;
    
    return data ? data.map(record => ({
      id: record.id,
      date: record.date,
      farmerName: record.farmer_name,
      cards: record.cards,
      contractPrice: Number(record.contract_price),
      freePrice: record.free_price ? Number(record.free_price) : 0,
      contractQuantityPerBag: Number(record.contract_quantity_per_bag),
      seedBags: Number(record.seed_bags),
      seedBagPrice: Number(record.seed_bag_price),
      additionalSeedKilos: Number(record.additional_seed_kilos || 0),
      totalContractQuantity: Number(record.total_contract_quantity),
      freeQuantity: Number(record.free_quantity || 0),
      contractAmount: Number(record.contract_amount),
      freeAmount: Number(record.free_amount || 0),
      seedRights: Number(record.seed_rights),
      totalAmount: Number(record.total_amount),
      netAmount: Number(record.net_amount),
      additionalDeductions: Number(record.additional_deductions || 0),
      finalAmount: Number(record.final_amount),
      isPaid: record.is_paid,
      remainingAmount: record.remaining_amount ? Number(record.remaining_amount) : Number(record.final_amount)
    })) : [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Save new invoice
export const saveInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{
        date: invoice.date,
        farmer_name: invoice.farmerName,
        cards: invoice.cards,
        contract_price: invoice.contractPrice,
        free_price: invoice.freePrice,
        contract_quantity_per_bag: invoice.contractQuantityPerBag,
        seed_bags: invoice.seedBags,
        seed_bag_price: invoice.seedBagPrice,
        additional_seed_kilos: invoice.additionalSeedKilos,
        total_contract_quantity: invoice.totalContractQuantity,
        free_quantity: invoice.freeQuantity,
        contract_amount: invoice.contractAmount,
        free_amount: invoice.freeAmount,
        seed_rights: invoice.seedRights,
        total_amount: invoice.totalAmount,
        net_amount: invoice.netAmount,
        additional_deductions: invoice.additionalDeductions,
        final_amount: invoice.finalAmount,
        is_paid: invoice.isPaid,
        remaining_amount: invoice.remainingAmount
      }])
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('No data returned after saving invoice');
    
    return {
      id: data.id,
      date: data.date,
      farmerName: data.farmer_name,
      cards: data.cards,
      contractPrice: Number(data.contract_price),
      freePrice: data.free_price ? Number(data.free_price) : 0,
      contractQuantityPerBag: Number(data.contract_quantity_per_bag),
      seedBags: Number(data.seed_bags),
      seedBagPrice: Number(data.seed_bag_price),
      additionalSeedKilos: Number(data.additional_seed_kilos || 0),
      totalContractQuantity: Number(data.total_contract_quantity),
      freeQuantity: Number(data.free_quantity || 0),
      contractAmount: Number(data.contract_amount),
      freeAmount: Number(data.free_amount || 0),
      seedRights: Number(data.seed_rights),
      totalAmount: Number(data.total_amount),
      netAmount: Number(data.net_amount),
      additionalDeductions: Number(data.additional_deductions || 0),
      finalAmount: Number(data.final_amount),
      isPaid: data.is_paid,
      remainingAmount: data.remaining_amount ? Number(data.remaining_amount) : Number(data.final_amount)
    };
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
};

// Update existing invoice
export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        date: invoice.date,
        farmer_name: invoice.farmerName,
        cards: invoice.cards,
        contract_price: invoice.contractPrice,
        free_price: invoice.freePrice,
        contract_quantity_per_bag: invoice.contractQuantityPerBag,
        seed_bags: invoice.seedBags,
        seed_bag_price: invoice.seedBagPrice,
        additional_seed_kilos: invoice.additionalSeedKilos,
        total_contract_quantity: invoice.totalContractQuantity,
        free_quantity: invoice.freeQuantity,
        contract_amount: invoice.contractAmount,
        free_amount: invoice.freeAmount,
        seed_rights: invoice.seedRights,
        total_amount: invoice.totalAmount,
        net_amount: invoice.netAmount,
        additional_deductions: invoice.additionalDeductions,
        final_amount: invoice.finalAmount,
        is_paid: invoice.isPaid,
        remaining_amount: invoice.remainingAmount
      })
      .eq('id', invoice.id)
      .select()
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('No data returned after updating invoice');
    
    return {
      id: data.id,
      date: data.date,
      farmerName: data.farmer_name,
      cards: data.cards,
      contractPrice: Number(data.contract_price),
      freePrice: data.free_price ? Number(data.free_price) : 0,
      contractQuantityPerBag: Number(data.contract_quantity_per_bag),
      seedBags: Number(data.seed_bags),
      seedBagPrice: Number(data.seed_bag_price),
      additionalSeedKilos: Number(data.additional_seed_kilos || 0),
      totalContractQuantity: Number(data.total_contract_quantity),
      freeQuantity: Number(data.free_quantity || 0),
      contractAmount: Number(data.contract_amount),
      freeAmount: Number(data.free_amount || 0),
      seedRights: Number(data.seed_rights),
      totalAmount: Number(data.total_amount),
      netAmount: Number(data.net_amount),
      additionalDeductions: Number(data.additional_deductions || 0),
      finalAmount: Number(data.final_amount),
      isPaid: data.is_paid,
      remainingAmount: data.remaining_amount ? Number(data.remaining_amount) : Number(data.final_amount)
    };
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

// Delete invoice
export const deleteInvoice = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

// Delete all invoices
export const deleteAllInvoices = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .neq('id', 0);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting all invoices:', error);
    throw error;
  }
};
