import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { saveCard } from '../../utils/storage';
import { 
  calculateDiscountAmount, 
  calculateNetWeight,
  calculateDiscountPercentage
} from '../../utils/calculations';
import { formatDate } from '../../utils/formatting';
import { useAlert } from '../../contexts/AlertContext';

const CardForm: React.FC = () => {
  const { dispatch } = useAppContext();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    farmerName: '',
    grossWeight: '',
    discountPercentage: '',
    discountAmount: '',
    netWeight: '',
    vehicleNumber: '',
    supplierName: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    const grossWeight = parseFloat(formData.grossWeight) || 0;
    
    if (grossWeight <= 0) return;

    if (formData.discountPercentage !== '') {
      const discountPercentage = parseFloat(formData.discountPercentage) || 0;
      const discountAmount = calculateDiscountAmount(grossWeight, discountPercentage);
      const netWeight = calculateNetWeight(grossWeight, discountAmount);
      
      setFormData(prev => ({
        ...prev,
        discountAmount: discountAmount.toString(),
        netWeight: netWeight.toString()
      }));
    }
    else if (formData.netWeight !== '') {
      const netWeight = parseFloat(formData.netWeight) || 0;
      if (netWeight > 0 && netWeight <= grossWeight) {
        const discountAmount = grossWeight - netWeight;
        const discountPercentage = calculateDiscountPercentage(grossWeight, discountAmount);
        
        setFormData(prev => ({
          ...prev,
          discountAmount: discountAmount.toString(),
          discountPercentage: discountPercentage.toString()
        }));
      }
    }
    else if (formData.discountAmount !== '') {
      const discountAmount = parseFloat(formData.discountAmount) || 0;
      if (discountAmount >= 0 && discountAmount <= grossWeight) {
        const discountPercentage = calculateDiscountPercentage(grossWeight, discountAmount);
        const netWeight = calculateNetWeight(grossWeight, discountAmount);
        
        setFormData(prev => ({
          ...prev,
          discountPercentage: discountPercentage.toString(),
          netWeight: netWeight.toString()
        }));
      }
    }
  }, [formData.grossWeight, formData.discountPercentage, formData.discountAmount, formData.netWeight]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'discountPercentage') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        discountAmount: '',
        netWeight: ''
      }));
    } else if (name === 'netWeight') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        discountAmount: '',
        discountPercentage: ''
      }));
    } else if (name === 'discountAmount') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        discountPercentage: '',
        netWeight: ''
      }));
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const grossWeight = parseFloat(formData.grossWeight);
      const discountPercentage = parseFloat(formData.discountPercentage) || 0;
      const discountAmount = parseFloat(formData.discountAmount) || calculateDiscountAmount(grossWeight, discountPercentage);
      const netWeight = parseFloat(formData.netWeight) || calculateNetWeight(grossWeight, discountAmount);
      
      const cardData = {
        date: formData.date,
        farmerName: formData.farmerName,
        grossWeight,
        discountPercentage,
        discountAmount,
        netWeight,
        vehicleNumber: formData.vehicleNumber,
        supplierName: formData.supplierName || ''
      };

      const newCard = await saveCard(cardData);
      
      if (newCard) {
        dispatch({ type: 'ADD_CARD', payload: newCard });
        showAlert('success', 'تم حفظ الكارتة بنجاح');
        
        setFormData({
          date: formatDate(new Date()),
          farmerName: '',
          grossWeight: '',
          discountPercentage: '',
          discountAmount: '',
          netWeight: '',
          vehicleNumber: '',
          supplierName: ''
        });
        
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      showAlert('error', 'حدث خطأ أثناء حفظ الكارتة');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-medium text-gray-900 mb-6">إدخال كارتة جديدة</h2>
      
      {isSuccess && (
        <div className="bg-green-50 border border-green-500 text-green-700 p-4 rounded-md mb-6 flex items-center">
          <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          تم حفظ الكارتة بنجاح
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
        
        <div className="mt-8 flex justify-center">
          <button type="submit" className="btn btn-primary w-1/3">
            حفظ الكارتة
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardForm;