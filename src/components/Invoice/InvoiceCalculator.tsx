import React, { useState, useEffect } from 'react';
import { Card, Invoice } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { saveInvoice } from '../../utils/storage';
import { formatCurrency, formatPrice } from '../../utils/formatting';
import {
  calculateTotalContractQuantity,
  calculateFreeQuantity,
  calculateContractAmount,
  calculateFreeAmount,
  calculateSeedRights,
  calculateTotalAmount,
  calculateNetAmount
} from '../../utils/calculations';

interface InvoiceCalculatorProps {
  onInvoiceCreated: (invoice: Invoice) => void;
}

const InvoiceCalculator: React.FC<InvoiceCalculatorProps> = ({ onInvoiceCreated }) => {
  const { state, dispatch } = useAppContext();
  const { selectedCards } = state;
  
  const farmerName = selectedCards.length > 0 ? selectedCards[0].farmerName : '';
  const totalNetWeight = selectedCards.reduce((total, card) => total + card.netWeight, 0);
  
  const defaultContractPrice = '12.900';
  const defaultContractQuantityPerBag = '500';
  
  const [formData, setFormData] = useState({
    contractPrice: defaultContractPrice,
    freePrice: '',
    contractQuantityPerBag: defaultContractQuantityPerBag,
    seedBags: '',
    seedBagPrice: '',
    additionalSeedKilos: ''
  });
  
  const [calculations, setCalculations] = useState({
    totalContractQuantity: 0,
    freeQuantity: 0,
    contractAmount: 0,
    freeAmount: 0,
    seedRights: 0,
    totalAmount: 0,
    netAmount: 0
  });
  
  useEffect(() => {
    if (selectedCards.length === 0) return;
    
    const contractPrice = parseFormattedNumber(formData.contractPrice);
    const freePrice = parseFormattedNumber(formData.freePrice);
    const contractQuantityPerBag = parseFormattedNumber(formData.contractQuantityPerBag);
    const seedBags = parseFormattedNumber(formData.seedBags);
    const seedBagPrice = parseFormattedNumber(formData.seedBagPrice);
    const additionalSeedKilos = parseFormattedNumber(formData.additionalSeedKilos);
    
    const totalContractQuantity = calculateTotalContractQuantity(contractQuantityPerBag, seedBags);
    const freeQuantity = calculateFreeQuantity(totalNetWeight, totalContractQuantity);
    
    const contractAmount = calculateContractAmount(contractPrice, totalContractQuantity, totalNetWeight);
    const freeAmount = calculateFreeAmount(freePrice, freeQuantity);
    const seedRights = calculateSeedRights(seedBagPrice, seedBags, additionalSeedKilos);
    const totalAmount = calculateTotalAmount(contractAmount, freeAmount);
    const netAmount = calculateNetAmount(totalAmount, seedRights);
    
    setCalculations({
      totalContractQuantity,
      freeQuantity,
      contractAmount,
      freeAmount,
      seedRights,
      totalAmount,
      netAmount
    });
  }, [formData, selectedCards, totalNetWeight]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCards.length === 0) {
      alert('يرجى اختيار كارتة واحدة على الأقل');
      return;
    }
    
    try {
      const newInvoice = await saveInvoice({
        date: new Date().toISOString().split('T')[0],
        farmerName,
        cards: selectedCards,
        contractPrice: parseFormattedNumber(formData.contractPrice),
        freePrice: parseFormattedNumber(formData.freePrice),
        contractQuantityPerBag: parseFormattedNumber(formData.contractQuantityPerBag),
        seedBags: parseFormattedNumber(formData.seedBags),
        seedBagPrice: parseFormattedNumber(formData.seedBagPrice),
        additionalSeedKilos: parseFormattedNumber(formData.additionalSeedKilos),
        ...calculations
      });
      
      dispatch({ type: 'ADD_INVOICE', payload: newInvoice });
      dispatch({ type: 'CLEAR_SELECTED_CARDS' });
      onInvoiceCreated(newInvoice);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('حدث خطأ أثناء حفظ الفاتورة');
    }
  };
  
  if (selectedCards.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-300 text-blue-700 p-4 rounded-md">
        <p>يرجى اختيار كارتة واحدة على الأقل للبدء في الحسابات</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">حسابات الفاتورة</h3>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              <label htmlFor="contractPrice" className="form-label">سعر العقد (ج)</label>
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
              <label htmlFor="freePrice" className="form-label">سعر الحر (ج)</label>
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
              <label htmlFor="seedBagPrice" className="form-label">سعر شكارة التقاوي (ج)</label>
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
                <p className="text-gray-600">إجمالي مبلغ العقد</p>
                <p className="text-lg font-medium">{formatCurrency(calculations.contractAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600">إجمالي مبلغ الحر</p>
                <p className="text-lg font-medium">{formatCurrency(calculations.freeAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600">إجمالي المبلغ الكلي</p>
                <p className="text-lg font-medium">{formatCurrency(calculations.totalAmount)} ج</p>
              </div>
              
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600">خصم حق التقاوي</p>
                <p className="text-lg font-medium">{formatCurrency(calculations.seedRights)} ج</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-gray-700">صافي المبلغ</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(calculations.netAmount)} ج</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button type="submit" className="btn btn-primary w-1/3">
              إنشاء الفاتورة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCalculator;