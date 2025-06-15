import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
  calculateDiscountAmount,
  calculateNetWeight,
  calculateDiscountPercentage
} from '../utils/calculations';
import { formatDate } from '../utils/formatting';
import { useAlert } from '../contexts/AlertContext';

const InvoiceManualPage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    farmerName: '',
    grossWeight: '',
    discountPercentage: '',
    discountAmount: '',
    netWeight: '',
    vehicleNumber: '',
    supplierName: '',
    date: formatDate(new Date())
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const grossWeight = parseFloat(formData.grossWeight) || 0;
    
    // Only proceed if we have a valid gross weight
    if (grossWeight <= 0) return;

    // Case 1: User entered discount percentage
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
    // Case 2: User entered net weight
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
    // Case 3: User entered discount amount
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
    
    // Clear related fields when changing a value
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
    
    // Validate that at least one discount field is filled
    if (!formData.discountPercentage && !formData.discountAmount && !formData.netWeight) {
      newErrors.discountPercentage = 'يجب إدخال نسبة الخصم أو كمية الخصم أو الوزن الصافي';
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
      // Convert string values to numbers
      const grossWeight = parseFloat(formData.grossWeight);
      const discountPercentage = parseFloat(formData.discountPercentage) || 0;
      const discountAmount = parseFloat(formData.discountAmount) || calculateDiscountAmount(grossWeight, discountPercentage);
      const netWeight = parseFloat(formData.netWeight) || calculateNetWeight(grossWeight, discountAmount);
      
      // Create temporary card for invoice
      const tempCard: Card = {
        id: Date.now(), // Temporary ID
        date: formData.date,
        farmerName: formData.farmerName,
        grossWeight,
        discountPercentage,
        discountAmount,
        netWeight,
        vehicleNumber: formData.vehicleNumber,
        supplierName: formData.supplierName
      };
      
      // Add to selected cards without saving to storage
      dispatch({ type: 'SELECT_CARD', payload: tempCard });
      
      // Navigate to invoice details
      navigate('/invoice-details');
    } catch (error) {
      console.error('Error creating manual invoice:', error);
      showAlert('error', 'حدث خطأ أثناء إنشاء الفاتورة');
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="card">
        <h2 className="text-xl font-medium text-gray-900 mb-6">إنشاء فاتورة يدوياً</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className={`input-field ${errors.discountPercentage ? 'border-red-500' : ''}`}
                placeholder="أدخل نسبة الخصم"
              />
              {errors.discountPercentage && <p className="text-red-500 text-sm mt-1">{errors.discountPercentage}</p>}
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
          
          <div className="flex justify-center mt-6">
            <button type="submit" className="btn btn-primary w-1/3">
              متابعة إنشاء الفاتورة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceManualPage;