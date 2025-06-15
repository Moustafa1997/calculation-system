import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Card, Invoice } from '../types';
import { getCards, getInvoices } from '../utils/storage';
import { useAlert } from './AlertContext';

// Initial state
const initialState: AppState = {
  cards: [],
  invoices: [],
  selectedCards: [],
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CARDS':
      return { ...state, cards: action.payload || [] };
    
    case 'ADD_CARD':
      return { ...state, cards: [...(state.cards || []), action.payload] };
    
    case 'UPDATE_CARD': {
      const updatedCards = (state.cards || []).map(card =>
        card.id === action.payload.id ? action.payload : card
      );
      return { ...state, cards: updatedCards };
    }
    
    case 'DELETE_CARD': {
      const filteredCards = (state.cards || []).filter(card => card.id !== action.payload);
      return { ...state, cards: filteredCards };
    }
    
    case 'DELETE_ALL_CARDS':
      return { ...state, cards: [] };
    
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload || [] };
    
    case 'ADD_INVOICE': {
      const newInvoices = [...(state.invoices || []), action.payload];
      return { ...state, invoices: newInvoices };
    }
    
    case 'UPDATE_INVOICE': {
      const updatedInvoices = (state.invoices || []).map(invoice =>
        invoice.id === action.payload.id ? action.payload : invoice
      );
      return { ...state, invoices: updatedInvoices };
    }
    
    case 'DELETE_INVOICE': {
      const filteredInvoices = (state.invoices || []).filter(
        invoice => invoice.id !== action.payload
      );
      return { ...state, invoices: filteredInvoices };
    }
    
    case 'DELETE_ALL_INVOICES':
      return { ...state, invoices: [] };
    
    case 'SELECT_CARD': {
      const isAlreadySelected = (state.selectedCards || []).some(
        card => card.id === action.payload.id
      );
      
      if (isAlreadySelected) {
        return state;
      }
      
      return {
        ...state,
        selectedCards: [...(state.selectedCards || []), action.payload],
      };
    }
    
    case 'DESELECT_CARD': {
      const filteredCards = (state.selectedCards || []).filter(
        card => card.id !== action.payload
      );
      return { ...state, selectedCards: filteredCards };
    }
    
    case 'CLEAR_SELECTED_CARDS':
      return { ...state, selectedCards: [] };
    
    default:
      return state;
  }
};

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { showAlert } = useAlert();

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cards, invoices] = await Promise.all([
          getCards(),
          getInvoices()
        ]);
        
        dispatch({ type: 'SET_CARDS', payload: cards || [] });
        dispatch({ type: 'SET_INVOICES', payload: invoices || [] });
      } catch (error) {
        console.error('Error loading data:', error);
        showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
      }
    };
    
    loadData();
  }, [showAlert]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};