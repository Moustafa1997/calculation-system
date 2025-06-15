 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { getCards } from '../utils/storage';
import CardList from '../components/Cards/CardList';
import { FileText, Plus, Search, X, Calendar } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const InvoiceCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { selectedCards } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);

  // Comprehensive Arabic text normalization function
  const normalizeArabicText = (text: string): string => {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/ام/g, 'م')
      .replace(/اه/g, 'ه')
      .replace(/او/g, 'و')
      .replace(/اي/g, 'ي')
      .replace(/ال/g, 'ل')
      .replace(/اب/g, 'ب')
      .replace(/اد/g, 'د')
      .replace(/اس/g, 'س')
      .replace(/ات/g, 'ت')
      .replace(/اك/g, 'ك')
      .replace(/ان/g, 'ن')
      .replace(/اج/g, 'ج')
      .replace(/اع/g, 'ع')
      .replace(/اف/g, 'ف')
      .replace(/اق/g, 'ق')
      .replace(/اط/g, 'ط')
      .replace(/اض/g, 'ض')
      .replace(/اص/g, 'ص')
      .replace(/اخ/g, 'خ')
      .replace(/اذ/g, 'ذ')
      .replace(/اش/g, 'ش')
      .replace(/اث/g, 'ث')
      .replace(/اظ/g, 'ظ')
      .replace(/اغ/g, 'غ')
      .replace(/اح/g, 'ح')
      .replace(/از/g, 'ز')
      .replace(/ار/g, 'ر')
      .replace(/([بتثجحخدذرزسشصضطظعغفقكلمنهوي])\1/g, '$1')
      .replace(/[ًٌٍَُِّْ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Enhanced Arabic search function
  const searchArabicText = (searchTerm: string, targetText: string): boolean => {
    if (!searchTerm || !targetText) return false;
    
    const normalizedSearch = normalizeArabicText(searchTerm);
    const normalizedTarget = normalizeArabicText(targetText);
    
    const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
    return searchWords.every(word => normalizedTarget.includes(word));
  };

  // Enhanced card search with Arabic normalization
  const searchCards = (cards: Card[], query: string): Card[] => {
    if (!query.trim()) return cards;

    const trimmedQuery = query.trim();
    
    // Try to parse as card ID first
    const cardId = parseInt(trimmedQuery);
    if (!isNaN(cardId)) {
      return cards.filter(card => 
        card.id === cardId || 
        card.supplierCardNumber === cardId ||
        card.vehicleNumber.includes(trimmedQuery)
      );
    }

    // Enhanced text search with Arabic normalization
    return cards.filter(card => {
      return (
        searchArabicText(trimmedQuery, card.farmerName) ||
        searchArabicText(trimmedQuery, card.supplierName) ||
        card.vehicleNumber.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
    }).sort((a, b) => {
      // Sort by relevance
      const aName = normalizeArabicText(a.farmerName);
      const bName = normalizeArabicText(b.farmerName);
      const searchQuery = normalizeArabicText(trimmedQuery);
      
      // Exact match gets highest priority
      if (aName === searchQuery) return -1;
      if (bName === searchQuery) return 1;
      
      // Names that start with the search term get higher priority
      if (aName.startsWith(searchQuery)) return -1;
      if (bName.startsWith(searchQuery)) return 1;
      
      // Shorter names (closer to search term) get higher priority
      return aName.length - bName.length;
    });
  };

  // Generate smart suggestions based on Arabic normalization
  const generateSuggestions = (cards: Card[], query: string): string[] => {
    if (!query.trim()) return [];

    const allNames = [...new Set([
      ...cards.map(card => card.farmerName),
      ...cards.map(card => card.supplierName)
    ])].filter(name => name);

    const normalizedQuery = normalizeArabicText(query);
    const suggestions = allNames.filter(name => 
      searchArabicText(query, name)
    );

    // Sort suggestions by relevance
    return suggestions.sort((a, b) => {
      const aNorm = normalizeArabicText(a);
      const bNorm = normalizeArabicText(b);
      
      if (aNorm === normalizedQuery) return -1;
      if (bNorm === normalizedQuery) return 1;
      if (aNorm.startsWith(normalizedQuery)) return -1;
      if (bNorm.startsWith(normalizedQuery)) return 1;
      return aNorm.length - bNorm.length;
    }).slice(0, 8); // Limit to 8 suggestions
  };
  
  // Fetch latest cards when component mounts
  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const latestCards = await getCards();
        setAvailableCards(latestCards);
        setFilteredCards(latestCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
        showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCards();
  }, [showAlert]);
  
  // Filter and search cards with enhanced Arabic search
  useEffect(() => {
    let results = availableCards;

    // Filter by search term using enhanced Arabic search
    if (searchTerm.trim()) {
      results = searchCards(availableCards, searchTerm);
      
      // Generate suggestions using Arabic normalization
      const newSuggestions = generateSuggestions(availableCards, searchTerm);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }

    // Filter by date
    if (searchDate) {
      results = results.filter(card => card.date === searchDate);
    }

    setFilteredCards(results);
  }, [searchTerm, searchDate, availableCards]);
  
  // Handle card selection
  const handleSelectCard = (card: Card) => {
    const isSelected = selectedCards.some(selected => selected.id === card.id);
    
    if (isSelected) {
      dispatch({ type: 'DESELECT_CARD', payload: card.id });
    } else {
      dispatch({ type: 'SELECT_CARD', payload: card });
    }
  };
  
  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(!!value.trim());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDate(e.target.value);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    setSearchDate('');
    setShowSuggestions(false);
    setSuggestions([]);
  };
  
  // Navigate to invoice details entry
  const handleCreateInvoice = () => {
    if (selectedCards.length === 0) {
      showAlert('warning', 'يرجى اختيار كارتة واحدة على الأقل');
      return;
    }
    navigate('/invoice-details');
  };
  
  // Navigate to manual invoice creation
  const handleCreateManualInvoice = () => {
    navigate('/invoice-manual');
  };
  
  return (
    <div className="container mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">إنشاء فاتورة جديدة</h2>
          
          <div className="flex gap-4">
            <button
              onClick={handleCreateManualInvoice}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="ml-2 h-5 w-5" />
              إنشاء فاتورة يدوياً
            </button>
            
            <button
              onClick={handleCreateInvoice}
              className="btn btn-primary flex items-center"
              disabled={selectedCards.length === 0}
            >
              <FileText className="ml-2 h-5 w-5" />
              إنشاء فاتورة من الكارتات المحددة
            </button>
          </div>
        </div>

        {/* Enhanced Search Tips */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">🔍 البحث الذكي المحسن:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700">
            <div>
              <p className="font-medium">أمثلة البحث:</p>
              <ul className="space-y-0.5">
                <li>• ابراهيم = أبراهيم = إبراهيم</li>
                <li>• بصارة = بصاره = بصره</li>
                <li>• الغامري = الغمري</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">البحث بـ:</p>
              <ul className="space-y-0.5">
                <li>• اسم الفلاح أو جزء منه</li>
                <li>• اسم المورد</li>
                <li>• رقم الكارتة أو رقم السيارة</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mb-6 space-y-4">
          {/* Enhanced search input */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(!!searchTerm.trim())}
              className="input-field pr-10 pl-10"
              placeholder="البحث الذكي: ابراهيم، بصاره، الغامري، عباس، سالم، رقم كارتة، رقم سيارة..."
            />
            {(searchTerm || searchDate) && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Date filter */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={handleDateChange}
              className="input-field pr-10"
              placeholder="اختر التاريخ"
            />
          </div>
          
          {/* Enhanced suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
              <div className="py-1">
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-b">
                  اقتراحات البحث ({suggestions.length})
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium text-gray-800">{suggestion}</div>
                    {searchTerm && (
                      <div className="text-xs text-gray-500 mt-1">
                        يطابق: "{searchTerm}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {selectedCards.length > 0 
              ? `الكارتات المختارة (${selectedCards.length})` 
              : `اختر الكارتات للفاتورة ${filteredCards.length > 0 ? `(${filteredCards.length} متاحة)` : ''}`}
          </h3>
          
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">جاري تحميل البيانات...</div>
          ) : (
            <>
              {filteredCards.length === 0 && (searchTerm || searchDate) ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="mb-4">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-lg mb-2">لا توجد كارتات تطابق بحثك</div>
                  </div>
                  <div className="text-sm bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                    <p className="font-medium mb-2">جرب:</p>
                    <ul className="text-right space-y-1">
                      <li>• البحث بطرق مختلفة: ابراهيم، أبراهيم، إبراهيم</li>
                      <li>• البحث بجزء من الاسم فقط</li>
                      <li>• التحقق من التاريخ المحدد</li>
                      <li>• البحث برقم الكارتة أو السيارة</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <CardList
                  cards={filteredCards}
                  selectable={true}
                  onSelectCard={handleSelectCard}
                  selectedCardIds={selectedCards.map(card => card.id)}
                  allowDelete={false}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreationPage;