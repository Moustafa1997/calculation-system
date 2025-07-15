import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { deleteCard, deleteAllCards, toggleCardDoneStatus } from '../../utils/storage';
import { exportCardToPDF } from '../../utils/export';
import { useAppContext } from '../../contexts/AppContext';
import { useAlert } from '../../contexts/AlertContext';
import Pagination from '../UI/Pagination';
import CardEditModal from './CardEditModal';
import { Edit, Trash2, AlertTriangle, FileDown, Eye, Filter, Check } from 'lucide-react';

interface CardListProps {
  cards: Card[];
  selectable?: boolean;
  onSelectCard?: (card: Card) => void;
  selectedCardIds?: number[];
  showTotals?: boolean;
  allowDelete?: boolean;
}

const SUPPLIER_OPTIONS = [
  'جمعه الفخراني اهرام',
  'فوكس السيد معتوه',
  'بكر صقر',
  'محمد سلامه اهرام',
  'محمود فريد',
  'ثلاجه فلاحين',
  'من الارض للثلاجه'
];

const CardList: React.FC<CardListProps> = ({
  cards,
  selectable = false,
  onSelectCard,
  selectedCardIds = [],
  showTotals = true,
  allowDelete = true
}) => {
  const { dispatch } = useAppContext();
  const { showAlert } = useAlert();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const pageSize = 10;

  // Filter and sort cards
  const filteredCards = React.useMemo(() => {
    let results = [...cards].sort((a, b) => a.id - b.id);
    
    if (selectedSupplier) {
      results = results.filter(card => 
        card.supplierName?.toLowerCase().trim() === selectedSupplier.toLowerCase().trim()
      );
    }
    
    return results;
  }, [cards, selectedSupplier]);
  
  // Calculate totals
  const totals = React.useMemo(() => {
    return filteredCards.reduce(
      (acc, card) => {
        acc.grossWeight += card.grossWeight || 0;
        acc.netWeight += card.netWeight || 0;
        return acc;
      },
      { grossWeight: 0, netWeight: 0 }
    );
  }, [filteredCards]);
  
  // Get current page data
  const currentCards = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCards.slice(startIndex, startIndex + pageSize);
  }, [filteredCards, currentPage]);
  
  // Check if card is selected
  const isCardSelected = (cardId: number) => {
    return selectedCardIds.includes(cardId);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle toggle card done status
  const handleToggleDone = async (card: Card) => {
    try {
      const newStatus = !card.is_done;
      const updatedCard = await toggleCardDoneStatus(card.id, newStatus);
      dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
      showAlert('success', newStatus ? 'تم تمييز الكارتة كمكتملة ✅' : 'تم إلغاء تمييز الكارتة كمكتملة');
    } catch (error) {
      console.error('Error toggling card status:', error);
      showAlert('error', 'حدث خطأ أثناء تحديث حالة الكارتة');
    }
  };

  const handleDownloadPDF = (card: Card) => {
    try {
      exportCardToPDF(card);
      showAlert('success', 'تم تحميل الكارتة بنجاح');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('error', 'حدث خطأ أثناء تحميل الكارتة');
    }
  };

  // Show delete confirmation
  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setShowDeleteConfirm(true);
  };

 // Handle delete card;
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      await deleteCard(cardToDelete.id);
      dispatch({ type: 'DELETE_CARD', payload: cardToDelete.id });
      showAlert('success', 'تم حذف الكارتة بنجاح');
      setShowDeleteConfirm(false);
      setCardToDelete(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      showAlert('error', 'حدث خطأ أثناء حذف الكارتة');
    }
  };

 // Handle delete all cards
  const handleDeleteAllCards = async () => {
    try {
      await deleteAllCards();
      dispatch({ type: 'DELETE_ALL_CARDS' });
      setShowDeleteAllConfirm(false);
      showAlert('success', 'تم حذف جميع الكارتات بنجاح');
    } catch (error) {
      console.error('Error deleting all cards:', error);
      showAlert('error', 'حدث خطأ أثناء حذف الكارتات');
    }
  };

  // Handle edit card
  const handleEditCard = (updatedCard: Card) => {
    dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
    setEditingCard(null);
    showAlert('success', 'تم تحديث الكارتة بنجاح');
  };

  // Handle supplier filter change
  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSupplier(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  if (filteredCards.length === 0) {
    return <div className="text-center text-gray-500 py-8">لا توجد كارتات حتى الآن</div>;
  }
  
  return (
    <>
      {showTotals && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-gray-500 text-sm">عدد الكارتات</p>
                <p className="text-xl font-bold text-gray-800">{filteredCards.length}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-gray-500 text-sm">إجمالي الوزن القائم</p>
                <p className="text-xl font-bold text-gray-800 arabic-number">{formatCurrency(totals.grossWeight)} كجم</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-gray-500 text-sm">إجمالي الوزن الصافي</p>
                <p className="text-xl font-bold text-gray-800 arabic-number">{formatCurrency(totals.netWeight)} كجم</p>
              </div>
            </div>
            
            {allowDelete && (
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="btn btn-danger flex items-center mr-4"
              >
                <Trash2 className="h-5 w-5 ml-2" />
                حذف جميع الكارتات
              </button>
            )} 
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center">
        <div className="relative flex items-center">
          <Filter className="h-5 w-5 text-gray-400 absolute right-3" />
          <select
            value={selectedSupplier}
            onChange={handleSupplierChange}
            className="input-field pr-10 appearance-none"
          >
            <option value="">جميع الموردين</option>
            {SUPPLIER_OPTIONS.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              {selectable && <th className="w-10"></th>}
              <th className="w-16">مكتمل</th>
              <th className="w-14">المسلسل</th>
              <th className="w-14">رقم الكارتة</th>
              <th className="w-24">التاريخ</th>
              <th>اسم الفلاح</th>
              <th className="w-28">الوزن القائم</th>
              <th className="w-20">الخصم (%)</th>
              <th className="w-28">كمية الخصم</th>
              <th className="w-28">الوزن الصافي</th>
              <th>رقم السيارة</th>
              <th>اسم المورد</th>
              {(allowDelete || selectable) && <th className="w-24">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {currentCards.map((card) => (
              <tr 
                key={card.id}
                className={`${selectable && isCardSelected(card.id) ? 'bg-green-50' : ''} ${
                  card.is_done ? 'bg-gray-100 opacity-75' : ''
                }`}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isCardSelected(card.id)}
                      onChange={() => onSelectCard && onSelectCard(card)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleDone(card)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      card.is_done 
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                    title={card.is_done ? 'إلغاء تمييز الكارتة كمكتملة' : 'تمييز الكارتة كمكتملة'}
                  >
                    {card.is_done && <Check className="h-4 w-4" />}
                  </button>
                </td>
                <td className="arabic-number">{card.id}</td>
                <td className="arabic-number">{card.supplierCardNumber || '-'}</td>
                <td>{card.date}</td>
                <td>{card.farmerName}</td>
                <td className="arabic-number">{formatCurrency(card.grossWeight)} كجم</td>
                <td className="arabic-number">{formatCurrency(card.discountPercentage)}%</td>
                <td className="arabic-number">{formatCurrency(card.discountAmount)} كجم</td>
                <td className="arabic-number">{formatCurrency(card.netWeight)} كجم</td>
                <td>{card.vehicleNumber}</td>
                <td>{card.supplierName}</td>
                {(allowDelete || selectable) && (
                  <td>
                    <div className="flex space-x-2 space-x-reverse">
                      <Link
                        to={`/cards/${card.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(card)}
                        className="text-blue-600 hover:text-blue-800"
                        title="تحميل PDF"
                      >
                        <FileDown className="h-5 w-5" />
                      </button>
                      {allowDelete && (
                        <>
                          <button
                            onClick={() => setEditingCard(card)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(card)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredCards.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredCards.length / pageSize)}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Single Card Confirmation Modal */}
      {showDeleteConfirm && cardToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 ml-2" />
              <h3 className="text-lg font-medium">تأكيد حذف الكارتة</h3>
            </div>
            <p className="text-gray-600 mb-2">
              هل أنت متأكد من حذف الكارتة رقم {cardToDelete.id}؟
            </p>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">اسم الفلاح:</span> {cardToDelete.farmerName}
              <br />
              <span className="font-medium">رقم السيارة:</span> {cardToDelete.vehicleNumber}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCardToDelete(null);
                }}
              >
                إلغاء
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteCard}
              >
                حذف الكارتة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 ml-2" />
              <h3 className="text-lg font-medium">تأكيد حذف جميع الكارتات</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف جميع الكارتات؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                إلغاء
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAllCards}
              >
                حذف الجميع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <CardEditModal
          card={editingCard}
          onSave={handleEditCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </>
  );
};

export default CardList;
