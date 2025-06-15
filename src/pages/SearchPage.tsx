import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { searchCards, getCards } from '../utils/storage';
import { exportCardsToExcel } from '../utils/export';
import CardList from '../components/Cards/CardList';
import { Search, X, Car, Calendar, User, Hash } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

// Comprehensive Arabic text normalization function (same as in storage.ts)
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

// Enhanced search function for Arabic text variations
const searchArabicText = (searchTerm: string, targetText: string): boolean => {
  if (!searchTerm || !targetText) return false;
  
  const normalizedSearch = normalizeArabicText(searchTerm);
  const normalizedTarget = normalizeArabicText(targetText);
  
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
  return searchWords.every(word => normalizedTarget.includes(word));
};

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [cardNumberSearch, setCardNumberSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();
  
  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      try {
        let results: Card[] = [];
        
        // If any search field has a value, perform search
        if (searchTerm.trim() || vehicleSearch.trim() || cardNumberSearch.trim() || searchDate) {
          
          // Enhanced multi-word search for farmer names with Arabic normalization
          if (searchTerm.trim()) {
            const normalizedSearch = normalizeArabicText(searchTerm);
            const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
            
            if (searchWords.length === 1) {
              // Single word - use database search with normalization
              results = await searchCards(searchTerm);
            } else {
              // Multiple words - get all cards and filter client-side with Arabic normalization
              results = await getCards();
              results = results.filter(card => searchArabicText(searchTerm, card.farmerName));
              
              // Sort results by relevance with normalized comparison
              results = results.sort((a, b) => {
                const aName = normalizeArabicText(a.farmerName);
                const bName = normalizeArabicText(b.farmerName);
                const searchQuery = normalizedSearch;
                
                // Exact match gets highest priority
                if (aName === searchQuery) return -1;
                if (bName === searchQuery) return 1;
                
                // Names that start with the search term get higher priority
                if (aName.startsWith(searchQuery)) return -1;
                if (bName.startsWith(searchQuery)) return 1;
                
                // Shorter names (closer to search term) get higher priority
                return aName.length - bName.length;
              });
            }
          } else if (cardNumberSearch.trim()) {
            results = await searchCards(cardNumberSearch);
          } else {
            // If only vehicle or date search, get all cards first
            results = await getCards();
          }

          // Apply additional filters locally
          if (vehicleSearch.trim()) {
            const vehicleQuery = vehicleSearch.toLowerCase().trim();
            results = results.filter(card => 
              card.vehicleNumber.toLowerCase().includes(vehicleQuery)
            );
          }

          // Apply card number filter if it's not already used as primary search
          if (cardNumberSearch.trim() && !searchTerm.trim()) {
            const cardQuery = cardNumberSearch.trim();
            const cardId = parseInt(cardQuery);
            if (!isNaN(cardId)) {
              results = results.filter(card => 
                card.id === cardId || card.supplierCardNumber === cardId
              );
            } else {
              // If not a number, search in farmer name with Arabic normalization
              results = results.filter(card => searchArabicText(cardQuery, card.farmerName));
            }
          }

          // Apply date filter
          if (searchDate) {
            results = results.filter(card => card.date === searchDate);
          }

        } else {
          // No search criteria - get all cards
          results = await getCards();
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching cards:', error);
        showAlert('error', 'حدث خطأ أثناء البحث عن الكارتات');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, vehicleSearch, cardNumberSearch, searchDate, showAlert]);
  
  const clearSearch = () => {
    setSearchTerm('');
    setVehicleSearch('');
    setCardNumberSearch('');
    setSearchDate('');
  };
  
  const handleExport = () => {
    if (searchResults.length === 0) {
      showAlert('warning', 'لا توجد بيانات للتصدير');
      return;
    }
    
    try {
      exportCardsToExcel(searchResults);
      showAlert('success', 'تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'حدث خطأ أثناء تصدير البيانات');
    }
  };

  const hasSearchCriteria = searchTerm.trim() || vehicleSearch.trim() || cardNumberSearch.trim() || searchDate;
  
  // Get search explanation text
  const getSearchExplanation = () => {
    if (!searchTerm.trim()) return '';
    
    const words = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 1) {
      return `البحث عن الأسماء التي تحتوي على: "${words[0]}"`;
    } else {
      return `البحث عن الأسماء التي تحتوي على جميع الكلمات: "${words.join('", "')}"`;
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="card mb-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">سجل الكارتات</h2>
        
        <div className="mb-6 space-y-4">
          {/* Search by farmer name - Enhanced flexible matching */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-10 pl-10"
              placeholder="البحث الذكي: بصاره=بصره، الغامري=الغمري، عباس=عبس، سالم=سلم، فاروق=فروق، عادل=عدل"
            />
            {hasSearchCriteria && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search by card number */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={cardNumberSearch}
              onChange={(e) => setCardNumberSearch(e.target.value)}
              className="input-field pr-10"
              placeholder="ابحث برقم الكارتة (رقم النظام أو رقم المورد) أو جزء من الاسم"
            />
          </div>

          {/* Vehicle number search */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Car className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="input-field pr-10"
              placeholder="ابحث برقم السيارة"
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="input-field pr-10"
              placeholder="اختر التاريخ"
            />
          </div>
        </div>
        
        {/* Search tips */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">🔍 البحث الذكي الشامل:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
            <div>
              <p className="font-medium">تطابق الحروف:</p>
              <ul className="space-y-0.5">
                <li>• ابراهيم = أبراهيم = إبراهيم</li>
                <li>• بصارة = بصاره = بصره</li>
                <li>• علي = على، يحيى = يحيي</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">الحروف الزائدة:</p>
              <ul className="space-y-0.5">
                <li>• الغامري = الغمري</li>
                <li>• عباس = عبس</li>
                <li>• سالم = سلم</li>
                <li>• فاروق = فروق</li>
                <li>• عادل = عدل</li>
              </ul>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            <p>💡 البحث يتعامل مع أكثر من 20 نوع من التباينات في الكتابة العربية تلقائياً!</p>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center"
            disabled={searchResults.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            تصدير Excel
          </button>
        </div>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {hasSearchCriteria ? (
                  <>
                    نتائج البحث ({searchResults.length})
                    {searchTerm && (
                      <span className="text-sm text-gray-600 block mt-1">
                        {getSearchExplanation()}
                        {searchResults.length > 0 && (
                          <span className="text-green-600 block mt-1">
                            ✓ تم العثور على {searchResults.length} كارتة تطابق البحث
                          </span>
                        )}
                      </span>
                    )}
                  </>
                ) : (
                  `جميع الكارتات (${searchResults.length})`
                )}
              </h3>
              
              {searchResults.length === 0 && hasSearchCriteria ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="mb-4">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <div className="text-lg mb-2">لا توجد نتائج تطابق بحثك</div>
                  </div>
                  <div className="text-sm bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">جرب هذه الطرق المختلفة:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <ul className="text-right space-y-1">
                        <li>• أشكال الألف: ابراهيم، أبراهيم، إبراهيم</li>
                        <li>• التاء والهاء: بصارة، بصاره، بصره</li>
                        <li>• الياء: علي، على، يحيى، يحيي</li>
                        <li>• حذف الألف: الغامري، الغمري</li>
                      </ul>
                      <ul className="text-right space-y-1">
                        <li>• الأسماء المختصرة: عباس، عبس</li>
                        <li>• بدون حروف زائدة: سالم، سلم</li>
                        <li>• أشكال مختلفة: فاروق، فروق</li>
                        <li>• البحث بجزء من الاسم فقط</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <CardList 
                  cards={searchResults} 
                  allowDelete={true}
                  showTotals={true}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;