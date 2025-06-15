import React, { useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Card } from '../types';
import { FileDown, FileText, Image } from 'lucide-react';
import { exportCardToPDF, exportCardToWord, exportCardToPNG } from '../utils/export';
import { useAlert } from '../contexts/AlertContext';

const CardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppContext();
  const { showAlert } = useAlert();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const card = state.cards.find(c => c.id === Number(id));
  
  if (!card) {
    return <Navigate to="/search" />;
  }

  const handleDownloadPDF = () => {
    try {
      exportCardToPDF(card);
      showAlert('success', 'تم تحميل الكارتة بنجاح');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('error', 'حدث خطأ أثناء تحميل الكارتة');
    }
  };

  const handleDownloadWord = () => {
    try {
      exportCardToWord(card);
      showAlert('success', 'تم تحميل الكارتة بنجاح');
    } catch (error) {
      console.error('Error generating Word document:', error);
      showAlert('error', 'حدث خطأ أثناء تحميل الكارتة');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      if (!cardRef.current) return;
      await exportCardToPNG(cardRef.current);
      showAlert('success', 'تم تحميل الكارتة بنجاح');
    } catch (error) {
      console.error('Error generating PNG:', error);
      showAlert('error', 'حدث خطأ أثناء تحميل الكارتة');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={handleDownloadPNG}
            className="btn btn-primary flex items-center"
          >
            <Image className="h-5 w-5 ml-2" />
            تحميل صورة
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary flex items-center"
          >
            <FileDown className="h-5 w-5 ml-2" />
            تحميل PDF
          </button>
          <button
            onClick={handleDownloadWord}
            className="btn btn-secondary flex items-center"
          >
            <FileText className="h-5 w-5 ml-2" />
            تحميل Word
          </button>
        </div>

        {/* Card Preview */}
        <div ref={cardRef} className="bg-white p-8 border-2 border-gray-300 rounded-lg" style={{ direction: 'rtl' }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-4">
              <div className="w-24">
                <img 
                  src="https://images.pexels.com/photos/2893552/pexels-photo-2893552.jpeg"
                  alt="Logo"
                  className="w-full"
                />
              </div>
              <div className="text-xl font-bold">عبد الخالق للتوريدات</div>
            </div>
            <div className="text-left">
              <div className="text-lg">الأهرام للتوريدات</div>
              <div>إذن إضافة محطة</div>
              <div className="mt-2">ختم بطاطس</div>
            </div>
          </div>

          {/* Card Number and Info */}
          <div className="mb-6 text-lg">
            <div className="flex justify-between mb-4">
              <div>رقم: {card.id}</div>
              <div>رقم السيارة: {card.vehicleNumber}</div>
            </div>
            <div className="flex justify-between mb-4">
              <div>اسم المورد: {card.supplierName || '-'}</div>
              <div>تاريخ الاستلام: {card.date}</div>
            </div>
            <div className="flex justify-between mb-4">
              <div>اسم السائق: {card.farmerName}</div>
              <div>تاريخ الوصول: {card.date}</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-400 mb-8">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">نوع التوريد</th>
                <th className="border border-gray-400 p-2">صافي الكمية بعد الخصم</th>
                <th className="border border-gray-400 p-2">كمية الخصم</th>
                <th className="border border-gray-400 p-2">نسبة الخصم</th>
                <th className="border border-gray-400 p-2">صافي الوزن</th>
                <th className="border border-gray-400 p-2">الوزن فارغ</th>
                <th className="border border-gray-400 p-2">الوزن القائم</th>
                <th className="border border-gray-400 p-2">عدد التكرار</th>
                <th className="border border-gray-400 p-2">نوعية البضاعة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 text-center">حر</td>
                <td className="border border-gray-400 p-2 text-center">{card.netWeight}</td>
                <td className="border border-gray-400 p-2 text-center">{card.discountAmount}</td>
                <td className="border border-gray-400 p-2 text-center">{card.discountPercentage}%</td>
                <td className="border border-gray-400 p-2 text-center">{card.grossWeight}</td>
                <td className="border border-gray-400 p-2 text-center">-</td>
                <td className="border border-gray-400 p-2 text-center">{card.grossWeight}</td>
                <td className="border border-gray-400 p-2 text-center">-</td>
                <td className="border border-gray-400 p-2 text-center">بطاطس</td>
              </tr>
            </tbody>
          </table>

          {/* Notes */}
          <div className="mb-8">
            <div className="text-right mb-2">صافي الكمية بالتحديد:</div>
            <div className="text-right mb-4">فقط لا غير</div>
            <div className="text-right mb-2">المرفقات: أصل كارتة القبض وكارتة الوزن</div>
            <div className="text-right">تم الفحص ووجدت مطابقة للمواصفات</div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="mb-8">مهندس الفحص</div>
              <div className="w-full border-t-2 border-gray-400"></div>
            </div>
            <div className="text-center">
              <div className="mb-8">الأمن</div>
              <div className="w-full border-t-2 border-gray-400"></div>
            </div>
            <div className="text-center">
              <div className="mb-8">أمين المخزن</div>
              <div className="w-full border-t-2 border-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;