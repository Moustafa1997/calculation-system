export interface Card {
  id: number;
  date: string;
  farmerName: string;
  grossWeight: number;
  discountPercentage: number;
  discountAmount: number;
  netWeight: number;
  vehicleNumber: string;
  supplierName: string;
  supplierCardNumber?: number;
}

export interface Invoice {
  id: number;
  date: string;
  farmerName: string;
  cards: Card[];
  contractPrice: number;
  freePrice: number;
  contractQuantityPerBag: number;
  seedBags: number;
  seedBagPrice: number;
  additionalSeedKilos: number;
  totalContractQuantity: number;
  freeQuantity: number;
  contractAmount: number;
  freeAmount: number;
  seedRights: number;
  totalAmount: number;
  netAmount: number;
  additionalDeductions: number;
  finalAmount: number;
  isPaid: boolean;
  remainingAmount: number;
}

export interface AppState {
  cards: Card[];
  invoices: Invoice[];
  selectedCards: Card[];
}

export type AppAction =
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: number }
  | { type: 'DELETE_ALL_CARDS' }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: number }
  | { type: 'DELETE_ALL_INVOICES' }
  | { type: 'SELECT_CARD'; payload: Card }
  | { type: 'DESELECT_CARD'; payload: number }
  | { type: 'CLEAR_SELECTED_CARDS' };