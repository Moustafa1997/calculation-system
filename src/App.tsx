import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AlertProvider } from './contexts/AlertContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CardEntryPage from './pages/CardEntryPage';
import CardDetailPage from './pages/CardDetailPage';
import SearchPage from './pages/SearchPage';
import InvoiceCreationPage from './pages/InvoiceCreationPage';
import InvoiceManualPage from './pages/InvoiceManualPage';
import InvoiceDetailsPage from './pages/InvoiceDetailsPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const checkSupabaseConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      setHasSupabaseConfig(Boolean(url && key));
    };

    checkSupabaseConfig();
  }, []);

  const handleConnect = () => {
    window.location.reload();
  };

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">مرحباً بك في نظام إدارة المحاصيل</h1>
          
          {!showForm ? (
            <>
              <p className="text-gray-600 mb-6 text-center">
                لبدء استخدام النظام، يرجى إعداد الاتصال بقاعدة البيانات الخاصة بك.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                إعداد الاتصال بقاعدة البيانات
              </button>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="https://your-project.supabase.co"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="text"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="your-anon-key"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  اتصال
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-700 text-sm">
              بمجرد اكتمال الإعداد، سيتم تحديث الصفحة تلقائياً وستتمكن من استخدام جميع ميزات النظام.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AlertProvider>
      <Router>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/card-entry" element={
                <ProtectedRoute>
                  <Layout>
                    <CardEntryPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/cards/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <CardDetailPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/search" element={
                <ProtectedRoute>
                  <Layout>
                    <SearchPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoice-creation" element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceCreationPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoice-manual" element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceManualPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoice-details" element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceDetailsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceListPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <InvoiceDetailPage />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </Router>
    </AlertProvider>
  );
}

export default App;