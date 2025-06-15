import { Card, Invoice } from '../types';

// File paths
const CARDS_FILE = '/data/cards.json';
const INVOICES_FILE = '/data/invoices.json';
const COUNTERS_FILE = '/data/counters.json';

// Initialize counters
let cardCounter = 0;
let invoiceCounter = 0;

// Load initial data
try {
  const counters = JSON.parse(localStorage.getItem('counters') || '{"cardId": 0, "invoiceId": 0}');
  cardCounter = counters.cardId;
  invoiceCounter = counters.invoiceId;
} catch (error) {
  console.error('Error loading counters:', error);
}

// Helper function to save counters
const saveCounters = () => {
  localStorage.setItem('counters', JSON.stringify({
    cardId: cardCounter,
    invoiceId: invoiceCounter
  }));
};

// Cards operations
export const getCards = (): Card[] => {
  try {
    const cardsJson = localStorage.getItem('cards');
    return cardsJson ? JSON.parse(cardsJson) : [];
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
};

export const saveCard = (card: Omit<Card, 'id'>): Card => {
  try {
    const cards = getCards();
    cardCounter++;
    
    const newCard: Card = {
      ...card,
      id: cardCounter
    };
    
    cards.push(newCard);
    localStorage.setItem('cards', JSON.stringify(cards));
    saveCounters();
    
    return newCard;
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
};

export const updateCard = (card: Card): boolean => {
  try {
    const cards = getCards();
    const index = cards.findIndex(c => c.id === card.id);
    
    if (index === -1) return false;
    
    cards[index] = card;
    localStorage.setItem('cards', JSON.stringify(cards));
    return true;
  } catch (error) {
    console.error('Error updating card:', error);
    return false;
  }
};

export const deleteCard = (id: number): boolean => {
  try {
    const cards = getCards();
    const filteredCards = cards.filter(card => card.id !== id);
    
    if (filteredCards.length === cards.length) return false;
    
    localStorage.setItem('cards', JSON.stringify(filteredCards));
    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
  }
};

export const deleteAllCards = (): void => {
  try {
    localStorage.setItem('cards', JSON.stringify([]));
    cardCounter = 0;
    saveCounters();
  } catch (error) {
    console.error('Error deleting all cards:', error);
    throw error;
  }
};

export const searchCards = (query: string): Card[] => {
  try {
    const cards = getCards();
    
    if (!query) return cards;
    
    const lowerQuery = query.toLowerCase();
    return cards.filter(card => 
      card.farmerName.toLowerCase().includes(lowerQuery) ||
      card.supplierName?.toLowerCase().includes(lowerQuery) ||
      card.vehicleNumber?.toLowerCase().includes(lowerQuery) ||
      (card.date && card.date.includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
};

// Invoices operations
export const getInvoices = (): Invoice[] => {
  try {
    const invoicesJson = localStorage.getItem('invoices');
    return invoicesJson ? JSON.parse(invoicesJson) : [];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
};

export const saveInvoice = (invoice: Omit<Invoice, 'id'>): Invoice => {
  try {
    const invoices = getInvoices();
    invoiceCounter++;
    
    const newInvoice: Invoice = {
      ...invoice,
      id: invoiceCounter
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    saveCounters();
    
    return newInvoice;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
};

export const updateInvoice = (invoice: Invoice): boolean => {
  try {
    const invoices = getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    
    if (index === -1) return false;
    
    invoices[index] = invoice;
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error('Error updating invoice:', error);
    return false;
  }
};

export const deleteInvoice = (id: number): boolean => {
  try {
    const invoices = getInvoices();
    const filteredInvoices = invoices.filter(invoice => invoice.id !== id);
    
    if (filteredInvoices.length === invoices.length) return false;
    
    localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
};

export const deleteAllInvoices = (): void => {
  try {
    localStorage.setItem('invoices', JSON.stringify([]));
    invoiceCounter = 0;
    saveCounters();
  } catch (error) {
    console.error('Error deleting all invoices:', error);
    throw error;
  }
};