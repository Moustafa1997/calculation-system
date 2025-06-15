import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { saveInvoice } from '../utils/storage';
import { formatCurrency } from '../utils/formatting';
import {
  calculateTotalContractQuantity,
  calculateFreeQuantity,
  calculateContractAmount,
  calculateFreeAmount,
  calculateSeedRights,
  calculateTotalAmount,
  calculateNetAmount,
  calculateFinalAmount
} from '../utils/calculations';

const InvoiceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { selectedCards } = state;
  
  const farmerName = selectedCards.length > 0 ? selectedCards[0].farmerName : '';
  const totalNetWeight = selectedCards.reduce((total, card) => total + card.netWeight, 0);
  
  const [formData, setFormData] = useState({
    contractPrice: '12.900',
    freePrice: '',
    contractQuantityPerBag: '500',
    seedBags: '',
    seedBagPrice: '',
    additionalSeedKilos: '',
    additionalDeductions: '0'
  });
  
  const [showDeductionsPrompt, setShowDeductionsPrompt] = useState(false);
  const [calculations, setCalculations] = useState({
    totalContractQuantity: 0,
    freeQuantity: 0,
    contractAmount: 0,
    freeAmount: 0,
    seedRights: 0,
    totalAmount: 0,
    netAmount: 0,
    finalAmount: 0
  });
  
  useEffect(() => {
    if (selectedCards.length === 0) {
      navigate('/invoice-creation');
      return;
    }
    
    const contractPrice = parseFloat(formData.contractPrice) || 0;
    const freePrice = parseFloat(formData.freePrice) || 0;
    const contractQuantityPerBag = parseFloat(formData.contractQuantityPerBag) || 0;
    const seedBags = parseFloat(formData.seedBags) || 0;
    const seedBagPrice = parseFloat(formData.seedBagPrice) || 0;
    const additionalSeedKilos = parseFloat(formData.additionalSeedKilos) || 0;
    const additionalDeductions = parseFloat(formData.additionalDeductions) || 0;
    
    // Calculate contract quantity per kilo (500/50 = 10kg per kilo of seed)
    const contractQuantityPerKilo = contractQuantityPerBag / 50;
    
    const totalContractQuantity = Math.round((seedBags * contractQuantityPerBag) + 
      (additionalSeedKilos * contractQuantityPerKilo));
      
    const freeQuantity = Math.round(calculateFreeQuantity(totalNetWeight, totalContractQuantity));
    
    const contractAmount = Math.round(calculateContractAmount(contractPrice, totalContractQuantity, totalNetWeight));
    const freeAmount = Math.round(calculateFreeAmount(freePrice, freeQuantity));
    const seedRights = Math.round(calculateSeedRights(seedBagPrice, seedBags, additionalSeedKilos));
    const totalAmount = Math.round(calculateTotalAmount(contractAmount, freeAmount));
    const netAmount = Math.round(calculateNetAmount(totalAmount, seedRights));
    const finalAmount = Math.round(calculateFinalAmount(netAmount, additionalDeductions));
    
    setCalculations({
      totalContractQuantity,
      freeQuantity,
      contractAmount,
      freeAmount,
      seedRights,
      totalAmount,
      netAmount,
      finalAmount
    });
  }, [formData, selectedCards, totalNetWeight, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDeductionsPrompt(true);
  };
  
  const handleSaveInvoice = async (additionalDeductions: number = 0) => {
    const finalAmount = Math.round(calculateFinalAmount(calculations.netAmount, additionalDeductions));
    
    try {
      const newInvoice = await saveInvoice({
        date: new Date().toISOString().split('T')[0],
        farmerName,
        cards: selectedCards,
        contractPrice: parseFloat(formData.contractPrice),
        freePrice: parseFloat(formData.freePrice) || 0,
        contractQuantityPerBag: parseFloat(formData.contractQuantityPerBag),
        seedBags: parseFloat(formData.seedBags),
        seedBagPrice: parseFloat(formData.seedBagPrice),
        additionalSeedKilos: parseFloat(formData.additionalSeedKilos) || 0,
        additionalDeductions,
        ...calculations,
        finalAmount,
        isPaid: false,
        remainingAmount: finalAmount
      });
      
      dispatch({ type: 'ADD_INVOICE', payload: newInvoice });
      dispatch({ type: 'CLEAR_SELECTED_CARDS' });
      navigate(`/invoices/${newInvoice.id}`);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };
  
  if (selectedCards.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto">
      <div className="card">
        <h2 className="text-xl font-medium text-gray-900 mb-6">تفاصيل الفاتورة</h2>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">اسم الفلاح</p>
            <p className="text-xl font-medium">{farmerName}</p>
          </div>
          <div>
            <p className="text-gray-500">إجمالي الوزن الصافي</p>
            <p className="text-xl font-medium text-green-600 arabic-number">
              {formatCurrency(totalNetWeight)} كجم
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="form-group">
              <label htmlFor="contractPrice" className="form-label">سعر العقد</label>
              <input
                type="text"
                id="contractPrice"
                name="contractPrice"
                value={formData.contractPrice}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="12.900"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="freePrice" className="form-label">سعر الحر</label>
              <input
                type="text"
                id="freePrice"
                name="freePrice"
                value={formData.freePrice}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="أدخل سعر الحر"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contractQuantityPerBag" className="form-label">كمية العقد على شكارة التقاوي (كجم)</label>
              <input
                type="text"
                id="contractQuantityPerBag"
                name="contractQuantityPerBag"
                value={formData.contractQuantityPerBag}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="500"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="seedBags" className="form-label">عدد شكائر التقاوي</label>
              <input
                type="text"
                id="seedBags"
                name="seedBags"
                value={formData.seedBags}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="أدخل عدد الشكائر"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="seedBagPrice" className="form-label">سعر شكارة التقاوي</label>
              <input
                type="text"
                id="seedBagPrice"
                name="seedBagPrice"
                value={formData.seedBagPrice}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="أدخل سعر الشكارة"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalSeedKilos" className="form-label">كمية التقاوي الإضافية (كجم)</label>
              <input
                type="text"
                id="additionalSeedKilos"
                name="additionalSeedKilos"
                value={formData.additionalSeedKilos}
                onChange={handleChange}
                className="input-field arabic-number"
                placeholder="أدخل الكمية الإضافية"
              />
            </div>
          </div>
          
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-800 mb-4">نتائج الحسابات</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">إجمالي مبلغ العقد = كمية العقد × سعر العقد</p>
                <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(calculations.totalContractQuantity)} × {parseFloat(formData.contractPrice)}</p>
                <p className="text-lg font-medium pr-8">= {formatCurrency(calculations.contractAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">إجمالي مبلغ الحر = كمية الحر × سعر الحر</p>
                <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(calculations.freeQuantity)} × {parseFloat(formData.freePrice)}</p>
                <p className="text-lg font-medium pr-8">= {formatCurrency(calculations.freeAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">إجمالي المبلغ الكلي = إجمالي مبلغ العقد + إجمالي مبلغ الحر</p>
                <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(calculations.contractAmount)} + {formatCurrency(calculations.freeAmount)}</p>
                <p className="text-lg font-medium pr-8">= {formatCurrency(calculations.totalAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">خصم حق التقاوي = مبلغ الشكائر + مبلغ الكيلوجرامات</p>
                <p className="text-gray-600 mb-2 pr-8">= {formatCurrency(calculations.seedRights)}</p>
                <p className="text-lg font-medium pr-8">= {formatCurrency(calculations.seedRights)} ج</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-gray-700 mb-2">صافي المبلغ = إجمالي المبلغ الكلي - خصم التقاوي</p>
                <p className="text-gray-700 mb-2 pr-8">= {formatCurrency(calculations.totalAmount)} - {formatCurrency(calculations.seedRights)}</p>
                <p className="text-2xl font-bold text-green-700 pr-8">= {formatCurrency(calculations.netAmount)} ج</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button type="submit" className="btn btn-primary w-1/3">
              حفظ الفاتورة
            </button>
          </div>
        </form>
        
        {showDeductionsPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">هل هناك خصومات إضافية؟</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قيمة الخصومات الإضافية
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.additionalDeductions}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalDeductions: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSaveInvoice(0)}
                >
                  لا توجد خصومات
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSaveInvoice(parseFloat(formData.additionalDeductions))}
                >
                  حفظ مع الخصومات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;