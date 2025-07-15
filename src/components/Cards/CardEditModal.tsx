import React, { useState, useEffect } from 'react';
import { Card } from '../../types';
import { updateCard } from '../../utils/storage';
import { calculateDiscountAmount, calculateNetWeight } from '../../utils/calculations';

interface CardEditModalProps {
  card: Card;
  onSave: (card: Card) => void;
  onClose: () => void;
}

const CardEditModal: React.FC<CardEditModalProps> = ({ card, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    date: card.date,
    farmerName: card.farmerName,
    grossWeight: card.grossWeight.toString(),
    discountPercentage: card.discountPercentage.toString(),
    discountAmount: card.discountAmount.toString(),
    netWeight: card.netWeight.toString(),
    vehicleNumber: card.vehicleNumber,
    supplierName: card.supplierName,
    is_done: card.is_done || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const grossWeight = parseFloat(formData.grossWeight) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;
    
    if (formData.grossWeight && formData.discountPercentage) {
      const discountAmount = calculateDiscountAmount(grossWeight, discountPercentage);
      const netWeight = calculateNetWeight(grossWeight, discountAmount);
      
      setFormData(prev => ({
        ...prev,
        discountAmount: discountAmount.toString(),
        netWeight: netWeight.toString()
      }));
    }
  }, [formData.grossWeight, formData.discountPercentage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.farmerName) {
      newErrors.farmerName = 'اسم الفلاح مطلوب';
    }
    
    if (!formData.grossWeight) {
      newErrors.grossWeight = 'الوزن القائم مطلوب';
    } else if (isNaN(parseFloat(formData.grossWeight))) {
      newErrors.grossWeight = 'يجب أن يكون الوزن رقماً';
    }
    
    if (!formData.vehicleNumber) {
      newErrors.vehicleNumber = 'رقم السيارة مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const updatedCard: Card = {
      ...card,
      date: formData.date,
      farmerName: formData.farmerName,
      grossWeight: parseFloat(formData.grossWeight),
      discountPercentage: parseFloat(formData.discountPercentage),
      discountAmount: parseFloat(formData.discountAmount),
      netWeight: parseFloat(formData.netWeight),
      vehicleNumber: formData.vehicleNumber,
      supplierName: formData.supplierName,
      is_done: formData.is_done
    };

    updateCard(updatedCard);
    onSave(updatedCard);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-medium mb-4">تعديل الكارتة</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="date" className="form-label">التاريخ</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="farmerName" className="form-label">اسم الفلاح</label>
              <input
                type="text"
                id="farmerName"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                className={`input-field ${errors.farmerName ? 'border-red-500' : ''}`}
                placeholder="أدخل اسم الفلاح"
              />
              {errors.farmerName && <p className="text-red-500 text-sm mt-1">{errors.farmerName}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="grossWeight" className="form-label">الوزن القائم (كجم)</label>
              <input
                type="text"
                id="grossWeight"
                name="grossWeight"
                value={formData.grossWeight}
                onChange={handleChange}
                className={`input-field ${errors.grossWeight ? 'border-red-500' : ''}`}
                placeholder="أدخل الوزن القائم"
              />
              {errors.grossWeight && <p className="text-red-500 text-sm mt-1">{errors.grossWeight}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="discountPercentage" className="form-label">نسبة الخصم (%)</label>
              <input
                type="text"
                id="discountPercentage"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل نسبة الخصم"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="discountAmount" className="form-label">كمية الخصم (كجم)</label>
              <input
                type="text"
                id="discountAmount"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل كمية الخصم"
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="netWeight" className="form-label">الوزن الصافي (كجم)</label>
              <input
                type="text"
                id="netWeight"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل الوزن الصافي"
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="vehicleNumber" className="form-label">رقم السيارة</label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`input-field ${errors.vehicleNumber ? 'border-red-500' : ''}`}
                placeholder="أدخل رقم السيارة"
              />
              {errors.vehicleNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleNumber}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="supplierName" className="form-label">اسم المورد</label>
              <input
                type="text"
                id="supplierName"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل اسم المورد"
              />
            </div>
            
            <div className="form-group flex items-center">
              <input
                type="checkbox"
                id="is_done"
                name="is_done"
                checked={formData.is_done}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_done" className="form-label mr-2 mb-0">
                كارتة مكتملة
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary">
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardEditModal;
