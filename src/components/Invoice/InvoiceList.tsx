import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import Pagination from '../UI/Pagination';
import { AlertTriangle, Search, Trash2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAlert } from '../../contexts/AlertContext';
import { deleteAllInvoices } from '../../utils/storage';

interface InvoiceListProps {
  invoices: Invoice[];
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const { dispatch } = useAppContext();
  const { showAlert } = useAlert();
  const pageSize = 10;
  
  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      return (
        invoice.id.toString().includes(searchLower) ||
        invoice.farmerName.toLowerCase().includes(searchLower) ||
        invoice.date.includes(searchLower)
      );
    })
    .sort((a, b) => a.id - b.id);
  
  // Calculate total net amount
  const totalNetAmount = filteredInvoices.reduce((total, invoice) => total + invoice.netAmount, 0);
  
  // Get current page invoices
  const getCurrentInvoices = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(startIndex, startIndex + pageSize);
  };
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllInvoices();
      dispatch({ type: 'DELETE_ALL_INVOICES' });
      setShowDeleteAllConfirm(false);
      showAlert('success', 'تم حذف جميع الفواتير بنجاح');
    } catch (error) {
      console.error('Error deleting all invoices:', error);
      showAlert('error', 'حدث خطأ أثناء حذف الفواتير');
    }
  };
  
  if (invoices.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد فواتير حتى الآن
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-800">ملخص الفواتير</h3>
            <p className="text-gray-500">
              {searchTerm ? `نتائج البحث: ${filteredInvoices.length} فواتير` : `العدد الإجمالي: ${invoices.length} فواتير`}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-gray-500">إجمالي المبالغ الصافية</p>
            <p className="text-2xl font-bold text-green-600 arabic-number">
              {formatCurrency(totalNetAmount)} ج
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-10"
              placeholder="ابحث برقم الفاتورة أو اسم الفلاح أو التاريخ"
            />
          </div>

          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            className="btn btn-danger flex items-center mr-4"
          >
            <Trash2 className="h-5 w-5 ml-2" />
            حذف جميع الفواتير
          </button>
        </div>
      </div>
      
      {filteredInvoices.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          لا توجد نتائج تطابق بحثك
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="w-16">رقم الفاتورة</th>
                  <th className="w-24">التاريخ</th>
                  <th>اسم الفلاح</th>
                  <th className="w-32">كمية العقد</th>
                  <th className="w-32">كمية الحر</th>
                  <th className="w-32">سعر العقد</th>
                  <th className="w-32">سعر الحر</th>
                  <th className="w-32">صافي المبلغ</th>
                  <th className="w-20">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {getCurrentInvoices().map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="arabic-number">{invoice.id}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.farmerName}</td>
                    <td className="arabic-number">{formatCurrency(invoice.totalContractQuantity)} كجم</td>
                    <td className="arabic-number">{formatCurrency(invoice.freeQuantity)} كجم</td>
                    <td className="arabic-number">{invoice.contractPrice.toFixed(3)} ج</td>
                    <td className="arabic-number">{invoice.freePrice ? invoice.freePrice.toFixed(3) : '-'} ج</td>
                    <td className="arabic-number text-green-600 font-medium">
                      {formatCurrency(invoice.netAmount)} ج
                    </td>
                    <td>
                      <Link 
                        to={`/invoices/${invoice.id}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredInvoices.length / pageSize)}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 ml-2" />
              <h3 className="text-lg font-medium">تأكيد حذف جميع الفواتير</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف جميع الفواتير؟ لا يمكن التراجع عن هذا الإجراء.
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
                onClick={handleDeleteAll}
              >
                حذف الجميع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;