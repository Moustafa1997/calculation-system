import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { X } from 'lucide-react';
import {
  calculateTotalContractQuantity,
  calculateFreeQuantity,
  calculateContractAmount,
  calculateFreeAmount,
  calculateSeedRights,
  calculateTotalAmount,
  calculateNetAmount,
  calculateFinalAmount
} from '../../utils/calculations';

interface InvoiceEditModalProps {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({ invoice, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    contractPrice: invoice.contractPrice?.toString() ?? '0',
    freePrice: invoice.freePrice?.toString() ?? '0',
    contractQuantityPerBag: invoice.contractQuantityPerBag?.toString() ?? '0',
    seedBags: invoice.seedBags?.toString() ?? '0',
    seedBagPrice: invoice.seedBagPrice?.toString() ?? '0',
    additionalSeedKilos: invoice.additionalSeedKilos?.toString() ?? '0',
    additionalDeductions: invoice.additionalDeductions?.toString() ?? '0'
  });

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
    // Calculate total net weight from cards
    const totalNetWeight = invoice.cards.reduce((total, card) => total + card.netWeight, 0);

    // Parse all input values
    const contractPrice = parseFloat(formData.contractPrice) || 0;
    const freePrice = parseFloat(formData.freePrice) || 0;
    const contractQuantityPerBag = parseFloat(formData.contractQuantityPerBag) || 0;
    const seedBags = parseFloat(formData.seedBags) || 0;
    const seedBagPrice = parseFloat(formData.seedBagPrice) || 0;
    const additionalSeedKilos = parseFloat(formData.additionalSeedKilos) || 0;
    const additionalDeductions = parseFloat(formData.additionalDeductions) || 0;

    // Recalculate all values
    const totalContractQuantity = calculateTotalContractQuantity(contractQuantityPerBag, seedBags, additionalSeedKilos);
    const freeQuantity = calculateFreeQuantity(totalNetWeight, totalContractQuantity);
    const contractAmount = calculateContractAmount(contractPrice, totalContractQuantity, totalNetWeight);
    const freeAmount = calculateFreeAmount(freePrice, freeQuantity);
    const seedRights = calculateSeedRights(seedBagPrice, seedBags, additionalSeedKilos);
    const totalAmount = calculateTotalAmount(contractAmount, freeAmount);
    const netAmount = calculateNetAmount(totalAmount, seedRights);
    const finalAmount = calculateFinalAmount(netAmount, additionalDeductions);

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
  }, [formData, invoice.cards]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedInvoice = {
      ...invoice,
      ...formData,
      ...calculations,
      remainingAmount: calculations.finalAmount
    };

    onSave(updatedInvoice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">تعديل الفاتورة</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="form-group">
              <label className="form-label">سعر العقد (ج)</label>
              <input
                type="number"
                name="contractPrice"
                value={formData.contractPrice}
                onChange={handleChange}
                className="input-field"
                step="0.001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">سعر الحر (ج)</label>
              <input
                type="number"
                name="freePrice"
                value={formData.freePrice}
                onChange={handleChange}
                className="input-field"
                step="0.001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">كمية العقد على شكارة التقاوي (كجم)</label>
              <input
                type="number"
                name="contractQuantityPerBag"
                value={formData.contractQuantityPerBag}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">عدد شكائر التقاوي</label>
              <input
                type="number"
                name="seedBags"
                value={formData.seedBags}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">سعر شكارة التقاوي (ج)</label>
              <input
                type="number"
                name="seedBagPrice"
                value={formData.seedBagPrice}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">كمية التقاوي الإضافية (كجم)</label>
              <input
                type="number"
                name="additionalSeedKilos"
                value={formData.additionalSeedKilos}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">خصومات إضافية (ج)</label>
              <input
                type="number"
                name="additionalDeductions"
                value={formData.additionalDeductions}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-800 mb-4">نتائج الحسابات</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">إجمالي مبلغ العقد = كمية العقد × سعر العقد</p>
                <p className="text-gray-600 mb-2 pr-8">= {calculations.totalContractQuantity} كجم × {parseFloat(formData.contractPrice)} ج</p>
                <p className="text-lg font-medium pr-8">= {calculations.contractAmount} ج</p>
              </div>

              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">إجمالي مبلغ الحر = كمية الحر × سعر الحر</p>
                <p className="text-gray-600 mb-2 pr-8">= {calculations.freeQuantity} كجم × {parseFloat(formData.freePrice)} ج</p>
                <p className="text-lg font-medium pr-8">= {calculations.freeAmount} ج</p>
              </div>

              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 mb-2">خصم حق التقاوي = مبلغ الشكائر + مبلغ الكيلوجرامات</p>
                <p className="text-lg font-medium pr-8">= {calculations.seedRights} ج</p>
              </div>

              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-gray-700 mb-2">المبلغ النهائي = صافي المبلغ - الخصومات الإضافية</p>
                <p className="text-gray-700 mb-2 pr-8">= {calculations.netAmount} ج - {formData.additionalDeductions} ج</p>
                <p className="text-2xl font-bold text-green-700 pr-8">= {calculations.finalAmount} ج</p>
              </div>
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

export default InvoiceEditModal;