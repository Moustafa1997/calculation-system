import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import InvoiceDetail from '../components/Invoice/InvoiceDetail';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppContext();
  
  // Find invoice by ID
  const invoice = state.invoices.find(inv => inv.id === Number(id));
  
  // If invoice not found, redirect to invoices list
  if (!invoice) {
    return <Navigate to="/invoices" />;
  }
  
  return (
    <div className="container mx-auto">
      <InvoiceDetail invoice={invoice} />
    </div>
  );
};

export default InvoiceDetailPage;