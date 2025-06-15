import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, FileText, FileSpreadsheet } from 'lucide-react';
import BackupRestore from '../components/UI/BackupRestore';

const HomePage: React.FC = () => {
  const menuItems = [
    {
      title: 'إدخال كارتة جديدة',
      icon: PlusCircle,
      description: 'إضافة وتسجيل كارتة جديدة في النظام',
      path: '/card-entry',
      color: 'bg-green-500'
    },
    {
      title: 'سجل الكارتات',
      icon: Search,
      description: 'البحث في الكارتات المسجلة وعرض الإحصائيات',
      path: '/search',
      color: 'bg-blue-500'
    },
    {
      title: 'إنشاء فاتورة',
      icon: FileText,
      description: 'إنشاء فاتورة جديدة وإجراء الحسابات',
      path: '/invoice-creation',
      color: 'bg-purple-500'
    },
    {
      title: 'سجل الفواتير',
      icon: FileSpreadsheet,
      description: 'عرض وإدارة الفواتير المسجلة في النظام',
      path: '/invoices',
      color: 'bg-amber-500'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">نظام إدارة المحاصيل</h1>
        <BackupRestore />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className={`${item.color} p-4 text-white flex items-center justify-center`}>
                <item.icon className="h-16 w-16" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                  {item.title}
                </h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;