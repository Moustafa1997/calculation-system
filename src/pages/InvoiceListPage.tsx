import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import InvoiceList from '../components/Invoice/InvoiceList';
import { getInvoices } from '../utils/storage';
import { useAlert } from '../contexts/AlertContext';

const InvoiceListPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { invoices } = state;
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch latest invoices when component mounts
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const latestInvoices = await getInvoices();
        dispatch({ type: 'SET_INVOICES', payload: latestInvoices });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoices();
  }, [dispatch, showAlert]);
  
  return (
    <div className="container mx-auto">
      <div className="card">
        <h2 className="text-xl font-medium text-gray-900 mb-6">سجل الفواتير</h2>
        
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">جاري تحميل البيانات...</div>
        ) : (
          <InvoiceList invoices={invoices} />
        )}
      </div>
    </div>
  );
};

export default InvoiceListPage;