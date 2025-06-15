import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { exportInvoiceToWord, printInvoiceToPDF } from '../../utils/export';
import { updateInvoice, deleteInvoice } from '../../utils/storage';
import { useAppContext } from '../../contexts/AppContext';
import CardList from '../Cards/CardList';
import InvoiceEditModal from './InvoiceEditModal';
import { FileText, Download, Trash2, Edit3, Check, X, AlertTriangle, Printer } from 'lucide-react';

interface InvoiceDetailProps {
  invoice: Invoice;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice }) => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(
    (invoice.remainingAmount ?? invoice.finalAmount).toString()
  );
  
  const handleExportWord = () => {
    exportInvoiceToWord(invoice);
  };

  const handlePrintPDF = () => {
    printInvoiceToPDF(invoice);
  };
  
  const handleDelete = () => {
    deleteInvoice(invoice.id);
    dispatch({ type: 'DELETE_INVOICE', payload: invoice.id });
    navigate('/invoices');
  };
  
  const handlePaymentUpdate = async () => {
    const remaining = parseFloat(remainingAmount);
    if (isNaN(remaining)) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    
    if (remaining < 0) {
      alert('لا يمكن أن يكون المبلغ المتبقي سالباً');
      return;
    }

    if (remaining > invoice.finalAmount) {
      alert('لا يمكن أن يكون المبلغ المتبقي أكبر من المبلغ النهائي');
      return;
    }
    
    const updatedInvoice = {
      ...invoice,
      remainingAmount: remaining,
      isPaid: remaining === 0
    };
    
    try {
      const savedInvoice = await updateInvoice(updatedInvoice);
      dispatch({ type: 'UPDATE_INVOICE', payload: savedInvoice });
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('حدث خطأ أثناء تحديث حالة الدفع');
    }
  };

  const handleSaveEdit = async (updatedInvoice: Invoice) => {
    try {
      const savedInvoice = await updateInvoice(updatedInvoice);
      dispatch({ type: 'UPDATE_INVOICE', payload: savedInvoice });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('حدث خطأ أثناء تحديث الفاتورة');
    }
  };
  
  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-medium text-gray-900">فاتورة رقم {invoice.id}</h2>
          <p className="text-gray-600 mt-1">{invoice.date}</p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary flex items-center"
          >
            <Edit3 className="h-5 w-5 ml-1" />
            تعديل الفاتورة
          </button>

          <button
            onClick={handlePrintPDF}
            className="btn btn-primary flex items-center"
          >
            <Printer className="h-5 w-5 ml-1" />
            طباعة
          </button>

          <button
            onClick={handleExportWord}
            className="btn btn-secondary flex items-center"
          >
            <FileText className="h-5 w-5 ml-1" />
            تصدير Word
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger flex items-center"
          >
            <Trash2 className="h-5 w-5 ml-1" />
            حذف
          </button>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium mb-2">حالة الدفع</h3>
            <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
              invoice.isPaid 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {invoice.isPaid ? 'مدفوع بالكامل' : 'غير مدفوع'}
            </div>
            
            {!invoice.isPaid && invoice.remainingAmount !== undefined && invoice.remainingAmount > 0 && (
              <div className="mt-2 text-red-600">
                المبلغ المتبقي: {formatCurrency(invoice.remainingAmount)} ج
              </div>
            )}
          </div>
          
          {!invoice.isPaid && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Edit3 className="h-5 w-5 ml-1" />
              تحديث حالة الدفع
            </button>
          )}
        </div>
        
        {showPaymentForm && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-md font-medium mb-4">تحديث المبلغ المتبقي</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المبلغ المتبقي
                </label>
                <input
                  type="number"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  className="input-field"
                  placeholder="أدخل المبلغ المتبقي"
                  min="0"
                  max={invoice.finalAmount}
                  step="0.001"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaymentUpdate}
                  className="btn btn-primary flex items-center"
                >
                  <Check className="h-5 w-5 ml-1" />
                  حفظ
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="btn btn-secondary flex items-center"
                >
                  <X className="h-5 w-5 ml-1" />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculation Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">إجمالي مبلغ العقد = كمية العقد × سعر العقد</p>
            <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(invoice.totalContractQuantity)} كجم × {invoice.contractPrice.toFixed(3)} ج</p>
            <p className="text-lg font-medium pr-8">= {formatCurrency(invoice.contractAmount)} ج</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">إجمالي مبلغ الحر = كمية الحر × سعر الحر</p>
            <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(invoice.freeQuantity)} كجم × {invoice.freePrice ? invoice.freePrice.toFixed(3) : '0'} ج</p>
            <p className="text-lg font-medium pr-8">= {formatCurrency(invoice.freeAmount)} ج</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">إجمالي المبلغ الكلي = إجمالي مبلغ العقد + إجمالي مبلغ الحر</p>
            <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(invoice.contractAmount)} ج + {formatCurrency(invoice.freeAmount)} ج</p>
            <p className="text-lg font-medium pr-8">= {formatCurrency(invoice.totalAmount)} ج</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">خصم حق التقاوي = مبلغ الشكائر + مبلغ الكيلوجرامات</p>
            <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(invoice.seedRights)} ج</p>
            <p className="text-lg font-medium pr-8">= {formatCurrency(invoice.seedRights)} ج</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">صافي المبلغ = إجمالي المبلغ الكلي - خصم التقاوي</p>
            <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(invoice.totalAmount)} ج - {formatCurrency(invoice.seedRights)} ج</p>
            <p className="text-lg font-medium pr-8">= {formatCurrency(invoice.netAmount)} ج</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <div className="border-b border-green-200 pb-2 mb-2">
              <p className="text-xl font-bold text-green-800">المبلغ النهائي = صافي المبلغ - الخصومات الإضافية</p>
            </div>
            <p className="text-gray-700 mb-2 pr-8">= {formatCurrency(invoice.netAmount)} ج - {formatCurrency(invoice.additionalDeductions || 0)} ج</p>
            <p className="text-3xl font-bold text-green-700 pr-8">= {formatCurrency(invoice.finalAmount)} ج</p>
          </div>
        </div>
      </div>
      
      {/* Cards List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">الكارتات المرتبطة</h3>
        <CardList 
          cards={invoice.cards} 
          showTotals={false} 
          allowDelete={false} 
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 ml-2" />
              <h3 className="text-lg font-medium">تأكيد حذف الفاتورة</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                إلغاء
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                حذف الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <InvoiceEditModal
          invoice={invoice}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default InvoiceDetail;